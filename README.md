# app_dotnet-angular-microservices

Microservices decomposed from the [OrderManager monolith](https://github.com/Cognition-Partner-Workshops/app_dotnet-angular-monolith). Each service owns its domain, database, and deployment pipeline.

## Services

### Inventory Service

| Component | Description |
|-----------|-------------|
| **Backend** | .NET 8 Web API with EF Core (SQLite) |
| **Frontend** | Angular 17 standalone components |
| **API** | RESTful — `/api/inventory` |

#### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/inventory` | List all inventory items |
| GET | `/api/inventory/product/{id}` | Get inventory for a product |
| POST | `/api/inventory/product/{id}/restock` | Restock a product |
| POST | `/api/inventory/product/{id}/deduct` | Deduct stock (used by order service) |
| GET | `/api/inventory/low-stock` | List items at or below reorder level |
| GET | `/health` | Health check |

#### Running Locally

```bash
dotnet restore src/InventoryService.Api/InventoryService.Api.csproj
cd client-app && npm install && cd ..
dotnet run --project src/InventoryService.Api/InventoryService.Api.csproj
```

#### Running Tests

```bash
dotnet test
```

## Infrastructure

- **Dockerfile**: `docker/Dockerfile` — multi-stage build (Angular + .NET + runtime)
- **Helm chart**: `helm/inventory-service/` — deployment, service, network policy, service monitor, HPA
- **ArgoCD**: `argocd/` — application manifests for dev and staging
- **CI/CD**: `ci/build-push.yaml` — GitHub Actions pipeline (build, test, push to ECR)

Conforms to the [platform-engineering-shared-services](https://github.com/Cognition-Partner-Workshops/platform-engineering-shared-services) standard.

## License

MIT
