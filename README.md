# Inventory Microservice

Standalone inventory management microservice decomposed from the [OrderManager monolith](https://github.com/Cognition-Partner-Workshops/app_dotnet-angular-monolith). Conforms to the [platform-engineering-shared-services](https://github.com/Cognition-Partner-Workshops/platform-engineering-shared-services) standard.

## Architecture

| Component | Description |
|-----------|-------------|
| **Backend** | .NET 8 Web API with EF Core + SQLite |
| **Frontend** | Angular 17 standalone components |
| **Container** | Multi-stage Docker build (Node + .NET SDK + Alpine runtime) |
| **Orchestration** | Helm chart with HPA, network policies, service monitor |
| **GitOps** | ArgoCD application manifests for dev and staging |
| **CI/CD** | GitHub Actions — build, test, push to ECR |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/inventory` | List all inventory items |
| GET | `/api/inventory/product/{productId}` | Get inventory for a specific product |
| POST | `/api/inventory/product/{productId}/restock` | Restock a product |
| POST | `/api/inventory/product/{productId}/deduct` | Deduct stock (called by order service) |
| GET | `/api/inventory/low-stock` | List items at or below reorder level |
| GET | `/api/inventory/product/{productId}/stock-level` | Get stock level for a product |
| GET | `/health` | Health check endpoint |

## Getting Started

### Prerequisites
- .NET 8 SDK
- Node.js 18+
- Angular CLI

### Run the application

```bash
dotnet restore
cd src/inventory-service/client-app && npm install && cd ../../..
dotnet run --project src/inventory-service/InventoryService.csproj
```

### Run tests

```bash
dotnet test --verbosity normal
```

## Project Structure

```
src/inventory-service/       # .NET 8 Web API + Angular 17 frontend
tests/InventoryService.Tests/  # xUnit tests
docker/Dockerfile            # Multi-stage build
helm/inventory-service/      # Helm chart (deployment, service, HPA, network policy, service monitor)
argocd/                      # ArgoCD application manifests (dev + staging)
.github/workflows/           # CI/CD pipeline
```

## License

MIT
