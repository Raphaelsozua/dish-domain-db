import { useState, useEffect } from 'react';
import { useRestaurantInfo, useUpdateRestaurantInfo, useUpdateRestaurantTheme } from '@/hooks/useAdmin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Palette } from 'lucide-react';

export function RestaurantSettings() {
  const { data: restaurant, isLoading: loadingRestaurant } = useRestaurantInfo();
  const updateRestaurantInfo = useUpdateRestaurantInfo();
  const updateRestaurantTheme = useUpdateRestaurantTheme();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    phone: '',
    email: '',
    logo_url: '',
    background_image: '',
    social_instagram: '',
    social_facebook: '',
    social_whatsapp: '',
  });

  const [primaryColor, setPrimaryColor] = useState('#D2691E');

  useEffect(() => {
    if (restaurant) {
      setFormData({
        name: restaurant.name || '',
        description: restaurant.description || '',
        phone: restaurant.phone || '',
        email: restaurant.email || '',
        logo_url: restaurant.logo_url || '',
        background_image: restaurant.background_image || '',
        social_instagram: restaurant.social_instagram || '',
        social_facebook: restaurant.social_facebook || '',
        social_whatsapp: restaurant.social_whatsapp || '',
      });
      setPrimaryColor(restaurant.primary_color || '#D2691E');
    }
  }, [restaurant]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateRestaurantInfo.mutateAsync(formData);
      toast({
        title: "Informações atualizadas!",
        description: "As informações do restaurante foram salvas com sucesso."
      });
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível atualizar as informações.",
        variant: "destructive"
      });
    }
  };

  const handleColorChange = async () => {
    try {
      await updateRestaurantTheme.mutateAsync(primaryColor);
      toast({
        title: "Cor primária atualizada!",
        description: "A cor do tema foi alterada com sucesso."
      });
    } catch (error) {
      toast({
        title: "Erro ao alterar cor",
        description: "Não foi possível atualizar a cor do tema.",
        variant: "destructive"
      });
    }
  };

  if (loadingRestaurant) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="ml-2">Carregando informações...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Restaurant Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Save className="w-5 h-5" />
            Informações do Restaurante
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nome do Restaurante</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nome do seu restaurante"
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Breve descrição do seu restaurante"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="contato@restaurante.com"
              />
            </div>

            <Separator />

            <h3 className="text-lg font-semibold">Imagens</h3>
            
            <div>
              <Label htmlFor="logo_url">URL do Logo</Label>
              <Input
                id="logo_url"
                value={formData.logo_url}
                onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                placeholder="https://exemplo.com/logo.png"
              />
            </div>

            <div>
              <Label htmlFor="background_image">URL da Imagem de Fundo</Label>
              <Input
                id="background_image"
                value={formData.background_image}
                onChange={(e) => setFormData({ ...formData, background_image: e.target.value })}
                placeholder="https://exemplo.com/fundo.jpg"
              />
            </div>

            <Separator />

            <h3 className="text-lg font-semibold">Redes Sociais</h3>
            
            <div>
              <Label htmlFor="social_instagram">Instagram</Label>
              <Input
                id="social_instagram"
                value={formData.social_instagram}
                onChange={(e) => setFormData({ ...formData, social_instagram: e.target.value })}
                placeholder="https://instagram.com/seurestaurante"
              />
            </div>

            <div>
              <Label htmlFor="social_facebook">Facebook</Label>
              <Input
                id="social_facebook"
                value={formData.social_facebook}
                onChange={(e) => setFormData({ ...formData, social_facebook: e.target.value })}
                placeholder="https://facebook.com/seurestaurante"
              />
            </div>

            <div>
              <Label htmlFor="social_whatsapp">WhatsApp</Label>
              <Input
                id="social_whatsapp"
                value={formData.social_whatsapp}
                onChange={(e) => setFormData({ ...formData, social_whatsapp: e.target.value })}
                placeholder="https://wa.me/5511999999999"
              />
            </div>

            <Button 
              type="submit" 
              disabled={updateRestaurantInfo.isPending}
              className="w-full md:w-auto"
            >
              {updateRestaurantInfo.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Informações
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Theme Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Personalização do Tema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="primary_color">Cor Primária</Label>
              <div className="flex gap-3 mt-2">
                <Input
                  id="primary_color"
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-16 h-10 p-1 border rounded"
                />
                <Input
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  placeholder="#D2691E"
                  className="flex-1"
                />
                <Button 
                  onClick={handleColorChange}
                  disabled={updateRestaurantTheme.isPending}
                  variant="outline"
                >
                  {updateRestaurantTheme.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Aplicar'
                  )}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Esta cor será usada em botões, links e elementos de destaque do cardápio.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}