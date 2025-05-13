namespace backend.Models;

public class User
{
    public int UserId { get; set; }
    public string Username { get; set; }
    public string Password { get; set; }

    public int? RoleId { get; set; }
    public Role Role { get; set; }

    public int? RestaurantId { get; set; }
    public Restaurant Restaurant { get; set; }

    public ICollection<Table> Tables { get; set; } = new List<Table>();
    public ICollection<Order> Orders { get; set; } = new List<Order>();
}