namespace backend.DTO;

public class OrderCreateDto
{
    public string? Name { get; set; }
    public int UserId { get; set; }
    public int TableId { get; set; }
    public int RestaurantId { get; set; }
    public List<OrderItemDto> OrderItems { get; set; }
}

public class OrderItemDto
{
    public int MenuItemId { get; set; }
    public int Quantity { get; set; }
}
