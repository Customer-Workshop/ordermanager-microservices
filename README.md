# Inventory Microservice

A standalone .NET 8 + Angular 17 microservice decomposed from the [OrderManager monolith](https://github.com/Cognition-Partner-Workshops/app_dotnet-angular-monolith). Manages stock levels, warehouse locations, and reorder alerts.

## Architecture

| Component | Description |
|-----------|-------------|
| **Backend** | .NET 8 Web API with EF Core + SQLite |
| **Frontend** | Angular 17 standalone components |
| **API** | RESTful with Swagger/OpenAPI + health endpoint |

### API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/inventory` | List all inventory items |
| GET | `/api/inventory/product/{id}` | Get inventory for a product |
| POST | `/api/inventory/product/{id}/restock` | Restock a product |
| POST | `/api/inventory/product/{id}/deduct` | Deduct stock (called by OrderManager) |
| GET | `/api/inventory/low-stock` | List items at or below reorder level |
| GET | `/health` | Health check |

#### API Endpoints

- **Backend**: .NET 8, C#, Entity Framework Core, SQLite
- **Frontend**: Angular 17, TypeScript
- **Container**: Multi-stage Docker build (Node + .NET SDK + ASP.NET runtime)
- **Orchestration**: Kubernetes (Helm chart), ArgoCD, HPA
- **CI/CD**: GitHub Actions -> ECR -> ArgoCD sync
- **Monitoring**: Prometheus ServiceMonitor

## Getting Started

### Prerequisites
- .NET 8 SDK
- Node.js 18+
- Angular CLI (`npm install -g @angular/cli`)

### Run Locally

```bash
# Restore and run
dotnet restore src/InventoryService.Api/InventoryService.Api.csproj
dotnet run --project src/InventoryService.Api/InventoryService.Api.csproj

The API will be available at `https://localhost:5001`.

### Run Tests

```bash
dotnet test
```

The application will be available at `http://localhost:5000`.

### Run tests

- **Dockerfile**: `docker/Dockerfile`
- **Helm chart**: `helm/inventory-service/`
- **ArgoCD manifests**: `argocd/`
- **CI/CD pipeline**: `.github/workflows/build-push.yaml`

## Platform Conformance

This service conforms to the [platform-engineering-shared-services](https://github.com/Cognition-Partner-Workshops/platform-engineering-shared-services) standard:
- Deploys to `decomposition-dev` / `decomposition-staging` namespaces
- Network policies: default-deny with explicit allow from ingress-nginx, ordermanager, and monitoring
- Prometheus ServiceMonitor for observability
- ArgoCD automated sync with prune and self-heal

## License

MIT
