using Microsoft.EntityFrameworkCore;
using InventoryService.Api.Data;
using InventoryService.Api.Models;

namespace InventoryService.Api.Services;

/// <summary>
/// Core business logic for inventory management operations.
/// Provides stock queries, restocking, deductions, and low-stock detection.
/// </summary>
public class InventoryItemService
{
    private readonly InventoryDbContext _context;

    /// <summary>Initializes the service with the inventory database context.</summary>
    public InventoryItemService(InventoryDbContext context)
    {
        _context = context;
    }

    /// <summary>Retrieves every inventory item in the database.</summary>
    public async Task<List<InventoryItem>> GetAllInventoryAsync()
    {
        return await _context.InventoryItems.ToListAsync();
    }

    /// <summary>Looks up the inventory record for a single product.</summary>
    /// <param name="productId">The product identifier.</param>
    public async Task<InventoryItem?> GetInventoryByProductIdAsync(int productId)
    {
        return await _context.InventoryItems.FirstOrDefaultAsync(i => i.ProductId == productId);
    }

    /// <summary>Adds <paramref name="quantity"/> units to the product's stock.</summary>
    /// <param name="productId">The product to restock.</param>
    /// <param name="quantity">Number of units to add.</param>
    /// <exception cref="ArgumentException">No inventory record for the product.</exception>
    public async Task<InventoryItem> RestockAsync(int productId, int quantity)
    {
        var item = await _context.InventoryItems.FirstOrDefaultAsync(i => i.ProductId == productId)
            ?? throw new ArgumentException($"No inventory record for product {productId}");
        item.QuantityOnHand += quantity;
        item.LastRestocked = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return item;
    }

    /// <summary>Returns items whose <c>QuantityOnHand</c> is at or below their <c>ReorderLevel</c>.</summary>
    public async Task<List<InventoryItem>> GetLowStockItemsAsync()
    {
        return await _context.InventoryItems
            .Where(i => i.QuantityOnHand <= i.ReorderLevel)
            .ToListAsync();
    }

    /// <summary>
    /// Atomically checks stock availability and deducts the requested quantity.
    /// Used by the Order service during checkout.
    /// </summary>
    /// <param name="productId">The product identifier.</param>
    /// <param name="quantity">The quantity to deduct.</param>
    /// <returns><c>true</c> if stock was successfully deducted; <c>false</c> if insufficient.</returns>
    public async Task<bool> CheckAndDeductStockAsync(int productId, int quantity)
    {
        var item = await _context.InventoryItems.FirstOrDefaultAsync(i => i.ProductId == productId);
        if (item is null || item.QuantityOnHand < quantity) return false;
        item.QuantityOnHand -= quantity;
        await _context.SaveChangesAsync();
        return true;
    }

    /// <summary>Deducts stock and returns the updated item, or <c>null</c> if insufficient.</summary>
    /// <param name="productId">The product identifier.</param>
    /// <param name="quantity">The quantity to deduct.</param>
    public async Task<InventoryItem?> DeductStockAsync(int productId, int quantity)
    {
        var item = await _context.InventoryItems.FirstOrDefaultAsync(i => i.ProductId == productId);
        if (item is null || item.QuantityOnHand < quantity) return null;
        item.QuantityOnHand -= quantity;
        await _context.SaveChangesAsync();
        return item;
    }
}
