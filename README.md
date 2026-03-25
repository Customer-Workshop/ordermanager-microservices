# Inventory Service Microservice

A standalone .NET 8 + Angular 17 microservice decomposed from the [OrderManager monolith](https://github.com/Cognition-Partner-Workshops/app_dotnet-angular-monolith). Manages stock levels, warehouse locations, and reorder alerts independently.

## Architecture

This microservice owns the **Inventory** bounded context:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/inventory` | GET | List all inventory items |
| `/api/inventory/product/{id}` | GET | Get inventory for a specific product |
| `/api/inventory/product/{id}/restock` | POST | Restock a product |
| `/api/inventory/product/{id}/check` | GET | Check stock availability |
| `/api/inventory/product/{id}/deduct` | POST | Deduct stock (called by Order service) |
| `/api/inventory/low-stock` | GET | List items at or below reorder level |
| `/health` | GET | Health check endpoint |

## Tech Stack

- **Backend**: .NET 8, C#, Entity Framework Core, SQLite
- **Frontend**: Angular 17, TypeScript
- **API**: RESTful with Swagger/OpenAPI
- **Container**: Multi-stage Docker build (Alpine-based)
- **Orchestration**: Kubernetes (Helm chart included)
- **GitOps**: ArgoCD application manifests for dev and staging
- **CI/CD**: GitHub Actions — build, test, push to ECR

## Getting Started

### Prerequisites
- .NET 8 SDK
- Node.js 18+
- Angular CLI (`npm install -g @angular/cli`)

### Run the application

```bash
# Restore .NET dependencies
dotnet restore

# Install Angular dependencies
cd client-app && npm install && cd ..

# Run the API (serves Angular app too)
dotnet run --project src/InventoryService.Api/InventoryService.Api.csproj
```

The application will be available at `http://localhost:5000`.

### Run tests

```bash
cd services/inventory-service

# Restore and run the API
dotnet restore src/InventoryService.Api/InventoryService.Api.csproj
dotnet run --project src/InventoryService.Api/InventoryService.Api.csproj

# Run tests
dotnet test
```

## IaC

| Component | Path |
|-----------|------|
| Dockerfile | `docker/Dockerfile` |
| Helm chart | `helm/inventory-service/` |
| ArgoCD manifests | `argocd/` |
| CI/CD pipeline | `.github/workflows/build-push.yaml` |

## Platform Conformance

This service conforms to the [platform-engineering-shared-services](https://github.com/Cognition-Partner-Workshops/platform-engineering-shared-services) standard:
- Deploys into `decomposition-dev` / `decomposition-staging` namespaces
- Network policies restrict ingress to ingress-nginx and monitoring namespaces
- ServiceMonitor exposes `/metrics` for Prometheus scraping
- HPA enabled in staging (2–4 replicas, 75% CPU target)

## License

MIT
