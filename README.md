# Microservices - OrderManager Decomposition

This repository contains microservices extracted from the OrderManager monolith application.

## Services

### Inventory Service

A standalone .NET 8 Web API microservice managing inventory operations.

**Features:**
- Full CRUD for inventory items
- Stock level queries and low-stock alerts
- Restock and deduction endpoints for inter-service communication
- Angular 17 frontend for inventory management
- Health check endpoint at `/health`
- Swagger UI at `/swagger`

**Running locally:**
```bash
cd services/inventory-service
dotnet restore
dotnet build
dotnet test
dotnet run --project src/InventoryService.Api
```

**API Endpoints:**
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/inventory` | List all inventory items |
| GET | `/api/inventory/product/{id}` | Get inventory by product ID |
| POST | `/api/inventory/product/{id}/restock` | Restock a product |
| GET | `/api/inventory/low-stock` | List low-stock items |
| POST | `/api/inventory/product/{id}/deduct` | Deduct stock (used by order service) |
| GET | `/api/inventory/product/{id}/stock-level` | Get current stock level |

## Infrastructure

Each service includes:
- **Dockerfile** — Multi-stage build (Angular + .NET + runtime)
- **Helm chart** — Deployment, Service, NetworkPolicy, ServiceMonitor, HPA
- **ArgoCD manifests** — Dev and staging environments
- **CI/CD pipeline** — GitHub Actions for build, test, and ECR push
