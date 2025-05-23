using Microsoft.EntityFrameworkCore;
using backend.Models;

namespace backend.Data
{
    public class RestaurantContext : DbContext
    {
        public RestaurantContext(DbContextOptions<RestaurantContext> options) : base(options) {}

        public DbSet<User> Users { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<Table> Tables { get; set; }
        public DbSet<MenuItem> MenuItems { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }
        public DbSet<Restaurant> Restaurants { get; set; }
        public DbSet<Category> Categories { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Restaurant>().HasData(
                new Restaurant { RestaurantId = 1, Name = "Index", Address = "Vukovarska", Phone = "012345678", Email = "example@gmail.com" }
            );

            modelBuilder.Entity<Role>().HasData(
                new Role { RoleId = 1, Name = "admin" },
                new Role { RoleId = 2, Name = "chef" },
                new Role { RoleId = 3, Name = "waiter" }
            );

            modelBuilder.Entity<User>().HasData(
                new User { UserId = 1, Username = "adminuser", Password = "adminpass", RoleId = 1, RestaurantId = 1 },
                new User { UserId = 2, Username = "chefuser", Password = "chefpass", RoleId = 2, RestaurantId = 1 },
                new User { UserId = 3, Username = "waiteruser", Password = "waiterpass", RoleId = 3, RestaurantId = 1 },
                new User { UserId = 4, Username = "jan", Password = "strelec", RoleId = 3, RestaurantId = 1 }
            );

            modelBuilder.Entity<Table>().HasData(
                new Table { TableId = 1, Capacity = 4, UserId = 3, RestaurantId = 1, Status = TableStatus.Occupied },
                new Table { TableId = 2, Capacity = 2, UserId = 3, RestaurantId = 1, Status = TableStatus.Free },
                new Table { TableId = 3, Capacity = 6, UserId = 3, RestaurantId = 1, Status = TableStatus.Occupied },
                new Table { TableId = 4, Capacity = 4, UserId = 1, RestaurantId = 1, Status = TableStatus.Occupied },
                new Table { TableId = 5, Capacity = 4, UserId = 1, RestaurantId = 1, Status = 0 },
                new Table { TableId = 6, Capacity = 4, UserId = 1, RestaurantId = 1, Status = 0 },
                new Table { TableId = 7, Capacity = 4, UserId = 1, RestaurantId = 1, Status = 0 },
                new Table { TableId = 8, Capacity = 4, UserId = 1, RestaurantId = 1, Status = 0 }
            );

            modelBuilder.Entity<Category>().HasData(
                new Category { CategoryId = 1, Name = "Starter", RestaurantId = 1 },
                new Category { CategoryId = 2, Name = "Main", RestaurantId = 1 },
                new Category { CategoryId = 3, Name = "Dessert", RestaurantId = 1 },
                new Category { CategoryId = 4, Name = "Side", RestaurantId = 1 }
            );

            modelBuilder.Entity<MenuItem>().HasData(
                new MenuItem { MenuItemId = 1, Name = "Bruschetts", Description = "Toasted bread with tomatoes", Price = 5.00m, CategoryId = 1, RestaurantId = 1 },
                new MenuItem { MenuItemId = 2, Name = "Soup of the Day", Description = "Fresh seasonal soup", Price = 4.50m, CategoryId = 1, RestaurantId = 1 },
                new MenuItem { MenuItemId = 3, Name = "Grilled Chicken", Description = "Served with vegetables", Price = 12.50m, CategoryId = 2, RestaurantId = 1 },
                new MenuItem { MenuItemId = 4, Name = "Beef Steak", Description = "Ribeye steak with sauce", Price = 18.90m, CategoryId = 2, RestaurantId = 1 },
                new MenuItem { MenuItemId = 5, Name = "Chocolate Cake", Description = "Dark chocolate with cream", Price = 4.00m, CategoryId = 3, RestaurantId = 1 },
                new MenuItem { MenuItemId = 6, Name = "Ice Cream", Description = "2 scoops of your choice", Price = 3.50m, CategoryId = 3, RestaurantId = 1 },
                new MenuItem { MenuItemId = 7, Name = "French Fries", Description = "Crispy fries", Price = 3.00m, CategoryId = 4, RestaurantId = 1 },
                new MenuItem { MenuItemId = 8, Name = "Side Salad", Description = "Fresh salad mix", Price = 3.50m, CategoryId = 4, RestaurantId = 1 }
            );

            modelBuilder.Entity<Order>().HasData(
                new Order { OrderId = 1, Name = "Table 7 Order", UserId = 1, TableId = 7, RestaurantId = 1, Status = OrderStatus.ReadyToServe },
                new Order { OrderId = 2, Name = "Table 6 Order", UserId = 1, TableId = 6, RestaurantId = 1, Status = OrderStatus.Preparing },
                new Order { OrderId = 3, Name = "Table 5 Order", UserId = 1, TableId = 5, RestaurantId = 1, Status = 0 },
                new Order { OrderId = 4, Name = "Table 1 Order", UserId = 1, TableId = 1, RestaurantId = 1, Status = 0 }
            );

            modelBuilder.Entity<OrderItem>().HasData(
                new OrderItem { OrderItemId = 1, OrderId = 1, MenuItemId = 6, Quantity = 1 },
                new OrderItem { OrderItemId = 2, OrderId = 2, MenuItemId = 3, Quantity = 1 },
                new OrderItem { OrderItemId = 3, OrderId = 2, MenuItemId = 5, Quantity = 2 },
                new OrderItem { OrderItemId = 4, OrderId = 2, MenuItemId = 6, Quantity = 1 },
                new OrderItem { OrderItemId = 5, OrderId = 3, MenuItemId = 5, Quantity = 1 },
                new OrderItem { OrderItemId = 6, OrderId = 3, MenuItemId = 6, Quantity = 1 },
                new OrderItem { OrderItemId = 7, OrderId = 4, MenuItemId = 3, Quantity = 2 },
                new OrderItem { OrderItemId = 8, OrderId = 4, MenuItemId = 5, Quantity = 2 },
                new OrderItem { OrderItemId = 9, OrderId = 4, MenuItemId = 7, Quantity = 1 }
            );
        }
    }
}
