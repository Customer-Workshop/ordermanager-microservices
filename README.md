# Inventory Microservice

A standalone .NET 8 + Angular 17 microservice extracted from the OrderManager monolith. Manages stock levels, warehouse locations, and reorder alerts.

## Architecture

This microservice owns the **Inventory** bounded context:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/inventory` | GET | List all inventory items |
| `/api/inventory/product/{id}` | GET | Get inventory for a specific product |
| `/api/inventory/product/{id}/restock` | POST | Restock a product |
| `/api/inventory/product/{id}/check` | GET | Check stock availability |
| `/api/inventory/product/{id}/deduct` | POST | Deduct stock (called by order-service) |
| `/api/inventory/low-stock` | GET | List items at or below reorder level |
| `/health` | GET | Health check endpoint |

## Tech Stack

- **Backend**: .NET 8, C#, Entity Framework Core, SQLite
- **Frontend**: Angular 17, TypeScript
- **API**: RESTful with Swagger/OpenAPI
- **Container**: Multi-stage Docker build
- **Orchestration**: Helm chart, ArgoCD, HPA
- **Observability**: Prometheus ServiceMonitor

## Getting Started

### Prerequisites
- .NET 8 SDK
- Node.js 18+
- Angular CLI (`npm install -g @angular/cli`)

### Run the application

```bash
# Restore and run .NET API
dotnet restore
dotnet run --project src/InventoryService.Api/InventoryService.Api.csproj

# (Optional) Install and build Angular client
cd client-app && npm install && npm run build && cd ..
```

The API will be available at `https://localhost:5001`.

### Run tests

```bash
dotnet test --verbosity normal
```

## Deployment

### Docker

```bash
docker build -f docker/Dockerfile -t inventory-service .
docker run -p 8080:8080 inventory-service
```

### Kubernetes (Helm)

```bash
helm install inventory-service helm/inventory-service -f helm/inventory-service/values-dev.yaml
```

### ArgoCD

Apply the application manifest:

```bash
kubectl apply -f argocd/application-dev.yaml
```

## Platform Conformance

This service conforms to the [platform-engineering-shared-services](https://github.com/Cognition-Partner-Workshops/platform-engineering-shared-services) standard:

- Deploys to `decomposition-dev` / `decomposition-staging` namespaces
- Network policy restricts ingress to nginx and monitoring namespaces
- Prometheus metrics exposed via ServiceMonitor
- ECR for container image storage
- Health check endpoint at `/health`
- Own database (no shared database)
