# Microservices — Decomposed from OrderManager Monolith

This repository contains microservices extracted from the [OrderManager monolith](https://github.com/Cognition-Partner-Workshops/app_dotnet-angular-monolith).

## Services

### Inventory Service

A standalone .NET 8 Web API managing stock levels, warehouse locations, and reorder workflows.

| Component | Description |
|-----------|-------------|
| **API** | .NET 8 Web API with EF Core (SQLite) |
| **Frontend** | Angular 17 standalone components |
| **Docker** | Multi-stage build (Node + .NET SDK + Alpine runtime) |
| **Helm** | Deployment, Service, NetworkPolicy, ServiceMonitor, HPA |
| **ArgoCD** | Application manifests for dev and staging |
| **CI/CD** | GitHub Actions — build, test, push to ECR |

#### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/inventory` | List all inventory items |
| GET | `/api/inventory/product/{id}` | Get inventory for a product |
| POST | `/api/inventory/product/{id}/restock` | Restock a product |
| GET | `/api/inventory/low-stock` | List low-stock items |
| GET | `/api/inventory/product/{id}/check?quantity=N` | Check stock availability |
| POST | `/api/inventory/product/{id}/deduct` | Deduct stock (used by monolith HTTP client) |
| GET | `/health` | Health check endpoint |

#### Running Locally

```bash
cd services/inventory-service

# Restore and run the API
dotnet restore
dotnet run --project src/InventoryService.Api/InventoryService.Api.csproj

# Run tests
dotnet test
```

The API will be available at `http://localhost:5000`.

## Architecture

Each microservice follows the platform standards defined in [platform-engineering-shared-services](https://github.com/Cognition-Partner-Workshops/platform-engineering-shared-services) and uses the IaC patterns from [app_dotnet-angular-monolith-iac](https://github.com/Cognition-Partner-Workshops/app_dotnet-angular-monolith-iac).

## License

MIT
