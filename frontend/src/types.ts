export type OrderItem = {
  orderItemId: number;
  menuItemId: number;
  quantity: number;
  menuItemName: string;
};

export type Order = {
  id: string;
  tableNumber: number;
  items: OrderItem[]; // <-- moraš koristiti items, ne orderItems!
  status: "ordered"| "preparing" | "ready" | "served";
  time: string;
};

export type Table = {
  id: string
  number: number
  status: "free" |"available" | "occupied" | "reserved"
  capacity: number
}

export type MenuItem = {
  id: string
  name: string
  description: string
  price: number
  category: "Starter" | "Main" | "Side" | "Dessert" | "Drink"
}
