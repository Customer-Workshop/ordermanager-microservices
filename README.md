# Microservices — Decomposed from OrderManager Monolith

A standalone .NET 8 + Angular 17 microservice decomposed from the OrderManager monolith. Manages stock levels, warehouse locations, and reorder thresholds.

## Services

| Component | Description |
|-----------|-------------|
| **API** | .NET 8 Web API with EF Core SQLite |
| **Frontend** | Angular 17 standalone components |
| **Container** | Multi-stage Docker build (Node + .NET SDK + ASP.NET runtime) |
| **Orchestration** | Helm chart with HPA, NetworkPolicy, ServiceMonitor |
| **GitOps** | ArgoCD application manifests for dev and staging |
| **CI/CD** | GitHub Actions: build, test, push to ECR |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/inventory` | List all inventory items |
| GET | `/api/inventory/product/{productId}` | Get inventory for a product |
| POST | `/api/inventory/product/{productId}/restock` | Restock a product |
| GET | `/api/inventory/low-stock` | List items at or below reorder level |
| GET | `/api/inventory/product/{productId}/check?quantity=N` | Check stock availability |
| POST | `/api/inventory/product/{productId}/deduct` | Deduct stock (used by monolith) |
| GET | `/health` | Health check |

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/inventory` | List all inventory items |
| GET | `/api/inventory/product/{id}` | Get inventory for a product |
| POST | `/api/inventory/product/{id}/restock` | Restock a product |
| GET | `/api/inventory/low-stock` | List low-stock items |
| GET | `/api/inventory/product/{id}/check?quantity=N` | Check stock availability |
| POST | `/api/inventory/product/{id}/deduct` | Deduct stock (used by monolith HTTP client) |
| GET | `/health` | Health check endpoint |

### Prerequisites
- .NET 8 SDK
- Node.js 18+
- Angular CLI (`npm install -g @angular/cli`)

### Run locally

```bash
# Restore and run the API
dotnet restore src/InventoryService.Api/InventoryService.Api.csproj
dotnet run --project src/InventoryService.Api/InventoryService.Api.csproj

The API will be available at `http://localhost:5000`.

### Run tests

```bash
dotnet test
```

## Deployment

See `docker/Dockerfile`, `helm/`, `argocd/`, and `.github/workflows/` for deployment configuration.

```bash
# Restore .NET dependencies
dotnet restore services/inventory-service/InventoryService.sln

# Install Angular dependencies
cd services/inventory-service/client-app && npm install && cd -

# Run the API (serves Angular app too)
dotnet run --project services/inventory-service/src/InventoryService.Api/InventoryService.Api.csproj
```

The service will be available at `https://localhost:5001`.

### Run Tests

```bash
dotnet test services/inventory-service/InventoryService.sln
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/inventory` | List all inventory items |
| GET | `/api/inventory/product/{productId}` | Get inventory for a specific product |
| POST | `/api/inventory/product/{productId}/restock` | Restock a product |
| POST | `/api/inventory/product/{productId}/deduct` | Deduct stock (used by monolith HTTP client) |
| GET | `/api/inventory/low-stock` | List items at or below reorder level |

## Monolith Integration

The OrderManager monolith calls this service via HTTP instead of direct database access. Configure the monolith with the `InventoryService__BaseUrl` environment variable pointing to this service.
