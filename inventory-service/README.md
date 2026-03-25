# Inventory Service

A standalone .NET 8 + Angular 17 microservice decomposed from the OrderManager monolith. Manages stock levels, warehouse locations, and reorder thresholds.

## Architecture

This microservice owns the **Inventory** bounded context, extracted from the monolith's shared database into its own SQLite database and API.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/inventory` | GET | List all inventory items |
| `/api/inventory/product/{id}` | GET | Get inventory by product ID |
| `/api/inventory/product/{id}/restock` | POST | Restock a product |
| `/api/inventory/product/{id}/deduct` | POST | Deduct stock (used by Order service) |
| `/api/inventory/low-stock` | GET | List items at or below reorder level |
| `/health` | GET | Health check |

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
- **ArgoCD**: Application manifests for dev/staging in `argocd/`
- **CI/CD**: GitHub Actions workflow in `.github/workflows/`

## Platform Conformance

This service conforms to the [platform-engineering-shared-services](https://github.com/Cognition-Partner-Workshops/platform-engineering-shared-services) standard:
- Network policies (default-deny with explicit allow rules)
- Prometheus ServiceMonitor for metrics scraping
- HPA for auto-scaling
- Ingress via nginx ingress controller
- ArgoCD GitOps deployment
