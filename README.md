# Inventory Microservice

Standalone inventory management microservice decomposed from the [OrderManager monolith](https://github.com/Cognition-Partner-Workshops/app_dotnet-angular-monolith). Conforms to the [platform-engineering-shared-services](https://github.com/Cognition-Partner-Workshops/platform-engineering-shared-services) standard.

## Architecture

| Component | Description |
|-----------|-------------|
| **API** | .NET 8 Web API with EF Core + SQLite |
| **Frontend** | Angular 17 standalone components |
| **Dockerfile** | Multi-stage build (Node + .NET SDK + runtime) |
| **Helm** | Kubernetes deployment, service, ingress, network policy, HPA, service monitor |
| **ArgoCD** | GitOps application manifests for dev and staging |
| **CI/CD** | GitHub Actions — build, test, push to ECR, trigger ArgoCD sync |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/inventory` | List all inventory items |
| GET | `/api/inventory/product/{productId}` | Get inventory for a product |
| POST | `/api/inventory/product/{productId}/restock` | Restock a product |
| GET | `/api/inventory/low-stock` | List low-stock items |
| GET | `/api/inventory/product/{productId}/check?quantity=N` | Check stock availability |
| POST | `/api/inventory/product/{productId}/deduct` | Deduct stock (used by monolith) |
| GET | `/health` | Health check endpoint |

## Getting Started

```bash
# Restore .NET dependencies
dotnet restore src/InventoryService.Api/InventoryService.Api.csproj

# Install Angular dependencies
cd client-app && npm install && cd ..

# Run the API
dotnet run --project src/InventoryService.Api/InventoryService.Api.csproj

# Run tests
dotnet test
```

## Platform Conformance

This service conforms to the [platform-engineering-shared-services](https://github.com/Cognition-Partner-Workshops/platform-engineering-shared-services) standard, including namespace isolation, network policies, Prometheus monitoring, and ArgoCD GitOps deployments.
