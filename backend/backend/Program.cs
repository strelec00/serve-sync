using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;

var builder = WebApplication.CreateBuilder(args);


// ➕ PostgreSQL EF Core
builder.Services.AddDbContext<RestaurantContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// ➕ Swagger / OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// 🧪 Swagger only in development
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.MapGet("/menuitems", async (RestaurantContext db) =>
        await db.MenuItems
            .Include(x => x.Category)
            .ToListAsync())
    .WithName("GetMenuItems")
    .WithTags("Menu");

app.MapPost("/menuitems", async (MenuItem item, RestaurantContext db) =>
{
    db.MenuItems.Add(item);
    await db.SaveChangesAsync();
    return Results.Created($"/menuitems/{item.MenuItemId}", item);
}).WithName("CreateMenuItem").WithTags("Menu");
#endregion

#region ORDER API
app.MapGet("/orders", async (RestaurantContext db) =>
        await db.Orders
            .Include(o => o.OrderItems)
            .ThenInclude(oi => oi.MenuItem)
            .ToListAsync())
    .WithName("GetOrders")
    .WithTags("Orders");

app.MapPost("/orders", async (Order order, RestaurantContext db) =>
{
    db.Orders.Add(order);
    await db.SaveChangesAsync();
    return Results.Created($"/orders/{order.OrderId}", order);
}).WithName("CreateOrder").WithTags("Orders");
#endregion

app.Run();