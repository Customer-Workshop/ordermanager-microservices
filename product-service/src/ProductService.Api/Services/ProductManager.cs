using Microsoft.EntityFrameworkCore;
using ProductService.Api.Data;
using ProductService.Api.Models;

namespace ProductService.Api.Services;

public class ProductManager
{
    private readonly ProductDbContext _context;

    public ProductManager(ProductDbContext context)
    {
        _context = context;
    }

    public async Task<List<Product>> GetAllProductsAsync()
    {
        return await _context.Products.ToListAsync();
    }

    public async Task<Product?> GetProductByIdAsync(int id)
    {
        return await _context.Products.FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task<List<Product>> GetProductsByIdsAsync(IEnumerable<int> ids)
    {
        var idSet = ids.Distinct().ToList();
        return await _context.Products.Where(p => idSet.Contains(p.Id)).ToListAsync();
    }

    public async Task<List<Product>> GetProductsByCategoryAsync(string category)
    {
        return await _context.Products.Where(p => p.Category == category).ToListAsync();
    }

    public async Task<Product> CreateProductAsync(Product product)
    {
        if (string.IsNullOrWhiteSpace(product.Name))
            throw new ArgumentException("Product name is required.");
        if (string.IsNullOrWhiteSpace(product.Sku))
            throw new ArgumentException("Product SKU is required.");
        if (product.Price < 0)
            throw new ArgumentOutOfRangeException(nameof(product), "Price must not be negative.");
        if (await _context.Products.AnyAsync(p => p.Sku == product.Sku))
            throw new InvalidOperationException($"A product with SKU {product.Sku} already exists.");

        _context.Products.Add(product);
        await _context.SaveChangesAsync();
        return product;
    }
}
