using Microsoft.EntityFrameworkCore;
using InventoryService.Api.Data;
using InventoryService.Api.Models;

namespace InventoryService.Api.Services;

/// <summary>
/// Core business logic for inventory management operations.
/// Provides CRUD and stock-level operations on inventory items.
/// </summary>
public class InventoryItemService
{
    private readonly InventoryDbContext _context;

    public InventoryItemService(InventoryDbContext context)
    {
        _context = context;
    }

    /// <summary>Retrieves all inventory items.</summary>
    public async Task<List<InventoryItem>> GetAllInventoryAsync()
    {
        return await _context.InventoryItems.OrderBy(i => i.ProductName).ToListAsync();
    }

    /// <summary>Retrieves a single inventory item by its product ID.</summary>
    public async Task<InventoryItem?> GetInventoryByProductIdAsync(int productId)
    {
        return await _context.InventoryItems.FirstOrDefaultAsync(i => i.ProductId == productId);
    }

    /// <summary>Adds stock quantity to an existing inventory item.</summary>
    /// <exception cref="ArgumentException">Thrown when no inventory record exists for the given product.</exception>
    /// <exception cref="ArgumentOutOfRangeException">Thrown when the quantity is less than or equal to zero.</exception>
    public async Task<InventoryItem> RestockAsync(int productId, int quantity)
    {
        if (quantity <= 0)
            throw new ArgumentOutOfRangeException(nameof(quantity), "Restock quantity must be greater than zero.");

        var item = await _context.InventoryItems.FirstOrDefaultAsync(i => i.ProductId == productId)
            ?? throw new ArgumentException($"No inventory record for product {productId}");

        item.QuantityOnHand += quantity;
        item.LastRestocked = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return item;
    }

    /// <summary>Retrieves items whose stock level is at or below the reorder threshold.</summary>
    public async Task<List<InventoryItem>> GetLowStockItemsAsync()
    {
        return await _context.InventoryItems
            .Where(i => i.QuantityOnHand <= i.ReorderLevel)
            .OrderBy(i => i.QuantityOnHand)
            .ToListAsync();
    }

    /// <summary>Checks stock availability and decrements quantity for an order.</summary>
    /// <returns>True if stock was successfully reserved; false if insufficient stock.</returns>
    public async Task<bool> ReserveStockAsync(int productId, int quantity)
    {
        var item = await _context.InventoryItems.FirstOrDefaultAsync(i => i.ProductId == productId);
        if (item is null || item.QuantityOnHand < quantity)
            return false;

        item.QuantityOnHand -= quantity;
        await _context.SaveChangesAsync();
        return true;
    }
}
