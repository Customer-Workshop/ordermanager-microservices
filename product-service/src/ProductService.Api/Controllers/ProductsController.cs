using Microsoft.AspNetCore.Mvc;
using ProductService.Api.Models;
using ProductService.Api.Services;

namespace ProductService.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly ProductManager _productManager;

    public ProductsController(ProductManager productManager)
    {
        _productManager = productManager;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await _productManager.GetAllProductsAsync());

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var product = await _productManager.GetProductByIdAsync(id);
        return product is null ? NotFound() : Ok(product);
    }

    [HttpGet("category/{category}")]
    public async Task<IActionResult> GetByCategory(string category) =>
        Ok(await _productManager.GetProductsByCategoryAsync(category));

    [HttpPost("batch")]
    public async Task<IActionResult> GetByIds([FromBody] ProductIdsRequest request) =>
        Ok(await _productManager.GetProductsByIdsAsync(request.Ids));

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Product product)
    {
        try
        {
            var created = await _productManager.CreateProductAsync(product);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }
        catch (ArgumentOutOfRangeException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { error = ex.Message });
        }
    }
}

public record ProductIdsRequest(List<int> Ids);
