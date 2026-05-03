# Web API Reference

This page documents all HTTP and WebSocket endpoints exposed by the built-in web server.
The server runs locally on the device (default port **80** unless changed in config).

::: info
All endpoints are unauthenticated — they are only reachable from the local network.
:::

---

## Embedded web-server

### `GET /`

Returns the main web interface as an HTML page.
The page is rendered server-side and includes the current configuration and basic actions.

---

## Configuration

### `GET /config`

Returns the current runtime configuration as a JSON object (`AppConfig`).

**Response:** `200 OK` — JSON body with all config fields.

---

### `POST /config`

Replaces the entire configuration with the provided JSON body.
The new config is saved to disk and takes effect immediately.

**Request body:** JSON object matching the `AppConfig` schema.

**Response:** `200 OK` — echoes back the saved config as JSON.

---

### `POST /config-entry`

Updates a single configuration key without replacing the whole config.
The TOML config file is edited in-place and the config is reloaded.

**Request body:**
```json
{
  "key": "dpi",
  "value": 160
}
```

Supported value types: `string`, `bool`, `integer`, `float`.
Arrays and objects are not supported.

**Response:** `200 OK`
```json
{ "status": "success", "key": "dpi", "value": 160 }
```

**Errors:**
- `400 Bad Request` — unknown key or unsupported value type
- `500 Internal Server Error` — file write or config reload failure

---

### `GET /config-data`

Returns the configuration metadata (field types, descriptions, allowed values, section groupings) used to render the UI form — not the live config values.

**Response:** `200 OK` — JSON object (`ConfigJson`).

---

## Device Control

### `POST /restart`

Requests an Android Auto session reconnect (no reboot, just re-establishes the AA connection).

**Response:** `200 OK` — `"Restart has been requested"`

---

### `POST /reboot`

Requests a full device reboot.

**Response:** `200 OK` — `"Reboot has been requested"`

---

### `POST /set-time`

Sets the system clock.

**Request body:** plain text, RFC 3339 timestamp, e.g.:
```
2025-10-15T16:20:22+02:00
```

**Response:** `200 OK` — `"System time set to <UTC time>"`

**Errors:** `400 Bad Request` if the timestamp cannot be parsed; `500` if the syscall fails.

---

### `GET /version`

Returns version and hardware information.

**Response:** `200 OK`
```json
{
  "version": "0.18.0",
  "board": "radxa03w",
  "model": "Radxa ZERO 3W"
}
```

---

## Sensor Data (EV / Car)

These endpoints inject sensor packets directly into the Android Auto data stream.
They require an active AA session (sensor channel must already be established).

### `POST /battery`

Sends EV battery data to Android Auto.
Either `battery_level_percentage` or `battery_level_wh` must be provided.

**Request body:**
```json
{
  "battery_level_percentage": 80.5,
  "battery_level_wh": null,
  "battery_capacity_wh": 75000,
  "reference_air_density": 1.2,
  "external_temp_celsius": 21.0
}
```

All fields except one of the level fields are optional.
`battery_level_percentage` must be in the range `0.0–100.0`.

**Response:** `200 OK` — `"OK"`

**Errors:** `400 Bad Request` — out-of-range or missing required field.

---

### `GET /battery-status`

Returns the last battery data that was successfully sent.

**Response:** `200 OK` — JSON with the last `BatteryData`, or `204 No Content` if nothing has been sent yet.

---

### `POST /odometer`

Sends odometer reading to Android Auto.

**Request body:**
```json
{
  "odometer_km": 123456.7
}
```

`odometer_km` must be `>= 0.0`.

**Response:** `200 OK` — `"OK"`

**Errors:** `400 Bad Request` — negative value.

---

### `GET /odometer-status`

Returns the last odometer data that was sent.

**Response:** `200 OK` — JSON, or `204 No Content`.

---

### `POST /tire-pressure`

Sends tire pressure readings to Android Auto.

**Request body:**
```json
{
  "pressures_kpa": [220.0, 220.0, 215.0, 215.0]
}
```

`pressures_kpa` must contain **1 to 4** values, all `>= 0.0`.

**Response:** `200 OK` — `"OK"`

**Errors:** `400 Bad Request` — wrong number of values or negative pressure.

---

### `GET /tire-pressure-status`

Returns the last tire pressure data that was sent.

**Response:** `200 OK` — JSON, or `204 No Content`.

---

### `GET /speed`

Returns the last vehicle speed received from the Head Unit.

**Response:** `200 OK`
```json
{ "speed": 72 }
```
Or `204 No Content` if no speed data has been received yet.

---

## Input Injection

These endpoints inject synthetic input events into Android Auto.
They require an active AA session (input channel must be established).

### `POST /inject_event`

Injects a key press (DOWN + UP) into Android Auto.

**Request body:**
```json
{
  "keycode": "KEYCODE_HOME"
}
```

Common keycodes: `KEYCODE_HOME`, `KEYCODE_BACK`, `KEYCODE_SEARCH`, `KEYCODE_MEDIA_NEXT`, `KEYCODE_MEDIA_PREVIOUS`, etc.
The full list matches Android `KeyEvent` keycode names.

**Response:** `200 OK` — `"OK"`

