# Inventory Microservice

A standalone .NET 8 + Angular 17 microservice extracted from the [OrderManager monolith](https://github.com/Cognition-Partner-Workshops/app_dotnet-angular-monolith). Manages stock levels, warehouse locations, and reorder thresholds.

## Architecture

| Component | Description |
|-----------|-------------|
| **API** | .NET 8 Web API with EF Core + SQLite |
| **Frontend** | Angular 17 standalone components |
| **IaC** | Helm chart, Dockerfile, ArgoCD manifests |
| **CI/CD** | GitHub Actions — build, test, push to ECR |

### API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/inventory` | List all inventory items |
| GET | `/api/inventory/product/{productId}` | Get inventory for a product |
| POST | `/api/inventory/product/{productId}/restock` | Restock a product |
| POST | `/api/inventory/product/{productId}/deduct` | Deduct stock (called by monolith) |
| GET | `/api/inventory/low-stock` | List low-stock items |
| GET | `/health` | Health check |

## Tech Stack

- **Backend**: .NET 8, C#, Entity Framework Core, SQLite
- **Frontend**: Angular 17, TypeScript
- **API**: RESTful with Swagger/OpenAPI
- **Container**: Multi-stage Docker build (Alpine)
- **Orchestration**: Helm 3, ArgoCD, Kubernetes

## Getting Started

### Prerequisites
- .NET 8 SDK
- Node.js 18+
- Angular CLI (`npm install -g @angular/cli`)

### Run the application

```bash
# Restore .NET dependencies
dotnet restore

# Install Angular dependencies
cd client-app && npm install && cd ..

# Run the API (serves Angular app too)
dotnet run --project src/InventoryService.Api/InventoryService.Api.csproj
```

The application will be available at `http://localhost:5000`.

### Run tests

```bash
dotnet test
```

## Deployment

### Docker

```bash
docker build -f docker/Dockerfile -t inventory-service .
docker run -p 8080:8080 inventory-service
```

### Kubernetes (Helm)

```bash
helm upgrade --install inventory-service helm/inventory-service \
  -f helm/inventory-service/values.yaml \
  -f helm/inventory-service/values-dev.yaml \
  -n decomposition-dev --create-namespace
```

### ArgoCD

Apply the manifests in `argocd/` to your ArgoCD instance:

```bash
kubectl apply -f argocd/application-dev.yaml
kubectl apply -f argocd/application-staging.yaml
```

## Platform Conformance

This service conforms to the [platform-engineering-shared-services](https://github.com/Cognition-Partner-Workshops/platform-engineering-shared-services) standard:
- Namespace isolation with NetworkPolicy
- Prometheus ServiceMonitor for metrics
- HPA for auto-scaling
- ArgoCD for GitOps deployments

## License

MIT
