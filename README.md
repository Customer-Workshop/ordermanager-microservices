# OrderManager Microservices

A microservices-based rewrite of the [OrderManager Monolith](https://github.com/Cognition-Partner-Workshops/app_dotnet-angular-monolith), decomposed into independently deployable services.

## Architecture

The application is split into 6 services:

| Service | Description | Port (local) |
|---------|-------------|--------------|
| **customer-service** | Customer profiles, addresses, contact info | 5001 |
| **product-service** | Product catalog, pricing, categories, SKUs | 5002 |
| **inventory-service** | Stock levels, warehouse locations, reorder management | 5003 |
| **order-service** | Order creation, status tracking, fulfillment (calls other services via HTTP) | 5004 |
| **api-gateway** | YARP reverse proxy routing `/api/*` to backend services | 5000 |
| **web-frontend** | Angular 17 SPA served via nginx | 4200 |

### Service Communication

```
┌─────────────┐     ┌─────────────┐
│ web-frontend│────▶│ api-gateway  │
│  (Angular)  │     │   (YARP)     │
└─────────────┘     └──────┬───────┘
                           │
          ┌────────────────┼────────────────┐
          ▼                ▼                ▼
   ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
   │  customer   │ │   product   │ │  inventory   │
   │  service    │ │   service   │ │   service    │
   └─────────────┘ └─────────────┘ └──────┬───────┘
                                          │
                                          ▼
                                   ┌─────────────┐
                                   │   product    │
                                   │   service    │
                                   └─────────────┘

   ┌─────────────┐
   │   order     │──▶ customer-service, product-service, inventory-service
   │   service   │
   └─────────────┘
```

Each backend service owns its own SQLite database and exposes REST APIs. Cross-service communication uses synchronous HTTP calls. The order service implements a saga pattern for distributed order creation with compensating transactions.

## Tech Stack

- **Backend Services**: .NET 8, ASP.NET Core, Entity Framework Core, SQLite
- **API Gateway**: .NET 8, YARP Reverse Proxy
- **Frontend**: Angular 17, TypeScript, nginx
- **Observability**: Prometheus metrics (`/metrics`), health checks (`/health`)
- **Containerization**: Docker, Docker Compose

## Getting Started

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/)

### Run locally with Docker Compose

```bash
docker-compose up --build
```

This starts all 6 services:

| URL | Service |
|-----|---------|
| http://localhost:4200 | Web Frontend (Angular) |
| http://localhost:5000 | API Gateway |
| http://localhost:5001/swagger | Customer Service |
| http://localhost:5002/swagger | Product Service |
| http://localhost:5003/swagger | Inventory Service |
| http://localhost:5004/swagger | Order Service |

### Run individual services

To run a single service for development:

```bash
docker-compose up --build customer-service
```

## API Endpoints

### Customer Service (`:5001`)
- `GET /api/customers` — List all customers
- `GET /api/customers/{id}` — Get customer by ID
- `POST /api/customers` — Create a customer

### Product Service (`:5002`)
- `GET /api/products` — List all products
- `GET /api/products/{id}` — Get product by ID
- `GET /api/products/category/{category}` — Get products by category
- `POST /api/products` — Create a product

### Inventory Service (`:5003`)
- `GET /api/inventory` — List all inventory items
- `GET /api/inventory/product/{productId}` — Get inventory for a product
- `POST /api/inventory/product/{productId}/restock` — Restock a product
- `POST /api/inventory/product/{productId}/deduct` — Deduct stock (used by order service)
- `GET /api/inventory/low-stock` — List low-stock items

### Order Service (`:5004`)
- `GET /api/orders` — List all orders
- `GET /api/orders/{id}` — Get order by ID
- `POST /api/orders` — Create an order
- `PATCH /api/orders/{id}/status` — Update order status

## Deployment

Kubernetes manifests and Helm charts are maintained in the companion IaC repo:
[app_dotnet-angular-monolith-iac](https://github.com/Cognition-Partner-Workshops/app_dotnet-angular-monolith-iac)

Target namespace: `decomposition-dev`

ECR repositories:
- `workshop/customer-service`
- `workshop/product-service`
- `workshop/inventory-service`
- `workshop/order-service`
- `workshop/api-gateway`
- `workshop/web-frontend`

## License

MIT
