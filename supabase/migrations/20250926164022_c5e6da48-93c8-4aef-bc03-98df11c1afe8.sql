-- Create restaurants table
CREATE TABLE public.restaurants (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    phone TEXT,
    email TEXT,
    logo_url TEXT,
    background_image TEXT,
    primary_color TEXT DEFAULT '#2563eb',
    social_instagram TEXT,
    social_facebook TEXT,
    social_whatsapp TEXT,
    rating_average DECIMAL(2,1) DEFAULT 0 CHECK (rating_average >= 0 AND rating_average <= 5),
    total_reviews INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create categories table
CREATE TABLE public.categories (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    icon TEXT,
    order_position INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(restaurant_id, slug)
);

-- Create products table
CREATE TABLE public.products (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    original_price DECIMAL(10,2) CHECK (original_price >= 0),
    image_url TEXT,
    is_promotion BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    rating_average DECIMAL(2,1) DEFAULT 0 CHECK (rating_average >= 0 AND rating_average <= 5),
    total_reviews INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reviews table
CREATE TABLE public.reviews (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    customer_name TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create admin_users table
CREATE TABLE public.admin_users (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_categories_restaurant_id ON public.categories(restaurant_id);
CREATE INDEX idx_categories_order_position ON public.categories(order_position);
CREATE INDEX idx_products_restaurant_id ON public.products(restaurant_id);
CREATE INDEX idx_products_category_id ON public.products(category_id);
CREATE INDEX idx_products_is_active ON public.products(is_active);
CREATE INDEX idx_reviews_restaurant_id ON public.reviews(restaurant_id);
CREATE INDEX idx_reviews_product_id ON public.reviews(product_id);
CREATE INDEX idx_admin_users_restaurant_id ON public.admin_users(restaurant_id);
CREATE INDEX idx_restaurants_slug ON public.restaurants(slug);

-- Enable Row Level Security
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public access to restaurant data
CREATE POLICY "Restaurants are viewable by everyone" 
ON public.restaurants 
FOR SELECT 
USING (true);

CREATE POLICY "Categories are viewable by everyone" 
ON public.categories 
FOR SELECT 
USING (true);

CREATE POLICY "Products are viewable by everyone" 
ON public.products 
FOR SELECT 
USING (true);

CREATE POLICY "Reviews are viewable by everyone" 
ON public.reviews 
FOR SELECT 
USING (true);

-- Create admin policies (will be updated when authentication is implemented)
CREATE POLICY "Admin users can manage their restaurant data" 
ON public.restaurants 
FOR ALL 
USING (false) 
WITH CHECK (false);

CREATE POLICY "Admin users can manage their categories" 
ON public.categories 
FOR ALL 
USING (false) 
WITH CHECK (false);

CREATE POLICY "Admin users can manage their products" 
ON public.products 
FOR ALL 
USING (false) 
WITH CHECK (false);

CREATE POLICY "Admin users can manage reviews" 
ON public.reviews 
FOR ALL 
USING (false) 
WITH CHECK (false);

CREATE POLICY "Admin users can view their own data" 
ON public.admin_users 
FOR SELECT 
USING (false);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_restaurants_updated_at
    BEFORE UPDATE ON public.restaurants
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON public.categories
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at
    BEFORE UPDATE ON public.reviews
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_admin_users_updated_at
    BEFORE UPDATE ON public.admin_users
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to update rating averages
CREATE OR REPLACE FUNCTION public.update_rating_averages()
RETURNS TRIGGER AS $$
BEGIN
    -- Update restaurant rating
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        IF NEW.product_id IS NULL THEN
            -- Restaurant review
            UPDATE public.restaurants 
            SET 
                rating_average = (
                    SELECT ROUND(AVG(rating::decimal), 1) 
                    FROM public.reviews 
                    WHERE restaurant_id = NEW.restaurant_id AND product_id IS NULL
                ),
                total_reviews = (
                    SELECT COUNT(*) 
                    FROM public.reviews 
                    WHERE restaurant_id = NEW.restaurant_id AND product_id IS NULL
                )
            WHERE id = NEW.restaurant_id;
        ELSE
            -- Product review
            UPDATE public.products 
            SET 
                rating_average = (
                    SELECT ROUND(AVG(rating::decimal), 1) 
                    FROM public.reviews 
                    WHERE product_id = NEW.product_id
                ),
                total_reviews = (
                    SELECT COUNT(*) 
                    FROM public.reviews 
                    WHERE product_id = NEW.product_id
                )
            WHERE id = NEW.product_id;
        END IF;
        RETURN NEW;
    END IF;
    
    -- Handle DELETE
    IF TG_OP = 'DELETE' THEN
        IF OLD.product_id IS NULL THEN
            -- Restaurant review
            UPDATE public.restaurants 
            SET 
                rating_average = COALESCE((
                    SELECT ROUND(AVG(rating::decimal), 1) 
                    FROM public.reviews 
                    WHERE restaurant_id = OLD.restaurant_id AND product_id IS NULL
                ), 0),
                total_reviews = (
                    SELECT COUNT(*) 
                    FROM public.reviews 
                    WHERE restaurant_id = OLD.restaurant_id AND product_id IS NULL
                )
            WHERE id = OLD.restaurant_id;
        ELSE
            -- Product review
            UPDATE public.products 
            SET 
                rating_average = COALESCE((
                    SELECT ROUND(AVG(rating::decimal), 1) 
                    FROM public.reviews 
                    WHERE product_id = OLD.product_id
                ), 0),
                total_reviews = (
                    SELECT COUNT(*) 
                    FROM public.reviews 
                    WHERE product_id = OLD.product_id
                )
            WHERE id = OLD.product_id;
        END IF;
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for rating updates
CREATE TRIGGER update_rating_averages_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.reviews
    FOR EACH ROW
    EXECUTE FUNCTION public.update_rating_averages();