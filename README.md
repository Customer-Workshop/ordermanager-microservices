# Inventory Service

A .NET 8 + Angular 17 microservice extracted from the [OrderManager monolith](https://github.com/Cognition-Partner-Workshops/app_dotnet-angular-monolith). This service owns all inventory management concerns: stock levels, warehouse locations, reorder thresholds, and stock deduction/restocking.

## Architecture

| Concern | Description |
|---------|-------------|
| **Stock Levels** | Track quantity on hand per product |
| **Warehouse Locations** | Map products to warehouse locations |
| **Reorder Alerts** | Flag items at or below reorder level |
| **Restock / Deduct** | HTTP endpoints for stock operations |

The service has its own SQLite database and is independently deployable.

## Tech Stack

- **Backend**: .NET 8, C#, Entity Framework Core, SQLite
- **Frontend**: Angular 17, TypeScript
- **API**: RESTful with Swagger/OpenAPI
- **Container**: Multi-stage Docker build (Node + .NET SDK + aspnet runtime)
- **Orchestration**: Helm chart, ArgoCD, HPA, NetworkPolicy, ServiceMonitor

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/inventory` | List all inventory items |
| GET | `/api/inventory/product/{productId}` | Get inventory for a product |
| POST | `/api/inventory/product/{productId}/restock` | Restock a product |
| POST | `/api/inventory/product/{productId}/deduct` | Deduct stock (used by OrderManager) |
| GET | `/api/inventory/low-stock` | List items at or below reorder level |
| GET | `/health` | Health check |

## Getting Started

### Prerequisites
- .NET 8 SDK
- Node.js 18+
- Angular CLI (`npm install -g @angular/cli`)

### Run the application

```bash
# Restore .NET dependencies
dotnet restore src/InventoryService.Api/InventoryService.Api.csproj

# Install Angular dependencies
cd client-app && npm install && cd ..

# Run the API (serves Angular app too)
dotnet run --project src/InventoryService.Api/InventoryService.Api.csproj
```

The application will be available at `http://localhost:5000`.

## IaC

- **Dockerfile**: `docker/Dockerfile` — multi-stage build
- **Helm chart**: `helm/inventory-service/` — deployment, service, ingress, network policy, service monitor, HPA
- **ArgoCD**: `argocd/` — application manifests for dev and staging
- **CI/CD**: `ci/build-push.yaml` — GitHub Actions pipeline

## Monolith Integration

The OrderManager monolith calls this service via HTTP to check and deduct inventory during order creation, replacing the previous in-process `InventoryService` dependency.

## License

MIT
