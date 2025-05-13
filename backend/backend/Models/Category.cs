namespace backend.Models;
    
public class Category
{
    public int CategoryId { get; set; }
    public string Name { get; set; }

    public int? RestaurantId { get; set; }
    public Restaurant Restaurant { get; set; }

    public ICollection<MenuItem> MenuItems { get; set; } = new List<MenuItem>();
}