# Inventory Microservice

A .NET 8 + Angular 17 microservice decomposed from the [OrderManager monolith](https://github.com/Cognition-Partner-Workshops/app_dotnet-angular-monolith). Manages stock levels, warehouse locations, and reorder alerts independently.

## Architecture

| Component | Description |
|-----------|-------------|
| **API** | .NET 8 Web API with its own EF Core DbContext and SQLite database |
| **Frontend** | Angular 17 standalone components for inventory management |
| **IaC** | Helm chart, Dockerfile, ArgoCD manifests, GitHub Actions CI/CD |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/inventory` | List all inventory items |
| GET | `/api/inventory/product/{id}` | Get inventory for a product |
| POST | `/api/inventory/product/{id}/restock` | Restock a product |
| POST | `/api/inventory/product/{id}/deduct` | Deduct stock (called by monolith) |
| GET | `/api/inventory/low-stock` | List items at or below reorder level |
| GET | `/health` | Health check |

## Tech Stack

- **Backend**: .NET 8, C#, Entity Framework Core, SQLite
- **Frontend**: Angular 17, TypeScript
- **Container**: Multi-stage Docker build (Node 20 + .NET 8)
- **Orchestration**: Kubernetes via Helm + ArgoCD
- **CI/CD**: GitHub Actions -> ECR -> ArgoCD auto-sync
- **Monitoring**: Prometheus ServiceMonitor

## Getting Started

### Prerequisites
- .NET 8 SDK
- Node.js 18+
- Angular CLI (`npm install -g @angular/cli`)

### Run locally

```bash
# Restore and run the API
dotnet restore src/InventoryService.Api/InventoryService.Api.csproj
dotnet run --project src/InventoryService.Api/InventoryService.Api.csproj
```

The API will be available at `http://localhost:5000`.

### Run tests

```bash
dotnet test
```

## Platform Conformance

This service conforms to the [platform-engineering-shared-services](https://github.com/Cognition-Partner-Workshops/platform-engineering-shared-services) standard:

- Deploys into `decomposition-dev` / `decomposition-staging` namespaces
- Network policies restrict ingress to nginx-ingress and monitoring namespaces
- ServiceMonitor exposes `/metrics` for Prometheus scraping
- HPA scales based on CPU utilization in staging
- ArgoCD auto-syncs from this repo's Helm chart

## License

MIT
