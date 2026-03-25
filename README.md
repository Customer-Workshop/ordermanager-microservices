# Microservices — OrderManager Decomposition

Microservices extracted from the [OrderManager monolith](https://github.com/Cognition-Partner-Workshops/app_dotnet-angular-monolith). Each service is a standalone .NET 8 Web API with its own Angular 17 frontend, Dockerfile, Helm chart, ArgoCD manifests, and CI/CD pipeline.

## Services

| Service | Description | Port |
|---------|-------------|------|
| **inventory-service** | Stock levels, warehouse locations, reorder management | 8080 |

## Structure

```
services/
└── inventory-service/
    ├── src/InventoryService.Api/     # .NET 8 Web API
    ├── client-app/                   # Angular 17 frontend
    ├── tests/                        # Unit tests
    ├── docker/Dockerfile             # Multi-stage Docker build
    ├── helm/inventory-service/       # Helm chart
    ├── argocd/                       # ArgoCD application manifests
    └── .github/workflows/            # CI/CD pipeline
```

## Quick Start

```bash
cd services/inventory-service

# Restore and run .NET API
dotnet restore src/InventoryService.Api/InventoryService.Api.csproj
dotnet run --project src/InventoryService.Api/InventoryService.Api.csproj

# In another terminal — install and build Angular client
cd client-app && npm install && npm run build
```

The API will be available at `http://localhost:5000` with Swagger at `/swagger`.

## Platform Conformance

All services conform to the [platform-engineering-shared-services](https://github.com/Cognition-Partner-Workshops/platform-engineering-shared-services) standard including:
- Network policies (default-deny with explicit allow)
- Prometheus ServiceMonitor for metrics
- HPA for autoscaling
- ArgoCD GitOps deployment
- ECR container registry
