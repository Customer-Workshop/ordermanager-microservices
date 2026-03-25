# Microservices — Decomposed from OrderManager Monolith

Microservices decomposed from the [OrderManager monolith](https://github.com/Cognition-Partner-Workshops/app_dotnet-angular-monolith). Each service is independently deployable and conforms to the [platform-engineering-shared-services](https://github.com/Cognition-Partner-Workshops/platform-engineering-shared-services) standard.

## Services

### inventory-service

Standalone .NET 8 Web API + Angular 17 frontend for inventory management (stock levels, warehouse locations, reorder alerts).

| Component | Description |
|-----------|-------------|
| **API** | .NET 8 Web API with EF Core (SQLite), Swagger/OpenAPI |
| **Frontend** | Angular 17 standalone components |
| **Docker** | Multi-stage build (Node → .NET SDK → ASP.NET runtime) |
| **Helm** | Kubernetes deployment, service, network policy, HPA, service monitor |
| **ArgoCD** | Application manifests for dev and staging environments |
| **CI/CD** | GitHub Actions pipeline — build, test, push to ECR, ArgoCD sync |

#### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/inventory` | List all inventory items |
| `GET` | `/api/inventory/product/{productId}` | Get inventory by product ID |
| `POST` | `/api/inventory/product/{productId}/restock` | Restock a product |
| `POST` | `/api/inventory/product/{productId}/deduct` | Deduct stock (used by monolith) |
| `GET` | `/api/inventory/low-stock` | List low-stock items |
| `GET` | `/health` | Health check |

#### Quick Start

```bash
cd services/inventory-service

# Restore and run
dotnet restore
dotnet run --project src/InventoryService.Api/InventoryService.Api.csproj

### Run tests

```bash
dotnet test --verbosity normal
```

### Docker Build

```bash
docker build -f docker/Dockerfile -t inventory-service:local .
docker run -p 8080:8080 inventory-service:local

# Verify at http://localhost:8080/health
```

## Configuration

| Setting | Default | Description |
|---------|---------|-------------|
| `ConnectionStrings:DefaultConnection` | `Data Source=inventory.db` | SQLite connection string |
| `ASPNETCORE_ENVIRONMENT` | `Development` | Runtime environment |
| `ASPNETCORE_URLS` | `http://+:8080` (Docker) | Listen URL |

## API Reference

Full API documentation: [`docs/api-specification.md`](docs/api-specification.md)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/inventory` | List all inventory items |
| `GET` | `/api/inventory/product/{productId}` | Get inventory by product ID |
| `POST` | `/api/inventory/product/{productId}/restock` | Add stock to a product |
| `POST` | `/api/inventory/product/{productId}/reserve` | Reserve stock (used by monolith) |
| `GET` | `/api/inventory/low-stock` | Get items below reorder level |
| `GET` | `/health` | Kubernetes health probe |

### Quick Examples

```bash
# List all inventory
curl http://localhost:5000/api/inventory | jq .

# Get inventory for product 1
curl http://localhost:5000/api/inventory/product/1 | jq .

# Restock product 1 with 25 units
curl -X POST http://localhost:5000/api/inventory/product/1/restock \
  -H "Content-Type: application/json" \
  -d '{"quantity": 25}' | jq .

# Reserve 5 units of product 1 (used by order service)
curl -X POST http://localhost:5000/api/inventory/product/1/reserve \
  -H "Content-Type: application/json" \
  -d '{"quantity": 5}' | jq .

# Get low-stock items
curl http://localhost:5000/api/inventory/low-stock | jq .
```

## Project Structure

```
.
├── .github/workflows/          # CI/CD pipelines
│   ├── build-push.yaml         # Docker build + ECR push
│   └── inventory-service-ci.yaml # PR build + test
├── argocd/                     # ArgoCD application manifests
│   ├── application-dev.yaml
│   └── application-staging.yaml
├── client-app/                 # Angular 17 frontend
│   ├── src/app/modules/inventory/
│   │   ├── inventory-list.component.ts
│   │   ├── low-stock.component.ts
│   │   ├── inventory.model.ts
│   │   └── inventory.service.ts
│   └── ...
├── docker/
│   └── Dockerfile              # Multi-stage build (Node → .NET SDK → Alpine runtime)
├── docs/
│   ├── api-specification.md    # Detailed API reference
│   ├── architecture.md         # Architecture decision record
│   └── deployment.md           # Deployment and operations guide
├── helm/inventory-service/     # Helm chart
│   ├── Chart.yaml
│   ├── templates/
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   ├── ingress.yaml
│   │   ├── hpa.yaml
│   │   ├── networkpolicy.yaml
│   │   └── servicemonitor.yaml
│   ├── values.yaml             # Base values
│   ├── values-dev.yaml         # Dev overrides
│   └── values-staging.yaml     # Staging overrides
├── src/InventoryService.Api/   # .NET 8 Web API
│   ├── Controllers/
│   │   └── InventoryController.cs
│   ├── Data/
│   │   ├── InventoryDbContext.cs
│   │   └── SeedData.cs
│   ├── Models/
│   │   ├── InventoryItem.cs
│   │   └── RestockRequest.cs
│   ├── Services/
│   │   └── InventoryItemService.cs
│   └── Program.cs
├── tests/InventoryService.Api.Tests/
├── InventoryService.sln
└── README.md
```

The API will be available at `http://localhost:5000` with Swagger UI at `/swagger`.

## Architecture

The monolith's in-process inventory calls are replaced with HTTP calls to the inventory-service `/api/inventory` endpoints. The monolith uses an `InventoryHttpClient` to communicate with this service.

## License

All services conform to the [platform-engineering-shared-services](https://github.com/Cognition-Partner-Workshops/platform-engineering-shared-services) standard:

- Namespace isolation with resource quotas
- Network policies (default-deny with explicit allow rules)
- Prometheus ServiceMonitor for metrics
- ArgoCD GitOps deployments
- NGINX Ingress with cert-manager TLS

## Repository Structure

```
services/
  inventory-service/
    src/InventoryService.Api/     # .NET 8 Web API
    tests/                        # xUnit tests
    client-app/                   # Angular 17 frontend
    docker/Dockerfile             # Multi-stage build
    helm/inventory-service/       # Helm chart (deployment, service, networkpolicy, servicemonitor, hpa)
    argocd/                       # ArgoCD application manifests (dev, staging)
.github/workflows/                # CI/CD pipeline
```

## License

See [LICENSE](LICENSE).
