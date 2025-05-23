using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class SeedInitialData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Restaurants",
                columns: new[] { "RestaurantId", "Address", "Email", "Name", "Phone" },
                values: new object[] { 1, "Vukovarska", "example@gmail.com", "Index", "012345678" });

            migrationBuilder.InsertData(
                table: "Roles",
                columns: new[] { "RoleId", "Name" },
                values: new object[,]
                {
                    { 1, "admin" },
                    { 2, "chef" },
                    { 3, "waiter" }
                });

            migrationBuilder.InsertData(
                table: "Categories",
                columns: new[] { "CategoryId", "Name", "RestaurantId" },
                values: new object[,]
                {
                    { 1, "Starter", 1 },
                    { 2, "Main", 1 },
                    { 3, "Dessert", 1 },
                    { 4, "Side", 1 }
                });

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "UserId", "Password", "RestaurantId", "RoleId", "Username" },
                values: new object[,]
                {
                    { 1, "adminpass", 1, 1, "adminuser" },
                    { 2, "chefpass", 1, 2, "chefuser" },
                    { 3, "waiterpass", 1, 3, "waiteruser" },
                    { 10, "strelec", 1, 3, "jan" }
                });

            migrationBuilder.InsertData(
                table: "MenuItems",
                columns: new[] { "MenuItemId", "CategoryId", "Description", "Name", "Price", "RestaurantId" },
                values: new object[,]
                {
                    { 1, 1, "Toasted bread with tomatoes", "Bruschetts", 5.00m, 1 },
                    { 2, 1, "Fresh seasonal soup", "Soup of the Day", 4.50m, 1 },
                    { 3, 2, "Served with vegetables", "Grilled Chicken", 12.50m, 1 },
                    { 4, 2, "Ribeye steak with sauce", "Beef Steak", 18.90m, 1 },
                    { 5, 3, "Dark chocolate with cream", "Chocolate Cake", 4.00m, 1 },
                    { 6, 3, "2 scoops of your choice", "Ice Cream", 3.50m, 1 },
                    { 7, 4, "Crispy fries", "French Fries", 3.00m, 1 },
                    { 8, 4, "Fresh salad mix", "Side Salad", 3.50m, 1 }
                });

            migrationBuilder.InsertData(
                table: "Tables",
                columns: new[] { "TableId", "Capacity", "RestaurantId", "Status", "UserId" },
                values: new object[,]
                {
                    { 1, 4, 1, 1, 3 },
                    { 2, 2, 1, 0, 3 },
                    { 3, 6, 1, 1, 3 },
                    { 4, 4, 1, 1, 1 },
                    { 5, 4, 1, 0, 1 },
                    { 6, 4, 1, 0, 1 },
                    { 7, 4, 1, 0, 1 },
                    { 8, 4, 1, 0, 1 }
                });

            migrationBuilder.InsertData(
                table: "Orders",
                columns: new[] { "OrderId", "Name", "RestaurantId", "Status", "TableId", "UserId" },
                values: new object[,]
                {
                    { 15, "Table 7 Order", 1, 2, 7, 1 },
                    { 16, "Table 6 Order", 1, 1, 6, 1 },
                    { 17, "Table 5 Order", 1, 0, 5, 1 },
                    { 21, "Table 1 Order", 1, 0, 1, 1 }
                });

            migrationBuilder.InsertData(
                table: "OrderItems",
                columns: new[] { "OrderItemId", "MenuItemId", "OrderId", "Quantity" },
                values: new object[,]
                {
                    { 85, 6, 15, 1 },
                    { 86, 3, 16, 1 },
                    { 87, 5, 16, 2 },
                    { 88, 6, 16, 1 },
                    { 89, 5, 17, 1 },
                    { 90, 6, 17, 1 },
                    { 101, 3, 21, 2 },
                    { 102, 5, 21, 2 },
                    { 103, 7, 21, 1 }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "MenuItems",
                keyColumn: "MenuItemId",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "MenuItems",
                keyColumn: "MenuItemId",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "MenuItems",
                keyColumn: "MenuItemId",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "MenuItems",
                keyColumn: "MenuItemId",
                keyValue: 8);

            migrationBuilder.DeleteData(
                table: "OrderItems",
                keyColumn: "OrderItemId",
                keyValue: 85);

            migrationBuilder.DeleteData(
                table: "OrderItems",
                keyColumn: "OrderItemId",
                keyValue: 86);

            migrationBuilder.DeleteData(
                table: "OrderItems",
                keyColumn: "OrderItemId",
                keyValue: 87);

            migrationBuilder.DeleteData(
                table: "OrderItems",
                keyColumn: "OrderItemId",
                keyValue: 88);

            migrationBuilder.DeleteData(
                table: "OrderItems",
                keyColumn: "OrderItemId",
                keyValue: 89);

            migrationBuilder.DeleteData(
                table: "OrderItems",
                keyColumn: "OrderItemId",
                keyValue: 90);

            migrationBuilder.DeleteData(
                table: "OrderItems",
                keyColumn: "OrderItemId",
                keyValue: 101);

            migrationBuilder.DeleteData(
                table: "OrderItems",
                keyColumn: "OrderItemId",
                keyValue: 102);

            migrationBuilder.DeleteData(
                table: "OrderItems",
                keyColumn: "OrderItemId",
                keyValue: 103);

            migrationBuilder.DeleteData(
                table: "Tables",
                keyColumn: "TableId",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Tables",
                keyColumn: "TableId",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Tables",
                keyColumn: "TableId",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "Tables",
                keyColumn: "TableId",
                keyValue: 8);

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "UserId",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "UserId",
                keyValue: 10);

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "CategoryId",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "MenuItems",
                keyColumn: "MenuItemId",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "MenuItems",
                keyColumn: "MenuItemId",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "MenuItems",
                keyColumn: "MenuItemId",
                keyValue: 6);

            migrationBuilder.DeleteData(
                table: "MenuItems",
                keyColumn: "MenuItemId",
                keyValue: 7);

            migrationBuilder.DeleteData(
                table: "Orders",
                keyColumn: "OrderId",
                keyValue: 15);

            migrationBuilder.DeleteData(
                table: "Orders",
                keyColumn: "OrderId",
                keyValue: 16);

            migrationBuilder.DeleteData(
                table: "Orders",
                keyColumn: "OrderId",
                keyValue: 17);

            migrationBuilder.DeleteData(
                table: "Orders",
                keyColumn: "OrderId",
                keyValue: 21);

            migrationBuilder.DeleteData(
                table: "Roles",
                keyColumn: "RoleId",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "CategoryId",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "CategoryId",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "CategoryId",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "Tables",
                keyColumn: "TableId",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Tables",
                keyColumn: "TableId",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "Tables",
                keyColumn: "TableId",
                keyValue: 6);

            migrationBuilder.DeleteData(
                table: "Tables",
                keyColumn: "TableId",
                keyValue: 7);

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "UserId",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "UserId",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Restaurants",
                keyColumn: "RestaurantId",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Roles",
                keyColumn: "RoleId",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Roles",
                keyColumn: "RoleId",
                keyValue: 3);
        }
    }
}
