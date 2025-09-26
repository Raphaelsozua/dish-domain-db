import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Phone, Instagram, Facebook, MessageCircle, Star, Clock } from 'lucide-react';
import { MenuHeader } from '@/components/menu/MenuHeader';
import { PromoBanner } from '@/components/menu/PromoBanner';
import { MenuNavigation } from '@/components/menu/MenuNavigation';
import { CategoryFilters } from '@/components/menu/CategoryFilters';
import { ProductCard } from '@/components/menu/ProductCard';
import { ReviewModal } from '@/components/menu/ReviewModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useRestaurantInfo, useCategories, useProducts, useReviews, useSubmitReview } from '@/hooks/useMenu';
import { useToast } from '@/hooks/use-toast';

export default function RestaurantMenu() {
  const { slug } = useParams<{ slug: string }>();
  const [activeTab, setActiveTab] = useState<'menu' | 'contacts' | 'reviews'>('menu');
  const [selectedCategory, setSelectedCategory] = useState<string>();
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const { toast } = useToast();

  const { data: restaurant, isLoading: loadingRestaurant } = useRestaurantInfo(slug!);
  const { data: categories = [], isLoading: loadingCategories } = useCategories(slug!);
  const { data: allProducts = [], isLoading: loadingProducts } = useProducts(slug!);
  const { data: reviews = [], isLoading: loadingReviews } = useReviews(slug!);
  const submitReview = useSubmitReview();

  // Filter products based on selected category
  const filteredProducts = useMemo(() => {
    if (!selectedCategory) return allProducts;
    
    if (selectedCategory === 'promotion') {
      return allProducts.filter(product => product.is_promotion);
    }
    
    return allProducts.filter(product => product.category_id === selectedCategory);
  }, [allProducts, selectedCategory]);

  // Calculate product count per category
  const categoriesWithCount = useMemo(() => {
    return categories.map(category => ({
      ...category,
      productCount: allProducts.filter(p => p.category_id === category.id).length
    }));
  }, [categories, allProducts]);

  const hasPromotions = allProducts.some(product => product.is_promotion);

  const handleProductClick = (product: any) => {
    setSelectedProduct(product);
    setReviewModalOpen(true);
  };

  const handleReviewSubmit = async (reviewData: any) => {
    try {
      await submitReview.mutateAsync({ slug: slug!, review: reviewData });
      setReviewModalOpen(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error('Error submitting review:', error);
      throw error;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

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

  if (loadingRestaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2" />
          <p>Carregando cardápio...</p>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Restaurante não encontrado</h1>
          <p className="text-muted-foreground">Verifique o endereço e tente novamente.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <MenuHeader restaurant={restaurant} />

      {/* Promo Banner */}
      <PromoBanner />

      {/* Navigation */}
      <MenuNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Content */}
      <div className="pb-6">
        {activeTab === 'menu' && (
          <>
            {/* Category Filters */}
            <CategoryFilters
              categories={categoriesWithCount}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              hasPromotions={hasPromotions}
            />

            {/* Products Grid */}
            <div className="px-4 space-y-4">
              {loadingProducts ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2" />
                  <p>Carregando produtos...</p>
                </div>
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onProductClick={handleProductClick}
                  />
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Nenhum produto encontrado nesta categoria.
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'contacts' && (
          <div className="px-4 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  Informações de Contato
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {restaurant.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <a 
                      href={`tel:${restaurant.phone}`}
                      className="text-primary hover:underline"
                    >
                      {restaurant.phone}
                    </a>
                  </div>
                )}
                
                {restaurant.email && (
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <a 
                      href={`mailto:${restaurant.email}`}
                      className="text-primary hover:underline"
                    >
                      {restaurant.email}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Social Media */}
            {(restaurant.social_instagram || restaurant.social_facebook || restaurant.social_whatsapp) && (
              <Card>
                <CardHeader>
                  <CardTitle>Redes Sociais</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-3">
                    {restaurant.social_instagram && (
                      <Button variant="outline" size="sm" asChild>
                        <a 
                          href={restaurant.social_instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2"
                        >
                          <Instagram className="w-4 h-4" />
                          Instagram
                        </a>
                      </Button>
                    )}
                    
                    {restaurant.social_facebook && (
                      <Button variant="outline" size="sm" asChild>
                        <a 
                          href={restaurant.social_facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2"
                        >
                          <Facebook className="w-4 h-4" />
                          Facebook
                        </a>
                      </Button>
                    )}
                    
                    {restaurant.social_whatsapp && (
                      <Button variant="outline" size="sm" asChild>
                        <a 
                          href={restaurant.social_whatsapp}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2"
                        >
                          <MessageCircle className="w-4 h-4" />
                          WhatsApp
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="px-4 space-y-4">
            {/* Add Review Button */}
            <Button 
              onClick={() => {
                setSelectedProduct(null);
                setReviewModalOpen(true);
              }}
              className="w-full"
            >
              <Star className="w-4 h-4 mr-2" />
              Avaliar Restaurante
            </Button>

            {/* Reviews List */}
            {loadingReviews ? (
              <div className="text-center py-8">
                <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2" />
                <p>Carregando avaliações...</p>
              </div>
            ) : reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <Card key={review.id}>
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold">{review.customer_name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex">
                              {renderStars(review.rating)}
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {formatDate(review.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {review.comment && (
                        <>
                          <Separator className="my-3" />
                          <p className="text-sm">{review.comment}</p>
                        </>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Star className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">
                  Ainda não há avaliações. Seja o primeiro a avaliar!
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Review Modal */}
      <ReviewModal
        isOpen={reviewModalOpen}
        onClose={() => {
          setReviewModalOpen(false);
          setSelectedProduct(null);
        }}
        onSubmit={handleReviewSubmit}
        productName={selectedProduct?.name}
        productId={selectedProduct?.id}
      />
    </div>
  );
}