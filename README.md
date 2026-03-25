# Inventory Service Microservice

A standalone .NET 8 Web API + Angular 17 microservice responsible for managing product inventory, stock levels, warehouse locations, and reorder alerts. Decomposed from the [OrderManager monolith](https://github.com/Cognition-Partner-Workshops/app_dotnet-angular-monolith).

## Architecture

```
┌─────────────────────────────────────────────┐
│           Inventory Service                  │
│                                              │
│  ┌──────────┐  ┌────────────┐  ┌──────────┐│
│  │Controller │→ │  Service   │→ │ EF Core  ││
│  │  (REST)   │  │  (Logic)   │  │ DbContext ││
│  └──────────┘  └────────────┘  └──────────┘│
│       ↑                            ↓        │
│  ┌──────────┐              ┌──────────────┐ │
│  │ Angular  │              │   SQLite DB   │ │
│  │ Frontend │              │ (inventory.db)│ │
│  └──────────┘              └──────────────┘ │
└─────────────────────────────────────────────┘
        ↑                          ↑
   HTTP clients              Inter-service
   (browsers)                calls (Order svc)
```

### Domain Responsibility

| Capability | Description |
|---|---|
| **Stock Queries** | Get all inventory, query by product ID, get by item ID |
| **Restocking** | Add stock quantity to existing products |
| **Stock Deduction** | Deduct stock during order creation (called by Order service) |
| **Low Stock Alerts** | Query items at or below reorder level |
| **Stock Checks** | Validate stock availability before order placement |
| **CRUD Operations** | Create, update, delete inventory records |

## Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | .NET 8, C# 12, ASP.NET Core Web API |
| **ORM** | Entity Framework Core 8 with SQLite |
| **Frontend** | Angular 17, TypeScript 5.2, Standalone Components |
| **API Docs** | Swagger/OpenAPI via Swashbuckle with Annotations |
| **Testing** | xUnit, EF Core InMemory provider |
| **Container** | Multi-stage Docker build (Alpine-based) |
| **Orchestration** | Kubernetes via Helm chart |
| **GitOps** | ArgoCD application manifests |
| **CI/CD** | GitHub Actions → ECR → ArgoCD sync |
| **Monitoring** | Prometheus ServiceMonitor |

## Getting Started

### Prerequisites

- .NET 8 SDK
- Node.js 18+
- Angular CLI (`npm install -g @angular/cli`)

### Run Locally

**Run locally:**
```bash
# Restore and run the API
dotnet restore src/InventoryService.Api/InventoryService.Api.csproj
dotnet run --project src/InventoryService.Api/InventoryService.Api.csproj --urls "http://localhost:5002"

# In a separate terminal, install and run the Angular client
cd client-app && npm install && ng serve --port 4201
```

- **API**: http://localhost:5002
- **Swagger UI**: http://localhost:5002/swagger
- **Angular Client**: http://localhost:4201

### Run Tests

```bash
dotnet test --verbosity normal
```

## API Reference

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
