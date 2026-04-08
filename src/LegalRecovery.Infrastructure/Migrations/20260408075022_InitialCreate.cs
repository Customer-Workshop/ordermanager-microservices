using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LegalRecovery.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Attorneys",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    BarNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    FirstName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    LastName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    FirmName = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Phone = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    MaxCaseLoad = table.Column<int>(type: "int", nullable: false),
                    CurrentCaseCount = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Attorneys", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "BatchJobInventories",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    JobName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    MappedStage = table.Column<int>(type: "int", nullable: true),
                    IsCrossCutting = table.Column<bool>(type: "bit", nullable: false),
                    MigrationStatus = table.Column<int>(type: "int", nullable: false),
                    TriggerType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    CronSchedule = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    InputTables = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    OutputTables = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    InputFiles = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    OutputFiles = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DownstreamDependencies = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LastExecutionDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ExecutionFrequencyPerDay = table.Column<int>(type: "int", nullable: false),
                    IsObsolete = table.Column<bool>(type: "bit", nullable: false),
                    RetirementJustification = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NewEventTopic = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    NewServiceName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    MigrationDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ParallelRunStartDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DecommissionDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BatchJobInventories", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "DataWarehouseReports",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ReportName = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AudienceRole = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    RefreshFrequency = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    DataFreshnessMinutes = table.Column<int>(type: "int", nullable: false),
                    SourceTablesViews = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SourceStoredProcedures = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PowerBiWorkspaceId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    PowerBiReportId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    IsMigrated = table.Column<bool>(type: "bit", nullable: false),
                    MigrationDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    NewDataSource = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DataWarehouseReports", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "IntegrationPartners",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PartnerName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Direction = table.Column<int>(type: "int", nullable: false),
                    CurrentProtocol = table.Column<int>(type: "int", nullable: false),
                    TargetProtocol = table.Column<int>(type: "int", nullable: true),
                    IsDualModeEnabled = table.Column<bool>(type: "bit", nullable: false),
                    DataFormat = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Frequency = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    EstimatedDailyVolume = table.Column<int>(type: "int", nullable: false),
                    SlaMinutes = table.Column<int>(type: "int", nullable: false),
                    PartnerOffersApi = table.Column<bool>(type: "bit", nullable: false),
                    MigrationPriority = table.Column<int>(type: "int", nullable: false),
                    ApiEndpointUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    SftpHost = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    SftpPath = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    PollingIntervalMinutes = table.Column<int>(type: "int", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_IntegrationPartners", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "States",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Code = table.Column<string>(type: "nvarchar(2)", maxLength: 2, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    StatuteOfLimitationsMonths = table.Column<int>(type: "int", nullable: false),
                    DefaultMinimumBalance = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_States", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "StoredProcedureCatalogs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ProcedureName = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    SchemaName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ProcedureType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    MappedStage = table.Column<int>(type: "int", nullable: true),
                    InputParameters = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    OutputParameters = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    InputTables = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    OutputTables = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DecisionTreeDescription = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    HasJurisdictionBranching = table.Column<bool>(type: "bit", nullable: false),
                    CallingFrequencyPerDay = table.Column<int>(type: "int", nullable: false),
                    LastExecutionDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CallingBatchJobs = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NewPlatformComponent = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: true),
                    IsMigrated = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StoredProcedureCatalogs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "IntegrationExecutions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PartnerId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ProtocolUsed = table.Column<int>(type: "int", nullable: false),
                    ExecutionStartTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ExecutionEndTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    RecordsProcessed = table.Column<int>(type: "int", nullable: false),
                    RecordsFailed = table.Column<int>(type: "int", nullable: false),
                    IsSuccess = table.Column<bool>(type: "bit", nullable: false),
                    ErrorMessage = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ReconciliationId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    HasDiscrepancies = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_IntegrationExecutions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_IntegrationExecutions_IntegrationPartners_PartnerId",
                        column: x => x.PartnerId,
                        principalTable: "IntegrationPartners",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Counties",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FipsCode = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    StateId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    StatuteOfLimitationsMonthsOverride = table.Column<int>(type: "int", nullable: true),
                    MinimumBalanceOverride = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Counties", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Counties_States_StateId",
                        column: x => x.StateId,
                        principalTable: "States",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Courthouses",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CourthouseCode = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    Address = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    CountyId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EFilingStatus = table.Column<int>(type: "int", nullable: false),
                    FilingFeeOverride = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    StatuteOfLimitationsMonthsOverride = table.Column<int>(type: "int", nullable: true),
                    MinimumBalanceOverride = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    AcceptedServiceMethods = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RequiredFormNumbers = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LocalCourtRulesUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Courthouses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Courthouses_Counties_CountyId",
                        column: x => x.CountyId,
                        principalTable: "Counties",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Accounts",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AccountNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    DebtorName = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    OriginalBalance = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    CurrentBalance = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    ProductType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    CurrentStage = table.Column<int>(type: "int", nullable: false),
                    StateId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CountyId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CourthouseId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    AssignedAttorneyId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    SelectionScore = table.Column<decimal>(type: "decimal(18,4)", precision: 18, scale: 4, nullable: true),
                    DateSelected = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DateFiled = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DateJudgmentObtained = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CaseNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Accounts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Accounts_Attorneys_AssignedAttorneyId",
                        column: x => x.AssignedAttorneyId,
                        principalTable: "Attorneys",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Accounts_Counties_CountyId",
                        column: x => x.CountyId,
                        principalTable: "Counties",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Accounts_Courthouses_CourthouseId",
                        column: x => x.CourthouseId,
                        principalTable: "Courthouses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Accounts_States_StateId",
                        column: x => x.StateId,
                        principalTable: "States",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "AttorneyCredentials",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AttorneyId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    StateId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CountyId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CourthouseId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    BarAdmissionNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    AdmissionDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ExpirationDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsLocalCounsel = table.Column<bool>(type: "bit", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AttorneyCredentials", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AttorneyCredentials_Attorneys_AttorneyId",
                        column: x => x.AttorneyId,
                        principalTable: "Attorneys",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AttorneyCredentials_Counties_CountyId",
                        column: x => x.CountyId,
                        principalTable: "Counties",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_AttorneyCredentials_Courthouses_CourthouseId",
                        column: x => x.CourthouseId,
                        principalTable: "Courthouses",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_AttorneyCredentials_States_StateId",
                        column: x => x.StateId,
                        principalTable: "States",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "DocumentTemplates",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TemplateCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    DocumentType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ProductType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Format = table.Column<int>(type: "int", nullable: false),
                    VersionNumber = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    StateId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CountyId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CourthouseId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    EffectiveDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ExpirationDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastUsedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UsageCount = table.Column<int>(type: "int", nullable: false),
                    BlobStoragePath = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ContentHash = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SimilarityScore = table.Column<double>(type: "float", nullable: true),
                    SimilarToTemplateId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DocumentTemplates", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DocumentTemplates_Counties_CountyId",
                        column: x => x.CountyId,
                        principalTable: "Counties",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_DocumentTemplates_Courthouses_CourthouseId",
                        column: x => x.CourthouseId,
                        principalTable: "Courthouses",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_DocumentTemplates_States_StateId",
                        column: x => x.StateId,
                        principalTable: "States",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "JurisdictionRules",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    RuleKey = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    RuleValue = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Level = table.Column<int>(type: "int", nullable: false),
                    ApplicableStage = table.Column<int>(type: "int", nullable: true),
                    StateId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CountyId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CourthouseId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    EffectiveDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ExpirationDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsOverride = table.Column<bool>(type: "bit", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_JurisdictionRules", x => x.Id);
                    table.ForeignKey(
                        name: "FK_JurisdictionRules_Counties_CountyId",
                        column: x => x.CountyId,
                        principalTable: "Counties",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_JurisdictionRules_Courthouses_CourthouseId",
                        column: x => x.CourthouseId,
                        principalTable: "Courthouses",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_JurisdictionRules_States_StateId",
                        column: x => x.StateId,
                        principalTable: "States",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "AccountStageHistories",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AccountId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FromStage = table.Column<int>(type: "int", nullable: false),
                    ToStage = table.Column<int>(type: "int", nullable: false),
                    TransitionDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Reason = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PerformedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AccountStageHistories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AccountStageHistories_Accounts_AccountId",
                        column: x => x.AccountId,
                        principalTable: "Accounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SuitFilings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AccountId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CourthouseId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    IsEFiled = table.Column<bool>(type: "bit", nullable: false),
                    EFilingSystemName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CaseNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    ConfirmationNumber = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    FilingDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FilingStatus = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    RejectionReason = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    FilingFee = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    TrackingNumber = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SuitFilings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SuitFilings_Accounts_AccountId",
                        column: x => x.AccountId,
                        principalTable: "Accounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_SuitFilings_Courthouses_CourthouseId",
                        column: x => x.CourthouseId,
                        principalTable: "Courthouses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "AccountDocuments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AccountId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TemplateId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DocumentType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Format = table.Column<int>(type: "int", nullable: false),
                    BlobStoragePath = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsRedacted = table.Column<bool>(type: "bit", nullable: false),
                    RedactedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    VendorOrderId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    VendorName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AccountDocuments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AccountDocuments_Accounts_AccountId",
                        column: x => x.AccountId,
                        principalTable: "Accounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AccountDocuments_DocumentTemplates_TemplateId",
                        column: x => x.TemplateId,
                        principalTable: "DocumentTemplates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "GarnishmentWrits",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AccountId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CourthouseId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TemplateId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    WritType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    EmployerName = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: true),
                    BankName = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: true),
                    GarnishmentAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    IssuedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ServedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    BlobStoragePath = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GarnishmentWrits", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GarnishmentWrits_Accounts_AccountId",
                        column: x => x.AccountId,
                        principalTable: "Accounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_GarnishmentWrits_Courthouses_CourthouseId",
                        column: x => x.CourthouseId,
                        principalTable: "Courthouses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_GarnishmentWrits_DocumentTemplates_TemplateId",
                        column: x => x.TemplateId,
                        principalTable: "DocumentTemplates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AccountDocuments_AccountId",
                table: "AccountDocuments",
                column: "AccountId");

            migrationBuilder.CreateIndex(
                name: "IX_AccountDocuments_TemplateId",
                table: "AccountDocuments",
                column: "TemplateId");

            migrationBuilder.CreateIndex(
                name: "IX_Accounts_AccountNumber",
                table: "Accounts",
                column: "AccountNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Accounts_AssignedAttorneyId",
                table: "Accounts",
                column: "AssignedAttorneyId");

            migrationBuilder.CreateIndex(
                name: "IX_Accounts_CountyId",
                table: "Accounts",
                column: "CountyId");

            migrationBuilder.CreateIndex(
                name: "IX_Accounts_CourthouseId",
                table: "Accounts",
                column: "CourthouseId");

            migrationBuilder.CreateIndex(
                name: "IX_Accounts_CurrentStage",
                table: "Accounts",
                column: "CurrentStage");

            migrationBuilder.CreateIndex(
                name: "IX_Accounts_StateId",
                table: "Accounts",
                column: "StateId");

            migrationBuilder.CreateIndex(
                name: "IX_Accounts_Status",
                table: "Accounts",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_AccountStageHistories_AccountId",
                table: "AccountStageHistories",
                column: "AccountId");

            migrationBuilder.CreateIndex(
                name: "IX_AccountStageHistories_TransitionDate",
                table: "AccountStageHistories",
                column: "TransitionDate");

            migrationBuilder.CreateIndex(
                name: "IX_AttorneyCredentials_AttorneyId_StateId_CountyId_CourthouseId",
                table: "AttorneyCredentials",
                columns: new[] { "AttorneyId", "StateId", "CountyId", "CourthouseId" });

            migrationBuilder.CreateIndex(
                name: "IX_AttorneyCredentials_CountyId",
                table: "AttorneyCredentials",
                column: "CountyId");

            migrationBuilder.CreateIndex(
                name: "IX_AttorneyCredentials_CourthouseId",
                table: "AttorneyCredentials",
                column: "CourthouseId");

            migrationBuilder.CreateIndex(
                name: "IX_AttorneyCredentials_StateId",
                table: "AttorneyCredentials",
                column: "StateId");

            migrationBuilder.CreateIndex(
                name: "IX_Attorneys_BarNumber",
                table: "Attorneys",
                column: "BarNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_BatchJobInventories_JobName",
                table: "BatchJobInventories",
                column: "JobName",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_BatchJobInventories_MigrationStatus",
                table: "BatchJobInventories",
                column: "MigrationStatus");

            migrationBuilder.CreateIndex(
                name: "IX_Counties_StateId_FipsCode",
                table: "Counties",
                columns: new[] { "StateId", "FipsCode" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Courthouses_CountyId_CourthouseCode",
                table: "Courthouses",
                columns: new[] { "CountyId", "CourthouseCode" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DocumentTemplates_CountyId",
                table: "DocumentTemplates",
                column: "CountyId");

            migrationBuilder.CreateIndex(
                name: "IX_DocumentTemplates_CourthouseId",
                table: "DocumentTemplates",
                column: "CourthouseId");

            migrationBuilder.CreateIndex(
                name: "IX_DocumentTemplates_StateId_CountyId_CourthouseId_DocumentType_ProductType",
                table: "DocumentTemplates",
                columns: new[] { "StateId", "CountyId", "CourthouseId", "DocumentType", "ProductType" });

            migrationBuilder.CreateIndex(
                name: "IX_DocumentTemplates_Status",
                table: "DocumentTemplates",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_DocumentTemplates_TemplateCode",
                table: "DocumentTemplates",
                column: "TemplateCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_GarnishmentWrits_AccountId",
                table: "GarnishmentWrits",
                column: "AccountId");

            migrationBuilder.CreateIndex(
                name: "IX_GarnishmentWrits_CourthouseId",
                table: "GarnishmentWrits",
                column: "CourthouseId");

            migrationBuilder.CreateIndex(
                name: "IX_GarnishmentWrits_TemplateId",
                table: "GarnishmentWrits",
                column: "TemplateId");

            migrationBuilder.CreateIndex(
                name: "IX_IntegrationExecutions_ExecutionStartTime",
                table: "IntegrationExecutions",
                column: "ExecutionStartTime");

            migrationBuilder.CreateIndex(
                name: "IX_IntegrationExecutions_PartnerId",
                table: "IntegrationExecutions",
                column: "PartnerId");

            migrationBuilder.CreateIndex(
                name: "IX_IntegrationPartners_PartnerName",
                table: "IntegrationPartners",
                column: "PartnerName",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_JurisdictionRules_CountyId",
                table: "JurisdictionRules",
                column: "CountyId");

            migrationBuilder.CreateIndex(
                name: "IX_JurisdictionRules_CourthouseId",
                table: "JurisdictionRules",
                column: "CourthouseId");

            migrationBuilder.CreateIndex(
                name: "IX_JurisdictionRules_RuleKey_StateId_CountyId_CourthouseId",
                table: "JurisdictionRules",
                columns: new[] { "RuleKey", "StateId", "CountyId", "CourthouseId" });

            migrationBuilder.CreateIndex(
                name: "IX_JurisdictionRules_StateId",
                table: "JurisdictionRules",
                column: "StateId");

            migrationBuilder.CreateIndex(
                name: "IX_States_Code",
                table: "States",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_StoredProcedureCatalogs_SchemaName_ProcedureName",
                table: "StoredProcedureCatalogs",
                columns: new[] { "SchemaName", "ProcedureName" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SuitFilings_AccountId",
                table: "SuitFilings",
                column: "AccountId");

            migrationBuilder.CreateIndex(
                name: "IX_SuitFilings_CourthouseId",
                table: "SuitFilings",
                column: "CourthouseId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AccountDocuments");

            migrationBuilder.DropTable(
                name: "AccountStageHistories");

            migrationBuilder.DropTable(
                name: "AttorneyCredentials");

            migrationBuilder.DropTable(
                name: "BatchJobInventories");

            migrationBuilder.DropTable(
                name: "DataWarehouseReports");

            migrationBuilder.DropTable(
                name: "GarnishmentWrits");

            migrationBuilder.DropTable(
                name: "IntegrationExecutions");

            migrationBuilder.DropTable(
                name: "JurisdictionRules");

            migrationBuilder.DropTable(
                name: "StoredProcedureCatalogs");

            migrationBuilder.DropTable(
                name: "SuitFilings");

            migrationBuilder.DropTable(
                name: "DocumentTemplates");

            migrationBuilder.DropTable(
                name: "IntegrationPartners");

            migrationBuilder.DropTable(
                name: "Accounts");

            migrationBuilder.DropTable(
                name: "Attorneys");

            migrationBuilder.DropTable(
                name: "Courthouses");

            migrationBuilder.DropTable(
                name: "Counties");

            migrationBuilder.DropTable(
                name: "States");
        }
    }
}
