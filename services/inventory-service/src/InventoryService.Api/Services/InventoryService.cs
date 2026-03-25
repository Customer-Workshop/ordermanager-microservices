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

    public async Task<StockReservationResponse> CheckAndReserveStockAsync(StockReservationRequest request)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            var response = new StockReservationResponse { Success = true };

            foreach (var reqItem in request.Items)
            {
                var inventory = await _context.InventoryItems
                    .FirstOrDefaultAsync(i => i.ProductId == reqItem.ProductId);

                if (inventory is null)
                {
                    response.Success = false;
                    response.Error = $"No inventory record for product {reqItem.ProductId}";
                    await transaction.RollbackAsync();
                    return response;
                }

                if (inventory.QuantityOnHand < reqItem.Quantity)
                {
                    response.Success = false;
                    response.Error = $"Insufficient stock for product {reqItem.ProductId} ({inventory.ProductName}). Available: {inventory.QuantityOnHand}, Requested: {reqItem.Quantity}";
                    await transaction.RollbackAsync();
                    return response;
                }

                inventory.QuantityOnHand -= reqItem.Quantity;

                response.ReservedItems.Add(new ReservedItem
                {
                    ProductId = reqItem.ProductId,
                    QuantityReserved = reqItem.Quantity,
                    RemainingStock = inventory.QuantityOnHand
                });
            }

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();
            return response;
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return new StockReservationResponse
            {
                Success = false,
                Error = $"Failed to reserve stock: {ex.Message}"
            };
        }
    }

    public async Task<List<InventoryItem>> GetLowStockItemsAsync()
    {
        return await _context.InventoryItems
            .Where(i => i.QuantityOnHand <= i.ReorderLevel)
            .ToListAsync();
    }
}
