# NexAttend

NexAttend is split into three Node.js apps:

- `nexattend_backend`: Express + TypeScript API, Prisma, PostgreSQL.
- `nexattend_frontend`: Next.js frontend.
- `nexattend_router-adapter`: Router polling microservice used to read connected Wi-Fi devices.

## Prerequisites

- Node.js 20 or newer
- npm
- PostgreSQL
- Access to the router you want to poll
- RabbitMQ only if you use queue-based router sync

## Environment Setup

A combined reference file is available at `.env.example`.

Create the local env files:

```bash
cp nexattend_backend/.env.example nexattend_backend/.env
cp nexattend_frontend/.env.example nexattend_frontend/.env.local
cp nexattend_router-adapter/.env.example nexattend_router-adapter/.env
```

On Windows PowerShell:

```powershell
Copy-Item nexattend_backend/.env.example nexattend_backend/.env
Copy-Item nexattend_frontend/.env.example nexattend_frontend/.env.local
Copy-Item nexattend_router-adapter/.env.example nexattend_router-adapter/.env
```

Update these important values before running:

- `nexattend_backend/.env`: set `DATABASE_URL`, `JWT_SECRET`, `HASH_SECRET`.
- `nexattend_frontend/.env.local`: keep `NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1` for local backend.
- `nexattend_router-adapter/.env`: set `ROUTER_BASE_URL`, `ROUTER_USERNAME`, and `ROUTER_PASSWORD`.

## Install Dependencies

Run this from each app folder:

```bash
cd nexattend_backend
npm install

cd ../nexattend_router-adapter
npm install

cd ../nexattend_frontend
npm install
```

## Database Setup

Create a PostgreSQL database named `nexattend`, or change `DATABASE_URL` to your database name.

Then run Prisma from the backend folder:

```bash
cd nexattend_backend
npx prisma generate
npx prisma migrate dev
```

## Run Locally

Open three terminals.

Terminal 1, backend API:

```bash
cd nexattend_backend
npm run dev
```

Backend runs on:

```text
http://localhost:4000/api/v1
```

Terminal 2, router adapter:

```bash
cd nexattend_router-adapter
npm run dev
```

Router adapter runs on:

```text
http://localhost:5000
```

Useful router adapter endpoints:

```text
GET http://localhost:5000/health
GET http://localhost:5000/devices
GET http://localhost:5000/routers/status
```

Terminal 3, frontend:

```bash
cd nexattend_frontend
npm run dev
```

Frontend runs on:

```text
http://localhost:3000
```

## Router Sync Modes

Recommended local setup:

```env
ROUTER_EXECUTION_MODE=router-adapter
ROUTER_SYNC_MODE=polling
ROUTER_ADAPTER_BASE_URL=http://localhost:5000
```

With this setup, run both the backend and the router adapter. The backend reads connected device snapshots from the adapter.

Queue mode is optional and needs RabbitMQ:

```env
ROUTER_SYNC_MODE=queue
ROUTER_SYNC_PUBLISH_ENABLED=true
AMQP_URL=amqp://localhost:5672
```

## Build

Backend:

```bash
cd nexattend_backend
npm run build
```

Router adapter:

```bash
cd nexattend_router-adapter
npm run build
```

Frontend:

```bash
cd nexattend_frontend
npm run build
```

## Common Checks

If the frontend cannot call the backend, confirm:

- Backend is running on port `4000`.
- `NEXT_PUBLIC_API_URL` is `http://localhost:4000/api/v1`.
- Backend CORS allows `http://localhost:3000`.

If attendance devices are not showing, confirm:

- Router adapter is running on port `5000`.
- Router credentials in `nexattend_router-adapter/.env` are correct.
- `GET http://localhost:5000/devices` returns connected devices.
- Backend env points to `ROUTER_ADAPTER_BASE_URL=http://localhost:5000`.
