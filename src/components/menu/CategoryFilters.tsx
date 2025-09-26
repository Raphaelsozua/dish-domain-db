import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Percent } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  is_active: boolean;
  productCount?: number;
}

interface CategoryFiltersProps {
  categories: Category[];
  selectedCategory?: string;
  onCategoryChange: (categoryId?: string) => void;
  hasPromotions: boolean;
}

export function CategoryFilters({ 
  categories, 
  selectedCategory, 
  onCategoryChange,
  hasPromotions 
}: CategoryFiltersProps) {
  return (
    <div className="px-4 py-4">
      <div className="flex gap-2 overflow-x-auto pb-2">
        {/* Promotion filter */}
        {hasPromotions && (
          <Button
            variant={selectedCategory === 'promotion' ? 'default' : 'outline'}
            className={`shrink-0 gap-2 ${
              selectedCategory === 'promotion'
                ? 'bg-promotion text-promotion-foreground'
                : 'bg-white text-promotion border-promotion hover:bg-promotion/10'
            }`}
            onClick={() => onCategoryChange(selectedCategory === 'promotion' ? undefined : 'promotion')}
          >
            <Percent className="w-4 h-4" />
            Promoção
          </Button>
        )}

        {/* Category filters */}
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? 'default' : 'outline'}
            className={`shrink-0 gap-2 ${
              selectedCategory === category.id
                ? 'bg-bakery-brown text-bakery-brown-foreground'
                : 'bg-white text-bakery-brown border-bakery-beige hover:bg-bakery-beige'
            }`}
            onClick={() => onCategoryChange(selectedCategory === category.id ? undefined : category.id)}
          >
            {category.name}
            {category.productCount && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {category.productCount}
              </Badge>
            )}
          </Button>
        ))}
      </div>
    </div>
  );
}