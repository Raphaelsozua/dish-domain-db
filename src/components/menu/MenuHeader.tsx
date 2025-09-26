import { Star } from 'lucide-react';

interface MenuHeaderProps {
  restaurant: {
    name: string;
    description?: string;
    logo_url?: string;
    background_image?: string;
    rating_average?: number;
    total_reviews?: number;
    primary_color?: string;
  };
}

export function MenuHeader({ restaurant }: MenuHeaderProps) {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) 
            ? 'fill-yellow-400 text-yellow-400' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div 
      className="relative bg-cover bg-center"
      style={{
        backgroundImage: restaurant.background_image 
          ? `url(${restaurant.background_image})` 
          : 'linear-gradient(135deg, hsl(var(--bakery-beige)), hsl(var(--bakery-brown)))'
      }}
    >
      <div className="absolute inset-0 bg-black/30" />
      
      <div className="relative z-10 px-4 py-8 text-center">
        <div className="max-w-md mx-auto">
          {/* Logo */}
          <div className="mb-4">
            {restaurant.logo_url ? (
              <img 
                src={restaurant.logo_url} 
                alt={`${restaurant.name} logo`}
                className="w-20 h-20 mx-auto rounded-full border-4 border-white shadow-lg object-cover"
              />
            ) : (
              <div className="w-20 h-20 mx-auto rounded-full border-4 border-white shadow-lg bg-white flex items-center justify-center">
                <span className="text-2xl font-bold text-bakery-brown">
                  {restaurant.name.charAt(0)}
                </span>
              </div>
            )}
          </div>

          {/* Restaurant Name */}
          <h1 className="text-3xl font-bold text-white mb-2">
            {restaurant.name}
          </h1>

          {/* Description */}
          {restaurant.description && (
            <p className="text-white/90 mb-4 text-lg">
              {restaurant.description}
            </p>
          )}

          {/* Rating */}
          {restaurant.rating_average && restaurant.total_reviews ? (
            <div className="flex items-center justify-center gap-2 bg-white/90 rounded-full px-4 py-2 inline-flex">
              <div className="flex">
                {renderStars(restaurant.rating_average)}
              </div>
              <span className="font-semibold text-bakery-brown">
                {restaurant.rating_average.toFixed(1)}
              </span>
              <span className="text-muted-foreground text-sm">
                ({restaurant.total_reviews} avaliações)
              </span>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}