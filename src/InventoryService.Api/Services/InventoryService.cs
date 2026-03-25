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
        return await _context.InventoryItems.OrderBy(i => i.ProductName).ToListAsync();
    }

    public async Task<InventoryItem?> GetInventoryByProductIdAsync(int productId)
    {
        return await _context.InventoryItems.FirstOrDefaultAsync(i => i.ProductId == productId);
    }

    public async Task<InventoryItem?> GetInventoryByIdAsync(int id)
    {
        return await _context.InventoryItems.FindAsync(id);
    }

    public async Task<InventoryItem> CreateInventoryItemAsync(CreateInventoryItemRequest request)
    {
        var existing = await _context.InventoryItems.FirstOrDefaultAsync(i => i.ProductId == request.ProductId);
        if (existing is not null)
            throw new InvalidOperationException($"Inventory record already exists for product {request.ProductId}");

        var item = new InventoryItem
        {
            ProductId = request.ProductId,
            ProductName = request.ProductName,
            ProductSku = request.ProductSku,
            QuantityOnHand = request.QuantityOnHand,
            ReorderLevel = request.ReorderLevel,
            WarehouseLocation = request.WarehouseLocation,
            LastRestocked = DateTime.UtcNow
        };

        _context.InventoryItems.Add(item);
        await _context.SaveChangesAsync();
        return item;
    }

    public async Task<InventoryItem> UpdateInventoryItemAsync(int id, UpdateInventoryItemRequest request)
    {
        var item = await _context.InventoryItems.FindAsync(id)
            ?? throw new ArgumentException($"Inventory item {id} not found");

        if (request.QuantityOnHand.HasValue)
            item.QuantityOnHand = request.QuantityOnHand.Value;
        if (request.ReorderLevel.HasValue)
            item.ReorderLevel = request.ReorderLevel.Value;
        if (request.WarehouseLocation is not null)
            item.WarehouseLocation = request.WarehouseLocation;

        await _context.SaveChangesAsync();
        return item;
    }

    public async Task<InventoryItem> RestockAsync(int productId, int quantity)
    {
        var item = await _context.InventoryItems.FirstOrDefaultAsync(i => i.ProductId == productId)
            ?? throw new ArgumentException($"No inventory record for product {productId}");

        if (quantity <= 0)
            throw new ArgumentException("Restock quantity must be positive");

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

    public async Task<bool> CheckStockAsync(int productId, int quantity)
    {
        var item = await _context.InventoryItems.FirstOrDefaultAsync(i => i.ProductId == productId);
        return item is not null && item.QuantityOnHand >= quantity;
    }

    public async Task<InventoryItem?> DeductStockAsync(int productId, int quantity)
    {
        var item = await _context.InventoryItems.FirstOrDefaultAsync(i => i.ProductId == productId);
        if (item is null || item.QuantityOnHand < quantity) return null;
        item.QuantityOnHand -= quantity;
        await _context.SaveChangesAsync();
        return item;
    }
}
