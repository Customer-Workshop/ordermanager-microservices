namespace InventoryService.Api.Models;

/// <summary>
/// Request payload for restocking an inventory item.
/// </summary>
/// <param name="Quantity">The number of units to add to stock. Must be greater than zero.</param>
public record RestockRequest(int Quantity);
