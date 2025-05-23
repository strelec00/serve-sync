namespace backend.Models;

public class Restaurant
{
    public int RestaurantId { get; set; }
    public string Name { get; set; }
    public string Address { get; set; }
    public string Phone { get; set; }
    public string Email { get; set; }

    public ICollection<User> Users { get; set; } = new List<User>();
    public ICollection<Table> Tables { get; set; } = new List<Table>();
    public ICollection<Category> Categories { get; set; } = new List<Category>();
    public ICollection<MenuItem> MenuItems { get; set; } = new List<MenuItem>();
    public ICollection<Order> Orders { get; set; } = new List<Order>();
}