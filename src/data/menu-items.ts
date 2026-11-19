
import type { MenuItem } from "@/components/menu/MenuItemCard";

export const menuItems: MenuItem[] = [
  {
    id: "1",
    name: "Classic Margherita",
    category: "Classic Pizzas",
    price: 599,
    image: "/images/pizzas/margherita.jpg",
    vendorName: "Pizza Palace",
    location: "Dhanmondi, Dhaka",
    isPremium: true,
  },
  {
    id: "2",
    name: "Pepperoni Feast",
    category: "Meat Lovers",
    price: 799,
    image: "/images/pizzas/pepperoni.jpg",
    vendorName: "Urban Slice",
    location: "Gulshan, Dhaka",
    isPremium: false,
  },
  {
    id: "3",
    name: "Garden Fresh Veggie",
    category: "Vegetarian Pizzas",
    price: 649,
    image: "/images/pizzas/veggie.jpg",
    vendorName: "Green Oven",
    location: "Banani, Dhaka",
    isPremium: true,
  },
  {
    id: "4",
    name: "BBQ Chicken Supreme",
    category: "Specialty / Gourmet Pizzas",
    price: 899,
    image: "/images/pizzas/bbq-chicken.jpg",
    vendorName: "Firewood Kitchen",
    location: "Uttara, Dhaka",
    isPremium: true,
  },
  {
    id: "5",
    name: "Ultimate Meat Lovers",
    category: "Meat Lovers",
    price: 999,
    image: "/images/pizzas/meat-lovers.jpg",
    vendorName: "Pizza Factory",
    location: "Mirpur, Dhaka",
    isPremium: false,
  },
  {
    id: "6",
    name: "Four Cheese Delight",
    category: "Specialty / Gourmet Pizzas",
    price: 849,
    image: "/images/pizzas/four-cheese.jpg",
    vendorName: "Cheese House",
    location: "Mohammadpur, Dhaka",
    isPremium: true,
  },
];

export const menuCategories = [
  "Classic Pizzas",
  "Vegetarian Pizzas",
  "Meat Lovers",
  "Specialty / Gourmet Pizzas",
  "Sides & Appetizers",
  "Beverages & Desserts",
];

export const menuLocations = Array.from(
  new Set(menuItems.map((item) => item.location))
).sort();