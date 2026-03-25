# Inventory Service Microservice

A standalone .NET 8 + Angular 17 microservice extracted from the [OrderManager monolith](https://github.com/Cognition-Partner-Workshops/app_dotnet-angular-monolith). Manages stock levels, warehouse locations, and reorder thresholds.

### Run tests

| Component | Description |
|-----------|-------------|
| **API** | .NET 8 Web API with EF Core + SQLite |
| **Frontend** | Angular 17 standalone components |
| **Docker** | Multi-stage build (Node → .NET SDK → Alpine runtime) |
| **Helm** | Kubernetes deployment, service, network policy, HPA, ServiceMonitor |
| **ArgoCD** | GitOps application manifests for dev and staging |
| **CI/CD** | GitHub Actions: build, test, push to ECR, trigger ArgoCD |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/inventory` | List all inventory items |
| GET | `/api/inventory/product/{productId}` | Get inventory for a product |
| POST | `/api/inventory/product/{productId}/restock` | Restock a product |
| GET | `/api/inventory/low-stock` | List low-stock items |
| POST | `/api/inventory/product/{productId}/deduct` | Deduct stock (used by monolith) |
| GET | `/api/inventory/product/{productId}/stock-level` | Get current stock level |
| GET | `/health` | Health check endpoint |

## Getting Started

### Prerequisites
- .NET 8 SDK
- Node.js 18+
- Angular CLI (`npm install -g @angular/cli`)

### Run the application

```bash
# Restore .NET dependencies
dotnet restore src/InventoryService.Api/InventoryService.Api.csproj

# Install Angular dependencies
cd client-app && npm install && cd ..

# Run the API (serves Angular app too)
dotnet run --project src/InventoryService.Api/InventoryService.Api.csproj

The service will be available at `https://localhost:5001`.

### Run tests

```bash
dotnet test
```

## Platform Conformance

This service conforms to the [platform-engineering-shared-services](https://github.com/Cognition-Partner-Workshops/platform-engineering-shared-services) standard:

- **Namespaces**: `decomposition-dev`, `decomposition-staging`
- **Network Policies**: Ingress from `ingress-nginx` and `monitoring` namespaces only
- **Monitoring**: Prometheus ServiceMonitor scraping `/metrics`
- **Autoscaling**: HPA with CPU-based scaling in staging

## License

MIT
