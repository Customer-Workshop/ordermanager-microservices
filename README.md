# Inventory Microservice

A .NET 8 + Angular 17 microservice extracted from the OrderManager monolith. Manages stock levels, warehouse locations, and reorder thresholds.

## Architecture

This service owns the **Inventory** bounded context, previously embedded in the OrderManager monolith. It exposes a REST API consumed by:

- The **OrderManager monolith** (via HTTP client for stock checks and deductions during order creation)
- The **Inventory Angular frontend** (for inventory management UI)

## Tech Stack

- **Backend**: .NET 8, C#, Entity Framework Core, SQLite
- **Frontend**: Angular 17, TypeScript
- **API**: RESTful with Swagger/OpenAPI
- **Infrastructure**: Helm, ArgoCD, GitHub Actions, ECR

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/inventory` | List all inventory items |
| GET | `/api/inventory/product/{productId}` | Get inventory for a product |
| POST | `/api/inventory/product/{productId}/restock` | Restock a product |
| POST | `/api/inventory/product/{productId}/deduct` | Deduct stock (used by order service) |
| GET | `/api/inventory/low-stock` | List items at or below reorder level |
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
```

The application will be available at `https://localhost:5001`.

## Testing

```bash
dotnet test
```

## Platform Conformance

This service conforms to the [platform-engineering-shared-services](https://github.com/Cognition-Partner-Workshops/platform-engineering-shared-services) standard:

- Helm chart with deployment, service, network policy, HPA, and ServiceMonitor
- ArgoCD application manifests for dev and staging environments
- Multi-stage Docker build
- GitHub Actions CI/CD pipeline pushing to ECR

## License

MIT
