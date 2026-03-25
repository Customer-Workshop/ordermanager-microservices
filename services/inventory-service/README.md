# Inventory Service

A standalone .NET 8 + Angular 17 microservice decomposed from the OrderManager monolith. Manages stock levels, warehouse locations, and reorder thresholds.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/inventory` | List all inventory items |
| GET | `/api/inventory/product/{productId}` | Get inventory for a specific product |
| POST | `/api/inventory/product/{productId}/restock` | Restock a product |
| GET | `/api/inventory/low-stock` | List items at or below reorder level |
| GET | `/api/inventory/product/{productId}/check?quantity=N` | Check if stock is available |
| POST | `/api/inventory/product/{productId}/deduct` | Deduct stock (used by order service) |
| GET | `/health` | Health check endpoint |

## Getting Started

### Prerequisites
- .NET 8 SDK
- Node.js 18+
- Angular CLI (`npm install -g @angular/cli`)

### Run locally

```bash
# Restore .NET dependencies
dotnet restore src/InventoryService.Api/InventoryService.Api.csproj

# Install Angular dependencies
cd client-app && npm install && cd ..

# Run the API (serves Angular app too)
dotnet run --project src/InventoryService.Api/InventoryService.Api.csproj
```

The service will be available at `https://localhost:5001`.

### Run tests

```bash
dotnet test
```

## Architecture

This service owns its own SQLite database and exposes HTTP endpoints consumed by:
- The **OrderManager monolith** (via HTTP client for stock checks and deductions)
- The **Angular frontend** (for inventory management UI)

## IaC

- `docker/` — Multi-stage Dockerfile
- `helm/` — Kubernetes Helm chart
- `argocd/` — ArgoCD application manifests (dev, staging)
- `ci/` — GitHub Actions CI/CD pipeline
