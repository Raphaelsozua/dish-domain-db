export const mockRestaurant = {
  id: '1',
  name: 'Padaria Barkery',
  slug: 'padaria-barkery',
  description: 'Pãozinho quentinho e muito mais!',
  phone: '(11) 99999-9999',
  email: 'contato@padariabarkery.com',
  logo_url: null,
  background_image: null,
  primary_color: '#D2691E',
  rating_average: 5.0,
  total_reviews: 127,
  social_instagram: 'https://instagram.com/padariabarkery',
  social_facebook: 'https://facebook.com/padariabarkery',
  social_whatsapp: 'https://wa.me/5511999999999'
};

export const mockCategories = [
  {
    id: '1',
    name: 'Lanches',
    slug: 'lanches',
    icon: '🥪',
    is_active: true,
    order_position: 1,
    productCount: 4
  },
  {
    id: '2',
    name: 'Bebidas',
    slug: 'bebidas',
    icon: '🥤',
    is_active: true,
    order_position: 2,
    productCount: 2
  },
  {
    id: '3',
    name: 'Doces',
    slug: 'doces',
    icon: '🍰',
    is_active: true,
    order_position: 3,
    productCount: 3
  }
];

export const mockProducts = [
  {
    id: '1',
    name: 'Presunto e Queijo',
    description: 'Pão francês com presunto e queijo na medida',
    price: 12.00,
    original_price: null,
    image_url: null,
    is_active: true,
    is_promotion: false,
    rating_average: 5.0,
    total_reviews: 45,
    category_id: '1'
  },
  {
    id: '2',
    name: 'Misto Quente',
    description: 'O clássico misto quente feito com muito amor e carinho',
    price: 8.00,
    original_price: 10.00,
    image_url: null,
    is_active: true,
    is_promotion: true,
    rating_average: 4.8,
    total_reviews: 32,
    category_id: '1'
  },
  {
    id: '3',
    name: 'Pão de Queijo c/ Frango',
    description: 'Pão de queijo gigante recheado com frango desfiado e catupiry',
    price: 15.00,
    original_price: null,
    image_url: null,
    is_active: true,
    is_promotion: false,
    rating_average: 4.9,
    total_reviews: 28,
    category_id: '1'
  },
  {
    id: '4',
    name: 'X-Bacon',
    description: 'Hambúrguer, bacon, queijo, alface e pão especial da casa',
    price: 18.00,
    original_price: null,
    image_url: null,
    is_active: true,
    is_promotion: false,
    rating_average: 4.7,
    total_reviews: 56,
    category_id: '1'
  },
  {
    id: '5',
    name: 'Refrigerante Lata',
    description: 'Coca-Cola, Guaraná, Fanta - gelado',
    price: 4.50,
    original_price: null,
    image_url: null,
    is_active: true,
    is_promotion: false,
    rating_average: 4.5,
    total_reviews: 15,
    category_id: '2'
  },
  {
    id: '6',
    name: 'Suco Natural',
    description: 'Laranja, maracujá ou acerola - 300ml',
    price: 6.00,
    original_price: null,
    image_url: null,
    is_active: true,
    is_promotion: false,
    rating_average: 4.8,
    total_reviews: 22,
    category_id: '2'
  },
  {
    id: '7',
    name: 'Brigadeiro Gourmet',
    description: 'Tradicional brigadeiro com granulado belga',
    price: 3.50,
    original_price: null,
    image_url: null,
    is_active: true,
    is_promotion: false,
    rating_average: 5.0,
    total_reviews: 89,
    category_id: '3'
  },
  {
    id: '8',
    name: 'Torta de Chocolate',
    description: 'Fatia generosa da nossa famosa torta de chocolate',
    price: 8.50,
    original_price: 12.00,
    image_url: null,
    is_active: true,
    is_promotion: true,
    rating_average: 4.9,
    total_reviews: 67,
    category_id: '3'
  },
  {
    id: '9',
    name: 'Pudim Caseiro',
    description: 'Pudim de leite condensado com calda de caramelo',
    price: 7.00,
    original_price: null,
    image_url: null,
    is_active: true,
    is_promotion: false,
    rating_average: 4.7,
    total_reviews: 43,
    category_id: '3'
  }
];

export const mockReviews = [
  {
    id: '1',
    customer_name: 'Maria Silva',
    rating: 5,
    comment: 'Melhor padaria do bairro! Tudo sempre fresquinho e saboroso.',
    created_at: '2025-09-25T10:30:00Z',
    product_id: null
  },
  {
    id: '2',
    customer_name: 'João Santos',
    rating: 5,
    comment: 'O misto quente é sensacional! Super recomendo.',
    created_at: '2025-09-24T15:45:00Z',
    product_id: '2'
  },
  {
    id: '3',
    customer_name: 'Ana Costa',
    rating: 4,
    comment: 'Produtos de qualidade e atendimento excelente. Parabéns!',
    created_at: '2025-09-23T09:15:00Z',
    product_id: null
  },
  {
    id: '4',
    customer_name: 'Pedro Lima',
    rating: 5,
    comment: 'A torta de chocolate é divina! Já virei cliente fiel.',
    created_at: '2025-09-22T18:20:00Z',
    product_id: '8'
  },
  {
    id: '5',
    customer_name: 'Fernanda Oliveira',
    rating: 5,
    comment: 'Ambiente acolhedor e produtos sempre frescos. Adoro!',
    created_at: '2025-09-21T14:10:00Z',
    product_id: null
  }
];