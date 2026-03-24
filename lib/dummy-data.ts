export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
}

export interface Restaurant {
  id: string;
  name: string;
  description: string;
  logo: string;
  menu: MenuItem[];
}

export const DUMMY_RESTAURANTS: Restaurant[] = [
  {
    id: "al-baraka",
    name: "Al-Baraka Fried Chicken (مطعم البركة)",
    description: "A popular Egyptian fast-food chain specializing in crispy broasted chicken, savory strips, and signature basmati rice \"Fatta\" bowls topped with various sauces.",
    logo: "https://images.unsplash.com/photo-1626082896492-766af4eb65ed?w=200&h=200&fit=crop",
    menu: [
      { id: "ab-1", name: "Quarter Broasted Chicken", description: "Thigh + Fries + Bread + Garlic Dip + Ketchup", price: 140 },
      { id: "ab-2", name: "3-Piece Strips Meal", description: "Strips + Fries + Bread + Garlic Dip + Ketchup", price: 155 },
      { id: "ab-3", name: "5-Piece Strips Meal", description: "Strips + Fries + Bread + Garlic Dip + Ketchup", price: 215 },
      { id: "ab-4", name: "Al-Baraka Meal", description: "1/2 Chicken + Fries + Bread + Garlic Dip + Coleslaw + Ketchup", price: 240 },
      { id: "ab-5", name: "Chicken Strips Fatta", description: "Basmati Rice + Strips + Sauce + Coleslaw (Choice of Sauce: BBQ/Garlic, Ranch, Sweet Chili, or Cheese)", price: 165 },
      { id: "ab-6", name: "Basmati Rice Bowl", description: "Basmati Rice + Choice of Sauce", price: 110 },
      { id: "ab-7", name: "Strips Piece", description: "Add-on", price: 40 },
      { id: "ab-8", name: "Basmati Rice (Extra)", description: "Add-on", price: 40 },
      { id: "ab-9", name: "Fries Packet", description: "Add-on", price: 40 },
      { id: "ab-10", name: "Cheesy Fries", description: "Add-on", price: 60 },
      { id: "ab-11", name: "Large Garlic Dip", description: "Add-on", price: 40 },
      { id: "ab-12", name: "Coleslaw", description: "Add-on", price: 20 },
      { id: "ab-13", name: "Kaiser Bread", description: "Add-on", price: 10 },
      { id: "ab-14", name: "Cheddar Sauce", description: "Sauce", price: 40 },
      { id: "ab-15", name: "Ranch Sauce", description: "Sauce", price: 30 },
      { id: "ab-16", name: "Sweet Chili Sauce", description: "Sauce", price: 30 },
      { id: "ab-17", name: "BBQ Sauce", description: "Sauce", price: 20 },
      { id: "ab-18", name: "Combo Upgrade", description: "Fries + Drink", price: 55 },
      { id: "ab-19", name: "Soft Drink", description: "Drink", price: 30 },
      { id: "ab-20", name: "Water", description: "Drink", price: 10 }
    ]
  }
];
