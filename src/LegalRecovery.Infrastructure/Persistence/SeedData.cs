using LegalRecovery.Domain.Entities;
using LegalRecovery.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace LegalRecovery.Infrastructure.Persistence;

public static class SeedData
{
    public static async Task SeedAsync(ApplicationDbContext context, ILogger logger)
    {
        if (await context.States.AnyAsync())
        {
            logger.LogInformation("Database already seeded. Skipping.");
            return;
        }

        logger.LogInformation("Seeding database with sample data...");

        // === States ===
        var california = new State
        {
            Id = Guid.Parse("11111111-1111-1111-1111-111111111001"),
            Code = "CA",
            Name = "California",
            StatuteOfLimitationsMonths = 48,
            DefaultMinimumBalance = 1000m,
            IsActive = true
        };
        var texas = new State
        {
            Id = Guid.Parse("11111111-1111-1111-1111-111111111002"),
            Code = "TX",
            Name = "Texas",
            StatuteOfLimitationsMonths = 48,
            DefaultMinimumBalance = 750m,
            IsActive = true
        };
        var newYork = new State
        {
            Id = Guid.Parse("11111111-1111-1111-1111-111111111003"),
            Code = "NY",
            Name = "New York",
            StatuteOfLimitationsMonths = 72,
            DefaultMinimumBalance = 1500m,
            IsActive = true
        };
        var florida = new State
        {
            Id = Guid.Parse("11111111-1111-1111-1111-111111111004"),
            Code = "FL",
            Name = "Florida",
            StatuteOfLimitationsMonths = 60,
            DefaultMinimumBalance = 500m,
            IsActive = true
        };
        var illinois = new State
        {
            Id = Guid.Parse("11111111-1111-1111-1111-111111111005"),
            Code = "IL",
            Name = "Illinois",
            StatuteOfLimitationsMonths = 60,
            DefaultMinimumBalance = 1000m,
            IsActive = true
        };

        context.States.AddRange(california, texas, newYork, florida, illinois);

        // === Counties ===
        var losAngeles = new County
        {
            Id = Guid.Parse("22222222-2222-2222-2222-222222222001"),
            FipsCode = "06037",
            Name = "Los Angeles",
            StateId = california.Id,
            MinimumBalanceOverride = 1500m,
            StatuteOfLimitationsMonthsOverride = null
        };
        var sanFrancisco = new County
        {
            Id = Guid.Parse("22222222-2222-2222-2222-222222222002"),
            FipsCode = "06075",
            Name = "San Francisco",
            StateId = california.Id,
            MinimumBalanceOverride = null,
            StatuteOfLimitationsMonthsOverride = null
        };
        var harris = new County
        {
            Id = Guid.Parse("22222222-2222-2222-2222-222222222003"),
            FipsCode = "48201",
            Name = "Harris",
            StateId = texas.Id,
            MinimumBalanceOverride = 1000m,
            StatuteOfLimitationsMonthsOverride = null
        };
        var dallas = new County
        {
            Id = Guid.Parse("22222222-2222-2222-2222-222222222004"),
            FipsCode = "48113",
            Name = "Dallas",
            StateId = texas.Id,
            MinimumBalanceOverride = null,
            StatuteOfLimitationsMonthsOverride = null
        };
        var newYorkCounty = new County
        {
            Id = Guid.Parse("22222222-2222-2222-2222-222222222005"),
            FipsCode = "36061",
            Name = "New York",
            StateId = newYork.Id,
            MinimumBalanceOverride = 2000m,
            StatuteOfLimitationsMonthsOverride = null
        };
        var cook = new County
        {
            Id = Guid.Parse("22222222-2222-2222-2222-222222222006"),
            FipsCode = "17031",
            Name = "Cook",
            StateId = illinois.Id,
            MinimumBalanceOverride = 1200m,
            StatuteOfLimitationsMonthsOverride = null
        };
        var miamidade = new County
        {
            Id = Guid.Parse("22222222-2222-2222-2222-222222222007"),
            FipsCode = "12086",
            Name = "Miami-Dade",
            StateId = florida.Id,
            MinimumBalanceOverride = 750m,
            StatuteOfLimitationsMonthsOverride = null
        };

        context.Counties.AddRange(losAngeles, sanFrancisco, harris, dallas, newYorkCounty, cook, miamidade);

        // === Courthouses ===
        var laSuperior = new Courthouse
        {
            Id = Guid.Parse("33333333-3333-3333-3333-333333333001"),
            CourthouseCode = "LASC-CENTRAL",
            Name = "LA Superior Court - Central District",
            Address = "111 N Hill St, Los Angeles, CA 90012",
            CountyId = losAngeles.Id,
            EFilingStatus = EFilingStatus.Required,
            FilingFeeOverride = 75.00m,
            MinimumBalanceOverride = 2000m,
            AcceptedServiceMethods = "Personal,Substituted,Mail"
        };
        var laLongBeach = new Courthouse
        {
            Id = Guid.Parse("33333333-3333-3333-3333-333333333002"),
            CourthouseCode = "LASC-LB",
            Name = "LA Superior Court - Long Beach",
            Address = "275 Magnolia Ave, Long Beach, CA 90802",
            CountyId = losAngeles.Id,
            EFilingStatus = EFilingStatus.Available,
            FilingFeeOverride = null,
            MinimumBalanceOverride = null,
            AcceptedServiceMethods = "Personal,Substituted"
        };
        var sfSuperior = new Courthouse
        {
            Id = Guid.Parse("33333333-3333-3333-3333-333333333003"),
            CourthouseCode = "SFSC-MAIN",
            Name = "San Francisco Superior Court",
            Address = "400 McAllister St, San Francisco, CA 94102",
            CountyId = sanFrancisco.Id,
            EFilingStatus = EFilingStatus.Required,
            FilingFeeOverride = 80.00m,
            MinimumBalanceOverride = null,
            AcceptedServiceMethods = "Personal,Substituted,Mail"
        };
        var harrisDistrict = new Courthouse
        {
            Id = Guid.Parse("33333333-3333-3333-3333-333333333004"),
            CourthouseCode = "HARRIS-DC",
            Name = "Harris County District Court",
            Address = "201 Caroline St, Houston, TX 77002",
            CountyId = harris.Id,
            EFilingStatus = EFilingStatus.Required,
            FilingFeeOverride = 50.00m,
            MinimumBalanceOverride = null,
            AcceptedServiceMethods = "Personal,Substituted"
        };
        var dallasDistrict = new Courthouse
        {
            Id = Guid.Parse("33333333-3333-3333-3333-333333333005"),
            CourthouseCode = "DALLAS-DC",
            Name = "Dallas County District Court",
            Address = "600 Commerce St, Dallas, TX 75202",
            CountyId = dallas.Id,
            EFilingStatus = EFilingStatus.Available,
            FilingFeeOverride = 55.00m,
            MinimumBalanceOverride = null,
            AcceptedServiceMethods = "Personal,Substituted,Mail"
        };
        var nySupreme = new Courthouse
        {
            Id = Guid.Parse("33333333-3333-3333-3333-333333333006"),
            CourthouseCode = "NYSC-MANHATTAN",
            Name = "NY Supreme Court - Manhattan",
            Address = "60 Centre St, New York, NY 10007",
            CountyId = newYorkCounty.Id,
            EFilingStatus = EFilingStatus.Required,
            FilingFeeOverride = 210.00m,
            MinimumBalanceOverride = 3000m,
            AcceptedServiceMethods = "Personal,Substituted"
        };
        var cookCircuit = new Courthouse
        {
            Id = Guid.Parse("33333333-3333-3333-3333-333333333007"),
            CourthouseCode = "COOK-CC",
            Name = "Cook County Circuit Court",
            Address = "50 W Washington St, Chicago, IL 60602",
            CountyId = cook.Id,
            EFilingStatus = EFilingStatus.Required,
            FilingFeeOverride = 65.00m,
            MinimumBalanceOverride = null,
            AcceptedServiceMethods = "Personal,Substituted,Mail"
        };
        var miamiDadeCircuit = new Courthouse
        {
            Id = Guid.Parse("33333333-3333-3333-3333-333333333008"),
            CourthouseCode = "MIAMI-CC",
            Name = "Miami-Dade County Circuit Court",
            Address = "73 W Flagler St, Miami, FL 33130",
            CountyId = miamidade.Id,
            EFilingStatus = EFilingStatus.Available,
            FilingFeeOverride = 40.00m,
            MinimumBalanceOverride = null,
            AcceptedServiceMethods = "Personal,Substituted,Mail"
        };

        context.Courthouses.AddRange(laSuperior, laLongBeach, sfSuperior, harrisDistrict,
            dallasDistrict, nySupreme, cookCircuit, miamiDadeCircuit);

        // === Jurisdiction Rules ===
        var rules = new List<JurisdictionRule>
        {
            new() { RuleKey = "FilingFee", RuleValue = "70.00", Level = JurisdictionLevel.State, StateId = california.Id, IsOverride = false, IsActive = true },
            new() { RuleKey = "MinDaysBeforeFiling", RuleValue = "30", Level = JurisdictionLevel.State, StateId = california.Id, IsOverride = false, IsActive = true },
            new() { RuleKey = "FilingFee", RuleValue = "45.00", Level = JurisdictionLevel.State, StateId = texas.Id, IsOverride = false, IsActive = true },
            new() { RuleKey = "FilingFee", RuleValue = "200.00", Level = JurisdictionLevel.State, StateId = newYork.Id, IsOverride = false, IsActive = true },
            new() { RuleKey = "FilingFee", RuleValue = "85.00", Level = JurisdictionLevel.County, CountyId = losAngeles.Id, IsOverride = true, IsActive = true },
            new() { RuleKey = "FilingFee", RuleValue = "100.00", Level = JurisdictionLevel.Courthouse, CourthouseId = laSuperior.Id, IsOverride = true, IsActive = true },
            new() { RuleKey = "ServiceMethod", RuleValue = "Personal,Substituted,Mail", Level = JurisdictionLevel.State, StateId = california.Id, IsOverride = false, IsActive = true },
            new() { RuleKey = "GarnishmentExemption", RuleValue = "75%", Level = JurisdictionLevel.State, StateId = texas.Id, IsOverride = false, IsActive = true },
        };
        context.JurisdictionRules.AddRange(rules);

        // === Attorneys ===
        var attorney1 = new Attorney
        {
            Id = Guid.Parse("44444444-4444-4444-4444-444444444001"),
            FirstName = "John",
            LastName = "Smith",
            BarNumber = "CA-12345",
            FirmName = "Smith & Associates",
            Email = "john.smith@lawfirm.com",
            Phone = "213-555-0100",
            IsActive = true,
            MaxCaseLoad = 50,
            CurrentCaseCount = 12
        };
        var attorney2 = new Attorney
        {
            Id = Guid.Parse("44444444-4444-4444-4444-444444444002"),
            FirstName = "Maria",
            LastName = "Garcia",
            BarNumber = "TX-67890",
            FirmName = "Garcia Legal Group",
            Email = "maria.garcia@lawfirm.com",
            Phone = "713-555-0200",
            IsActive = true,
            MaxCaseLoad = 75,
            CurrentCaseCount = 30
        };
        var attorney3 = new Attorney
        {
            Id = Guid.Parse("44444444-4444-4444-4444-444444444003"),
            FirstName = "David",
            LastName = "Chen",
            BarNumber = "NY-11111",
            FirmName = "Chen & Partners LLP",
            Email = "david.chen@lawfirm.com",
            Phone = "212-555-0300",
            IsActive = true,
            MaxCaseLoad = 40,
            CurrentCaseCount = 5
        };

        context.Attorneys.AddRange(attorney1, attorney2, attorney3);

        // === Attorney Credentials ===
        var credentials = new List<AttorneyCredential>
        {
            new() { AttorneyId = attorney1.Id, StateId = california.Id, BarAdmissionNumber = "CA-12345", AdmissionDate = new DateTime(2015, 6, 15, 0, 0, 0, DateTimeKind.Utc), IsActive = true },
            new() { AttorneyId = attorney1.Id, StateId = california.Id, CourthouseId = laSuperior.Id, BarAdmissionNumber = "CA-12345-LA", AdmissionDate = new DateTime(2015, 6, 15, 0, 0, 0, DateTimeKind.Utc), IsLocalCounsel = true, IsActive = true },
            new() { AttorneyId = attorney1.Id, StateId = california.Id, CourthouseId = sfSuperior.Id, BarAdmissionNumber = "CA-12345-SF", AdmissionDate = new DateTime(2016, 1, 10, 0, 0, 0, DateTimeKind.Utc), IsLocalCounsel = true, IsActive = true },
            new() { AttorneyId = attorney2.Id, StateId = texas.Id, BarAdmissionNumber = "TX-67890", AdmissionDate = new DateTime(2012, 9, 1, 0, 0, 0, DateTimeKind.Utc), IsActive = true },
            new() { AttorneyId = attorney2.Id, StateId = texas.Id, CourthouseId = harrisDistrict.Id, BarAdmissionNumber = "TX-67890-HAR", AdmissionDate = new DateTime(2012, 9, 1, 0, 0, 0, DateTimeKind.Utc), IsLocalCounsel = true, IsActive = true },
            new() { AttorneyId = attorney3.Id, StateId = newYork.Id, BarAdmissionNumber = "NY-11111", AdmissionDate = new DateTime(2018, 3, 20, 0, 0, 0, DateTimeKind.Utc), IsActive = true },
            new() { AttorneyId = attorney3.Id, StateId = newYork.Id, CourthouseId = nySupreme.Id, BarAdmissionNumber = "NY-11111-MAN", AdmissionDate = new DateTime(2018, 3, 20, 0, 0, 0, DateTimeKind.Utc), IsLocalCounsel = true, IsActive = true },
        };
        context.AttorneyCredentials.AddRange(credentials);

        // === Document Templates ===
        var templates = new List<DocumentTemplate>
        {
            new() { TemplateCode = "CA-COMP-CC-001", Name = "CA Complaint - Credit Card", DocumentType = "Complaint", ProductType = "CreditCard", VersionNumber = 1, Format = DocumentFormat.Pdf, Status = TemplateStatus.Active, StateId = california.Id, EffectiveDate = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc), UsageCount = 1500 },
            new() { TemplateCode = "CA-COMP-AL-001", Name = "CA Complaint - Auto Loan", DocumentType = "Complaint", ProductType = "AutoLoan", VersionNumber = 1, Format = DocumentFormat.Pdf, Status = TemplateStatus.Active, StateId = california.Id, EffectiveDate = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc), UsageCount = 800 },
            new() { TemplateCode = "TX-SUM-GEN-002", Name = "TX Summons - Generic", DocumentType = "Summons", ProductType = "Generic", VersionNumber = 2, Format = DocumentFormat.Pdf, Status = TemplateStatus.Active, StateId = texas.Id, EffectiveDate = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc), UsageCount = 2200 },
            new() { TemplateCode = "NY-GARN-GEN-001", Name = "NY Garnishment Writ", DocumentType = "GarnishmentWrit", ProductType = "Generic", VersionNumber = 1, Format = DocumentFormat.Word, Status = TemplateStatus.Active, StateId = newYork.Id, EffectiveDate = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc), UsageCount = 950 },
            new() { TemplateCode = "FL-NOTICE-GEN-003", Name = "FL Notice of Intent", DocumentType = "Notice", ProductType = "Generic", VersionNumber = 3, Format = DocumentFormat.Pdf, Status = TemplateStatus.Active, StateId = florida.Id, EffectiveDate = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc), UsageCount = 3100 },
            new() { TemplateCode = "CA-LA-COMP-CC-001", Name = "LA County Complaint - Credit Card", DocumentType = "Complaint", ProductType = "CreditCard", VersionNumber = 1, Format = DocumentFormat.Pdf, Status = TemplateStatus.Active, StateId = california.Id, CountyId = losAngeles.Id, EffectiveDate = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc), UsageCount = 600 },
            new() { TemplateCode = "CA-LA-LASC-CS-001", Name = "LASC Cover Sheet", DocumentType = "CoverSheet", ProductType = "Generic", VersionNumber = 1, Format = DocumentFormat.Pdf, Status = TemplateStatus.Active, StateId = california.Id, CountyId = losAngeles.Id, CourthouseId = laSuperior.Id, EffectiveDate = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc), UsageCount = 450 },
            new() { TemplateCode = "CA-COMP-CC-000", Name = "Obsolete CA Template", DocumentType = "Complaint", ProductType = "CreditCard", VersionNumber = 0, Format = DocumentFormat.Tiff, Status = TemplateStatus.Retired, StateId = california.Id, EffectiveDate = new DateTime(2020, 1, 1, 0, 0, 0, DateTimeKind.Utc), ExpirationDate = new DateTime(2023, 12, 31, 0, 0, 0, DateTimeKind.Utc), UsageCount = 0 },
        };
        context.DocumentTemplates.AddRange(templates);

        // === Accounts ===
        var accounts = new List<Account>
        {
            new() { Id = Guid.Parse("55555555-5555-5555-5555-555555555001"), AccountNumber = "ACC-2024-001", DebtorName = "Jane Doe", OriginalBalance = 8500m, CurrentBalance = 7200m, ProductType = "CreditCard", StateId = california.Id, CountyId = losAngeles.Id, CourthouseId = laSuperior.Id, Status = AccountStatus.Selected, CurrentStage = ProcessStage.DocumentOrderFulfillment },
            new() { Id = Guid.Parse("55555555-5555-5555-5555-555555555002"), AccountNumber = "ACC-2024-002", DebtorName = "Robert Johnson", OriginalBalance = 12000m, CurrentBalance = 11500m, ProductType = "AutoLoan", StateId = texas.Id, CountyId = harris.Id, CourthouseId = harrisDistrict.Id, Status = AccountStatus.Selected, CurrentStage = ProcessStage.AccountSelection },
            new() { Id = Guid.Parse("55555555-5555-5555-5555-555555555003"), AccountNumber = "ACC-2024-003", DebtorName = "Emily Williams", OriginalBalance = 25000m, CurrentBalance = 24000m, ProductType = "CreditCard", StateId = newYork.Id, CountyId = newYorkCounty.Id, CourthouseId = nySupreme.Id, Status = AccountStatus.Selected, CurrentStage = ProcessStage.SuitFiling, AssignedAttorneyId = attorney3.Id },
            new() { Id = Guid.Parse("55555555-5555-5555-5555-555555555004"), AccountNumber = "ACC-2024-004", DebtorName = "Michael Brown", OriginalBalance = 3500m, CurrentBalance = 3200m, ProductType = "CreditCard", StateId = florida.Id, CountyId = miamidade.Id, CourthouseId = miamiDadeCircuit.Id, Status = AccountStatus.Selected, CurrentStage = ProcessStage.ServiceOfProcess },
            new() { Id = Guid.Parse("55555555-5555-5555-5555-555555555005"), AccountNumber = "ACC-2024-005", DebtorName = "Sarah Davis", OriginalBalance = 15000m, CurrentBalance = 14500m, ProductType = "CreditCard", StateId = illinois.Id, CountyId = cook.Id, CourthouseId = cookCircuit.Id, Status = AccountStatus.Selected, CurrentStage = ProcessStage.AttorneyPlacementReview },
        };
        context.Accounts.AddRange(accounts);

        // === Integration Partners ===
        var partners = new List<IntegrationPartner>
        {
            new() { PartnerName = "DocuServe Inc.", Direction = IntegrationDirection.Outbound, CurrentProtocol = IntegrationProtocol.Sftp, TargetProtocol = IntegrationProtocol.Api, IsDualModeEnabled = true, PartnerOffersApi = true, DataFormat = "CSV", Frequency = "Daily", PollingIntervalMinutes = 60, MigrationPriority = 1 },
            new() { PartnerName = "CourtFile Pro", Direction = IntegrationDirection.Outbound, CurrentProtocol = IntegrationProtocol.Api, TargetProtocol = IntegrationProtocol.Api, IsDualModeEnabled = false, PartnerOffersApi = true, DataFormat = "JSON", Frequency = "Real-time", PollingIntervalMinutes = 15, MigrationPriority = 0 },
            new() { PartnerName = "SkipTrace Global", Direction = IntegrationDirection.Inbound, CurrentProtocol = IntegrationProtocol.Sftp, TargetProtocol = IntegrationProtocol.Sftp, IsDualModeEnabled = false, PartnerOffersApi = false, DataFormat = "Fixed-width", Frequency = "Daily", PollingIntervalMinutes = 0, MigrationPriority = 5 },
            new() { PartnerName = "eFile Gateway", Direction = IntegrationDirection.Outbound, CurrentProtocol = IntegrationProtocol.Api, TargetProtocol = IntegrationProtocol.Api, IsDualModeEnabled = false, PartnerOffersApi = true, DataFormat = "XML", Frequency = "On-demand", PollingIntervalMinutes = 0, MigrationPriority = 0 },
        };
        context.IntegrationPartners.AddRange(partners);

        // === Batch Job Inventory ===
        var batchJobs = new List<BatchJobInventory>
        {
            new() { JobName = "DailyAccountSelection", Description = "Evaluates new accounts for legal eligibility", MappedStage = ProcessStage.AccountSelection, TriggerType = "Schedule", CronSchedule = "0 2 * * *", MigrationStatus = BatchJobStatus.InParallel, NewEventTopic = "legal-recovery.account-selection", ParallelRunStartDate = DateTime.UtcNow.AddDays(-14) },
            new() { JobName = "DocumentOrderBatch", Description = "Processes document orders from SFTP", MappedStage = ProcessStage.DocumentOrderFulfillment, TriggerType = "Schedule", CronSchedule = "0 6 * * *", MigrationStatus = BatchJobStatus.Active },
            new() { JobName = "ServiceTracker", Description = "Updates service of process status", MappedStage = ProcessStage.ServiceOfProcess, TriggerType = "Schedule", CronSchedule = "0 */4 * * *", MigrationStatus = BatchJobStatus.Active },
            new() { JobName = "FilingStatusCheck", Description = "Polls e-filing systems for status updates", MappedStage = ProcessStage.SuitFiling, TriggerType = "Schedule", CronSchedule = "0 8 * * *", MigrationStatus = BatchJobStatus.Migrated, MigrationDate = DateTime.UtcNow.AddDays(-30), NewEventTopic = "legal-recovery.filing-status" },
            new() { JobName = "GarnishmentProcessor", Description = "Processes garnishment responses", MappedStage = ProcessStage.AssetGarnishments, TriggerType = "Schedule", CronSchedule = "0 10 * * *", MigrationStatus = BatchJobStatus.Active },
            new() { JobName = "NightlyDWRefresh", Description = "Refreshes data warehouse tables", IsCrossCutting = true, TriggerType = "Schedule", CronSchedule = "0 1 * * *", MigrationStatus = BatchJobStatus.Decommissioned, IsObsolete = true, RetirementJustification = "Replaced by event-driven DW pipeline", DecommissionDate = DateTime.UtcNow.AddDays(-60) },
        };
        context.BatchJobInventories.AddRange(batchJobs);

        await context.SaveChangesAsync();
        logger.LogInformation("Database seeded successfully with {StateCount} states, {CountyCount} counties, {CourthouseCount} courthouses, {AccountCount} accounts",
            5, 7, 8, 5);
    }
}
