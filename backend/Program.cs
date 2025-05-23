using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text.Json.Serialization;
using backend.Data;
using backend.DTO;
using backend.Models;

var builder = WebApplication.CreateBuilder(args);

// EF Core + PostgreSQL
builder.Services.AddDbContext<RestaurantContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// JWT autentifikacija
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes("tajni_kljuc_za_token1234567890tajni_kljuc!")
            )
        };
    });

builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.WebHost.UseUrls("http://*:5123");

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();

// ---------------- ENDPOINTI ---------------- //

// Stolovi
app.MapGet("/tables", async (RestaurantContext db) => {
    var tables = await db.Tables
        .Select(t => new {
            t.TableId,
            t.Capacity,
            t.Status,
            t.UserId,
            UserName = t.User != null ? t.User.Username : null,
            t.RestaurantId,
            RestaurantName = t.Restaurant.Name,
            Orders = t.Orders.Select(o => new {
                o.OrderId,
                o.Status,
                o.Name
            }).ToList()
        })
        .ToListAsync();

    return Results.Ok(tables);
}).RequireAuthorization().WithName("GetTables").WithTags("Tables");

app.MapPost("/tables", async (Table table, RestaurantContext db) =>
{
    db.Tables.Add(table);
    await db.SaveChangesAsync();
    return Results.Created($"/tables/{table.TableId}", table);
}).RequireAuthorization().WithName("AddTable").WithTags("Tables");

app.MapDelete("/tables/{id:int}", async (int id, RestaurantContext db) =>
{
    var table = await db.Tables.FindAsync(id);
    if (table is null) return Results.NotFound();

    db.Tables.Remove(table);
    await db.SaveChangesAsync();

    return Results.NoContent();
}).RequireAuthorization().WithName("DeleteTable").WithTags("Tables");

app.MapPost("/users/register", async (User user, RestaurantContext db) =>
{
    var existingUser = await db.Users.FirstOrDefaultAsync(u => u.Username == user.Username);
    if (existingUser != null)
    {
        return Results.BadRequest(new { message = $"Username '{user.Username}' is already taken." });
    }

    user.RoleId = null;
    db.Users.Add(user);
    await db.SaveChangesAsync();
    return Results.Created($"/users/{user.UserId}", user);
}).WithName("RegisterUser").WithTags("Users");


app.MapPost("/users/login", async (LoginRequest login, RestaurantContext db) =>
{
    var user = await db.Users.FirstOrDefaultAsync(u =>
        u.Username == login.Username && u.Password == login.Password);

    if (user == null)
        return Results.Unauthorized();

    var tokenHandler = new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler();
    var key = Encoding.UTF8.GetBytes("tajni_kljuc_za_token1234567890tajni_kljuc!");
    var tokenDescriptor = new SecurityTokenDescriptor
    {
        Subject = new System.Security.Claims.ClaimsIdentity(new[]
        {
            new System.Security.Claims.Claim("id", user.UserId.ToString()),
            new System.Security.Claims.Claim("role", user.RoleId?.ToString() ?? "0"),
        }),
        Expires = DateTime.UtcNow.AddHours(2),
        SigningCredentials = new SigningCredentials(
            new SymmetricSecurityKey(key),
            SecurityAlgorithms.HmacSha256Signature)
    };

    var token = tokenHandler.CreateToken(tokenDescriptor);
    var jwt = tokenHandler.WriteToken(token);

    return Results.Ok(new { token = jwt });
}).WithName("LoginUser").WithTags("Users");

// Osigurani korisnički endpointi
app.MapGet("/users", async (RestaurantContext db) =>
{
    var users = await db.Users
        .Select(u => new {
            u.UserId,
            u.Username,
            Role = u.Role != null ? new {
                u.Role.RoleId,
                u.Role.Name
            } : null
        })
        .ToListAsync();

    return Results.Ok(users);
}).RequireAuthorization().WithName("GetUsers").WithTags("Users");

app.MapPut("/users/{id}/role", async (int id, int roleId, RestaurantContext db) =>
{
    var user = await db.Users.FindAsync(id);
    if (user == null)
        return Results.NotFound("User not found");

    var role = await db.Roles.FindAsync(roleId);
    if (role == null)
        return Results.BadRequest("Invalid role ID");

    user.RoleId = roleId;
    await db.SaveChangesAsync();

    return Results.Ok(new {
        user.UserId,
        user.Username,
        Role = new {
            role.RoleId,
            role.Name
        }
    });
}).RequireAuthorization().WithName("UpdateUserRole").WithTags("Users");

app.MapDelete("/users/{id}", async (int id, RestaurantContext db) =>
{
    var user = await db.Users.FindAsync(id);
    if (user == null)
        return Results.NotFound("User not found");

    db.Users.Remove(user);
    await db.SaveChangesAsync();

    return Results.Ok($"User with ID {id} deleted successfully.");
}).RequireAuthorization().WithName("DeleteUser").WithTags("Users");

