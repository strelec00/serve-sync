namespace backend.Models;

public enum OrderStatus
{
    Ordered,
    Preparing,
    ReadyToServe,
    Served
}

public class Order
{
    public int OrderId { get; set; }
    public string? Name { get; set; }

    public int UserId { get; set; }
    public User User { get; set; }

    public int TableId { get; set; }
    public Table Table { get; set; }

    public int RestaurantId { get; set; }
    public Restaurant Restaurant { get; set; }

    public OrderStatus Status { get; set; }

    public ICollection<OrderItem> OrderItems { get; set; }
}