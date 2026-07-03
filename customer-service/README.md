# Customer Service

Standalone customer microservice decomposed from the OrderManager monolith. Conforms to the platform standard defined in [platform-engineering-shared-services](https://github.com/Cognition-Partner-Workshops/platform-engineering-shared-services).

## Architecture

- **Backend**: .NET 8 Web API with EF Core (SQLite), owning its own `Customers` database (no shared database)
- **Frontend**: Angular 17 standalone components for customer listing and creation
- **Health**: `/health` endpoint for liveness/readiness probes
- Customer records do **not** include order history — the service never calls back into the monolith's orders (no circular dependency). Order data is fetched separately via the monolith's orders endpoints.

## API

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/customers` | List all customers |
| GET | `/api/customers/{id}` | Get a customer by id (404 if missing) |
| POST | `/api/customers` | Create a customer; 400 on missing name/email, 409 on duplicate email |

## Run Locally

```bash
# API (port 5300)
dotnet run --project src/CustomerService.Api/CustomerService.Api.csproj --urls http://localhost:5300

# Frontend
cd client-app && npm install && npm run build   # builds into API wwwroot

# Tests
dotnet test
```

## Deployment

- `docker/Dockerfile` — multi-stage build (Angular → .NET publish → alpine runtime), image pushed to ECR `workshop/customer-service`
- `helm/customer-service/` — deployment, service, ingress, network policy, ServiceMonitor, HPA
- `argocd/` — ArgoCD Application manifests for `decomposition-dev` and `decomposition-staging`
- `.github/workflows/customer-service-ci.yaml` — build, test, push to ECR, trigger ArgoCD sync

Note: SQLite with HPA/multiple replicas is acceptable for this workshop only; a real deployment would use a shared database.
