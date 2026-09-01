# Product Service

The product-service team owns the Products HTTP API, product catalog persistence, and the inventory data embedded in product responses. Inventory is currently a local read model owned by this service; when inventory-service lands, it will become an event-fed projection.

## Routes

| Method | Route | Behavior |
| --- | --- | --- |
| GET | `/api/products` | List products with inventory |
| GET | `/api/products/{id}` | Get one product |
| GET | `/api/products/category/{category}` | Filter products by category |
| POST | `/api/products` | Create a product |
| GET | `/health` | Liveness check |
| GET | `/metrics` | Prometheus metrics |

## Run and test

From this directory:

```bash
dotnet run --project src/ProductService.Api
dotnet test ProductService.sln
```

The default database is `productservice.db`. Set `ConnectionStrings__DefaultConnection` to use another SQLite file.

## Docker

```bash
docker build -f docker/Dockerfile -t product-service:local .
docker run --rm -p 8080:8080 product-service:local
```

## Helm

Install the base values:

```bash
helm install product-service helm/product-service
```

Install the development overlay:

```bash
helm install product-service-dev helm/product-service -f helm/product-service/values-dev.yaml
```

Install the staging overlay:

```bash
helm install product-service-staging helm/product-service -f helm/product-service/values-staging.yaml
```
