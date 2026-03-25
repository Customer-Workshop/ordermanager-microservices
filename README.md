# Inventory Microservice

A .NET 8 + Angular 17 microservice decomposed from the OrderManager monolith. Manages inventory stock levels, warehouse locations, and reorder alerts independently.

## Architecture

| Component | Description |
|-----------|-------------|
| **API** | .NET 8 Web API with EF Core + SQLite |
| **Frontend** | Angular 17 standalone components |
| **IaC** | Helm chart, ArgoCD manifests, Dockerfile |
| **CI/CD** | GitHub Actions — build, test, push to ECR |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/inventory` | List all inventory items |
| GET | `/api/inventory/product/{id}` | Get inventory for a product |
| POST | `/api/inventory/product/{id}/restock` | Restock a product |
| GET | `/api/inventory/low-stock` | List low-stock items |
| GET | `/api/inventory/product/{id}/check?quantity=N` | Check stock availability |
| POST | `/api/inventory/product/{id}/deduct` | Deduct stock (used by order service) |
| GET | `/health` | Health check |

## Getting Started

### Prerequisites
- .NET 8 SDK
- Node.js 18+
- Angular CLI (`npm install -g @angular/cli`)

### Run locally

```bash
# Restore and run the API
dotnet restore
dotnet run --project src/InventoryService.Api/InventoryService.Api.csproj

# Run tests
dotnet test
```

The API will be available at `http://localhost:5062`.

## Deployment

See `helm/`, `argocd/`, and `docker/` for Kubernetes deployment artifacts.
