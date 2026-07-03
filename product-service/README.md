# Product Service

Standalone product catalog microservice decomposed from the OrderManager monolith. Conforms to the platform standard defined in [platform-engineering-shared-services](https://github.com/Cognition-Partner-Workshops/platform-engineering-shared-services).

## Architecture

- **Backend**: .NET 8 Web API with EF Core (SQLite), owning its own `Products` database (no shared database)
- **Frontend**: Angular 17 standalone components for browsing and creating products
- **Health**: `/health` endpoint for liveness/readiness probes

## API

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/products` | List all products |
| GET | `/api/products/{id}` | Get a product by id |
| GET | `/api/products/category/{category}` | List products in a category |
| POST | `/api/products/batch` | Batch get by ids (`{ "ids": [1, 2] }`) — used by the monolith order flow |
| POST | `/api/products` | Create a product; 400 on invalid input, 409 on duplicate SKU |

## Run Locally

```bash
# API (port 5300)
dotnet run --project src/ProductService.Api/ProductService.Api.csproj --urls http://localhost:5300

# Frontend
cd client-app && npm install && npm run build   # builds into API wwwroot

# Tests
dotnet test
```

## Deployment

- `docker/Dockerfile` — multi-stage build (Angular → .NET publish → alpine runtime), image pushed to ECR `workshop/product-service`
- `helm/product-service/` — deployment, service, ingress, network policy, ServiceMonitor, HPA
- `argocd/` — ArgoCD Application manifests for `decomposition-dev` and `decomposition-staging`
- `.github/workflows/product-service-ci.yaml` — build, test, push to ECR, trigger ArgoCD sync
