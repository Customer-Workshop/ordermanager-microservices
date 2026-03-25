# app_dotnet-angular-microservices

Microservices decomposed from the [OrderManager monolith](https://github.com/Cognition-Partner-Workshops/app_dotnet-angular-monolith). Each service is independently deployable and conforms to the [platform-engineering-shared-services](https://github.com/Cognition-Partner-Workshops/platform-engineering-shared-services) standard.

## Services

### Inventory Service

Standalone .NET 8 Web API + Angular 17 frontend for inventory management (stock levels, warehouse locations, reorder alerts).

| Layer | Tech |
|-------|------|
| **Backend** | .NET 8, C#, EF Core, SQLite |
| **Frontend** | Angular 17, TypeScript |
| **IaC** | Helm chart, ArgoCD manifests, multi-stage Dockerfile |
| **CI/CD** | GitHub Actions — build, test, push to ECR, ArgoCD sync |

#### API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/inventory` | List all inventory items |
| `GET` | `/api/inventory/product/{productId}` | Get inventory for a product |
| `POST` | `/api/inventory/product/{productId}/restock` | Restock a product |
| `POST` | `/api/inventory/product/{productId}/deduct` | Deduct stock (called by monolith) |
| `GET` | `/api/inventory/low-stock` | List items at or below reorder level |
| `GET` | `/health` | Health check |

#### Quick Start

```bash
cd services/inventory-service
dotnet restore
dotnet run --project src/InventoryService.Api/InventoryService.Api.csproj
```

The API will be available at `http://localhost:5000` with Swagger UI at `/swagger`.

#### Run Tests

```bash
cd services/inventory-service
dotnet test --verbosity normal
```

## Architecture

The monolith's in-process inventory calls are replaced with HTTP calls to the inventory-service `/api/inventory` endpoints. The monolith uses an `InventoryHttpClient` to communicate with this service.

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
