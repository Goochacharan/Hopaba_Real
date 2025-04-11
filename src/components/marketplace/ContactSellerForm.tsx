
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Phone, Send, MessageSquare } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface ContactSellerFormProps {
  listingId: string;
  sellerId: string;
  sellerName: string;
  sellerPhone: string | null;
  sellerWhatsapp: string | null;
}

const ContactSellerForm: React.FC<ContactSellerFormProps> = ({
  listingId,
  sellerId,
  sellerName,
  sellerPhone,
  sellerWhatsapp
}) => {
  const [message, setMessage] = useState('');
  const [contactMethod, setContactMethod] = useState<'whatsapp' | 'phone' | 'message'>('message');
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please login to contact the seller',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }

    // Provide feedback based on contact method
    switch (contactMethod) {
      case 'whatsapp':
        if (sellerWhatsapp) {
          const whatsappUrl = `https://wa.me/${sellerWhatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
          window.open(whatsappUrl, '_blank');
          toast({
            title: 'Opening WhatsApp',
            description: 'Redirecting you to WhatsApp to contact the seller.',
          });
        } else {
          toast({
            title: 'WhatsApp Not Available',
            description: 'This seller hasn\'t provided a WhatsApp number.',
            variant: 'destructive',
          });
        }
        break;
        
      case 'phone':
        if (sellerPhone) {
          window.location.href = `tel:${sellerPhone}`;
          toast({
            title: 'Calling Seller',
            description: 'Initiating phone call to the seller.',
          });
        } else {
          toast({
            title: 'Phone Not Available',
            description: 'This seller hasn\'t provided a phone number.',
            variant: 'destructive',
          });
        }
        break;
        
      case 'message':
        toast({
          title: 'Message Sent',
          description: `Your message has been sent to ${sellerName}.`,
        });
        setMessage('');
        break;
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Contact {sellerName}</h3>
      
      <div className="flex gap-2 mb-4">
        <Button 
          type="button"
          variant={contactMethod === 'message' ? 'default' : 'outline'}
          onClick={() => setContactMethod('message')}
          size="sm"
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Message
        </Button>
        
        <Button 
          type="button"
          variant={contactMethod === 'whatsapp' ? 'default' : 'outline'}
          onClick={() => setContactMethod('whatsapp')}
          size="sm"
          disabled={!sellerWhatsapp}
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          WhatsApp
        </Button>
        
        <Button 
          type="button"
          variant={contactMethod === 'phone' ? 'default' : 'outline'}
          onClick={() => setContactMethod('phone')}
          size="sm"
          disabled={!sellerPhone}
        >
          <Phone className="h-4 w-4 mr-2" />
          Call
        </Button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {contactMethod === 'message' && (
          <>
            <div className="space-y-2">
              <Label htmlFor="message">Your Message</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={`Hi, I'm interested in your listing. Is it still available?`}
                className="min-h-[100px]"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contact">Your Contact Info</Label>
              <Input
                id="contact"
                type="text"
                placeholder="Your phone or email (optional)"
              />
            </div>
          </>
        )}
        
        {contactMethod === 'whatsapp' && (
          <div className="space-y-2">
            <Label htmlFor="whatsapp-message">WhatsApp Message</Label>
            <Textarea
              id="whatsapp-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Hi, I'm interested in your listing. Is it still available?`}
              className="min-h-[100px]"
            />
          </div>
        )}
        
        <Button type="submit" className="w-full">
          {contactMethod === 'message' && (
            <>
              <Send className="h-4 w-4 mr-2" />
              Send Message
            </>
          )}
          {contactMethod === 'whatsapp' && (
            <>
              <MessageSquare className="h-4 w-4 mr-2" />
              Open WhatsApp
            </>
          )}
          {contactMethod === 'phone' && (
            <>
              <Phone className="h-4 w-4 mr-2" />
              Call Now
            </>
          )}
        </Button>
      </form>
    </div>
  );
};

export default ContactSellerForm;
