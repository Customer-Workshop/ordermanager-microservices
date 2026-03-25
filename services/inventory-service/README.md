# Inventory Service

A standalone .NET 8 + Angular 17 microservice decomposed from the OrderManager monolith. Manages stock levels, warehouse locations, and reorder thresholds.

## Architecture

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/inventory` | GET | List all inventory items |
| `/api/inventory/product/{productId}` | GET | Get inventory for a specific product |
| `/api/inventory/product/{productId}/restock` | POST | Restock a product |
| `/api/inventory/product/{productId}/deduct` | POST | Deduct stock (used by Order service) |
| `/api/inventory/low-stock` | GET | List items at or below reorder level |
| `/health` | GET | Health check endpoint |

## Tech Stack

- **Backend**: .NET 8, C#, Entity Framework Core, SQLite
- **Frontend**: Angular 17, TypeScript
- **API**: RESTful with Swagger/OpenAPI

## Getting Started

### Prerequisites
- .NET 8 SDK
- Node.js 18+
- Angular CLI (`npm install -g @angular/cli`)

### Run the application

```bash
# Restore .NET dependencies
dotnet restore services/inventory-service/InventoryService.sln

# Run tests
dotnet test services/inventory-service/InventoryService.sln

# Run the API
dotnet run --project services/inventory-service/src/InventoryService.Api/InventoryService.Api.csproj
```

The API will be available at `http://localhost:5000` with Swagger at `/swagger`.

## IaC

- **Dockerfile**: `docker/Dockerfile` — multi-stage build (Node + .NET SDK + ASP.NET runtime)
- **Helm chart**: `helm/inventory-service/` — deployment, service, network policy, service monitor, HPA
- **ArgoCD**: `argocd/` — application manifests for dev and staging environments
- **CI/CD**: `.github/workflows/inventory-service-ci.yaml` — build, test, push to ECR

## License

MIT
