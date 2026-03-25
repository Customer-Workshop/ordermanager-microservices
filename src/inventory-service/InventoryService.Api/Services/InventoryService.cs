using Microsoft.EntityFrameworkCore;
using InventoryService.Api.Data;
using InventoryService.Api.DTOs;
using InventoryService.Api.Models;

namespace InventoryService.Api.Services;

/// <summary>
/// Core business logic for inventory management operations.
/// Handles CRUD, restocking, stock checks, and deductions.
/// </summary>
public class InventoryBusinessService
{
    private readonly InventoryDbContext _context;

    public InventoryBusinessService(InventoryDbContext context)
    {
        _context = context;
    }

    /// <summary>Retrieves all inventory items.</summary>
    public async Task<List<InventoryItemDto>> GetAllInventoryAsync()
    {
        return await _context.InventoryItems
            .Select(i => MapToDto(i))
            .ToListAsync();
    }

    /// <summary>Retrieves the inventory record for a specific product.</summary>
    public async Task<InventoryItemDto?> GetInventoryByProductIdAsync(int productId)
    {
        var item = await _context.InventoryItems.FirstOrDefaultAsync(i => i.ProductId == productId);
        return item is null ? null : MapToDto(item);
    }

    /// <summary>Retrieves a single inventory item by its ID.</summary>
    public async Task<InventoryItemDto?> GetInventoryByIdAsync(int id)
    {
        var item = await _context.InventoryItems.FindAsync(id);
        return item is null ? null : MapToDto(item);
    }

    /// <summary>Adds stock to an existing inventory item.</summary>
    public async Task<InventoryItemDto> RestockAsync(int productId, int quantity)
    {
        var item = await _context.InventoryItems.FirstOrDefaultAsync(i => i.ProductId == productId)
            ?? throw new ArgumentException($"No inventory record for product {productId}");

        if (quantity <= 0)
            throw new ArgumentException("Restock quantity must be positive");

        item.QuantityOnHand += quantity;
        item.LastRestocked = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return MapToDto(item);
    }

    /// <summary>Returns all items whose stock is at or below their reorder level.</summary>
    public async Task<List<InventoryItemDto>> GetLowStockItemsAsync()
    {
        return await _context.InventoryItems
            .Where(i => i.QuantityOnHand <= i.ReorderLevel)
            .Select(i => MapToDto(i))
            .ToListAsync();
    }

    /// <summary>Creates a new inventory record for a product.</summary>
    public async Task<InventoryItemDto> CreateInventoryItemAsync(CreateInventoryItemRequest request)
    {
        var existing = await _context.InventoryItems.FirstOrDefaultAsync(i => i.ProductId == request.ProductId);
        if (existing is not null)
            throw new InvalidOperationException($"Inventory record already exists for product {request.ProductId}");

        var item = new InventoryItem
        {
            ProductId = request.ProductId,
            ProductName = request.ProductName,
            Sku = request.Sku,
            QuantityOnHand = request.QuantityOnHand,
            ReorderLevel = request.ReorderLevel,
            WarehouseLocation = request.WarehouseLocation,
            LastRestocked = DateTime.UtcNow
        };

        _context.InventoryItems.Add(item);
        await _context.SaveChangesAsync();
        return MapToDto(item);
    }

    /// <summary>Checks stock availability for a given product and quantity.</summary>
    public async Task<StockCheckResponse> CheckStockAsync(int productId, int quantity)
    {
        var item = await _context.InventoryItems.FirstOrDefaultAsync(i => i.ProductId == productId);
        if (item is null)
            return new StockCheckResponse(productId, 0, false);

        return new StockCheckResponse(productId, item.QuantityOnHand, item.QuantityOnHand >= quantity);
    }

    /// <summary>Deducts stock for a product (called by Order service during order creation).</summary>
    public async Task<InventoryItemDto> DeductStockAsync(int productId, int quantity)
    {
        var item = await _context.InventoryItems.FirstOrDefaultAsync(i => i.ProductId == productId)
            ?? throw new ArgumentException($"No inventory record for product {productId}");

        if (quantity <= 0)
            throw new ArgumentException("Deduction quantity must be positive");

        if (item.QuantityOnHand < quantity)
            throw new InvalidOperationException(
                $"Insufficient stock for product {productId} ({item.ProductName}). Available: {item.QuantityOnHand}, Requested: {quantity}");

        item.QuantityOnHand -= quantity;
        await _context.SaveChangesAsync();
        return MapToDto(item);
    }

    private static InventoryItemDto MapToDto(InventoryItem item) => new(
        item.Id,
        item.ProductId,
        item.ProductName,
        item.Sku,
        item.QuantityOnHand,
        item.ReorderLevel,
        item.WarehouseLocation,
        item.LastRestocked
    );
}
