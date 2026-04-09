using System.Net;
using System.Net.Http.Json;
using IntegrationTests.Factories;

namespace IntegrationTests;

public class CrossServiceTests
    : IClassFixture<ProductServiceFactory>,
      IClassFixture<CustomerServiceFactory>,
      IClassFixture<InventoryServiceFactory>
{
    private readonly HttpClient _productClient;
    private readonly HttpClient _customerClient;
    private readonly HttpClient _inventoryClient;

    public CrossServiceTests(
        ProductServiceFactory productFactory,
        CustomerServiceFactory customerFactory,
        InventoryServiceFactory inventoryFactory)
    {
        _productClient = productFactory.CreateClient();
        _customerClient = customerFactory.CreateClient();
        _inventoryClient = inventoryFactory.CreateClient();
    }

    [Fact]
    public async Task CrossService_CreateProduct_ThenVerifyInProductService()
    {
        var newProduct = new
        {
            Name = "Cross-Service Widget",
            Description = "Product for cross-service test",
            Category = "CrossTest",
            Price = 33.33m,
            Sku = "CS-" + Guid.NewGuid().ToString("N")[..8]
        };

        var createResponse = await _productClient.PostAsJsonAsync("/api/products", newProduct);
        Assert.Equal(HttpStatusCode.Created, createResponse.StatusCode);
        var created = await createResponse.Content.ReadFromJsonAsync<ProductResponse>();
        Assert.NotNull(created);
        Assert.True(created.Id > 0);

        var getResponse = await _productClient.GetAsync($"/api/products/{created.Id}");
        Assert.Equal(HttpStatusCode.OK, getResponse.StatusCode);
        var fetched = await getResponse.Content.ReadFromJsonAsync<ProductResponse>();
        Assert.NotNull(fetched);
        Assert.Equal(newProduct.Name, fetched.Name);
        Assert.Equal(newProduct.Price, fetched.Price);
    }

    [Fact]
    public async Task CrossService_CreateCustomer_ThenVerifyInCustomerService()
    {
        var newCustomer = new
        {
            Name = "Cross-Service Corp",
            Email = $"cross-{Guid.NewGuid():N}@test.com",
            Phone = "555-7777",
            Address = "42 Cross St",
            City = "Dallas",
            State = "TX",
            ZipCode = "75001"
        };

        var createResponse = await _customerClient.PostAsJsonAsync("/api/customers", newCustomer);
        Assert.Equal(HttpStatusCode.Created, createResponse.StatusCode);
        var created = await createResponse.Content.ReadFromJsonAsync<CustomerResponse>();
        Assert.NotNull(created);
        Assert.True(created.Id > 0);

        var getResponse = await _customerClient.GetAsync($"/api/customers/{created.Id}");
        Assert.Equal(HttpStatusCode.OK, getResponse.StatusCode);
        var fetched = await getResponse.Content.ReadFromJsonAsync<CustomerResponse>();
        Assert.NotNull(fetched);
        Assert.Equal(newCustomer.Name, fetched.Name);
    }

    [Fact]
    public async Task CrossService_CheckInventoryForProduct()
    {
        var inventoryResponse = await _inventoryClient.GetAsync("/api/inventory/product/1");
        Assert.Equal(HttpStatusCode.OK, inventoryResponse.StatusCode);
        var item = await inventoryResponse.Content.ReadFromJsonAsync<InventoryItemResponse>();
        Assert.NotNull(item);
        Assert.Equal(1, item.ProductId);
        Assert.True(item.QuantityOnHand > 0);
    }

    [Fact]
    public async Task CrossService_FullWorkflow_ProductAndInventoryAndCustomer()
    {
        // Step 1: Verify products exist
        var productsResponse = await _productClient.GetAsync("/api/products");
        Assert.Equal(HttpStatusCode.OK, productsResponse.StatusCode);
        var products = await productsResponse.Content.ReadFromJsonAsync<List<ProductResponse>>();
        Assert.NotNull(products);
        Assert.True(products.Count >= 1);
        var firstProduct = products[0];

        // Step 2: Verify inventory exists for that product
        var inventoryResponse = await _inventoryClient.GetAsync($"/api/inventory/product/{firstProduct.Id}");
        Assert.Equal(HttpStatusCode.OK, inventoryResponse.StatusCode);
        var inventory = await inventoryResponse.Content.ReadFromJsonAsync<InventoryItemResponse>();
        Assert.NotNull(inventory);
        Assert.Equal(firstProduct.Id, inventory.ProductId);

        // Step 3: Verify customers exist
        var customersResponse = await _customerClient.GetAsync("/api/customers");
        Assert.Equal(HttpStatusCode.OK, customersResponse.StatusCode);
        var customers = await customersResponse.Content.ReadFromJsonAsync<List<CustomerResponse>>();
        Assert.NotNull(customers);
        Assert.True(customers.Count >= 1);

        // Step 4: Restock and verify inventory update
        var restockPayload = new { Quantity = 10 };
        var restockResponse = await _inventoryClient.PostAsJsonAsync(
            $"/api/inventory/product/{firstProduct.Id}/restock", restockPayload);
        Assert.Equal(HttpStatusCode.OK, restockResponse.StatusCode);
        var restocked = await restockResponse.Content.ReadFromJsonAsync<InventoryItemResponse>();
        Assert.NotNull(restocked);
        Assert.True(restocked.QuantityOnHand > inventory.QuantityOnHand);
    }
}
