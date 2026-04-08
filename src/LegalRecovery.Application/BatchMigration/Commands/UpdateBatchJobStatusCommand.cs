using LegalRecovery.Application.Common.Interfaces;
using LegalRecovery.Domain.Enums;
using LegalRecovery.Domain.Events;
using LegalRecovery.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LegalRecovery.Application.BatchMigration.Commands;

public record UpdateBatchJobStatusCommand : IRequest<bool>
{
    public Guid BatchJobId { get; init; }
    public BatchJobStatus NewStatus { get; init; }
    public string? NewEventTopic { get; init; }
    public string? NewServiceName { get; init; }
}

public class UpdateBatchJobStatusCommandHandler : IRequestHandler<UpdateBatchJobStatusCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly IEventPublisher _eventPublisher;

    public UpdateBatchJobStatusCommandHandler(IApplicationDbContext context, IEventPublisher eventPublisher)
    {
        _context = context;
        _eventPublisher = eventPublisher;
    }

    public async Task<bool> Handle(UpdateBatchJobStatusCommand request, CancellationToken cancellationToken)
    {
        var job = await _context.BatchJobInventories
            .FirstOrDefaultAsync(j => j.Id == request.BatchJobId, cancellationToken)
            ?? throw new KeyNotFoundException($"Batch job {request.BatchJobId} not found");

        job.MigrationStatus = request.NewStatus;
        job.NewEventTopic = request.NewEventTopic ?? job.NewEventTopic;
        job.NewServiceName = request.NewServiceName ?? job.NewServiceName;
        job.UpdatedAt = DateTime.UtcNow;

        switch (request.NewStatus)
        {
            case BatchJobStatus.Migrated:
                job.MigrationDate = DateTime.UtcNow;
                break;
            case BatchJobStatus.InParallel:
                job.ParallelRunStartDate = DateTime.UtcNow;
                break;
            case BatchJobStatus.Decommissioned:
                job.DecommissionDate = DateTime.UtcNow;
                break;
        }

        await _eventPublisher.PublishAsync(new BatchJobMigratedEvent
        {
            BatchJobId = job.Id,
            JobName = job.JobName,
            NewStatus = request.NewStatus,
            NewEventTopic = request.NewEventTopic
        }, cancellationToken);

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
