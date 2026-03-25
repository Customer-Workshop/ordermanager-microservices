namespace InventoryService.Api.Models;

/// <summary>
/// Represents an inventory record tracking stock levels for a specific product.
/// </summary>
public class InventoryItem
{
    /// <summary>Unique identifier for the inventory record.</summary>
    public int Id { get; set; }

    /// <summary>Foreign key referencing the product in the Products service.</summary>
    public int ProductId { get; set; }

    /// <summary>Denormalized product name for display without cross-service calls.</summary>
    public string ProductName { get; set; } = string.Empty;

    /// <summary>Denormalized SKU for quick reference.</summary>
    public string Sku { get; set; } = string.Empty;

    /// <summary>Current quantity available in stock.</summary>
    public int QuantityOnHand { get; set; }

    /// <summary>Threshold below which the item is considered low-stock and triggers reorder alerts.</summary>
    public int ReorderLevel { get; set; } = 10;

    /// <summary>Physical warehouse location identifier (e.g., "A-01").</summary>
    public string WarehouseLocation { get; set; } = string.Empty;

    /// <summary>UTC timestamp of the last restock event.</summary>
    public DateTime LastRestocked { get; set; } = DateTime.UtcNow;
}
