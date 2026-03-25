# Microservices — OrderManager Decomposition

Standalone microservices extracted from the [OrderManager monolith](https://github.com/Cognition-Partner-Workshops/app_dotnet-angular-monolith). Each service owns its bounded context, database, and Angular frontend.

## Services

| Service | Description | Path |
|---------|-------------|------|
| **inventory-service** | Stock levels, warehouse locations, reorder alerts | `inventory-service/` |

## Platform Conformance

All services conform to the [platform-engineering-shared-services](https://github.com/Cognition-Partner-Workshops/platform-engineering-shared-services) standard:

- Kubernetes-native with Helm charts
- ArgoCD GitOps deployments
- Prometheus ServiceMonitor for observability
- Network policies for namespace isolation
- HPA for autoscaling
- Multi-stage Docker builds on .NET 8 Alpine

## See Also

- [Monolith IaC patterns](https://github.com/Cognition-Partner-Workshops/app_dotnet-angular-monolith-iac)
- [Platform shared services](https://github.com/Cognition-Partner-Workshops/platform-engineering-shared-services)
