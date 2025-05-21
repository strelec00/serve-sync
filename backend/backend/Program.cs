using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text.Json.Serialization;
using backend.Data;
using backend.DTO;
using backend.Models;

var builder = WebApplication.CreateBuilder(args);

// Dodaj EF Core za PostgreSQL
builder.Services.AddDbContext<RestaurantContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Dodaj JWT autentifikaciju
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

// Podrška za enum kao string u JSON-u
builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
});

// CORS policy za React frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// AKTIVIRAJ CORS POLICY OVDJE
app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

// ---------------- ENDPOINTI ---------------- //

app.MapGet("/tables", async (RestaurantContext db) =>
    {
        var tables = await db.Tables
            .Select(t => new {
                t.TableId,
                t.Capacity,
                t.Status,
                t.UserId,
                UserName = t.User != null ? t.User.Username : null,  // ako postoji korisnik
                t.RestaurantId,
                RestaurantName = t.Restaurant.Name,                  // ako postoji restoran
                Orders = t.Orders.Select(o => new {
                    o.OrderId,
                    o.Status,
                    o.Name
                }).ToList()
            })
            .ToListAsync();

        return Results.Ok(tables);
    })
    .WithName("GetTables")
    .WithTags("Tables");

app.MapPost("/tables", async (Table table, RestaurantContext db) =>
{
    db.Tables.Add(table);
    await db.SaveChangesAsync();
    return Results.Created($"/tables/{table.TableId}", table);
}).WithName("AddTable").WithTags("Tables");

app.MapDelete("/tables/{id:int}", async (int id, RestaurantContext db) =>
    {
        var table = await db.Tables.FindAsync(id);
        if (table is null) return Results.NotFound();

        db.Tables.Remove(table);
        await db.SaveChangesAsync();

        return Results.NoContent();
    })
    .WithName("DeleteTable")
    .WithTags("Tables");

app.MapPost("/users/register", async (User user, RestaurantContext db) =>
{
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
})
.WithName("LoginUser")
.WithTags("Users");

app.MapGet("/orders", async (RestaurantContext db) =>
{
    var orders = await db.Orders
        .Select(o => new {
            o.OrderId,
            o.Name,
            o.Status,
            o.TableId, 
            TableNumber = o.Table.Capacity,       // ako postoji
            o.UserId,
            UserName = o.User.Username,         // ako postoji
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
});


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
    })
    .WithName("CreateOrder")
    .WithTags("Orders");

app.MapPut("/orders/{id}", async (int id, OrderUpdateDto dto, RestaurantContext db) =>
    {
        var order = await db.Orders
            .Include(o => o.OrderItems)
            .FirstOrDefaultAsync(o => o.OrderId == id);

        if (order == null)
            return Results.NotFound();

        // Ažuriraj osnovna polja
        order.Name = dto.Name;
        order.UserId = dto.UserId;
        order.TableId = dto.TableId;
        order.Status = dto.Status;

        // Ažuriraj OrderItems - jednostavna logika zamjene svih stavki
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
    })
    .WithName("UpdateOrder")
    .WithTags("Orders");

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
        .ToListAsync())
    .WithName("GetMenuItems")
    .WithTags("Menu");

app.MapGet("/categories", async (RestaurantContext db) =>
        await db.Categories
            .Select(c => new
            {
                c.CategoryId,
                c.Name
            })
            .ToListAsync())
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
}).WithName("UpdateMenuItem").WithTags("Menu");

app.MapPost("/menuitems", async (MenuItem newItem, RestaurantContext db) =>
    {
        db.MenuItems.Add(newItem);
        await db.SaveChangesAsync();

        return Results.Created($"/menuitems/{newItem.MenuItemId}", newItem);
    })
    .WithName("CreateMenuItem")
    .WithTags("Menu");
app.MapDelete("/menuitems/{id:int}", async (int id, RestaurantContext db) =>
    {
        var item = await db.MenuItems.FindAsync(id);
        if (item == null)
        {
            return Results.NotFound();
        }

        db.MenuItems.Remove(item);
        await db.SaveChangesAsync();

        return Results.NoContent();
    })
    .WithName("DeleteMenuItem")
    .WithTags("Menu");

app.Run();