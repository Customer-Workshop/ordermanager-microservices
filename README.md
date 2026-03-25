# Inventory Service — Microservice

[![Build](https://github.com/Cognition-Partner-Workshops/app_dotnet-angular-microservices/actions/workflows/build-push.yaml/badge.svg)](https://github.com/Cognition-Partner-Workshops/app_dotnet-angular-microservices/actions)

Standalone .NET 8 Web API + Angular 17 frontend for inventory management, decomposed from the [OrderManager monolith](https://github.com/Cognition-Partner-Workshops/app_dotnet-angular-monolith). Conforms to the [platform-engineering-shared-services](https://github.com/Cognition-Partner-Workshops/platform-engineering-shared-services) standard.

| Component | Tech | Description |
|-----------|------|-------------|
| **API** | .NET 8, EF Core, SQLite | REST API with Swagger/OpenAPI documentation |
| **Frontend** | Angular 17 | Standalone components for inventory management |
| **Docker** | Multi-stage | Node 20 → .NET 8 SDK → ASP.NET 8 Alpine runtime |
| **Helm** | v0.1.0 | Deployment, service, ingress, HPA, network policy, service monitor |
| **ArgoCD** | GitOps | Application manifests for dev and staging |
| **CI/CD** | GitHub Actions | Build, test, push to ECR, trigger ArgoCD sync |

## Quick Start

```bash
# Restore and build
dotnet restore
dotnet build

# Run the API (http://localhost:5000)
dotnet run --project src/InventoryService.Api/InventoryService.Api.csproj

# Run tests
dotnet test --verbosity normal
```

### Docker

```bash
docker build -f docker/Dockerfile -t inventory-service:local .
docker run -p 8080:8080 inventory-service:local

# Verify
curl http://localhost:8080/health
curl http://localhost:8080/swagger
```

## API Reference

Interactive docs available at **`/swagger`** when the service is running. OpenAPI spec: [`docs/openapi-spec.yaml`](docs/openapi-spec.yaml).

| Method | Endpoint | Description | Success | Error |
|--------|----------|-------------|---------|-------|
| `GET` | `/api/inventory` | List all inventory items | `200` | — |
| `GET` | `/api/inventory/product/{productId}` | Get inventory by product ID | `200` | `404` |
| `POST` | `/api/inventory/product/{productId}/restock` | Add stock to a product | `200` | `400` |
| `POST` | `/api/inventory/product/{productId}/deduct` | Deduct stock (used by Order service) | `200` | `409` |
| `GET` | `/api/inventory/low-stock` | Items at or below reorder level | `200` | — |
| `GET` | `/health` | Kubernetes health probe | `200` | — |

### Examples

```bash
# List all inventory
curl http://localhost:5000/api/inventory | jq .

# Get inventory for product 1
curl http://localhost:5000/api/inventory/product/1 | jq .

# Restock product 1 with 25 units
curl -X POST http://localhost:5000/api/inventory/product/1/restock \
  -H "Content-Type: application/json" \
  -d '{"quantity": 25}' | jq .

# Deduct 5 units (called by Order service during checkout)
curl -X POST http://localhost:5000/api/inventory/product/1/deduct \
  -H "Content-Type: application/json" \
  -d '{"quantity": 5}' | jq .

# Get low-stock items
curl http://localhost:5000/api/inventory/low-stock | jq .
```

### Data Model

| Field | Type | Description |
|-------|------|-------------|
| `id` | `int` | Auto-generated primary key |
| `productId` | `int` | Foreign key to Product catalog (unique index) |
| `productName` | `string` | Denormalized product name (max 200 chars) |
| `quantityOnHand` | `int` | Current stock level |
| `reorderLevel` | `int` | Threshold that triggers low-stock alert (default: 10) |
| `warehouseLocation` | `string` | Physical location code (e.g., A-01) |
| `lastRestocked` | `datetime` | UTC timestamp of last restock |

## Configuration

| Setting | Default | Description |
|---------|---------|-------------|
| `ConnectionStrings:DefaultConnection` | `Data Source=inventory.db` | SQLite connection string |
| `ASPNETCORE_ENVIRONMENT` | `Development` | Runtime environment |
| `ASPNETCORE_URLS` | `http://+:8080` (Docker) | Listen URL |

## Architecture

The monolith's in-process inventory calls are replaced with HTTP calls to this service's `/api/inventory` endpoints. The monolith uses a typed `InventoryServiceClient` (`HttpClient`) for communication.

See [`docs/architecture.md`](docs/architecture.md) for the full Architecture Decision Record including design trade-offs, layer diagrams, and deployment topology.

See [`docs/deployment.md`](docs/deployment.md) for Kubernetes deployment instructions, Helm values, health check configuration, network policies, and troubleshooting.

## Project Structure

```
.
├── .github/workflows/
│   └── build-push.yaml             # CI/CD: build, test, push to ECR, ArgoCD sync
├── argocd/
│   ├── application-dev.yaml         # ArgoCD app manifest (dev)
│   └── application-staging.yaml     # ArgoCD app manifest (staging)
├── client-app/                      # Angular 17 frontend
│   └── src/app/modules/inventory/
│       ├── inventory-list.component.ts
│       └── low-stock.component.ts
├── docker/
│   └── Dockerfile                   # Multi-stage build (Node → .NET SDK → Alpine runtime)
├── docs/
│   ├── architecture.md              # Architecture Decision Record
│   ├── deployment.md                # Deployment & operations guide
│   └── openapi-spec.yaml            # OpenAPI 3.0 specification
├── helm/inventory-service/
│   ├── Chart.yaml
│   ├── templates/                   # deployment, service, ingress, hpa, networkpolicy, servicemonitor
│   ├── values.yaml                  # Base values
│   ├── values-dev.yaml              # Dev overrides (1 replica, no HPA)
│   └── values-staging.yaml          # Staging overrides (2 replicas, HPA 2-4)
├── src/InventoryService.Api/
│   ├── Controllers/InventoryController.cs
│   ├── Data/InventoryDbContext.cs
│   ├── Data/SeedData.cs
│   ├── Models/InventoryItem.cs
│   ├── Services/InventoryService.cs
│   └── Program.cs
├── tests/InventoryService.Api.Tests/
│   └── InventoryServiceTests.cs     # 9 xUnit tests
├── InventoryService.sln
└── README.md
```

## Platform Compliance

This service conforms to the [platform-engineering-shared-services](https://github.com/Cognition-Partner-Workshops/platform-engineering-shared-services) standard:

- Namespace isolation with resource quotas (`decomposition-dev`, `decomposition-staging`)
- Network policies (default-deny with explicit ingress/egress rules)
- Prometheus ServiceMonitor for `/metrics` scraping
- ArgoCD GitOps deployments with auto-sync
- NGINX Ingress with cert-manager TLS (letsencrypt-staging)
- Horizontal Pod Autoscaler (staging: 2–4 replicas)

## License

See [LICENSE](LICENSE).
