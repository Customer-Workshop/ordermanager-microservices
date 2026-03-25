# Microservices — OrderManager Decomposition

A standalone .NET 8 + Angular 17 microservice decomposed from the [OrderManager monolith](https://github.com/Cognition-Partner-Workshops/app_dotnet-angular-monolith).

## Services

This microservice owns the **Inventory** bounded context:

| Endpoint | Description |
|----------|-------------|
| `GET /api/inventory` | List all inventory items |
| `GET /api/inventory/product/{id}` | Get inventory for a specific product |
| `POST /api/inventory/product/{id}/restock` | Restock a product |
| `GET /api/inventory/low-stock` | List items at or below reorder level |
| `POST /api/inventory/product/{id}/deduct` | Deduct stock (called by monolith) |
| `GET /health` | Health check endpoint |

## See Also

- **Backend**: .NET 8, C#, Entity Framework Core, SQLite
- **Frontend**: Angular 17, TypeScript
- **Container**: Multi-stage Docker build
- **Orchestration**: Helm chart, ArgoCD, HPA
- **CI/CD**: GitHub Actions → ECR → ArgoCD

## Getting Started

### Prerequisites
- .NET 8 SDK
- Node.js 18+
- Angular CLI (`npm install -g @angular/cli`)

### Run the API

```bash
dotnet restore src/InventoryService.Api/InventoryService.Api.csproj
dotnet run --project src/InventoryService.Api/InventoryService.Api.csproj
```

The API will be available at `http://localhost:5000`.

### Run tests

```bash
dotnet test
```

## Infrastructure

- **Dockerfile**: `docker/Dockerfile` — multi-stage build (Node → .NET SDK → runtime)
- **Helm chart**: `helm/inventory-service/` — deployment, service, network policy, service monitor, HPA
- **ArgoCD**: `argocd/` — application manifests for dev and staging
- **CI/CD**: `.github/workflows/build-push.yaml` — build, test, push to ECR

## License

MIT
