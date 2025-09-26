import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAdmin } from '@/contexts/AdminContext';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { RestaurantSettings } from '@/components/admin/RestaurantSettings';
import { CategoryManager } from '@/components/admin/CategoryManager';
import { ProductManager } from '@/components/admin/ProductManager';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star } from 'lucide-react';

export default function AdminDashboard() {
  const { admin } = useAdmin();
  const [activeTab, setActiveTab] = useState('restaurant');

  if (!admin) {
    return <Navigate to="/admin/login" replace />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'restaurant':
        return <RestaurantSettings />;
      case 'categories':
        return <CategoryManager />;
      case 'products':
        return <ProductManager />;
      case 'reviews':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                Avaliações dos Clientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Em breve</h3>
                <p className="text-muted-foreground">
                  A funcionalidade de visualização de avaliações será implementada em breve.
                </p>
              </div>
            </CardContent>
          </Card>
        );
      case 'settings':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Configurações Gerais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <h3 className="font-semibold mb-2">Em desenvolvimento</h3>
                <p className="text-muted-foreground">
                  Configurações adicionais serão adicionadas em breve.
                </p>
              </div>
            </CardContent>
          </Card>
        );
      default:
        return <RestaurantSettings />;
    }
  };

  return (
    <AdminLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </AdminLayout>
  );
}