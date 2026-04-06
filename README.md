# Inventory Microservice

A .NET 8 + Angular 17 microservice decomposed from the [OrderManager monolith](https://github.com/Cognition-Partner-Workshops/app_dotnet-angular-monolith). Manages stock levels, warehouse locations, and reorder thresholds independently.

## Architecture

| Component | Description |
|-----------|-------------|
| **API** | .NET 8 Web API with EF Core + SQLite |
| **Frontend** | Angular 17 standalone components |
| **Container** | Multi-stage Docker build (Node + .NET SDK + ASP.NET runtime) |
| **IaC** | Helm chart, ArgoCD manifests, GitHub Actions CI/CD |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/inventory` | List all inventory items |
| GET | `/api/inventory/product/{id}` | Get inventory for a product |
| POST | `/api/inventory/product/{id}/restock` | Restock a product |
| GET | `/api/inventory/low-stock` | List items at or below reorder level |
| GET | `/api/inventory/product/{id}/check?quantity=N` | Check stock availability |
| POST | `/api/inventory/product/{id}/deduct` | Deduct stock for an order |
| GET | `/health` | Health check endpoint |

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

### Run tests

```bash
dotnet test
```

## Deployment

This service conforms to the [platform-engineering-shared-services](https://github.com/Cognition-Partner-Workshops/platform-engineering-shared-services) standard.

- **Dockerfile**: `docker/Dockerfile`
- **Helm chart**: `helm/inventory-service/`
- **ArgoCD**: `argocd/application-dev.yaml`, `argocd/application-staging.yaml`
- **CI/CD**: `.github/workflows/build-push.yaml`

## License

MIT
