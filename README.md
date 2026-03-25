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
dotnet test
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

MIT
