# OrderManager Microservices

Microservices extracted from the [OrderManager monolith](https://github.com/Cognition-Partner-Workshops/app_dotnet-angular-monolith).

## Architecture

```
┌──────────────────────────────────────────┐
│              API Consumers               │
│        (Angular SPA / API Gateway)       │
└──────────────────┬───────────────────────┘
                   │
         ┌─────────▼──────────┐
         │  Inventory Service  │
         │  .NET 8 Web API     │
         │  /api/inventory     │
         │  SQLite (own DB)    │
         └────────────────────┘
```

## Services

### Inventory Service

Manages stock levels, warehouse locations, and reorder alerts. Extracted from the monolith's `InventoryController`, `InventoryService`, and `InventoryItem` model.

**Key changes from monolith:**
- Own `InventoryDbContext` with dedicated SQLite database (`inventory.db`)
- Removed direct `Product` entity navigation — stores `ProductId`, `ProductName`, and `Sku` as denormalized fields
- Added full CRUD endpoints (`POST`, `PUT`, `DELETE`) beyond the original read/restock operations
- Health check endpoint at `/health` with EF Core database connectivity check
- Swagger UI at `/swagger`

**API Endpoints:**

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/inventory` | List all inventory items |
| GET | `/api/inventory/{id}` | Get inventory item by ID |
| GET | `/api/inventory/product/{productId}` | Get inventory by product ID |
| POST | `/api/inventory` | Create new inventory item |
| PUT | `/api/inventory/{id}` | Update inventory item |
| DELETE | `/api/inventory/{id}` | Delete inventory item |
| POST | `/api/inventory/product/{productId}/restock` | Restock a product |
| GET | `/api/inventory/low-stock` | Get items at or below reorder level |
| GET | `/health` | Health check |

## Project Structure

```
services/
  inventory-service/         # .NET 8 Web API
    Controllers/             # API controllers
    Models/                  # Domain models
    Data/                    # DbContext and seed data
    Services/                # Business logic
    Program.cs               # Application entry point
tests/
  InventoryService.Tests/    # xUnit tests
docker/
  inventory-service/         # Multi-stage Dockerfile
helm/
  inventory-service/         # Helm chart with platform conformance
    templates/               # K8s manifests (Deployment, Service, HPA, NetworkPolicy, ServiceMonitor)
    values.yaml              # Base values
    values-dev.yaml          # Dev overrides
    values-staging.yaml      # Staging overrides
argocd/
  inventory-service-dev.yaml      # ArgoCD app → decomposition-dev
  inventory-service-staging.yaml  # ArgoCD app → decomposition-staging
```

## Getting Started

### Prerequisites
- .NET 8 SDK
- Docker (for container builds)
- Helm 3 (for chart management)

### Run Locally

```bash
dotnet restore services/inventory-service/InventoryService.csproj
dotnet run --project services/inventory-service/InventoryService.csproj
# API available at http://localhost:5000
# Swagger UI at http://localhost:5000/swagger
```

### Run Tests

```bash
dotnet test tests/InventoryService.Tests/InventoryService.Tests.csproj
```

### Build Docker Image

```bash
docker build -f docker/inventory-service/Dockerfile -t inventory-service:local .
docker run -p 8080:8080 inventory-service:local
```

### Helm

```bash
helm lint helm/inventory-service
helm template inventory-service helm/inventory-service
helm template inventory-service helm/inventory-service -f helm/inventory-service/values.yaml -f helm/inventory-service/values-dev.yaml
```

## Platform Conformance

Each microservice conforms to the platform standards defined in [`app_dotnet-angular-monolith-iac`](https://github.com/Cognition-Partner-Workshops/app_dotnet-angular-monolith-iac):

- **Helm chart** with NetworkPolicy, ServiceMonitor, and HPA
- **ArgoCD manifests** targeting `decomposition-dev` and `decomposition-staging` namespaces
- **Multi-stage Dockerfile** following the established pattern
- **Health check** endpoint at `/health`
