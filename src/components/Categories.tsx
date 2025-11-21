import { Button } from "@/components/ui/button";
import { Apple, Beef, Milk, Carrot, Coffee, Cookie } from "lucide-react";

interface CategoriesProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

const categories = [
  { name: "All", icon: null },
  { name: "Poultry", icon: Beef },
  { name: "Meat", icon: Beef },
];

const Categories = ({ selectedCategory, onSelectCategory }: CategoriesProps) => {
  return (
    <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
      {categories.map(({ name, icon: Icon }) => (
        <Button
          key={name}
          variant={selectedCategory === name ? "default" : "outline"}
          className="flex-shrink-0 transition-all duration-300 hover:scale-105"
          onClick={() => onSelectCategory(name)}
        >
          {Icon && <Icon className="mr-2 h-4 w-4" />}
          {name}
        </Button>
      ))}
    </div>
  );
};

export default Categories;
