# Inventory Microservice

A .NET 8 + Angular 17 microservice extracted from the OrderManager monolith. Manages stock levels, warehouse locations, and reorder alerts as an independent service.

## Architecture

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/inventory` | GET | List all inventory items |
| `/api/inventory/product/{id}` | GET | Get inventory for a product |
| `/api/inventory/product/{id}/restock` | POST | Restock a product |
| `/api/inventory/low-stock` | GET | List items at or below reorder level |
| `/api/inventory/product/{id}/check?quantity=N` | GET | Check if stock is sufficient |
| `/api/inventory/product/{id}/deduct` | POST | Deduct stock (used by OrderManager) |
| `/health` | GET | Health check |

## Tech Stack

- **Backend**: .NET 8, C#, Entity Framework Core, SQLite
- **Frontend**: Angular 17, TypeScript
- **Container**: Multi-stage Docker build (Alpine)
- **Orchestration**: Helm, ArgoCD, HPA
- **CI/CD**: GitHub Actions, Amazon ECR

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

# Run the API
dotnet run --project src/InventoryService.Api/InventoryService.Api.csproj
```

The application will be available at `http://localhost:5000`.

### Run tests

```bash
dotnet test
```

## Deployment

- **Docker**: Multi-stage build in `docker/Dockerfile`
- **Helm**: Kubernetes deployment chart in `helm/inventory-service/`
- **ArgoCD**: GitOps manifests in `argocd/`
- **CI/CD**: GitHub Actions workflow in `.github/workflows/`

## Platform Conformance

This service conforms to the [platform-engineering-shared-services](https://github.com/Cognition-Partner-Workshops/platform-engineering-shared-services) standard including:
- Network policies (ingress-nginx, monitoring namespace access)
- Prometheus ServiceMonitor for metrics
- HPA for autoscaling
- Health check endpoints for liveness/readiness probes
