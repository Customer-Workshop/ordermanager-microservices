using System.Text.Json;
using Azure.Messaging.ServiceBus;
using LegalRecovery.Domain.Events;
using LegalRecovery.Domain.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace LegalRecovery.Infrastructure.Messaging;

/// <summary>
/// Publishes domain events to Azure Service Bus topics.
/// Used for the event-driven architecture replacing batch jobs.
/// </summary>
public class AzureServiceBusPublisher : IEventPublisher, IAsyncDisposable
{
    private readonly ServiceBusClient _client;
    private readonly ILogger<AzureServiceBusPublisher> _logger;
    private readonly string _topicPrefix;

    public AzureServiceBusPublisher(IConfiguration configuration, ILogger<AzureServiceBusPublisher> logger)
    {
        var connectionString = configuration.GetConnectionString("ServiceBus")
            ?? throw new InvalidOperationException("ServiceBus connection string not configured");
        _client = new ServiceBusClient(connectionString);
        _logger = logger;
        _topicPrefix = configuration["ServiceBus:TopicPrefix"] ?? "legal-recovery";
    }

    public async Task PublishAsync<T>(T domainEvent, CancellationToken cancellationToken = default) where T : DomainEvent
    {
        var topicName = $"{_topicPrefix}-{typeof(T).Name.ToLowerInvariant()}";
        var sender = _client.CreateSender(topicName);

        try
        {
            var message = new ServiceBusMessage(JsonSerializer.Serialize(domainEvent))
            {
                ContentType = "application/json",
                MessageId = domainEvent.EventId.ToString(),
                Subject = domainEvent.EventType,
                ApplicationProperties =
                {
                    ["EventType"] = domainEvent.EventType,
                    ["OccurredAt"] = domainEvent.OccurredAt.ToString("O")
                }
            };

            await sender.SendMessageAsync(message, cancellationToken);
            _logger.LogInformation("Published event {EventType} to topic {Topic}", domainEvent.EventType, topicName);
        }
        finally
        {
            await sender.DisposeAsync();
        }
    }

    public async Task PublishBatchAsync<T>(IEnumerable<T> domainEvents, CancellationToken cancellationToken = default) where T : DomainEvent
    {
        var topicName = $"{_topicPrefix}-{typeof(T).Name.ToLowerInvariant()}";
        var sender = _client.CreateSender(topicName);

        try
        {
            using var messageBatch = await sender.CreateMessageBatchAsync(cancellationToken);

            foreach (var domainEvent in domainEvents)
            {
                var message = new ServiceBusMessage(JsonSerializer.Serialize(domainEvent))
                {
                    ContentType = "application/json",
                    MessageId = domainEvent.EventId.ToString(),
                    Subject = domainEvent.EventType
                };

                if (!messageBatch.TryAddMessage(message))
                {
                    await sender.SendMessagesAsync(messageBatch, cancellationToken);
                    _logger.LogInformation("Sent batch of events to {Topic}", topicName);
                }
            }

            if (messageBatch.Count > 0)
            {
                await sender.SendMessagesAsync(messageBatch, cancellationToken);
                _logger.LogInformation("Sent final batch of {Count} events to {Topic}", messageBatch.Count, topicName);
            }
        }
        finally
        {
            await sender.DisposeAsync();
        }
    }

    public async ValueTask DisposeAsync()
    {
        await _client.DisposeAsync();
        GC.SuppressFinalize(this);
    }
}
