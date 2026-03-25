# Inventory Service API Specification

## Overview

The Inventory Service API provides RESTful endpoints for managing product inventory within the decomposed OrderManager system. This service owns the bounded context for stock levels, warehouse locations, and reorder operations.

**Base URL**: `/api/inventory`
**Content-Type**: `application/json`
**OpenAPI Spec**: Available at `/swagger/v1/swagger.json`

---

## Authentication

Currently, the API does not require authentication. In production, integrate with the platform's OAuth2/JWT gateway via the ingress-nginx annotations.

---

## Endpoints

### 1. List All Inventory Items

Retrieves all inventory records sorted by product name.

```
GET /api/inventory
```

**Response** `200 OK`
```json
[
  {
    "id": 1,
    "productId": 1,
    "productName": "Widget A",
    "quantityOnHand": 50,
    "reorderLevel": 10,
    "warehouseLocation": "A-01",
    "lastRestocked": "2024-01-15T10:30:00Z"
  }
]
```

---

### 2. Get Inventory by Product ID

```
GET /api/inventory/product/{productId}
```

**Path Parameters**
| Parameter | Type | Description |
|-----------|------|-------------|
| `productId` | integer | The ID of the product |

**Response** `200 OK` — Returns the inventory item.
**Response** `404 Not Found` — No inventory record exists for the given product ID.

---

### 3. Restock a Product

```
POST /api/inventory/product/{productId}/restock
```

**Request Body**
```json
{ "quantity": 25 }
```

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `quantity` | integer | Yes | Must be > 0 |

**Response** `200 OK` — Returns the updated inventory item.
**Response** `400 Bad Request` — Invalid quantity or missing product.

---

### 4. Get Low Stock Items

```
GET /api/inventory/low-stock
```

Returns items whose `quantityOnHand <= reorderLevel`, sorted by quantity ascending.

---

### 5. Reserve Stock (Service-to-Service)

```
POST /api/inventory/product/{productId}/reserve
```

**Request Body**
```json
{ "quantity": 5 }
```

**Response** `200 OK`
```json
{ "reserved": true, "productId": 1, "quantity": 5 }
```

**Response** `409 Conflict`
```json
{ "error": "Insufficient stock for product 1" }
```

---

### 6. Health Check

```
GET /health
```

Returns `Healthy` with `200 OK` when the service and database are operational.

---

## Data Model

### InventoryItem

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| `id` | int | Primary key | Auto-generated |
| `productId` | int | Product reference | Unique index |
| `productName` | string | Denormalized product name | Required, max 200 chars |
| `quantityOnHand` | int | Current stock quantity | >= 0 |
| `reorderLevel` | int | Low-stock threshold | Default: 10 |
| `warehouseLocation` | string | Physical location code | Max 50 chars |
| `lastRestocked` | datetime | UTC timestamp of last restock | Auto-set |

---

## Error Handling

All errors follow a consistent format:
```json
{ "error": "Human-readable error message" }
```

| HTTP Status | Meaning |
|-------------|---------|
| 200 | Success |
| 400 | Invalid request |
| 404 | Resource not found |
| 409 | Conflict (insufficient stock) |
| 500 | Internal server error |

---

## Cross-Service Communication

```
OrderManager Monolith  ──HTTP──>  Inventory Service
  POST /api/inventory/product/{id}/reserve
  GET  /api/inventory/product/{id}
```

Resilience patterns in the monolith HTTP client:
- Timeout: 30 seconds
- Base URL configurable via `InventoryServiceUrl` in appsettings
