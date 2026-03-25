# Inventory Service

A standalone .NET 8 + Angular 17 microservice decomposed from the OrderManager monolith. Manages stock levels, warehouse locations, and reorder thresholds.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/inventory` | List all inventory items |
| GET | `/api/inventory/product/{productId}` | Get inventory for a specific product |
| POST | `/api/inventory/product/{productId}/restock` | Restock a product |
| GET | `/api/inventory/low-stock` | List items at or below reorder level |
| GET | `/api/inventory/product/{productId}/check?quantity=N` | Check if stock is available |
| POST | `/api/inventory/product/{productId}/deduct` | Deduct stock (used by order service) |

## Tech Stack

- **Backend**: .NET 8, C#, Entity Framework Core, SQLite
- **Frontend**: Angular 17, TypeScript
- **API**: RESTful with Swagger/OpenAPI

## Getting Started

### Prerequisites
- .NET 8 SDK
- Node.js 18+
- Angular CLI

### Run the application

```bash
dotnet restore
cd client-app && npm install && cd ..
dotnet run --project src/InventoryService.Api/InventoryService.Api.csproj
```

### Run Tests

```bash
dotnet test
```

## Monolith Integration

The OrderManager monolith calls this service via HTTP instead of direct database access. Configure the monolith with the `InventoryServiceUrl` setting pointing to this service.
