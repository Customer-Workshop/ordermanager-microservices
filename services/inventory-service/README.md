# Inventory Service

A .NET 8 + Angular 17 microservice extracted from the OrderManager monolith. Manages stock levels, warehouse locations, and reorder alerts.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/inventory` | List all inventory items |
| GET | `/api/inventory/product/{productId}` | Get inventory for a specific product |
| POST | `/api/inventory/product/{productId}/restock` | Restock a product |
| GET | `/api/inventory/low-stock` | List items at or below reorder level |
| GET | `/api/inventory/product/{productId}/check?quantity=N` | Check stock availability |
| POST | `/api/inventory/product/{productId}/deduct` | Deduct stock (used by Order service) |
| GET | `/health` | Health check endpoint |

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

- **Docker**: Multi-stage Dockerfile in `docker/`
- **Helm**: Kubernetes deployment chart in `helm/inventory-service/`
- **ArgoCD**: GitOps application manifests in `argocd/`
- **CI/CD**: GitHub Actions workflow in `.github/workflows/`

## Platform Conformance

This service conforms to the [platform-engineering-shared-services](https://github.com/Cognition-Partner-Workshops/platform-engineering-shared-services) standard:
- Deploys to `decomposition-dev` / `decomposition-staging` namespaces
- Network policies: default-deny with explicit allow from ingress-nginx and monitoring
- ServiceMonitor for Prometheus scraping
- HPA for horizontal autoscaling in staging
