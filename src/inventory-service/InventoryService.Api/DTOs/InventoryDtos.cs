namespace InventoryService.Api.DTOs;

/// <summary>Read-only representation of an inventory item returned by the API.</summary>
public record InventoryItemDto(
    int Id,
    int ProductId,
    string ProductName,
    string Sku,
    int QuantityOnHand,
    int ReorderLevel,
    string WarehouseLocation,
    DateTime LastRestocked
);

/// <summary>Request body for restocking an inventory item.</summary>
public record RestockRequest(int Quantity);

/// <summary>Request body for creating a new inventory record.</summary>
public record CreateInventoryItemRequest(
    int ProductId,
    string ProductName,
    string Sku,
    int QuantityOnHand,
    int ReorderLevel,
    string WarehouseLocation
);

/// <summary>Request body for deducting stock (used by Order service during order creation).</summary>
public record DeductStockRequest(int Quantity);

/// <summary>Response for stock availability checks.</summary>
public record StockCheckResponse(int ProductId, int QuantityOnHand, bool InStock);
