# Inventory Service (Microservice)

A standalone .NET 8 + Angular 17 microservice extracted from the [OrderManager monolith](https://github.com/Cognition-Partner-Workshops/app_dotnet-angular-monolith). Manages stock levels, warehouse locations, and reorder alerts.

## Architecture

This microservice owns the **Inventory** bounded context:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/inventory` | GET | List all inventory items |
| `/api/inventory/product/{id}` | GET | Get inventory for a specific product |
| `/api/inventory/product/{id}/restock` | POST | Restock a product |
| `/api/inventory/product/{id}/decrement` | POST | Decrement stock (called by Order service) |
| `/api/inventory/low-stock` | GET | List items at or below reorder level |
| `/health` | GET | Health check endpoint |

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
dotnet restore

# Install Angular dependencies
cd client-app && npm install && cd ..

# Run the API (serves Angular app too)
dotnet run --project src/InventoryService.Api/InventoryService.Api.csproj
```

The service will be available at `http://localhost:5000`.

### Run tests

```bash
dotnet test
```

## IaC

All infrastructure-as-code lives under `iac/`:

| Path | Description |
|------|-------------|
| `iac/docker/Dockerfile` | Multi-stage build (Angular + .NET + runtime) |
| `iac/helm/inventory-service/` | Helm chart with deployment, service, ingress, network policy, HPA, service monitor |
| `iac/argocd/` | ArgoCD Application manifests for dev and staging |
| `.github/workflows/build-push.yaml` | CI/CD pipeline: build, test, push to ECR |

## Platform Conformance

This service conforms to the [platform-engineering-shared-services](https://github.com/Cognition-Partner-Workshops/platform-engineering-shared-services) standard:
- Network policies (default-deny with explicit ingress/monitoring rules)
- ServiceMonitor for Prometheus metrics
- HPA for auto-scaling
- Ingress via nginx ingress controller
- TLS via cert-manager
- GitOps via ArgoCD
