# app_dotnet-angular-microservices

Decomposed microservices extracted from the [OrderManager monolith](https://github.com/Cognition-Partner-Workshops/app_dotnet-angular-monolith).

## Services

### Inventory Service

Manages product inventory levels, warehouse locations, restocking, and low-stock alerts.

**Tech Stack:** .NET 8, ASP.NET Core, EF Core (SQLite), Angular 17

**API Endpoints:**
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/inventory` | List all inventory items |
| GET | `/api/inventory/product/{productId}` | Get inventory for a specific product |
| POST | `/api/inventory/product/{productId}/restock` | Restock a product |
| GET | `/api/inventory/low-stock` | List items at or below reorder level |
| GET | `/health` | Health check endpoint |

**Local Development:**
```bash
# Backend
cd Services/InventoryService
dotnet restore
dotnet build
dotnet test
dotnet run --project src/InventoryService.Api

# Frontend
cd Services/InventoryService/client-app
npm install
npm run build
```

**Infrastructure:**
- `docker/` — Multi-stage Dockerfile
- `helm/inventory-service/` — Helm chart with NetworkPolicy, ServiceMonitor, HPA
- `argocd/` — ArgoCD Application manifests for dev and staging
