using System.ComponentModel.DataAnnotations.Schema;

namespace ProductService.Api.Models;

public class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string Sku { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public InventoryItem? Inventory { get; set; }
    [NotMapped]
    public IReadOnlyList<object> OrderItems => Array.Empty<object>();
}
