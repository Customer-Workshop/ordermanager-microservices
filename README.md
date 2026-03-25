# Inventory Microservice

A .NET 8 + Angular 17 microservice extracted from the OrderManager monolith. Manages stock levels, warehouse locations, and reorder alerts independently.

## Architecture

| Component | Technology |
|-----------|-----------|
| **Backend** | .NET 8 Web API, EF Core, SQLite |
| **Frontend** | Angular 17, standalone components |
| **Container** | Multi-stage Docker build |
| **Orchestration** | Kubernetes via Helm + ArgoCD |
| **Monitoring** | Prometheus ServiceMonitor |
| **CI/CD** | GitHub Actions -> ECR -> ArgoCD |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/inventory` | List all inventory items |
| GET | `/api/inventory/product/{id}` | Get inventory for a product |
| POST | `/api/inventory/product/{id}/restock` | Restock a product |
| GET | `/api/inventory/low-stock` | List low-stock items |
| GET | `/api/inventory/product/{id}/check?quantity=N` | Check stock availability |
| POST | `/api/inventory/product/{id}/deduct` | Deduct stock (used by order-service) |
| GET | `/health` | Health check endpoint |

## Getting Started

### Prerequisites
- .NET 8 SDK
- Node.js 18+
- Angular CLI (`npm install -g @angular/cli`)

### Run locally

```bash
# Restore and run API
dotnet restore src/InventoryService.Api/InventoryService.Api.csproj
dotnet run --project src/InventoryService.Api/InventoryService.Api.csproj

# Install and build Angular client
cd client-app && npm install && npm run build && cd ..

# Run tests
dotnet test
```

The API will be available at `http://localhost:5000` with Swagger UI.

## Infrastructure

- **Dockerfile**: `docker/Dockerfile` — multi-stage build (Node + .NET SDK + runtime)
- **Helm chart**: `helm/inventory-service/` — deployment, service, network policy, HPA, service monitor
- **ArgoCD**: `argocd/` — application manifests for dev and staging environments
- **CI/CD**: `.github/workflows/build-push.yaml` — build, test, push to ECR

## Platform Conformance

This service conforms to the [platform-engineering-shared-services](https://github.com/Cognition-Partner-Workshops/platform-engineering-shared-services) standard:
- Deploys to `decomposition-dev` / `decomposition-staging` namespaces
- Network policies restrict traffic to ingress-nginx and monitoring namespaces
- Prometheus metrics exposed via ServiceMonitor
- Health check endpoint at `/health`
- Container images stored in ECR (`workshop/inventory-service`)
