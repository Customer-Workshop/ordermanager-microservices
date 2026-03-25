namespace InventoryService.Api.Models;

/// <summary>Request to restock an inventory item.</summary>
public record RestockRequest(int Quantity);

/// <summary>Request to create a new inventory item.</summary>
public record CreateInventoryItemRequest(
    int ProductId,
    string ProductName,
    string ProductSku,
    int QuantityOnHand,
    int ReorderLevel,
    string WarehouseLocation);

/// <summary>Request to update an existing inventory item.</summary>
public record UpdateInventoryItemRequest(
    int? QuantityOnHand,
    int? ReorderLevel,
    string? WarehouseLocation);

/// <summary>Request to check and reserve stock for an order.</summary>
public record StockCheckRequest(int ProductId, int Quantity);

/// <summary>Response for a stock availability check.</summary>
public record StockCheckResponse(int ProductId, bool Available, int QuantityOnHand);
