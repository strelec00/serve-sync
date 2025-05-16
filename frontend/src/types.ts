// types.ts

// === Enumi ===
export type OrderStatus = 'Ordered' | 'Preparing' | 'ReadyToServe' | 'Served';


export enum TableStatus {
  Free = 'Free',
  Occupied = 'Occupied',
}

// === Interfejsi ===

export interface Category {
  categoryId: number;
  name: string;
  restaurantId?: number | null;
  restaurant?: Restaurant;
  menuItems: MenuItem[];
}

export interface MenuItem {
  menuItemId: number;
  name: string;
  description: string;
  price: number;
  categoryId: number;
  category?: Category;
  restaurantId?: number | null;
  restaurant?: Restaurant;
  orderItems: OrderItem[];
}

export interface OrderItem {
  orderItemId: number;
  orderId: number;
  order: Order;
  menuItemId: number;
  menuItem: MenuItem;
  quantity: number;
}

export interface Order {
  orderId: number;
  name?: string | null;
  userId: number;
  user: User;
  tableId: number;
  table: Table;
  restaurantId: number;
  restaurant: Restaurant;
  status: OrderStatus;
  orderItems: OrderItem[];
}

export interface Restaurant {
  restaurantId: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  users: User[];
  tables: Table[];
  categories: Category[];
  menuItems: MenuItem[];
  orders: Order[];
}

export interface Role {
  roleId: number;
  name: string;
  users: User[];
}

export interface Table {
  tableId: number;
  capacity: number;
  userId?: number | null;
  user?: User | null;
  restaurantId: number;
  restaurant: Restaurant;
  status: TableStatus;
  orders: Order[];
}

export interface User {
  userId: number;
  username: string;
  password: string;
  roleId?: number | null;
  role?: Role;
  restaurantId?: number | null;
  restaurant?: Restaurant;
  tables: Table[];
  orders: Order[];
}
