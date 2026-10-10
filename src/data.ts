export interface Product {
  id: number;
  name: string;
  image: string;
}

export const popularFlavors: Product[] = [
  {
    id: 1,
    name: "DULCE DE COOKIES",
    image: "https://i.postimg.cc/P5g6Cg5t/ice-cream-1.png",
  },
  {
    id: 2,
    name: "TURKISH MOCHA",
    image: "https://i.postimg.cc/d1dZJ1g3/ice-cream-2.png",
  },
  {
    id: 3,
    name: "SPICY PB CARAMEL",
    image: "https://i.postimg.cc/L6yXVxbf/ice-cream-3.png",
  },
  {
    id: 4,
    name: "THAI COCO-LIME",
    image: "https://i.postimg.cc/Bv0gVzB4/ice-cream-4.png",
  },
  {
    id: 5,
    name: "MOROCCAN HONEY",
    image: "https://i.postimg.cc/8cT3gB4M/ice-cream-5.png",
  },
];

export interface Flavor {
  id: number;
  name: string;
  color: string;
  icon?: string;
}

export const exoticFlavors: Flavor[] = [
  { id: 1, name: "Grape", color: "#8B5CF6" },
  { id: 2, name: "Strawberry", color: "#FF69B4" },
  { id: 3, name: "Orange", color: "#FF8C00" },
  { id: 4, name: "Chocolate", color: "#D2691E" },
  { id: 5, name: "Mint", color: "#98FB98" },
];
