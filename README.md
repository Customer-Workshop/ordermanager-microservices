# Microservices — Decomposed from OrderManager Monolith

This repository contains microservices extracted from the [OrderManager monolith](https://github.com/Cognition-Partner-Workshops/app_dotnet-angular-monolith).

## Services

### Inventory Service

A standalone .NET 8 Web API managing stock levels, warehouse locations, and reorder thresholds.

**Tech Stack**: .NET 8, EF Core (SQLite), Angular 17, Docker, Helm, ArgoCD

#### API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/inventory` | List all inventory items |
| GET | `/api/inventory/product/{id}` | Get inventory for a product |
| POST | `/api/inventory/product/{id}/restock` | Restock a product |
| POST | `/api/inventory/product/{id}/deduct` | Deduct stock (used by monolith) |
| GET | `/api/inventory/low-stock` | List low-stock items |
| GET | `/health` | Health check |

#### Running Locally

```bash
cd services/inventory-service

# Restore and run the API
dotnet restore src/InventoryService.Api/InventoryService.Api.csproj
dotnet run --project src/InventoryService.Api/InventoryService.Api.csproj

# Run tests
dotnet test
```

The API will be available at `http://localhost:5000`.

## Infrastructure

- **Docker**: Multi-stage Dockerfile in `docker/`
- **Helm**: Chart in `helm/inventory-service/` with dev/staging value overrides
- **ArgoCD**: Application manifests in `argocd/`
- **CI/CD**: GitHub Actions workflow in `.github/workflows/`

## Platform Conformance

This service conforms to the [platform-engineering-shared-services](https://github.com/Cognition-Partner-Workshops/platform-engineering-shared-services) standard:
- Network policies (ingress-nginx, monitoring namespace access)
- ServiceMonitor for Prometheus scraping
- HPA for horizontal auto-scaling
- Namespaced deployments (decomposition-dev, decomposition-staging)
