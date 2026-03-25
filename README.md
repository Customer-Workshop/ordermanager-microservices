# Inventory Microservice

A .NET 8 + Angular 17 microservice extracted from the OrderManager monolith. Manages stock levels, warehouse locations, and reorder alerts independently.

## Architecture

This is the **Inventory** domain service decomposed from the [OrderManager monolith](https://github.com/Cognition-Partner-Workshops/app_dotnet-angular-monolith).

| Endpoint | Description |
|----------|-------------|
| `GET /api/inventory` | List all inventory items |
| `GET /api/inventory/product/{id}` | Get inventory by product ID |
| `POST /api/inventory/product/{id}/restock` | Restock a product |
| `POST /api/inventory/product/{id}/deduct` | Deduct stock for a product |
| `GET /api/inventory/low-stock` | List items at or below reorder level |
| `GET /health` | Health check endpoint |

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
dotnet restore src/InventoryService.Api/InventoryService.Api.csproj

# Install Angular dependencies
cd client-app && npm install && cd ..

# Run the API (serves Angular app too)
dotnet run --project src/InventoryService.Api/InventoryService.Api.csproj
```

The application will be available at `https://localhost:5001`.

### Run tests

```bash
dotnet test
```

## Infrastructure

| Component | Path |
|-----------|------|
| Dockerfile | `docker/Dockerfile` |
| Helm chart | `helm/inventory-service/` |
| ArgoCD manifests | `argocd/` |
| CI/CD pipeline | `.github/workflows/build-push.yaml` |

## Platform Conformance

This service conforms to the [platform-engineering-shared-services](https://github.com/Cognition-Partner-Workshops/platform-engineering-shared-services) standard:
- Deploys into `decomposition-dev` / `decomposition-staging` namespaces
- Network policies follow default-deny with explicit allow rules
- ServiceMonitor for Prometheus scraping
- HPA for horizontal autoscaling in staging
- ArgoCD for GitOps-driven deployments

## License

MIT
