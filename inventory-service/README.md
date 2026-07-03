# Inventory Service

Standalone inventory microservice decomposed from the OrderManager monolith. Conforms to the platform standard defined in [platform-engineering-shared-services](https://github.com/Cognition-Partner-Workshops/platform-engineering-shared-services).

## Architecture

- **Backend**: .NET 8 Web API with EF Core (SQLite), owning its own `InventoryItems` database (no shared database)
- **Frontend**: Angular 17 standalone components for inventory management and low-stock alerts
- **Health**: `/health` endpoint for liveness/readiness probes

## API

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/inventory` | List all inventory items |
| GET | `/api/inventory/product/{productId}` | Get inventory for a product |
| POST | `/api/inventory/product/{productId}/restock` | Restock (`{ "quantity": n }`) |
| POST | `/api/inventory/product/{productId}/deduct` | Deduct stock (`{ "quantity": n }`); 409 on insufficient stock |
| GET | `/api/inventory/low-stock` | Items at or below reorder level |

## Run Locally

```bash
# API (port 5200)
dotnet run --project src/InventoryService.Api/InventoryService.Api.csproj --urls http://localhost:5200

# Frontend
cd client-app && npm install && npm run build   # builds into API wwwroot

# Tests
dotnet test
```

## Deployment

- `docker/Dockerfile` — multi-stage build (Angular → .NET publish → alpine runtime), image pushed to ECR `workshop/inventory-service`
- `helm/inventory-service/` — deployment, service, ingress, network policy, ServiceMonitor, HPA
- `argocd/` — ArgoCD Application manifests for `decomposition-dev` and `decomposition-staging`
- `.github/workflows/inventory-service-ci.yaml` — build, test, push to ECR, trigger ArgoCD sync
