namespace InventoryService.Api.Models;

public class StockReservationResponse
{
    public bool Success { get; set; }
    public string? Error { get; set; }
    public List<ReservedItem> ReservedItems { get; set; } = new();
}

public class ReservedItem
{
    public int ProductId { get; set; }
    public int QuantityReserved { get; set; }
    public int RemainingStock { get; set; }
}
