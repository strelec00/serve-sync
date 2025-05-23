using backend.Models;

namespace backend.DTO;

public class OrderUpdateDto
{
    public string? Name { get; set; }
    public int UserId { get; set; }
    public int TableId { get; set; }
    public OrderStatus Status { get; set; }
    public List<OrderItemDto> OrderItems { get; set; }
}

