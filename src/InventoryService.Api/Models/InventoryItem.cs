namespace InventoryService.Api.Models;

/// <summary>
/// Represents an inventory record tracking stock levels for a product.
/// </summary>
public class InventoryItem
{
    /// <summary>Unique identifier for the inventory record.</summary>
    public int Id { get; set; }

    /// <summary>Foreign key referencing the product in the Product catalog.</summary>
    public int ProductId { get; set; }

    /// <summary>Human-readable product name (denormalized for display without cross-service calls).</summary>
    public string ProductName { get; set; } = string.Empty;

    /// <summary>Current quantity available in stock.</summary>
    public int QuantityOnHand { get; set; }

    /// <summary>Minimum stock level that triggers a reorder alert.</summary>
    public int ReorderLevel { get; set; } = 10;

    /// <summary>Physical warehouse location code (e.g., A-01, B-12).</summary>
    public string WarehouseLocation { get; set; } = string.Empty;

    /// <summary>UTC timestamp of the last restock operation.</summary>
    public DateTime LastRestocked { get; set; } = DateTime.UtcNow;
}
