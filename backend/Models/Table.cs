namespace backend.Models;

public enum TableStatus
{
    Free,
    Occupied
}

public class Table
{
    public int TableId { get; set; }
    public int Capacity { get; set; }

    public int? UserId { get; set; }
    public User? User { get; set; }

    public int RestaurantId { get; set; }
    public Restaurant Restaurant { get; set; }

    public TableStatus Status { get; set; }

    public ICollection<Order> Orders { get; set; }
}