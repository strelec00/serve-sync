namespace backend.Models;

public class MenuItem
{
    public int MenuItemId { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }
    public decimal Price { get; set; }

    public int? CategoryId { get; set; }
    public Category Category { get; set; }

    public int? RestaurantId { get; set; }
    public Restaurant Restaurant { get; set; }

    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
}