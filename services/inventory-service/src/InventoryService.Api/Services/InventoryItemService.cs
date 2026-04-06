using Microsoft.EntityFrameworkCore;
using InventoryService.Api.Data;
using InventoryService.Api.Models;

namespace InventoryService.Api.Services;

public class InventoryItemService
{
    private readonly InventoryDbContext _context;

    public InventoryItemService(InventoryDbContext context)
    {
        _context = context;
    }

    public async Task<List<InventoryItem>> GetAllInventoryAsync()
    {
        return await _context.InventoryItems.Include(i => i.Product).ToListAsync();
    }

    public async Task<InventoryItem?> GetInventoryByProductIdAsync(int productId)
    {
        return await _context.InventoryItems.Include(i => i.Product)
            .FirstOrDefaultAsync(i => i.ProductId == productId);
    }

    public async Task<InventoryItem> RestockAsync(int productId, int quantity)
    {
        var item = await _context.InventoryItems.FirstOrDefaultAsync(i => i.ProductId == productId);
        if (item == null) throw new KeyNotFoundException($"No inventory found for product {productId}");

        item.QuantityOnHand += quantity;
        item.LastRestocked = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return item;
    }

    public async Task<InventoryItem> DeductStockAsync(int productId, int quantity)
    {
        var item = await _context.InventoryItems.FirstOrDefaultAsync(i => i.ProductId == productId);
        if (item == null) throw new KeyNotFoundException($"No inventory found for product {productId}");
        if (item.QuantityOnHand < quantity)
            throw new InvalidOperationException($"Insufficient stock for product {productId}. Available: {item.QuantityOnHand}, Requested: {quantity}");

        item.QuantityOnHand -= quantity;
        await _context.SaveChangesAsync();
        return item;
    }

    public async Task<bool> CheckStockAsync(int productId, int quantity)
    {
        var item = await _context.InventoryItems.FirstOrDefaultAsync(i => i.ProductId == productId);
        return item is not null && item.QuantityOnHand >= quantity;
    }

    public async Task<List<InventoryItem>> GetLowStockItemsAsync()
    {
        return await _context.InventoryItems.Include(i => i.Product)
            .Where(i => i.QuantityOnHand <= i.ReorderLevel)
            .ToListAsync();
    }

    public async Task<InventoryItem> CreateInventoryItemAsync(InventoryItem item)
    {
        _context.InventoryItems.Add(item);
        await _context.SaveChangesAsync();
        return item;
    }
}
