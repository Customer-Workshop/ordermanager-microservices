# Microservices — Inventory Service

Decomposed inventory microservice extracted from the [OrderManager monolith](https://github.com/Cognition-Partner-Workshops/app_dotnet-angular-monolith). This is the **"after"** state for the monolith-to-microservices decomposition workshop.

## Services

The inventory-service owns all inventory concerns that were previously embedded in the monolith:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/inventory` | GET | List all inventory items |
| `/api/inventory/product/{id}` | GET | Get inventory for a specific product |
| `/api/inventory/product/{id}/restock` | POST | Restock a product |
| `/api/inventory/product/{id}/deduct` | POST | Deduct stock (called by monolith during order creation) |
| `/api/inventory/low-stock` | GET | List items at or below reorder level |
| `/health` | GET | Health check endpoint |

## Tech Stack

- **Backend**: .NET 8, C#, Entity Framework Core, SQLite
- **Frontend**: Angular 17, TypeScript
- **Container**: Multi-stage Docker build
- **Orchestration**: Kubernetes (Helm), ArgoCD
- **CI/CD**: GitHub Actions → ECR → ArgoCD sync
- **Monitoring**: Prometheus ServiceMonitor

### Prerequisites
- .NET 8 SDK
- Node.js 18+
- Angular CLI (`npm install -g @angular/cli`)

### Run locally

```bash
# Restore and run .NET API
cd services/inventory-service
dotnet restore src/InventoryService.Api/InventoryService.Api.csproj
dotnet run --project src/InventoryService.Api/InventoryService.Api.csproj
```

The API will be available at `http://localhost:5000`.

### Run tests

```bash
cd services/inventory-service
dotnet test
```

## Project Structure

```
services/inventory-service/
├── src/InventoryService.Api/
│   ├── Controllers/          # API controllers
│   ├── Models/               # Domain models
│   ├── Services/             # Business logic
│   ├── Data/                 # EF Core DbContext and seed data
│   └── Program.cs            # Application entry point
├── tests/                    # Unit tests (xUnit)
└── client-app/               # Angular 17 frontend
docker/Dockerfile             # Multi-stage build
helm/inventory-service/       # Helm chart
argocd/                       # ArgoCD application manifests
.github/workflows/            # CI/CD pipeline
```

## License

This service conforms to the [platform-engineering-shared-services](https://github.com/Cognition-Partner-Workshops/platform-engineering-shared-services) standard:
- Deploys into `decomposition-dev` / `decomposition-staging` namespaces
- Network policies restrict ingress to nginx-ingress and monitoring namespaces
- ServiceMonitor for Prometheus scraping
- HPA for horizontal autoscaling in staging
- ArgoCD automated sync with prune and self-heal

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
