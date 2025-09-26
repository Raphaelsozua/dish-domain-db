import { Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  original_price?: number;
  image_url?: string;
  is_promotion: boolean;
  rating_average?: number;
  total_reviews?: number;
}

interface ProductCardProps {
  product: Product;
  onProductClick?: (product: Product) => void;
}

export function ProductCard({ product, onProductClick }: ProductCardProps) {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${
          i < Math.floor(rating) 
            ? 'fill-yellow-400 text-yellow-400' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onProductClick?.(product)}
    >
      <CardContent className="p-0">
        <div className="flex gap-4 p-4">
          {/* Product Image */}
          <div className="relative shrink-0">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-20 h-20 rounded-lg object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-lg bg-bakery-beige flex items-center justify-center">
                <span className="text-2xl">🍞</span>
              </div>
            )}
            
            {/* Promotion badge */}
            {product.is_promotion && (
              <Badge 
                className="absolute -top-2 -left-2 bg-promotion text-promotion-foreground text-xs px-2 py-1"
              >
                PROMO
              </Badge>
            )}
          </div>

          {/* Product Info */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-foreground truncate pr-2">
                {product.name}
              </h3>
              
              {/* Rating */}
              {product.rating_average && product.total_reviews && (
                <div className="flex items-center gap-1 shrink-0">
                  <div className="flex">
                    {renderStars(product.rating_average)}
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {product.description}
              </p>
            )}

            {/* Price */}
            <div className="flex items-center gap-2">
              {product.original_price && product.is_promotion ? (
                <>
                  <span className="text-sm text-muted-foreground line-through">
                    {formatPrice(product.original_price)}
                  </span>
                  <span className="font-bold text-lg text-promotion">
                    {formatPrice(product.price)}
                  </span>
                </>
              ) : (
                <span className="font-bold text-lg text-foreground">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}