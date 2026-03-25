namespace InventoryService.Api.Models;

public class StockReservationRequest
{
    public List<StockReservationItem> Items { get; set; } = new();
}

public class StockReservationItem
{
    public int ProductId { get; set; }
    public int Quantity { get; set; }
}