// Narudžbe
app.MapGet("/orders", async (RestaurantContext db) =>
{
    var orders = await db.Orders
        .Select(o => new {
            o.OrderId,
            o.Name,
            o.Status,
            o.TableId, 
            TableNumber = o.Table.Capacity,
            o.UserId,
            UserName = o.User.Username,
            OrderItems = o.OrderItems.Select(oi => new {
                oi.OrderItemId,
                oi.MenuItemId,
                oi.Quantity,
                MenuItem = new {
                    oi.MenuItem.MenuItemId,
                    oi.MenuItem.Name,
                    oi.MenuItem.Price
                }
            }).ToList()
        })
        .ToListAsync();

    return Results.Ok(orders);
}).RequireAuthorization().WithTags("Orders");

app.MapPost("/orders", async (OrderCreateDto dto, RestaurantContext db) =>
{
    var order = new Order
    {
        Name = dto.Name,
        UserId = dto.UserId,
        TableId = dto.TableId,
        RestaurantId = dto.RestaurantId,
        Status = OrderStatus.Ordered,
        OrderItems = dto.OrderItems.Select(i => new OrderItem
        {
            MenuItemId = i.MenuItemId,
            Quantity = i.Quantity
        }).ToList()
    };

    db.Orders.Add(order);
    await db.SaveChangesAsync();

    return Results.Created($"/orders/{order.OrderId}", new
    {
        order.OrderId,
        order.Name,
        order.Status,
        order.UserId,
        order.TableId,
        order.RestaurantId
    });
}).RequireAuthorization().WithName("CreateOrder").WithTags("Orders");

app.MapPut("/orders/{id}", async (int id, OrderUpdateDto dto, RestaurantContext db) =>
{
    var order = await db.Orders
        .Include(o => o.OrderItems)
        .FirstOrDefaultAsync(o => o.OrderId == id);

    if (order == null)
        return Results.NotFound();

    order.Name = dto.Name;
    order.UserId = dto.UserId;
    order.TableId = dto.TableId;
    order.Status = dto.Status;

    db.OrderItems.RemoveRange(order.OrderItems);

    order.OrderItems = dto.OrderItems.Select(i => new OrderItem
    {
        MenuItemId = i.MenuItemId,
        Quantity = i.Quantity
    }).ToList();

    await db.SaveChangesAsync();

    return Results.Ok(new
    {
        order.OrderId,
        order.Name,
        order.Status,
        order.UserId,
        order.TableId,
        order.RestaurantId
    });
}).RequireAuthorization().WithName("UpdateOrder").WithTags("Orders");

app.MapPut("/orders/{id}/status", async (int id, OrderStatusUpdateDto dto, RestaurantContext db) =>
{
    var order = await db.Orders.FindAsync(id);
    if (order == null)
        return Results.NotFound();

    order.Status = dto.Status;
    await db.SaveChangesAsync();

    return Results.NoContent();
}).RequireAuthorization().WithName("UpdateOrderStatus").WithTags("Orders");

app.MapDelete("/orders/{id}", async (int id, RestaurantContext db) =>
{
    var order = await db.Orders.FindAsync(id);
    if (order == null)
        return Results.NotFound();

    db.Orders.Remove(order);
    await db.SaveChangesAsync();

    return Results.NoContent();
}).RequireAuthorization().WithName("DeleteOrder").WithTags("Orders");

// Jelovnik
app.MapGet("/menuitems", async (RestaurantContext db) =>
    await db.MenuItems
        .Include(x => x.Category)
        .Select(x => new
        {
            x.MenuItemId,
            x.Name,
            x.Description,
            x.Price,
            x.CategoryId,
            CategoryName = x.Category.Name
        })
        .ToListAsync()).RequireAuthorization()
    .WithName("GetMenuItems")
    .WithTags("Menu");

app.MapGet("/categories", async (RestaurantContext db) =>
    await db.Categories
        .Select(c => new
        {
            c.CategoryId,
            c.Name
        })
        .ToListAsync()).RequireAuthorization()
    .WithName("GetCategories")
    .WithTags("Menu");

app.MapPut("/menuitems/{id}", async (int id, MenuItem updatedItem, RestaurantContext db) =>
{
    var existingItem = await db.MenuItems.FindAsync(id);
    if (existingItem is null) return Results.NotFound();

    existingItem.Name = updatedItem.Name;
    existingItem.Description = updatedItem.Description;
    existingItem.Price = updatedItem.Price;
    existingItem.CategoryId = updatedItem.CategoryId;

    await db.SaveChangesAsync();
    return Results.NoContent();
}).RequireAuthorization().WithName("UpdateMenuItem").WithTags("Menu");

app.MapPost("/menuitems", async (MenuItem newItem, RestaurantContext db) =>
{
    db.MenuItems.Add(newItem);
    await db.SaveChangesAsync();

    return Results.Created($"/menuitems/{newItem.MenuItemId}", newItem);
}).RequireAuthorization().WithName("CreateMenuItem").WithTags("Menu");

app.MapDelete("/menuitems/{id:int}", async (int id, RestaurantContext db) =>
{
    var item = await db.MenuItems.FindAsync(id);
    if (item == null)
        return Results.NotFound();

    db.MenuItems.Remove(item);
    await db.SaveChangesAsync();

    return Results.NoContent();
}).RequireAuthorization().WithName("DeleteMenuItem").WithTags("Menu");

app.Run();
