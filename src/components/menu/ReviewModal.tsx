import { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (review: {
    customer_name: string;
    rating: number;
    comment?: string;
    product_id?: string;
  }) => Promise<void>;
  productName?: string;
  productId?: string;
}

export function ReviewModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  productName, 
  productId 
}: ReviewModalProps) {
  const [customerName, setCustomerName] = useState('');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerName.trim() || rating === 0) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha seu nome e avaliação.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        customer_name: customerName.trim(),
        rating,
        comment: comment.trim() || undefined,
        product_id: productId
      });
      
      toast({
        title: "Avaliação enviada!",
        description: "Obrigado pelo seu feedback."
      });
      
      // Reset form
      setCustomerName('');
      setRating(0);
      setComment('');
      onClose();
    } catch (error) {
      toast({
        title: "Erro ao enviar avaliação",
        description: "Tente novamente em alguns minutos.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, i) => (
      <button
        key={i}
        type="button"
        onClick={() => setRating(i + 1)}
        className="p-1 hover:scale-110 transition-transform"
      >
        <Star
          className={`w-8 h-8 ${
            i < rating 
              ? 'fill-yellow-400 text-yellow-400' 
              : 'text-gray-300 hover:text-yellow-200'
          }`}
        />
      </button>
    ));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {productName ? `Avaliar ${productName}` : 'Avaliar Restaurante'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <Label htmlFor="name">Seu nome</Label>
            <Input
              id="name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Digite seu nome"
              required
            />
          </div>

          {/* Rating */}
          <div>
            <Label>Sua avaliação</Label>
            <div className="flex gap-1 mt-1">
              {renderStars()}
            </div>
            {rating > 0 && (
              <p className="text-sm text-muted-foreground mt-1">
                {rating} de 5 estrelas
              </p>
            )}
          </div>

          {/* Comment */}
          <div>
            <Label htmlFor="comment">Comentário (opcional)</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Conte-nos sobre sua experiência..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !customerName.trim() || rating === 0}
              className="flex-1"
            >
              {isSubmitting ? 'Enviando...' : 'Enviar Avaliação'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}