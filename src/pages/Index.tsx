// Update this page (the content is just a fallback if you fail to update the page)

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-bakery-beige to-white">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold text-bakery-brown mb-4">
            Sistema de Cardápio Digital
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Plataforma completa para restaurantes criarem e gerenciarem seus cardápios digitais
          </p>
          
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold text-bakery-brown mb-4">
              Demonstração
            </h2>
            <p className="text-muted-foreground mb-6">
              Confira o cardápio da <strong>Padaria Barkery</strong> como exemplo
            </p>
            
            <div className="space-y-4">
              <a 
                href="/menu" 
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <span>🍞</span>
                Ver Cardápio Demo
              </a>
              
              <div className="grid md:grid-cols-2 gap-4 mt-8 text-left">
                <div className="bg-bakery-beige/30 p-4 rounded-lg">
                  <h3 className="font-semibold text-bakery-brown mb-2">
                    Para Clientes
                  </h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Visualizar cardápio completo</li>
                    <li>• Filtrar por categoria</li>
                    <li>• Ver promoções ativas</li>
                    <li>• Avaliar produtos</li>
                    <li>• Contatos e redes sociais</li>
                  </ul>
                </div>
                
                <div className="bg-primary/10 p-4 rounded-lg">
                  <h3 className="font-semibold text-bakery-brown mb-2">
                    Para Administradores
                  </h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Painel administrativo completo</li>
                    <li>• Gerenciar produtos e categorias</li>
                    <li>• Personalizar informações</li>
                    <li>• Controlar promoções</li>
                    <li>• Visualizar avaliações</li>
                  </ul>
                  <div className="mt-3">
                    <a 
                      href="/admin/login" 
                      className="inline-flex items-center gap-2 bg-bakery-brown hover:bg-bakery-brown/90 text-bakery-brown-foreground px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      <span>🔐</span>
                      Acesso Admin
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p>
              Criado com React, TypeScript, Tailwind CSS e Supabase
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
