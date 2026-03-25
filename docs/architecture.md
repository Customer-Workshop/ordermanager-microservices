# Architecture Decision Record: Inventory Service Extraction

## Status

Accepted

## Context

The OrderManager monolith contains four tightly coupled modules (Orders, Products, Customers, Inventory) sharing a single SQLite database and deployed as one unit. The Inventory module was identified as an extraction target because it has a clear domain boundary but is coupled to the Order creation flow via stock reservations.

## Decision

Extract the Inventory module into a standalone .NET 8 Web API microservice with its own database, API, and deployment pipeline.

### Key Design Choices

#### 1. Data Ownership and Denormalization

The `InventoryItem` model stores `ProductName` as a denormalized field instead of maintaining a foreign key to a Product table. In the microservice world, the inventory service does not own product data. Rather than introducing synchronous cross-service joins or an event-driven sync mechanism, we denormalize the product name at write time.

**Trade-off:** Product name changes in the product service will not automatically propagate. For production, an event-driven approach (e.g., ProductUpdated events via a message broker) would keep this in sync.

#### 2. Synchronous HTTP Communication

The monolith communicates with the inventory service via synchronous HTTP calls using a typed `HttpClient` (`InventoryServiceClient`). The `ReserveStock` operation during order creation is synchronous because stock reservation must succeed before the order is confirmed.

**Trade-off:** Synchronous calls create temporal coupling. If the inventory service is down, order creation fails. For production, consider circuit breakers (Polly), saga pattern, or event-driven stock reservation.

#### 3. Separate Angular Frontend

The inventory service ships with its own Angular 17 SPA served from the same .NET host. Each microservice is independently deployable and testable. The embedded frontend provides a standalone management UI for inventory operations.

#### 4. SQLite Database

SQLite is used for simplicity in workshop demos. For production, PostgreSQL or a managed database service would be appropriate.

## Architecture Layers

```
┌─────────────────────────────────────────────────┐
│                   HTTP Layer                     │
│                                                  │
│  InventoryController (REST API endpoints)        │
│  - GET  /api/inventory                           │
│  - GET  /api/inventory/product/{id}              │
│  - POST /api/inventory/product/{id}/restock      │
│  - POST /api/inventory/product/{id}/reserve      │
│  - GET  /api/inventory/low-stock                 │
│  - GET  /health                                  │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│                Business Layer                    │
│                                                  │
│  InventoryItemService (service class)            │
│  - GetAllInventoryAsync()                        │
│  - GetInventoryByProductIdAsync(productId)       │
│  - RestockAsync(productId, quantity)              │
│  - ReserveStockAsync(productId, quantity)         │
│  - GetLowStockItemsAsync()                       │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│                 Data Layer                        │
│                                                  │
│  InventoryDbContext (EF Core)                    │
│  - InventoryItems DbSet                          │
│  - OnModelCreating: PK, unique index, required   │
│                                                  │
│  SQLite: inventory.db                            │
└─────────────────────────────────────────────────┘
```

## Deployment Topology

```
                    ┌─────────────┐
                    │   Route 53  │
                    │   DNS       │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │  ingress-   │
                    │  nginx      │
                    │  (L7 LB)   │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
      ┌───────▼──┐  ┌─────▼────┐  ┌───▼────────┐
      │ordermanager│ │inventory │  │ (future    │
      │ monolith │  │ service  │  │  services) │
      └──────────┘  └──────────┘  └────────────┘
              decomposition-dev namespace
```

## Consequences

### Positive
- Inventory domain is independently deployable and scalable
- Clear API contract between monolith and inventory service
- Own database eliminates shared-state coupling
- Health checks and monitoring enable platform observability

### Negative
- Network latency added to order creation (HTTP call vs. in-process)
- Data consistency relies on synchronous calls (no distributed transactions)
- Product name denormalization can become stale
- Operational complexity increases (two services to monitor)
