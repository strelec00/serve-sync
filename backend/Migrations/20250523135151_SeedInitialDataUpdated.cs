using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class SeedInitialDataUpdated : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
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
                table: "Users",
                keyColumn: "UserId",
                keyValue: 10);

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

            migrationBuilder.InsertData(
                table: "Orders",
                columns: new[] { "OrderId", "Name", "RestaurantId", "Status", "TableId", "UserId" },
                values: new object[,]
                {
                    { 1, "Table 7 Order", 1, 2, 7, 1 },
                    { 2, "Table 6 Order", 1, 1, 6, 1 },
                    { 3, "Table 5 Order", 1, 0, 5, 1 },
                    { 4, "Table 1 Order", 1, 0, 1, 1 }
                });

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "UserId", "Password", "RestaurantId", "RoleId", "Username" },
                values: new object[] { 4, "strelec", 1, 3, "jan" });

            migrationBuilder.InsertData(
                table: "OrderItems",
                columns: new[] { "OrderItemId", "MenuItemId", "OrderId", "Quantity" },
                values: new object[,]
                {
                    { 1, 6, 1, 1 },
                    { 2, 3, 2, 1 },
                    { 3, 5, 2, 2 },
                    { 4, 6, 2, 1 },
                    { 5, 5, 3, 1 },
                    { 6, 6, 3, 1 },
                    { 7, 3, 4, 2 },
                    { 8, 5, 4, 2 },
                    { 9, 7, 4, 1 }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "OrderItems",
                keyColumn: "OrderItemId",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "OrderItems",
                keyColumn: "OrderItemId",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "OrderItems",
                keyColumn: "OrderItemId",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "OrderItems",
                keyColumn: "OrderItemId",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "OrderItems",
                keyColumn: "OrderItemId",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "OrderItems",
                keyColumn: "OrderItemId",
                keyValue: 6);

            migrationBuilder.DeleteData(
                table: "OrderItems",
                keyColumn: "OrderItemId",
                keyValue: 7);

            migrationBuilder.DeleteData(
                table: "OrderItems",
                keyColumn: "OrderItemId",
                keyValue: 8);

            migrationBuilder.DeleteData(
                table: "OrderItems",
                keyColumn: "OrderItemId",
                keyValue: 9);

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "UserId",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "Orders",
                keyColumn: "OrderId",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Orders",
                keyColumn: "OrderId",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Orders",
                keyColumn: "OrderId",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Orders",
                keyColumn: "OrderId",
                keyValue: 4);

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
                table: "Users",
                columns: new[] { "UserId", "Password", "RestaurantId", "RoleId", "Username" },
                values: new object[] { 10, "strelec", 1, 3, "jan" });

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
    }
}
