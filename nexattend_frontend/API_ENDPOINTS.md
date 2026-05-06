# NexAttend API Endpoints Reference

This document outlines all API endpoints used by the NexAttend frontend application. Your backend must implement these endpoints for the application to function.

## Base URL

```
NEXT_PUBLIC_API_URL = http://localhost:3000/api
```

## Authentication Endpoints

### Login
```
POST /auth/login
```

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "user": {
    "id": "user-123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "admin",
    "permissions": ["read", "write"]
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Error Response (401):**
```json
{
  "message": "Invalid credentials"
}
```

### Register
```
POST /auth/register
```

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secure123"
}
```

**Response (200 OK):**
```json
{
  "user": {
    "id": "user-456",
    "email": "john@example.com",
    "name": "John Doe",
    "role": "user",
    "permissions": ["read"]
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Error Response (400):**
```json
{
  "message": "Email already exists"
}
```

---

## Device Management Endpoints

### Get All Devices
```
GET /devices
```

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response (200 OK):**
```json
{
  "devices": [
    {
      "id": "dev-001",
      "name": "Main Entrance",
      "identifier": "DEV-001",
      "type": "attendance_machine",
      "status": "active",
      "registeredDate": "2024-01-15T10:30:00Z",
      "lastSeen": "2024-05-05T14:25:00Z"
    },
    {
      "id": "dev-002",
      "name": "Back Door",
      "identifier": "DEV-002",
      "type": "biometric",
      "status": "inactive",
      "registeredDate": "2024-02-20T11:00:00Z",
      "lastSeen": "2024-05-04T09:15:00Z"
    }
  ]
}
```

### Register New Device
```
POST /devices
```

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request:**
```json
{
  "name": "Conference Room Entrance",
  "identifier": "DEV-003",
  "type": "attendance_machine"
}
```

**Response (201 Created):**
```json
{
  "device": {
    "id": "dev-003",
    "name": "Conference Room Entrance",
    "identifier": "DEV-003",
    "type": "attendance_machine",
    "status": "active",
    "registeredDate": "2024-05-05T15:00:00Z",
    "lastSeen": null
  }
}
```

### Update Device
```
PUT /devices/{deviceId}
```

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request:**
```json
{
  "name": "Updated Device Name",
  "status": "maintenance"
}
```

**Response (200 OK):**
```json
{
  "device": {
    "id": "dev-001",
    "name": "Updated Device Name",
    "identifier": "DEV-001",
    "type": "attendance_machine",
    "status": "maintenance",
    "registeredDate": "2024-01-15T10:30:00Z",
    "lastSeen": "2024-05-05T14:25:00Z"
  }
}
```

### Delete Device
```
DELETE /devices/{deviceId}
```

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response (200 OK):**
```json
{
  "message": "Device deleted successfully"
}
```

---

## Presence Tracking Endpoints

### Get All Presence Records
```
GET /presence
```

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `status` (optional) - Filter by status: present, absent, late, left_early
- `userId` (optional) - Filter by user ID
- `date` (optional) - Filter by specific date (YYYY-MM-DD)

**Response (200 OK):**
```json
{
  "records": [
    {
      "id": "pres-001",
      "userId": "user-123",
      "userName": "John Doe",
      "status": "present",
      "checkInTime": "2024-05-05T09:00:00Z",
      "checkOutTime": "2024-05-05T17:30:00Z",
      "timestamp": "2024-05-05T09:00:00Z",
      "location": "Main Entrance",
      "deviceId": "dev-001"
    },
    {
      "id": "pres-002",
      "userId": "user-456",
      "userName": "Jane Smith",
      "status": "late",
      "checkInTime": "2024-05-05T09:30:00Z",
      "checkOutTime": null,
      "timestamp": "2024-05-05T09:30:00Z",
      "location": "Main Entrance",
      "deviceId": "dev-001"
    }
  ]
}
```

### Get Today's Presence
```
GET /presence/today
```

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response (200 OK):**
```json
{
  "records": [
    {
      "id": "pres-001",
      "userId": "user-123",
      "userName": "John Doe",
      "status": "present",
      "checkInTime": "2024-05-05T09:00:00Z",
      "checkOutTime": null,
      "timestamp": "2024-05-05T09:00:00Z",
      "location": "Main Entrance",
      "deviceId": "dev-001"
    }
  ]
}
```

### Check In
```
POST /presence/check-in
```

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request:**
```json
{
  "deviceId": "dev-001"
}
```

**Response (200 OK):**
```json
{
  "record": {
    "id": "pres-003",
    "userId": "user-123",
    "status": "present",
    "checkInTime": "2024-05-05T09:00:00Z",
    "timestamp": "2024-05-05T09:00:00Z",
    "deviceId": "dev-001"
  }
}
```

### Check Out
```
POST /presence/check-out
```

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request:**
```json
{
  "deviceId": "dev-001"
}
```

**Response (200 OK):**
```json
{
  "record": {
    "id": "pres-001",
    "userId": "user-123",
    "status": "present",
    "checkInTime": "2024-05-05T09:00:00Z",
    "checkOutTime": "2024-05-05T17:30:00Z",
    "timestamp": "2024-05-05T17:30:00Z",
    "deviceId": "dev-001"
  }
}
```

---

## Attendance Records Endpoints

### Get Attendance Records
```
GET /attendance
```

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `dateFrom` (optional) - Start date (YYYY-MM-DD)
- `dateTo` (optional) - End date (YYYY-MM-DD)
- `userId` (optional) - Filter by user ID
- `userName` (optional) - Filter by user name
- `status` (optional) - Filter by status: present, absent, late, left_early, half_day

**Response (200 OK):**
```json
{
  "records": [
    {
      "id": "att-001",
      "userId": "user-123",
      "userName": "John Doe",
      "date": "2024-05-05",
      "status": "present",
      "checkInTime": "2024-05-05T09:00:00Z",
      "checkOutTime": "2024-05-05T17:30:00Z",
      "totalHours": 8.5,
      "notes": "Regular working hours"
    },
    {
      "id": "att-002",
      "userId": "user-456",
      "userName": "Jane Smith",
      "date": "2024-05-05",
      "status": "absent",
      "checkInTime": null,
      "checkOutTime": null,
      "totalHours": 0,
      "notes": "Sick leave"
    }
  ]
}
```

### Get User Attendance
```
GET /attendance/{userId}
```

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `month` (optional) - Month filter (YYYY-MM)

**Response (200 OK):**
```json
{
  "records": [
    {
      "id": "att-001",
      "userId": "user-123",
      "userName": "John Doe",
      "date": "2024-05-01",
      "status": "present",
      "checkInTime": "2024-05-01T09:00:00Z",
      "checkOutTime": "2024-05-01T17:30:00Z",
      "totalHours": 8.5,
      "notes": null
    }
  ]
}
```

### Update Attendance Record
```
PUT /attendance/{recordId}
```

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request:**
```json
{
  "status": "late",
  "notes": "Traffic delay"
}
```

**Response (200 OK):**
```json
{
  "record": {
    "id": "att-001",
    "userId": "user-123",
    "userName": "John Doe",
    "date": "2024-05-05",
    "status": "late",
    "checkInTime": "2024-05-05T09:15:00Z",
    "checkOutTime": "2024-05-05T17:30:00Z",
    "totalHours": 8.25,
    "notes": "Traffic delay"
  }
}
```

### Delete Attendance Record
```
DELETE /attendance/{recordId}
```

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response (200 OK):**
```json
{
  "message": "Attendance record deleted successfully"
}
```

---

## Error Responses

All endpoints follow standard HTTP status codes:

| Status | Meaning | Example |
|--------|---------|---------|
| 200 | Success | Request completed successfully |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource does not exist |
| 500 | Server Error | Internal server error |

**Standard Error Response:**
```json
{
  "message": "Error description",
  "code": "ERROR_CODE",
  "status": 400
}
```

---

## Authentication

All endpoints except `/auth/login` and `/auth/register` require authentication.

**Header:**
```
Authorization: Bearer {accessToken}
```

The `accessToken` is obtained from login/register responses and automatically managed by the Axios interceptor in `lib/api.ts`.

---

## Data Types

### User Object
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'user';
  permissions: string[];
}
```

### Device Object
```typescript
interface Device {
  id: string;
  name: string;
  identifier: string;
  type: string;
  status: 'active' | 'inactive' | 'maintenance';
  registeredDate: string;
  lastSeen?: string;
}
```

### Presence Record
```typescript
interface PresenceRecord {
  id: string;
  userId: string;
  userName: string;
  status: 'present' | 'absent' | 'late' | 'left_early';
  checkInTime?: string;
  checkOutTime?: string;
  timestamp: string;
  location?: string;
  deviceId?: string;
}
```

### Attendance Record
```typescript
interface AttendanceRecord {
  id: string;
  userId: string;
  userName: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'left_early' | 'half_day';
  checkInTime?: string;
  checkOutTime?: string;
  totalHours?: number;
  notes?: string;
}
```

---

## Implementation Checklist

- [ ] Implement `/auth/login` endpoint
- [ ] Implement `/auth/register` endpoint
- [ ] Implement `GET /devices` endpoint
- [ ] Implement `POST /devices` endpoint
- [ ] Implement `PUT /devices/{deviceId}` endpoint
- [ ] Implement `DELETE /devices/{deviceId}` endpoint
- [ ] Implement `GET /presence` endpoint
- [ ] Implement `GET /presence/today` endpoint
- [ ] Implement `POST /presence/check-in` endpoint
- [ ] Implement `POST /presence/check-out` endpoint
- [ ] Implement `GET /attendance` endpoint
- [ ] Implement `GET /attendance/{userId}` endpoint
- [ ] Implement `PUT /attendance/{recordId}` endpoint
- [ ] Implement `DELETE /attendance/{recordId}` endpoint
- [ ] Setup CORS to allow frontend domain
- [ ] Implement JWT authentication
- [ ] Setup database models
- [ ] Add input validation
- [ ] Add error handling
- [ ] Add logging
- [ ] Test with Postman collection

---

**Note:** All dates/times should be in ISO 8601 format (UTC). The frontend uses `date-fns` for parsing and formatting.
