# Legal Recovery Platform

A comprehensive legal debt recovery platform built on Microsoft and Azure tech stack, managing the end-to-end legal recovery workflow across **9 process stages** with jurisdiction-aware rules engine supporting **~30 states, 3,000+ counties, and 9,000+ courthouses**.

## Architecture

### Clean Architecture (Domain-Driven Design)

```
src/
  LegalRecovery.Domain/         # Entities, Enums, Events, Interfaces, Rules Engine
  LegalRecovery.Application/    # CQRS Commands/Queries (MediatR), Validation (FluentValidation)
  LegalRecovery.Infrastructure/ # EF Core, Azure Service Bus, Blob Storage, SFTP/API Adapters
  LegalRecovery.Api/            # ASP.NET Core Web API with Swagger/OpenAPI
tests/
  LegalRecovery.Domain.Tests/        # Unit tests for domain logic and rules engine
  LegalRecovery.Application.Tests/   # Integration tests for CQRS handlers
docker/                         # Multi-stage Dockerfile
helm/                           # Helm chart with HPA, NetworkPolicy, ServiceMonitor
argocd/                         # ArgoCD manifests for dev and staging
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| **Runtime** | .NET 8 / C# / ASP.NET Core |
| **Database** | SQL Server / Azure SQL (EF Core) |
| **Messaging** | Azure Service Bus (event-driven) |
| **Storage** | Azure Blob Storage (documents/templates) |
| **CQRS** | MediatR |
| **Validation** | FluentValidation |
| **API Docs** | Swagger / OpenAPI |
| **Testing** | xUnit, Moq, FluentAssertions |
| **Container** | Docker (multi-stage build) |
| **Orchestration** | Kubernetes (Helm + ArgoCD) |
| **Monitoring** | Prometheus ServiceMonitor |

## Epics

### E0: Legacy Discovery & Rule Extraction
Catalog of stored procedures, batch jobs (~2,100), and document templates from the 3 TB legacy database. Supports behavior capture via I/O observation (FoxPro source unavailable).

### E0.1: Template Rationalization & Migration
Management of 44,000 document templates with versioning, jurisdiction tagging, similarity detection for deduplication, and active/inactive lifecycle.

### E0.2: Integration Modernization (SFTP -> API)
Dual-mode integration adapter supporting both SFTP and API protocols for 20-30 external partners. Configurable switching without code changes with reconciliation reporting.

### E0.3: Data Warehouse & Power BI Migration
Event-driven DW pipeline replacing batch ETL. Near-real-time ingestion (<15 min target) with Power BI compatibility.

### E0.4: Batch-to-Event Coexistence Framework
Parallel run support for legacy batch jobs and new event-driven processes. Reconciliation jobs and migration dashboard tracking 2,100 batch jobs.

### E0.5: Jurisdiction Hierarchy Management
Hierarchical configuration (State > County > Courthouse) with rule inheritance and override. Configurable rules engine - all configurations without deployment via UI.

### E1-E9: Core Process Stages
1. **Account Selection** - Jurisdiction-aware scoring and filtering rules engine
2. **Document Order & Fulfillment** - Template engine with vendor integration (SFTP/API)
3. **Document Redaction** - PII detection, multi-format support (PDF, TIFF, Word, scanned)
4. **Service of Process** - Tracking and management
5. **Attorney Placement & Review** - Courthouse-level bar admission matching
6. **Court Appearance & Proceedings** - Scheduling and tracking
7. **Suit Filing** - E-filing capability matrix for 9,000+ courthouses
8. **Judgment & Post-Judgment** - Case outcome tracking
9. **Asset Garnishments** - Courthouse-level writ template selection with inheritance

## Key Design Patterns

### Hierarchical Jurisdiction Rules Engine
Rules cascade: **Courthouse > County > State**. When a new courthouse is added, it inherits its county's rules by default. Override at any level without code deployment.

```
State (CA): MinimumBalance = $1,000
  County (Los Angeles): MinimumBalance = $1,500 (override)
    Courthouse (LA Superior): MinimumBalance = $2,000 (override)
    Courthouse (Long Beach): inherits $1,500 from county
  County (San Francisco): inherits $1,000 from state
```

### SFTP/API Dual-Mode Integration
Partners can run in dual-mode during migration. Both protocols execute in parallel with automatic reconciliation to detect discrepancies before cutover.

### Batch-to-Event Coexistence
Legacy batch jobs and new event-driven processes run in parallel during stage-by-stage migration. Daily reconciliation compares outputs. Migration dashboard tracks progress across all 2,100 jobs.

## API Endpoints

| Controller | Endpoints | Description |
|-----------|-----------|-------------|
| `/api/jurisdictions` | States, Counties, Courthouses, Rules | Jurisdiction hierarchy CRUD with rule inheritance |
| `/api/accounts` | Create, Get, Evaluate Selection | Account management through 9 stages |
| `/api/documents` | Templates, Search, Rationalization Report | 44,000 template management |
| `/api/integrations` | Dashboard, Partners, Dual-Mode Toggle | SFTP/API integration management |
| `/api/batch-migration` | Dashboard, Job Status, Reconciliation | Batch-to-event migration tracking |
| `/api/attorneys` | Create, Assign, Eligible by Courthouse | Attorney credential management |
| `/api/filing` | Create Filing, E-Filing Matrix | Suit filing with e-filing routing |
| `/api/garnishments` | Create Writ, Get by Account | Garnishment writ management |

## Getting Started

### Prerequisites
- .NET 8 SDK
- SQL Server (or Azure SQL)
- Azure Service Bus (optional for local dev)
- Azure Blob Storage (optional for local dev)

### Run the API

```bash
dotnet restore
dotnet build
dotnet run --project src/LegalRecovery.Api/LegalRecovery.Api.csproj
```

The Swagger UI will be available at `http://localhost:5000`.

### Run Tests

```bash
dotnet test
```

### Docker Build

```bash
docker build -f docker/Dockerfile -t legal-recovery-platform .
docker run -p 8080:8080 legal-recovery-platform
```

### Deploy with Helm

```bash
# Dev
helm install legal-recovery helm/legal-recovery -f helm/legal-recovery/values-dev.yaml -n decomposition-dev

# Staging
helm install legal-recovery helm/legal-recovery -f helm/legal-recovery/values-staging.yaml -n decomposition-staging
```

## License

MIT
