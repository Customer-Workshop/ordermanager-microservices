# Architecture Decision Record: Inventory Service Extraction

## Status

Accepted

## Context

The OrderManager monolith contains four tightly coupled modules (Orders, Products, Customers, Inventory) sharing a single SQLite database and deployed as one unit. The Inventory module was identified as the third extraction target (after Products and Customers) because it has a clear domain boundary but is coupled to the Order creation flow.

## Decision

Extract the Inventory module into a standalone .NET 8 Web API microservice with its own database, API, and deployment pipeline.

### Key Design Choices

#### 1. Data Ownership and Denormalization

**Choice:** The `InventoryItem` model stores `ProductName` as a denormalized field instead of maintaining a foreign key to a Product table.

**Rationale:** In the monolith, `InventoryItem` had a navigation property to `Product` via `ProductId`. In the microservice world, the inventory service does not own product data. Rather than introducing synchronous cross-service joins or an event-driven sync mechanism (which adds complexity for a workshop demo), we denormalize the product name at write time. This provides a self-contained read model.

**Trade-off:** Product name changes in the product service will not automatically propagate to the inventory service. For a production system, an event-driven approach (e.g., ProductUpdated events via a message broker) would keep this in sync.

#### 2. Synchronous HTTP Communication

**Choice:** The monolith communicates with the inventory service via synchronous HTTP calls using a typed `HttpClient` (`InventoryServiceClient`).

**Rationale:** This is the simplest integration pattern and appropriate for a workshop demo. The `DeductStock` operation during order creation is synchronous because stock deduction must succeed before the order is confirmed.

**Trade-off:** Synchronous calls create temporal coupling. If the inventory service is down, order creation fails. For production, consider:
- Circuit breaker pattern (Polly)
- Saga pattern for distributed transactions
- Event-driven stock reservation

#### 3. Separate Angular Frontend

**Choice:** The inventory service ships with its own Angular 17 SPA served from the same .NET host.

**Rationale:** Each microservice should be independently deployable and testable. The embedded frontend provides a standalone management UI for inventory operations. In a full decomposition, a separate API gateway + micro-frontend architecture would aggregate UIs.

#### 4. SQLite Database

**Choice:** SQLite as the database engine, consistent with the monolith.

**Rationale:** Simplicity for workshop demos. SQLite requires no external database server. For production, PostgreSQL or a managed database service would be appropriate.

## Architecture Layers

```
┌─────────────────────────────────────────────────┐
│                   HTTP Layer                     │
│                                                  │
│  InventoryController (REST API endpoints)        │
│  - GET  /api/inventory                           │
│  - GET  /api/inventory/product/{id}              │
│  - POST /api/inventory/product/{id}/restock      │
│  - POST /api/inventory/product/{id}/deduct       │
│  - GET  /api/inventory/low-stock                 │
│  - GET  /health                                  │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│                Business Layer                    │
│                                                  │
│  InventoryManager (service class)                │
│  - GetAllInventoryAsync()                        │
│  - GetInventoryByProductIdAsync(productId)       │
│  - RestockAsync(productId, quantity)              │
│  - DeductStockAsync(productId, quantity)          │
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

## Error Handling Strategy

| Scenario | HTTP Status | Error Body |
|----------|------------|------------|
| Item not found | `404 Not Found` | `{ "error": "No inventory record for product {id}" }` |
| Insufficient stock | `409 Conflict` | `{ "error": "Insufficient stock for product {id}. Available: N, Requested: M" }` |
| Restock success | `200 OK` | Updated `InventoryItem` JSON |
| Deduct success | `200 OK` | Updated `InventoryItem` JSON |

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
      │          │  │          │  │            │
      └──────────┘  └──────────┘  └────────────┘
              decomposition-dev namespace
```

## Consequences

### Positive
- Inventory domain is independently deployable and scalable
- Clear API contract between monolith and inventory service
- Own database eliminates shared-state coupling
- Health checks and monitoring enable platform observability
- Helm chart + ArgoCD enable GitOps deployment

### Negative
- Network latency added to order creation (HTTP call vs. in-process)
- Data consistency relies on synchronous calls (no distributed transactions)
- Product name denormalization can become stale
- Operational complexity increases (two services to monitor)

## References

- [Platform Engineering Shared Services](https://github.com/Cognition-Partner-Workshops/platform-engineering-shared-services)
- [Monolith IaC Patterns](https://github.com/Cognition-Partner-Workshops/app_dotnet-angular-monolith-iac)
- [Decomposition Plan](https://github.com/Cognition-Partner-Workshops/app_dotnet-angular-monolith-iac/blob/main/docs/decomposition-plan.md)
