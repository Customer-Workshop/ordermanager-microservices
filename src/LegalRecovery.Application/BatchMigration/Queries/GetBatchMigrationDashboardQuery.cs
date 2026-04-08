using LegalRecovery.Application.Common.Interfaces;
using LegalRecovery.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LegalRecovery.Application.BatchMigration.Queries;

public record GetBatchMigrationDashboardQuery : IRequest<BatchMigrationDashboardDto>;

public class BatchMigrationDashboardDto
{
    public int TotalBatchJobs { get; set; }
    public int ActiveJobs { get; set; }
    public int MigratedJobs { get; set; }
    public int InParallelJobs { get; set; }
    public int DecommissionedJobs { get; set; }
    public int RetiredJobs { get; set; }
    public int RemainingJobs { get; set; }
    public double MigrationProgressPercent { get; set; }
    public Dictionary<string, int> JobsByStage { get; set; } = new();
}

public class GetBatchMigrationDashboardQueryHandler
    : IRequestHandler<GetBatchMigrationDashboardQuery, BatchMigrationDashboardDto>
{
    private readonly IApplicationDbContext _context;

    public GetBatchMigrationDashboardQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<BatchMigrationDashboardDto> Handle(
        GetBatchMigrationDashboardQuery request, CancellationToken cancellationToken)
    {
        var jobs = await _context.BatchJobInventories.ToListAsync(cancellationToken);

        var total = jobs.Count;
        var active = jobs.Count(j => j.MigrationStatus == BatchJobStatus.Active);
        var migrated = jobs.Count(j => j.MigrationStatus == BatchJobStatus.Migrated);
        var inParallel = jobs.Count(j => j.MigrationStatus == BatchJobStatus.InParallel);
        var decommissioned = jobs.Count(j => j.MigrationStatus == BatchJobStatus.Decommissioned);
        var retired = jobs.Count(j => j.MigrationStatus == BatchJobStatus.Retired);

        var jobsByStage = jobs
            .Where(j => j.MappedStage.HasValue)
            .GroupBy(j => j.MappedStage!.Value.ToString())
            .ToDictionary(g => g.Key, g => g.Count());

        var crossCutting = jobs.Count(j => j.IsCrossCutting);
        if (crossCutting > 0) jobsByStage["CrossCutting"] = crossCutting;

        return new BatchMigrationDashboardDto
        {
            TotalBatchJobs = total,
            ActiveJobs = active,
            MigratedJobs = migrated,
            InParallelJobs = inParallel,
            DecommissionedJobs = decommissioned,
            RetiredJobs = retired,
            RemainingJobs = active + inParallel,
            MigrationProgressPercent = total > 0 ? Math.Round((double)(migrated + decommissioned + retired) / total * 100, 1) : 0,
            JobsByStage = jobsByStage
        };
    }
}
