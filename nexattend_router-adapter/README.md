# Router Microservice

Production-grade Node.js TypeScript microservice for integrating with multiple network routers through a unified REST API.

The service supports two router integration styles:

- **API routers**: routers that expose HTTP endpoints for login, health, and connected devices.
- **Scraper routers**: routers that only expose device data through a web UI, scraped with Playwright.

The main application never talks to routers directly. It calls this service, which keeps router-specific behavior isolated behind adapters and returns normalized device data.

## Architecture

The codebase follows a clean layered architecture:

```text
HTTP Request
  -> Routes
  -> Controller
  -> Service
  -> Cache / Aggregator
  -> Router Adapters
  -> Router API or Router UI
```

### Layers

#### Routes

Location: `src/routes/router.routes.ts`

Defines public REST endpoints and maps them to controller methods:

- `GET /devices`
- `GET /health`
- `GET /routers/status`
- `GET /debug/raw?routerKey=...`

#### Controller

Location: `src/controllers/router.controller.ts`

Handles HTTP concerns:

- Reads query params.
- Validates debug input with Zod.
- Converts service responses into JSON.
- Passes errors to the Express error handler.

The controller does not know how routers work.

#### Service

Location: `src/services/router.service.ts`

Orchestrates application behavior:

- Starts the background polling loop.
- Prevents overlapping polls.
- Reads cached device data for `/devices`.
- Delegates health, diagnostics, and raw debug calls to the aggregator.

The key production decision is that `/devices` returns cached data instead of hitting routers directly.

#### Cache

Location: `src/cache/router.cache.ts`

Stores the latest aggregated snapshot in memory:

```ts
{
  devices: ConnectedDevice[];
  failures: Array<{ routerKey; routerName; error }>;
  timestamp: string;
}
```

This keeps API latency stable even when a router is slow or temporarily unavailable.

#### Aggregator

Location: `src/aggregator/router.aggregator.ts`

Fetches from all adapters in parallel using `Promise.allSettled`.

Responsibilities:

- Collect device data from every enabled router.
- Handle partial failures without breaking the whole response.
- Merge all router results.
- Deduplicate devices by lowercase MAC address.
- Prefer the device record with stronger RSSI when duplicates exist.
- Run per-router health checks.
- Expose raw router data for debugging.

#### Adapters

Locations:

- Interface: `src/adapters/router.adapter.ts`
- Factory: `src/adapters/router.factory.ts`
- API implementation: `src/adapters/api/api-router.adapter.ts`
- Scraper implementation: `src/adapters/scraper/scraper-router.adapter.ts`

Adapters isolate router-specific logic behind a common interface:

```ts
interface RouterAdapter {
  key: string;
  name: string;

  login(): Promise<void>;
  fetchConnectedDevices(): Promise<ConnectedDevice[]>;
  healthCheck(): Promise<boolean>;
}
```

Every adapter must return normalized `ConnectedDevice` objects. This keeps the rest of the service independent from router-specific payloads, DOM layouts, auth flows, or vendor quirks.

## Data Flow

### Background Polling Flow

1. `server.ts` creates the Express app and starts `RouterService`.
2. `RouterService.start()` begins polling every `ROUTER_POLL_INTERVAL_MS`.
3. `RouterAggregator.fetchAllDevices()` calls all router adapters in parallel.
4. Each adapter logs in if needed, fetches device data, and normalizes rows.
5. Aggregator merges results and deduplicates by MAC.
6. `RouterCache` stores the latest snapshot.
7. `GET /devices` returns that cached snapshot.

This design avoids launching router calls from every API request.

### API Router Flow

Location: `src/adapters/api/api-router.adapter.ts`

1. `ensureToken()` checks whether the current token is missing or expired.
2. `login()` posts credentials to the configured login path.
3. The adapter stores the token and expiry time.
4. `fetchRawConnectedDevices()` calls the configured devices endpoint.
5. Raw API rows are normalized into `ConnectedDevice`.

The API adapter includes:

- Request timeout.
- Retry handling.
- Token expiry handling.
- Structured diagnostics.

### Scraper Router Flow

Location: `src/adapters/scraper/scraper-router.adapter.ts`

The scraper adapter is based on the provided `scraper.js`, but wrapped as a production adapter.

Important behavior:

- Playwright browser is launched once and reused.
- Browser/session/page are not created per API request.
- Scraper operations are serialized per router to avoid concurrent page navigation conflicts.
- Login is reused when the session is still active.
- On page/session failure, the adapter closes the broken page and recreates it.

High-level flow:

