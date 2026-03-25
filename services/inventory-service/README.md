# Inventory Service

A standalone .NET 8 Web API microservice decomposed from the [OrderManager monolith](https://github.com/Cognition-Partner-Workshops/app_dotnet-angular-monolith). Manages stock levels, warehouse locations, restocking, and stock availability checks.

## Architecture

This microservice owns the **Inventory** bounded context, previously a tightly-coupled module inside the OrderManager monolith. It has its own database, API surface, and Angular frontend.

| Component | Technology |
|-----------|-----------|
| **Backend** | .NET 8, C#, Entity Framework Core, SQLite |
| **Frontend** | Angular 17, TypeScript |
| **API** | RESTful with Swagger/OpenAPI |
| **Container** | Multi-stage Docker build (Alpine) |
| **Orchestration** | Kubernetes (Helm chart + ArgoCD) |
| **CI/CD** | GitHub Actions → ECR → ArgoCD |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/inventory` | List all inventory items |
| `GET` | `/api/inventory/product/{productId}` | Get inventory for a specific product |
| `POST` | `/api/inventory/product/{productId}/restock` | Restock a product |
| `GET` | `/api/inventory/low-stock` | Get items at or below reorder level |
| `GET` | `/api/inventory/product/{productId}/check?quantity=N` | Check stock availability |
| `POST` | `/api/inventory/product/{productId}/deduct` | Deduct stock (called by order service) |
| `GET` | `/health` | Health check endpoint |
| `GET` | `/swagger` | OpenAPI/Swagger UI |

### Request/Response Examples

**Restock a product:**
```bash
curl -X POST http://localhost:5001/api/inventory/product/1/restock \
  -H "Content-Type: application/json" \
  -d '{"quantity": 50}'
```

**Check stock availability:**
```bash
curl "http://localhost:5001/api/inventory/product/1/check?quantity=10"
# Response: {"productId":1,"quantity":10,"available":true}
```

**Deduct stock (service-to-service):**
```bash
curl -X POST http://localhost:5001/api/inventory/product/1/deduct \
  -H "Content-Type: application/json" \
  -d '{"quantity": 5}'
```

## Getting Started

### Prerequisites
- .NET 8 SDK
- Node.js 18+
- Angular CLI (`npm install -g @angular/cli`)

### Run Locally

```bash
# Restore .NET dependencies
dotnet restore src/InventoryService.Api/InventoryService.Api.csproj

# Install Angular dependencies
cd client-app && npm install && cd ..

# Run the API (serves Angular app too)
dotnet run --project src/InventoryService.Api/InventoryService.Api.csproj

The service will be available at `https://localhost:5001`. Swagger UI at `https://localhost:5001/swagger`.

### Run Tests

```bash
dotnet test --verbosity normal
```

## Project Structure

```
services/inventory-service/
├── src/InventoryService.Api/
│   ├── Controllers/         # API controllers
│   │   └── InventoryController.cs
│   ├── Data/                # EF Core DbContext and seed data
│   │   ├── InventoryDbContext.cs
│   │   └── SeedData.cs
│   ├── Models/              # Domain models
│   │   └── InventoryItem.cs
│   ├── Services/            # Business logic
│   │   └── InventoryService.cs
│   ├── Program.cs           # Application entry point
│   └── appsettings.json     # Configuration
├── tests/InventoryService.Api.Tests/
│   └── InventoryServiceTests.cs
├── client-app/              # Angular 17 frontend
│   └── src/app/modules/
│       ├── inventory-list/     # All inventory view
│       ├── inventory-restock/  # Restock form
│       └── low-stock-alerts/   # Low stock dashboard
├── docker/Dockerfile        # Multi-stage Docker build
├── helm/inventory-service/  # Helm chart
│   ├── templates/           # K8s manifests (deployment, service, ingress, networkpolicy, servicemonitor, hpa)
│   ├── values.yaml          # Base values
│   ├── values-dev.yaml      # Dev overrides
│   └── values-staging.yaml  # Staging overrides
├── argocd/                  # ArgoCD application manifests
│   ├── application-dev.yaml
│   └── application-staging.yaml
├── ci/build-push.yaml       # GitHub Actions CI/CD pipeline
└── InventoryService.sln     # .NET solution file
```

## Integration with OrderManager Monolith

The monolith's `OrderService.CreateOrderAsync()` previously accessed inventory directly via `AppDbContext.InventoryItems`. After decomposition, the monolith calls this service's HTTP API:

- **Stock check**: `GET /api/inventory/product/{id}/check?quantity=N`
- **Stock deduction**: `POST /api/inventory/product/{id}/deduct`

The monolith uses a typed `HttpClient` (`InventoryHttpClient`) registered in DI, configured via `appsettings.json`:

```json
{
  "InventoryService": {
    "BaseUrl": "http://inventory-service.decomposition-dev.svc.cluster.local"
  }
}
```

## Deployment

### Docker

```bash
docker build -f docker/Dockerfile -t inventory-service:latest .
docker run -p 8080:8080 inventory-service:latest
```

### Kubernetes (Helm)

```bash
helm upgrade --install inventory-service helm/inventory-service \
  -f helm/inventory-service/values.yaml \
  -f helm/inventory-service/values-dev.yaml \
  -n decomposition-dev
```

### ArgoCD (GitOps)

```bash
kubectl apply -f argocd/application-dev.yaml
```

## Platform Conformance

This service conforms to the [platform-engineering-shared-services](https://github.com/Cognition-Partner-Workshops/platform-engineering-shared-services) standard:

- **Namespace**: `decomposition-dev` / `decomposition-staging`
- **Network Policy**: Default-deny with explicit ingress from `ingress-nginx` and `monitoring` namespaces
- **ServiceMonitor**: Prometheus metrics scraping at `/metrics`
- **HPA**: Horizontal Pod Autoscaler enabled in staging (2-4 replicas)
- **Health checks**: Liveness and readiness probes at `/health`
- **Ingress**: NGINX ingress with cert-manager TLS

## License

MIT
