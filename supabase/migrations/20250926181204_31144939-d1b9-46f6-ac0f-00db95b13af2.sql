-- Insert test restaurant
INSERT INTO public.restaurants (name, slug, description, phone, primary_color) 
VALUES ('Restaurante Teste', 'restaurante-teste', 'Restaurante para testes da API', '(11) 9999-9999', '#FF6B6B');

-- Insert test admin user (using the restaurant id)
INSERT INTO public.admin_users (restaurant_id, name, email, password) 
VALUES (
  (SELECT id FROM public.restaurants WHERE slug = 'restaurante-teste'), 
  'Admin Teste', 
  'admin@teste.com', 
  '123456'
);

-- Insert test categories
INSERT INTO public.categories (restaurant_id, name, slug) 
VALUES 
  ((SELECT id FROM public.restaurants WHERE slug = 'restaurante-teste'), 'Pratos Principais', 'pratos-principais'),
  ((SELECT id FROM public.restaurants WHERE slug = 'restaurante-teste'), 'Bebidas', 'bebidas');

-- Insert test products
INSERT INTO public.products (restaurant_id, category_id, name, description, price, is_active, is_promotion) 
VALUES 
  (
    (SELECT id FROM public.restaurants WHERE slug = 'restaurante-teste'),
    (SELECT id FROM public.categories WHERE slug = 'pratos-principais'),
    'Hambúrguer Artesanal',
    'Delicioso hambúrguer com ingredientes frescos',
    25.90,
    true,
    false
  ),
  (
    (SELECT id FROM public.restaurants WHERE slug = 'restaurante-teste'),
    (SELECT id FROM public.categories WHERE slug = 'bebidas'),
    'Refrigerante',
    'Refrigerante gelado',
    5.50,
    true,
    false
  );