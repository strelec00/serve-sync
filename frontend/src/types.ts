export type Order = {
  id: string
  tableNumber: number
  items: string[]
  status: "preparing" | "ready" | "served"
  time: string
}

export type Table = {
  id: string
  number: number
  status: "available" | "occupied" | "reserved"
  capacity: number
}

export type MenuItem = {
  id: string
  name: string
  description: string
  price: number
  category: "Starter" | "Main" | "Side" | "Dessert" | "Drink"
}
