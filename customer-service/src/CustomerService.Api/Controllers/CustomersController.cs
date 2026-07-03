using Microsoft.AspNetCore.Mvc;
using CustomerService.Api.Models;
using CustomerService.Api.Services;

namespace CustomerService.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CustomersController : ControllerBase
{
    private readonly CustomerManager _customerManager;

    public CustomersController(CustomerManager customerManager)
    {
        _customerManager = customerManager;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await _customerManager.GetAllCustomersAsync());

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var customer = await _customerManager.GetCustomerByIdAsync(id);
        return customer is null ? NotFound() : Ok(customer);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Customer customer)
    {
        try
        {
            var created = await _customerManager.CreateCustomerAsync(customer);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
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
