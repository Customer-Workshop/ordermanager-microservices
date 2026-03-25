# Inventory Microservice

Standalone .NET 8 + Angular 17 microservice extracted from the [OrderManager monolith](https://github.com/Cognition-Partner-Workshops/app_dotnet-angular-monolith). Manages stock levels, warehouse locations, and reorder alerts independently.

## Architecture

| Layer | Technology |
|-------|-----------|
| **Backend** | .NET 8 Web API, EF Core, SQLite |
| **Frontend** | Angular 17, TypeScript |
| **Container** | Multi-stage Docker build |
| **Orchestration** | Helm chart, ArgoCD, HPA |
| **CI/CD** | GitHub Actions → ECR → ArgoCD sync |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/inventory` | List all inventory items |
| GET | `/api/inventory/product/{id}` | Get inventory for a product |
| POST | `/api/inventory/product/{id}/restock` | Restock a product |
| GET | `/api/inventory/low-stock` | List items below reorder level |
| GET | `/api/inventory/product/{id}/check?quantity=N` | Check stock availability |
| POST | `/api/inventory/product/{id}/deduct` | Deduct stock (used by monolith) |
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
```

### Run tests

```bash
dotnet test
```

## Project Structure

```
src/InventoryService.Api/     # .NET 8 Web API
  Controllers/                # REST controllers
  Models/                     # EF Core entity models
  Services/                   # Business logic
  Data/                       # DbContext and seed data
client-app/                   # Angular 17 frontend
docker/Dockerfile             # Multi-stage container build
helm/inventory-service/       # Helm chart
argocd/                       # ArgoCD application manifests
.github/workflows/            # CI/CD pipeline
tests/                        # Unit tests
```

## Platform Conformance

This service conforms to the [platform-engineering-shared-services](https://github.com/Cognition-Partner-Workshops/platform-engineering-shared-services) standard:
- Network policies (default-deny + explicit allow)
- Prometheus ServiceMonitor for metrics
- HPA for autoscaling
- ArgoCD GitOps deployment
- cert-manager TLS annotations

## License

MIT
