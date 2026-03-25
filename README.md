# Microservices — OrderManager Decomposition

Standalone microservices extracted from the [OrderManager monolith](https://github.com/Cognition-Partner-Workshops/app_dotnet-angular-monolith). Each service is independently deployable and conforms to the [platform-engineering-shared-services](https://github.com/Cognition-Partner-Workshops/platform-engineering-shared-services) standard.

## Services

| Service | Description | Tech Stack |
|---------|-------------|------------|
| **inventory-service** | Stock levels, warehouse locations, reorder alerts, stock deduction | .NET 8 Web API, EF Core, SQLite, Angular 17 |

## Repository Structure

```
services/
└── inventory-service/
    ├── src/InventoryService.Api/    # .NET 8 Web API
    ├── tests/                       # xUnit tests
    ├── client-app/                  # Angular 17 frontend
    ├── docker/Dockerfile            # Multi-stage Docker build
    ├── helm/inventory-service/      # Helm chart (deployment, service, networkpolicy, HPA, servicemonitor)
    ├── argocd/                      # ArgoCD application manifests (dev, staging)
    └── InventoryService.sln
.github/
└── workflows/
    └── inventory-service-ci.yaml    # CI/CD: build, test, push to ECR, trigger ArgoCD
```

## Getting Started

### Prerequisites
- .NET 8 SDK
- Node.js 18+
- Angular CLI (`npm install -g @angular/cli`)

### Run the Inventory Service

```bash
cd services/inventory-service

# Restore and run the API
dotnet restore src/InventoryService.Api/InventoryService.Api.csproj
dotnet run --project src/InventoryService.Api/InventoryService.Api.csproj

# Run tests
dotnet test
```

The API will be available at `http://localhost:5000` with Swagger at `/swagger`.

## Platform Conformance

Each service includes:
- **Helm chart** with deployment, service, network policy, HPA, and ServiceMonitor
- **ArgoCD** application manifests for dev and staging environments
- **Dockerfile** following the multi-stage build pattern from `app_dotnet-angular-monolith-iac`
- **GitHub Actions** CI/CD pipeline for build, test, ECR push, and ArgoCD sync
- **Network policies** allowing ingress from NGINX ingress controller and monitoring namespace
- **Health checks** at `/health` for Kubernetes liveness/readiness probes

## License

MIT
