# Inventory Microservice

A standalone .NET 8 + Angular 17 microservice extracted from the [OrderManager monolith](https://github.com/Cognition-Partner-Workshops/app_dotnet-angular-monolith). Manages product inventory, stock levels, warehouse locations, and reorder alerts.

## Architecture

This microservice is part of a decomposition strategy that extracts tightly coupled modules from the OrderManager monolith into independently deployable services.

```
┌─────────────────────────────────────────────────────────┐
│                   Inventory Service                      │
│                                                          │
│  ┌──────────────┐  ┌────────────────┐  ┌──────────────┐ │
│  │  Angular 17   │  │  .NET 8 API    │  │  SQLite DB   │ │
│  │  Frontend     │──│  Controllers   │──│  EF Core     │ │
│  │  (SPA)        │  │  Services      │  │              │ │
│  └──────────────┘  └────────────────┘  └──────────────┘ │
│                           │                              │
│                    /health endpoint                      │
│                    /swagger docs                         │
└─────────────────────────────────────────────────────────┘
         │                    ▲
         │                    │ HTTP (REST)
         ▼                    │
┌─────────────────┐  ┌───────────────────┐
│  Ingress/NGINX  │  │  OrderManager     │
│                 │  │  Monolith         │
└─────────────────┘  │  (HTTP Client)    │
                     └───────────────────┘
```

### Bounded Context

| Concern | Inventory Service | Monolith (Orders) |
|---------|-------------------|-------------------|
| Stock levels | Owns | Calls via HTTP |
| Restock operations | Owns | N/A |
| Stock reservation | Owns (API) | Calls `/reserve` |
| Product catalog | References by ID | Owns |
| Order creation | N/A | Owns |

## Tech Stack

- **Backend**: .NET 8, C# 12, Entity Framework Core 8, SQLite
- **Frontend**: Angular 17, TypeScript 5.2, Standalone Components
- **API**: RESTful with OpenAPI 3.0 / Swagger
- **Container**: Multi-stage Docker build (Alpine-based runtime)
- **Orchestration**: Kubernetes (Helm chart, HPA, NetworkPolicy)
- **CI/CD**: GitHub Actions → Amazon ECR → ArgoCD
- **Monitoring**: Prometheus ServiceMonitor

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/inventory` | List all inventory items |
| `GET` | `/api/inventory/product/{productId}` | Get inventory for a specific product |
| `POST` | `/api/inventory/product/{productId}/restock` | Restock a product |
| `GET` | `/api/inventory/low-stock` | Get items at or below reorder level |
| `POST` | `/api/inventory/product/{productId}/reserve` | Reserve stock for an order |
| `GET` | `/health` | Health check (includes DB connectivity) |
| `GET` | `/swagger` | OpenAPI / Swagger UI |

### Request/Response Examples

#### List All Inventory
```http
GET /api/inventory
```
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

#### Restock a Product
```http
POST /api/inventory/product/1/restock
Content-Type: application/json

{ "quantity": 25 }
```

#### Reserve Stock (used by Order service)
```http
POST /api/inventory/product/1/reserve
Content-Type: application/json

{ "quantity": 5 }
```
Response `200 OK`:
```json
{ "reserved": true, "productId": 1, "quantity": 5 }
```
Response `409 Conflict`:
```json
{ "error": "Insufficient stock for product 1" }
```

## Getting Started

### Prerequisites
- .NET 8 SDK
- Node.js 18+
- Angular CLI (`npm install -g @angular/cli`)

### Run Locally

```bash
# Restore .NET dependencies
dotnet restore

# Install Angular dependencies
cd client-app && npm install && cd ..

# Run tests
dotnet test

# Run the API (serves Angular app too)
dotnet run --project src/InventoryService.Api/InventoryService.Api.csproj
```

The service will be available at `http://localhost:5000`:
- **UI**: http://localhost:5000
- **Swagger**: http://localhost:5000/swagger
- **Health**: http://localhost:5000/health

### Docker

```bash
docker build -f docker/Dockerfile -t inventory-service .
docker run -p 8080:8080 inventory-service
```

## Project Structure

```
├── src/
│   └── InventoryService.Api/
│       ├── Controllers/       # API endpoints
│       ├── Models/            # Domain models & DTOs
│       ├── Services/          # Business logic
│       ├── Data/              # EF Core DbContext & seed data
│       └── Program.cs         # Application entry point
├── tests/
│   └── InventoryService.Api.Tests/  # xUnit tests
├── client-app/                # Angular 17 SPA
│   └── src/app/modules/inventory/
├── docker/Dockerfile          # Multi-stage container build
├── helm/inventory-service/    # Kubernetes Helm chart
├── argocd/                    # ArgoCD application manifests
├── .github/workflows/         # CI/CD pipeline
└── docs/                      # Additional documentation
```

## Deployment

### Helm Chart

```bash
helm install inventory-service helm/inventory-service -n decomposition-dev
```

### ArgoCD

Apply the ArgoCD application manifests:
```bash
kubectl apply -f argocd/application-dev.yaml
kubectl apply -f argocd/application-staging.yaml
```

### Environment-Specific Configuration

| Environment | Replicas | HPA | Persistence | Host |
|-------------|----------|-----|-------------|------|
| Dev | 1 | Off | Off (in-memory) | inventory-service-dev.workshop.local |
| Staging | 2 | 2-4 pods | On (1Gi gp2) | inventory-service-staging.workshop.local |
| Production | 1+ | On | On (1Gi gp2) | inventory-service.workshop.local |

## Integration with OrderManager Monolith

The monolith's `OrderService` has been refactored to call this microservice via HTTP instead of directly querying the shared database:

```csharp
// Before (monolith — direct DB access):
var inventory = await _context.InventoryItems.FirstOrDefaultAsync(i => i.ProductId == productId);

// After (monolith — HTTP client to inventory service):
var inventory = await _inventoryHttpClient.GetInventoryByProductIdAsync(productId);
var reserved = await _inventoryHttpClient.ReserveStockAsync(productId, quantity);
```

## License

MIT
