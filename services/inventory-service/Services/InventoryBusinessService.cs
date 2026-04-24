using Microsoft.EntityFrameworkCore;
using InventoryService.Data;
using InventoryService.Models;

namespace InventoryService.Services;

public class InventoryBusinessService
{
    private readonly InventoryDbContext _context;

    public InventoryBusinessService(InventoryDbContext context)
    {
        _context = context;
    }

    public async Task<List<InventoryItem>> GetAllInventoryAsync()
    {
        return await _context.InventoryItems.ToListAsync();
    }

    public async Task<InventoryItem?> GetInventoryByProductIdAsync(int productId)
    {
        return await _context.InventoryItems.FirstOrDefaultAsync(i => i.ProductId == productId);
    }

    public async Task<InventoryItem> RestockAsync(int productId, int quantity)
    {
        var item = await _context.InventoryItems.FirstOrDefaultAsync(i => i.ProductId == productId)
            ?? throw new ArgumentException($"No inventory record for product {productId}");
        item.QuantityOnHand += quantity;
        item.LastRestocked = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return item;
    }

    public async Task<List<InventoryItem>> GetLowStockItemsAsync()
    {
        return await _context.InventoryItems
            .Where(i => i.QuantityOnHand <= i.ReorderLevel)
            .ToListAsync();
    }

    public async Task<InventoryItem> CreateAsync(InventoryItem item)
    {
        _context.InventoryItems.Add(item);
        await _context.SaveChangesAsync();
        return item;
    }

    public async Task<InventoryItem?> UpdateAsync(int id, InventoryItem updated)
    {
        var item = await _context.InventoryItems.FindAsync(id);
        if (item is null) return null;

        item.ProductId = updated.ProductId;
        item.ProductName = updated.ProductName;
        item.Sku = updated.Sku;
        item.QuantityOnHand = updated.QuantityOnHand;
        item.ReorderLevel = updated.ReorderLevel;
        item.WarehouseLocation = updated.WarehouseLocation;
        item.LastRestocked = updated.LastRestocked;

        await _context.SaveChangesAsync();
        return item;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var item = await _context.InventoryItems.FindAsync(id);
        if (item is null) return false;

        _context.InventoryItems.Remove(item);
        await _context.SaveChangesAsync();
        return true;
    }
}
