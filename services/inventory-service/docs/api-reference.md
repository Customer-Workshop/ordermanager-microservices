# Inventory Service API Reference

Base URL: `http://localhost:5000` (local) or `https://inventory.workshop.local` (cluster)

All endpoints are prefixed with `/api/inventory`.

## Data Model

### InventoryItem

| Field | Type | Description |
|-------|------|-------------|
| `id` | `int` | Auto-generated primary key |
| `productId` | `int` | Reference to the product in the product catalog (unique) |
| `productName` | `string` | Denormalized product display name (max 200 chars) |
| `quantityOnHand` | `int` | Current stock count |
| `reorderLevel` | `int` | Threshold for low-stock alerts (default: 10) |
| `warehouseLocation` | `string` | Physical warehouse location code (e.g., "A-01") |
| `lastRestocked` | `datetime` | UTC timestamp of the last restock operation |

### Request DTOs

#### RestockRequest
```json
{ "quantity": 25 }
```

#### DeductRequest
```json
{ "quantity": 5 }
```

## Endpoints

### List All Inventory

```
GET /api/inventory
```

Returns all inventory items in the system.

**cURL Example:**
```bash
curl -s http://localhost:5000/api/inventory | jq .
```

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "productId": 1,
    "productName": "Widget A",
    "quantityOnHand": 50,
    "reorderLevel": 10,
    "warehouseLocation": "A-01",
    "lastRestocked": "2025-01-15T10:30:00Z"
  },
  {
    "id": 2,
    "productId": 2,
    "productName": "Widget B",
    "quantityOnHand": 100,
    "reorderLevel": 10,
    "warehouseLocation": "A-02",
    "lastRestocked": "2025-01-15T10:30:00Z"
  }
]
```

---

### Get Inventory by Product ID

```
GET /api/inventory/product/{productId}
```

Returns the inventory record for a specific product.

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `productId` | `int` | Yes | The product identifier |

**cURL Example:**
```bash
curl -s http://localhost:5000/api/inventory/product/1 | jq .
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "productId": 1,
  "productName": "Widget A",
  "quantityOnHand": 50,
  "reorderLevel": 10,
  "warehouseLocation": "A-01",
  "lastRestocked": "2025-01-15T10:30:00Z"
}
```

**Error Response:** `404 Not Found` — No inventory record exists for the given product ID.

---

### Restock Product

```
POST /api/inventory/product/{productId}/restock
```

Adds stock to an existing inventory item. Updates the `lastRestocked` timestamp.

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `productId` | `int` | Yes | The product identifier |

**Request Body:**
```json
{ "quantity": 25 }
```

**cURL Example:**
```bash
curl -s -X POST http://localhost:5000/api/inventory/product/1/restock \
  -H "Content-Type: application/json" \
  -d '{"quantity": 25}' | jq .
```

**Response:** `200 OK` — Returns the updated inventory item.
```json
{
  "id": 1,
  "productId": 1,
  "productName": "Widget A",
  "quantityOnHand": 75,
  "reorderLevel": 10,
  "warehouseLocation": "A-01",
  "lastRestocked": "2025-03-25T12:00:00Z"
}
```

**Error Response:** `404 Not Found`
```json
{ "error": "No inventory record for product 999" }
```

---

### Deduct Stock

```
POST /api/inventory/product/{productId}/deduct
```

Removes stock from an inventory item. Used by the OrderManager monolith during order creation.

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `productId` | `int` | Yes | The product identifier |

**Request Body:**
```json
{ "quantity": 5 }
```

**cURL Example:**
```bash
curl -s -X POST http://localhost:5000/api/inventory/product/1/deduct \
  -H "Content-Type: application/json" \
  -d '{"quantity": 5}' | jq .
```

**Response:** `200 OK` — Returns the updated inventory item.
```json
{
  "id": 1,
  "productId": 1,
  "productName": "Widget A",
  "quantityOnHand": 45,
  "reorderLevel": 10,
  "warehouseLocation": "A-01",
  "lastRestocked": "2025-01-15T10:30:00Z"
}
```

**Error Responses:**

`404 Not Found` — No inventory record for the product:
```json
{ "error": "No inventory record for product 999" }
```

`409 Conflict` — Insufficient stock:
```json
{ "error": "Insufficient stock for product 1. Available: 3, Requested: 5" }
```

---

### Get Low Stock Items

```
GET /api/inventory/low-stock
```

Returns all inventory items where `quantityOnHand <= reorderLevel`.

**cURL Example:**
```bash
curl -s http://localhost:5000/api/inventory/low-stock | jq .
```

**Response:** `200 OK`
```json
[
  {
    "id": 3,
    "productId": 3,
    "productName": "Gadget X",
    "quantityOnHand": 5,
    "reorderLevel": 10,
    "warehouseLocation": "A-03",
    "lastRestocked": "2024-12-01T08:00:00Z"
  }
]
```

---

### Health Check

```
GET /health
```

Kubernetes liveness and readiness probe. Checks the database connection via EF Core health check.

**Response:** `200 OK`
```
Healthy
```

---

## Error Handling

All error responses follow a consistent format:

```json
{ "error": "Human-readable error message" }
```

| HTTP Status | Meaning | When |
|------------|---------|------|
| `200 OK` | Success | Request completed |
| `404 Not Found` | Not found | No inventory record for product ID |
| `409 Conflict` | Business rule violation | Insufficient stock for deduction |

## OpenAPI / Swagger

Interactive API documentation is available at `/swagger` when the service is running. The OpenAPI spec is at `/swagger/v1/swagger.json`.
