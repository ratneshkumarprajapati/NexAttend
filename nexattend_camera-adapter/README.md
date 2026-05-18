# NexAttend Face Intelligence Camera Adapter

Stores student face embeddings, detects faces in camera frames, matches known students, and publishes `face.matched` events to the main NexAttend backend through RabbitMQ/CloudAMQP.

## Run

```bash
npm install
cp .env.example .env
npm run dev
```

## Register a Student Face

```bash
curl -X POST http://localhost:5100/faces/register \
  -H "content-type: application/json" \
  -d "{\"studentId\":\"USER_ID\",\"imageDataUrl\":\"data:image/jpeg;base64,BASE64_IMAGE\"}"
```

The service detects the face once, converts the image into an embedding, and stores it in MongoDB when `MONGODB_URI` or `FACE_MONGODB_URI` is configured. Without MongoDB config it falls back to `FACE_EMBEDDING_STORE_PATH` (`data/face-embeddings.json` by default) for local development.

## MongoDB Embedding Store

```env
MONGODB_URI=mongodb://localhost:27017
MONGODB_DATABASE=nexattend_face_intelligence
FACE_EMBEDDING_COLLECTION=face_embeddings
FACE_EMBEDDING_MIN_SIMILARITY=0.82
```

The collection stores documents shaped like:

```json
{
  "studentId": "USER_ID",
  "userId": "USER_ID",
  "embedding": [0.123, 0.532],
  "metadata": {},
  "createdAt": "2026-05-15T10:00:00.000Z",
  "updatedAt": "2026-05-15T10:00:00.000Z"
}
```

## Recognize a Frame

```bash
curl -X POST http://localhost:5100/faces/recognize \
  -H "content-type: application/json" \
  -d "{\"imageDataUrl\":\"data:image/jpeg;base64,BASE64_IMAGE\",\"publish\":true}"
```

When `publish` is `true`, a matched face is sent to RabbitMQ with routing key `face.matched`.

## Local Event Test

```bash
curl -X POST http://localhost:5100/detections \
  -H "content-type: application/json" \
  -d "{\"studentId\":\"USER_ID\",\"confidence\":0.92}"
```

The adapter publishes face recognition messages. The backend consumes them when `CAMERA_QUEUE_ENABLED=true`, the backend and adapter use the same `CAMERA_SYNC_RECOGNITION_ROUTING_KEY`, and `AMQP_URL` or `CLOUDAMQP_URL` is configured.

## Student photo matching

The adapter can match a live camera frame against preuploaded student profile photos from the backend.

Configure:

```env
BACKEND_BASE_URL=http://localhost:4000
BACKEND_STUDENTS_PATH=/api/v1/users
BACKEND_API_TOKEN=
FACE_MATCH_ENABLED=true
FACE_MATCH_MIN_SIMILARITY=0.82
```

Refresh the local gallery manually:

```bash
curl -X POST http://localhost:5100/students/refresh
```

`POST /capture` now detects a face, checks stored embeddings first, then falls back to enrolled student photos, and publishes the matched `studentId` only when the similarity passes the configured threshold.

## Face detection

Open the browser camera tester:

```text
http://localhost:5100/camera
```

`POST /detect` runs the local TensorFlow.js BlazeFace model against a base64 JPEG/PNG frame:

```bash
curl -X POST http://localhost:5100/detect \
  -H "content-type: application/json" \
  -d "{\"imageBase64\":\"BASE64_IMAGE\"}"
```

`POST /capture` first detects a face locally. If at least one face is present, it matches against stored embeddings, then backend student photos, then forwards the frame to `FACE_RECOGNITION_URL` if configured.

## Postman

Import `postman/NexAttend-Face-Intelligence.postman_collection.json`. Set `baseUrl`, `studentId`, and `imageDataUrl` collection variables before running the face registration and recognition requests.
