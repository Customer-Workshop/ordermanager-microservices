# Inventory Service

A standalone .NET 8 + Angular 17 microservice decomposed from the OrderManager monolith. Manages stock levels, warehouse locations, and reorder alerts.

## Architecture

This microservice owns the **Inventory** bounded context, extracted from the monolith's shared database into its own SQLite database and independent deployment unit.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/inventory` | GET | List all inventory items |
| `/api/inventory/product/{id}` | GET | Get inventory for a specific product |
| `/api/inventory/product/{id}/restock` | POST | Restock a product (body: `{ "quantity": N }`) |
| `/api/inventory/product/{id}/deduct` | POST | Deduct stock (body: `{ "quantity": N }`) |
| `/api/inventory/low-stock` | GET | List items at or below reorder level |
| `/health` | GET | Health check endpoint |

## Tech Stack

- **Backend**: .NET 8, C#, Entity Framework Core, SQLite
- **Frontend**: Angular 17, TypeScript
- **API**: RESTful with Swagger/OpenAPI

## Getting Started

### Prerequisites
- .NET 8 SDK
- Node.js 18+
- Angular CLI (`npm install -g @angular/cli`)

### Run locally

```bash
# Restore and run the API
dotnet restore src/InventoryService.Api/InventoryService.Api.csproj
dotnet run --project src/InventoryService.Api/InventoryService.Api.csproj
```

The API will be available at `http://localhost:5000`.

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
helm upgrade --install inventory-service helm/inventory-service -f helm/inventory-service/values.yaml
```

### ArgoCD

Apply the ArgoCD application manifest for your target environment:

```bash
kubectl apply -f argocd/application-dev.yaml
kubectl apply -f argocd/application-staging.yaml
```

## Integration with Monolith

The monolith's `OrderService` calls this service's `/api/inventory/product/{id}/deduct` endpoint when creating orders, replacing the previous in-process inventory deduction.

## Platform Conformance

This service conforms to the [platform-engineering-shared-services](https://github.com/Cognition-Partner-Workshops/platform-engineering-shared-services) standard:
- Network policies (default-deny with explicit ingress/egress)
- Prometheus ServiceMonitor for metrics
- HPA for auto-scaling
- Health check endpoints for liveness/readiness probes