1. `ensurePage()` launches or reuses browser/context/page.
2. `ensureLoggedIn()` checks for the configured logged-in selector.
3. If not logged in, `loginUnlocked()` performs UI login.
4. `navigateToDevices()` opens the local devices screen and iframe.
5. `extractDevices()` reads table rows from the DOM.
6. Rows are normalized into `ConnectedDevice`.

## Normalized Device Shape

Location: `src/utils/device-normalizer.ts`

All adapters return:

```json
{
  "mac": "string",
  "ip": "string",
  "hostname": "string",
  "connection": {
    "rssi": 0,
    "band": "string",
    "interface": "string"
  },
  "meta": {
    "routerKey": "string",
    "routerName": "string",
    "routerType": "API | SCRAPER"
  },
  "timestamp": "ISO string"
}
```

MAC addresses are always normalized to lowercase.

## Configuration

Location: `src/config/router.config.ts`

Configuration is validated with Zod. Routers can be supplied through `ROUTERS_JSON`.

Environment variables:

```bash
PORT=3000
LOG_LEVEL=info
ROUTER_POLL_INTERVAL_MS=5000
ROUTERS_JSON='[...]'
```

Polling interval is constrained to 2-5 seconds.

### Example API Router

```json
{
  "key": "api-router-1",
  "name": "Gateway API Router",
  "type": "API",
  "enabled": true,
  "baseUrl": "http://192.168.0.1",
  "loginPath": "/api/login",
  "devicesPath": "/api/connected-devices",
  "healthPath": "/api/health",
  "username": "admin",
  "password": "password",
  "timeoutMs": 5000,
  "retry": { "attempts": 2, "delayMs": 300 },
  "tokenTtlMs": 300000
}
```

### Example Scraper Router

```json
{
  "key": "scraper-router-1",
  "name": "Legacy UI Router",
  "type": "SCRAPER",
  "enabled": true,
  "baseUrl": "http://192.168.1.1",
  "loginPath": "/admin/login.asp",
  "username": "admin",
  "password": "password",
  "headless": true,
  "timeoutMs": 10000,
  "retry": { "attempts": 2, "delayMs": 500 },
  "selectors": {
    "loggedIn": "#nav",
    "username": "input[name=\"username\"]",
    "password": "input[name=\"password\"]",
    "submit": "input[type=\"submit\"]",
    "statusLink": "a:has-text(\"Status\")",
    "localDevicesLink": "#side a:has-text(\"Local Devices\")",
    "contentFrame": "#contentIframe",
    "readyText": "text=LAN User List",
    "rows": "table tbody tr"
  }
}
```

## REST API

Postman collection:

```text
postman/router-microservice.postman_collection.json
```

Import it into Postman and update the `baseUrl` and `routerKey` collection variables for your environment.

### `GET /devices`

Returns the latest cached device snapshot.

```json
{
  "devices": [],
  "timestamp": "2026-05-03T08:45:45.325Z",
  "failures": []
}
```

### `GET /health`

Runs live health checks for each router.

```json
{
  "status": "ok",
  "routers": [
    {
      "routerKey": "scraper-router-1",
      "routerName": "Legacy UI Router",
      "routerType": "SCRAPER",
      "available": true,
      "latencyMs": 132,
      "checkedAt": "2026-05-03T08:45:45.325Z"
    }
  ]
}
```

### `GET /routers/status`

Returns adapter diagnostics such as last login, last fetch, last error, and session status.

### `GET /debug/raw?routerKey=scraper-router-1`

Returns raw router output before normalization. This is intended for debugging API payload or scraper DOM issues.

## Running Locally

Install dependencies:

```bash
npm install
```

Start in development mode:

```bash
npm run dev
```

Build:

```bash
npm run build
```

Run production build:

```bash
npm start
```

Typecheck:

```bash
npm run typecheck
```

## Extension Guide

To add a new router type or vendor:

1. Create a new adapter under `src/adapters/...`.
2. Implement `RouterAdapter`.
3. Normalize all device rows using `normalizeDevice`.
4. Add a new config schema if the router needs different settings.
5. Register the adapter in `router.factory.ts`.

Router-specific quirks should stay inside the adapter. The aggregator, service, controller, and routes should not change for each router vendor.

## Production Notes

- `/devices` is cache-backed to avoid slow router calls on user requests.
- Router polling handles partial failure.
- `Promise.allSettled` prevents one bad router from breaking aggregation.
- Scraper browsers are reused and recovered instead of launched per request.
- Scraper actions are serialized per router because one Playwright page cannot safely navigate multiple flows at once.
- Logging is structured with Winston in `YYYY-MM-DD HH:mm:ss [level] [Context] message` format.
- Runtime config is validated with Zod.
- MAC normalization and deduplication happen centrally.