**Errors:**
- `400 Bad Request` — unknown keycode string
- `503 Service Unavailable` — no input channel yet

---

### `POST /inject_rotary`

Injects a rotary encoder (scroll wheel) event into Android Auto.

**Request body:**
```json
{
  "delta": 3
}
```

Positive values = clockwise, negative = counterclockwise.
Absolute value scales linearly (e.g., `2` = two UI steps).
`delta` must be non-zero.

**Response:** `200 OK` — `"OK"`

**Errors:**
- `400 Bad Request` — `delta` is `0`
- `503 Service Unavailable` — no input channel yet

---

## Firmware & Certificates

### `POST /upload-hex-model`

Uploads a custom EV energy model (protobuf binary encoded as a hex string).
Replaces the default Ford EV model used for battery data injection.

**Request body:** plain text — hex-encoded binary, e.g.:
```
0a1f0a1d...
```

**Response:** `200 OK` — `"File saved correctly as /etc/aa-proxy-rs/ev_model.bin"`

**Errors:** `400 Bad Request` — invalid UTF-8 or hex; `500` — write failure.

---

### `POST /upload-certs`

Uploads a certificate bundle (`.tar.gz` archive containing `.pem` files).
The archive must contain a top-level `aa-proxy-rs/` directory with the cert files inside.

**Content-Type:** `application/gzip` or `application/x-gzip`

**Response:** `200 OK` — `"Certificates uploaded to /etc/aa-proxy-rs/"`

**Errors:**
- `415 Unsupported Media Type` — wrong Content-Type
- `400 Bad Request` — bad archive or no `.pem` files found
- `500 Internal Server Error` — file copy / hash write failure

---

### `GET /certs-info`

Returns the SHA-256 hash of the currently installed certificate bundle.

**Response:** `200 OK`
```json
{ "sha": "e3b0c44298fc1c149afb..." }
```
`sha` is an empty string if no bundle has been uploaded yet.

---

## Backup & Restore

### `GET /userdata-backup`

Downloads a backup of the entire `/data` partition as a `.tar.gz` archive.
Symlinks are preserved (not followed).

**Query params:**
- `filename` (optional) — override the default generated filename (`YYYYMMDDHHmmSS_aa-proxy-rs_backup.tar.gz`)

**Response:** `200 OK` — streaming `application/gzip` download.

---

### `POST /userdata-restore`

Uploads a backup archive to restore.
The archive is saved to `/data/pending_restore.tar.gz` and the device reboots to apply it.

**Content-Type:** `application/gzip` or `application/x-gzip`

**Response:** `200 OK` — `"Backup data uploaded ... Device will now reboot!"`

**Errors:** `415 Unsupported Media Type`, `400`, `500`.

---

### `POST /factory-reset`

Triggers a factory reset on next boot by creating a sentinel file at `/data/factory-reset`, then reboots the device.

**Response:** `200 OK` — `"Factory reset requested. Device will now reboot."`

---

## Logs

### `GET /download`

Downloads a `.tar.gz` archive of all current log files (`/var/log/aa-proxy-*log`, `/var/log/messages`, and the configured log file).

**Query params:**
- `filename` (optional) — override the default generated filename (`YYYYMMDDHHmmSS_aa-proxy-rs_logs.tar.gz`)

**Response:** `200 OK` — streaming `application/gzip` download.

---

## Bluetooth

### `GET /bt/devices`

Lists all Bluetooth devices currently visible / discovered.

**Response:** `200 OK` — JSON array of device objects.

---

### `GET /bt/devices/paired`

Lists all paired Bluetooth devices.

**Response:** `200 OK` — JSON array of paired device objects.

---

### `DELETE /bt/devices/:id`

Removes (unpairs) a Bluetooth device by its identifier.

**Path param:** `:id` — the device address or ID as returned by the listing endpoints.

**Response:** `200 OK` on success.

---

## WebSocket

### `GET /ws`

Upgrades the connection to a WebSocket for real-time bidirectional event streaming.

Upon connection the server immediately sends a `connected` event:
```json
{ "type": "event", "topic": "system", "payload": "connected" }
```

#### Client → Server messages

**Subscribe to a topic:**
```json
{ "type": "subscribe", "topic": "odometer" }
```
**Response:**
```json
{ "type": "subscribed", "topic": "odometer" }
```

**Unsubscribe:**
```json
{ "type": "unsubscribe", "topic": "odometer" }
```
**Response:**
```json
{ "type": "unsubscribed", "topic": "odometer" }
```

**Emit a script event** (used by WASM scripts):
```json
{ "type": "script_event", "topic": "my_topic", "payload": "some_data" }
```

#### Server → Client messages

**Event delivery** (only sent for topics the client subscribed to):
```json
{ "type": "event", "topic": "odometer", "payload": "..." }
```

**Error:**
```json
{ "type": "error", "message": "invalid json message" }
```

#### Known event topics

| Topic | Emitted when |
|---|---|
| `system` | Connection established |
| `odometer` | Odometer packet sent to AA |
| `tire_pressure` | Tire pressure packet sent to AA |

::: info
If the `wasm-scripting` feature is compiled in, WASM scripts can intercept and transform events before they are forwarded to subscribers.
:::
