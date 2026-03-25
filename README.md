# Inventory Microservice

A .NET 8 + Angular 17 microservice decomposed from the [OrderManager monolith](https://github.com/Cognition-Partner-Workshops/app_dotnet-angular-monolith). Manages stock levels, warehouse locations, and reorder alerts as an independent service.

## Architecture

| Component | Technology |
|-----------|-----------|
| **Backend** | .NET 8, C#, Entity Framework Core, SQLite |
| **Frontend** | Angular 17, TypeScript |
| **API** | RESTful with Swagger/OpenAPI |
| **Container** | Multi-stage Docker build |
| **Orchestration** | Kubernetes (Helm chart) |
| **GitOps** | ArgoCD |
| **CI/CD** | GitHub Actions |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/inventory` | List all inventory items |
| GET | `/api/inventory/product/{productId}` | Get inventory by product ID |
| POST | `/api/inventory/product/{productId}/restock` | Restock a product |
| GET | `/api/inventory/low-stock` | Get items below reorder level |
| GET | `/api/inventory/product/{productId}/check?quantity=N` | Check stock availability |
| POST | `/api/inventory/product/{productId}/decrement` | Decrement stock (used by OrderManager) |
| GET | `/health` | Health check endpoint |

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

The application will be available at `http://localhost:5000`.

### Run tests

```bash
dotnet test
```

## Project Structure

```
src/InventoryService.Api/       # .NET 8 Web API
  Controllers/                  # API controllers
  Models/                       # Domain models
  Services/                     # Business logic
  Data/                         # EF Core DbContext and seed data
client-app/                     # Angular 17 frontend
docker/Dockerfile               # Multi-stage Docker build
helm/inventory-service/         # Helm chart
argocd/                         # ArgoCD application manifests
.github/workflows/              # CI/CD pipeline
tests/                          # Unit tests
```

## Platform Conformance

This service conforms to the [platform-engineering-shared-services](https://github.com/Cognition-Partner-Workshops/platform-engineering-shared-services) standard:
- Deploys to `decomposition-dev` / `decomposition-staging` namespaces
- Network policies restrict ingress to ingress-nginx and monitoring namespaces
- ServiceMonitor for Prometheus metrics collection
- HPA for autoscaling in staging
- ArgoCD automated sync with self-heal

## License

MIT
