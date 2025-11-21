import { Button } from "@/components/ui/button";
import { Beef, Milk, Wheat, Carrot, Apple, Drumstick } from "lucide-react";

interface CategoriesProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

const categories = [
  { name: "All", icon: null },
  { name: "Poultry", icon: Drumstick },
  { name: "Meat", icon: Beef },
  { name: "Dairy", icon: Milk },
  { name: "Bakery", icon: Wheat },
  { name: "Vegetables", icon: Carrot },
  { name: "Fruits", icon: Apple },
];

const Categories = ({ selectedCategory, onSelectCategory }: CategoriesProps) => {
  return (
    <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
      {categories.map(({ name, icon: Icon }) => (
        <Button
          key={name}
          variant={selectedCategory === name ? "default" : "outline"}
          className="flex-shrink-0 transition-all duration-300 hover:scale-105 hover:-translate-y-0.5 animate-fade-in"
          onClick={() => onSelectCategory(name)}
        >
          {Icon && <Icon className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:rotate-12" />}
          {name}
        </Button>
      ))}
    </div>
  );
};

export default Categories;
