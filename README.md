# Microservices — Decomposed from OrderManager Monolith

This repository contains microservices extracted from the [OrderManager monolith](https://github.com/Cognition-Partner-Workshops/app_dotnet-angular-monolith). Each service is independently deployable and conforms to the [platform-engineering-shared-services](https://github.com/Cognition-Partner-Workshops/platform-engineering-shared-services) standard.

## Services

| Service | Description | Tech Stack |
|---------|-------------|------------|
| **inventory-service** | Stock levels, warehouse locations, reorder management | .NET 8, Angular 17, EF Core, SQLite |

## Repository Structure

```
services/
└── inventory-service/
    ├── src/InventoryService.Api/    # .NET 8 Web API
    ├── tests/                       # Unit tests
    ├── client-app/                  # Angular 17 frontend
    └── InventoryService.sln
infrastructure/
└── inventory-service/
    ├── docker/Dockerfile            # Multi-stage build
    ├── helm/inventory-service/      # Helm chart (deployment, service, ingress, HPA, network policy, service monitor)
    └── argocd/                      # ArgoCD Application manifests (dev, staging)
.github/workflows/
└── inventory-service-ci.yaml       # GitHub Actions CI/CD pipeline
```

## Getting Started

### Prerequisites
- .NET 8 SDK
- Node.js 18+
- Angular CLI (`npm install -g @angular/cli`)

### Run the Inventory Service

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
