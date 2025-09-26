import { Utensils, Phone, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MenuNavigationProps {
  activeTab: 'menu' | 'contacts' | 'reviews';
  onTabChange: (tab: 'menu' | 'contacts' | 'reviews') => void;
}

export function MenuNavigation({ activeTab, onTabChange }: MenuNavigationProps) {
  const tabs = [
    { id: 'menu' as const, label: 'Cardápio', icon: Utensils },
    { id: 'contacts' as const, label: 'Contatos', icon: Phone },
    { id: 'reviews' as const, label: 'Avaliações', icon: Star },
  ];

  return (
    <div className="px-4 py-2">
      <div className="flex gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <Button
              key={tab.id}
              variant={isActive ? 'default' : 'outline'}
              className={`flex-1 gap-2 ${
                isActive 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-white text-bakery-brown border-bakery-beige hover:bg-bakery-beige'
              }`}
              onClick={() => onTabChange(tab.id)}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}