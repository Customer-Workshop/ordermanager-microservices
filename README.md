# Inventory Microservice

Standalone inventory management microservice decomposed from the [OrderManager monolith](https://github.com/Cognition-Partner-Workshops/app_dotnet-angular-monolith). Conforms to the [platform-engineering-shared-services](https://github.com/Cognition-Partner-Workshops/platform-engineering-shared-services) standard.

## Architecture

| Component | Description |
|-----------|-------------|
| **Backend** | .NET 8 Web API with EF Core + SQLite |
| **Frontend** | Angular 17 standalone components |
| **Container** | Multi-stage Docker build (Node + .NET SDK + Alpine runtime) |
| **Orchestration** | Helm chart with HPA, network policies, service monitor |
| **GitOps** | ArgoCD application manifests for dev and staging |
| **CI/CD** | GitHub Actions — build, test, push to ECR |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/inventory` | List all inventory items |
| GET | `/api/inventory/product/{productId}` | Get inventory for a specific product |
| POST | `/api/inventory/product/{productId}/restock` | Restock a product |
| POST | `/api/inventory/product/{productId}/deduct` | Deduct stock (called by order service) |
| GET | `/api/inventory/low-stock` | List items at or below reorder level |
| GET | `/api/inventory/product/{productId}/stock-level` | Get stock level for a product |
| GET | `/health` | Health check endpoint |

## Getting Started

### Prerequisites

- .NET 8 SDK
- Node.js 18+
- Angular CLI

### Run Locally

**Run locally:**
```bash
dotnet restore
cd src/inventory-service/client-app && npm install && cd ../../..
dotnet run --project src/inventory-service/InventoryService.csproj
```

### Run tests

```bash
dotnet test --verbosity normal
```

## Project Structure

```
src/inventory-service/       # .NET 8 Web API + Angular 17 frontend
tests/InventoryService.Tests/  # xUnit tests
docker/Dockerfile            # Multi-stage build
helm/inventory-service/      # Helm chart (deployment, service, HPA, network policy, service monitor)
argocd/                      # ArgoCD application manifests (dev + staging)
.github/workflows/           # CI/CD pipeline
```

### Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/inventory` | List all inventory items |
| `GET` | `/api/inventory/{id}` | Get item by ID |
| `GET` | `/api/inventory/product/{productId}` | Get item by product ID |
| `POST` | `/api/inventory` | Create a new inventory item |
| `PATCH` | `/api/inventory/{id}` | Partially update an item |
| `DELETE` | `/api/inventory/{id}` | Delete an item |
| `POST` | `/api/inventory/product/{productId}/restock` | Restock a product |
| `POST` | `/api/inventory/product/{productId}/deduct` | Deduct stock (order fulfillment) |
| `GET` | `/api/inventory/low-stock` | Get items at/below reorder level |
| `POST` | `/api/inventory/stock-check` | Check stock availability |
| `GET` | `/health` | Health check (includes DB connectivity) |
| `GET` | `/swagger` | Interactive Swagger UI |
| `GET` | `/swagger/v1/swagger.json` | OpenAPI 3.0 spec (JSON) |

### Example Requests

```bash
# Get all inventory
curl http://localhost:5002/api/inventory

# Check stock for product 1
curl -X POST http://localhost:5002/api/inventory/stock-check \
  -H "Content-Type: application/json" \
  -d '{"productId": 1, "quantity": 10}'

# Restock product 1
curl -X POST http://localhost:5002/api/inventory/product/1/restock \
  -H "Content-Type: application/json" \
  -d '{"quantity": 50}'

# Deduct stock for product 1 (used by Order service)
curl -X POST http://localhost:5002/api/inventory/product/1/deduct \
  -H "Content-Type: application/json" \
  -d '{"quantity": 5}'

# Get low stock items
curl http://localhost:5002/api/inventory/low-stock
```

### OpenAPI Specification

A full OpenAPI 3.0 specification is available at:
- **Runtime**: `GET /swagger/v1/swagger.json` (auto-generated from code annotations)
- **Static**: [`docs/openapi-spec.yaml`](docs/openapi-spec.yaml) (version-controlled)

## Project Structure

```
app_dotnet-angular-microservices/
├── src/InventoryService.Api/
│   ├── Controllers/          # REST API controllers with Swagger annotations
│   ├── Data/                 # EF Core DbContext and seed data
│   ├── Models/               # Domain models and DTOs
│   ├── Services/             # Business logic layer
│   ├── Program.cs            # Application entry point and DI configuration
│   └── appsettings.json      # Application configuration
├── tests/InventoryService.Api.Tests/
│   └── InventoryServiceTests.cs  # Unit tests (xUnit)
├── client-app/               # Angular 17 frontend
│   └── src/app/modules/inventory/
│       ├── inventory-list.component.ts   # Main inventory view
│       └── low-stock.component.ts        # Low stock alerts view
├── docker/Dockerfile         # Multi-stage build (Node → .NET → Alpine runtime)
├── helm/inventory-service/   # Helm chart
│   ├── templates/            # K8s manifests (deployment, service, networkpolicy, hpa, servicemonitor)
│   ├── values.yaml           # Base values
│   ├── values-dev.yaml       # Dev environment overrides
│   └── values-staging.yaml   # Staging environment overrides
├── argocd/                   # ArgoCD application manifests
│   ├── application-dev.yaml
│   └── application-staging.yaml
├── .github/workflows/ci-cd.yaml  # GitHub Actions pipeline
└── docs/openapi-spec.yaml    # Static OpenAPI specification
```

## Infrastructure

### Docker

Multi-stage build following the platform pattern:
1. **Stage 1** — Build Angular client (`node:20-alpine`)
2. **Stage 2** — Build .NET API (`dotnet/sdk:8.0`)
3. **Stage 3** — Runtime (`dotnet/aspnet:8.0-alpine`, ~80MB)

```bash
docker build -f docker/Dockerfile -t inventory-service:latest .
docker run -p 8080:8080 inventory-service:latest
```

### Helm Chart

Includes: Deployment, Service, Ingress, NetworkPolicy, ServiceMonitor, HPA.

```bash
helm install inventory-service helm/inventory-service -f helm/inventory-service/values-dev.yaml
```

### ArgoCD

GitOps-driven deployment to `decomposition-dev` and `decomposition-staging` namespaces.

### CI/CD Pipeline

GitHub Actions workflow:
1. **build-and-test** — Restore, build, run xUnit tests
2. **build-and-push** — Docker build and push to ECR (main branch only)
3. **deploy-dev** — Trigger ArgoCD sync for dev
4. **deploy-staging** — Trigger ArgoCD sync for staging (requires approval)

## Inter-Service Communication

The monolith's `OrderService` now calls this microservice via HTTP instead of accessing the database directly:

| Monolith Operation | Microservice Endpoint |
|---|---|
| `_context.InventoryItems.FirstOrDefault(...)` | `GET /api/inventory/product/{productId}` |
| `inventory.QuantityOnHand < quantity` check | `POST /api/inventory/stock-check` |
| `inventory.QuantityOnHand -= quantity` | `POST /api/inventory/product/{productId}/deduct` |

## Configuration

| Environment Variable | Description | Default |
|---|---|---|
| `ConnectionStrings__DefaultConnection` | SQLite connection string | `Data Source=inventory.db` |
| `ASPNETCORE_ENVIRONMENT` | Runtime environment | `Production` |
| `ASPNETCORE_URLS` | Listen URLs | `http://+:8080` |

## Platform Compliance

This service follows the standards defined in [platform-engineering-shared-services](https://github.com/Cognition-Partner-Workshops/platform-engineering-shared-services):

- Deploys to platform-managed namespaces (`decomposition-dev`, `decomposition-staging`)
- NetworkPolicy restricts ingress to nginx ingress controller and monitoring namespace
- ServiceMonitor enables Prometheus scraping on `/metrics`
- HPA enabled in staging (2-4 replicas, CPU target 75%)
- Health checks at `/health` with EF Core database connectivity validation
