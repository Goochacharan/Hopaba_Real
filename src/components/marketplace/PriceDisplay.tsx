
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Lock, Unlock } from 'lucide-react';
import CertificateBadge from './CertificateBadge';

interface PriceDisplayProps {
  price: number;
  isNegotiable?: boolean;
  ownershipNumber?: string;
  inspectionCertificates?: string[];
}

const PriceDisplay: React.FC<PriceDisplayProps> = ({
  price,
  isNegotiable = false,
  ownershipNumber,
  inspectionCertificates = []
}) => {
  const formatPrice = (price: number): string => {
    return price.toLocaleString('en-IN');
  };

  return (
    <div>
      <h2 className="md:text-6xl font-extrabold text-gray-800 py-0 px-1 text-4xl -mb-1 flex items-center">
        <span className="text-4xl md:text-5xl font-extrabold mr-0.5">₹</span>{formatPrice(price)}
      </h2>
      <div className="mt-2 flex items-center gap-2 flex-wrap">
        {isNegotiable ? (
          <Badge variant="success" className="flex items-center gap-1">
            <Unlock className="h-3 w-3" />
            <span>Negotiable</span>
          </Badge>
        ) : (
          <Badge variant="default" className="flex items-center gap-1">
            <Lock className="h-3 w-3" />
            <span>Fixed Price</span>
          </Badge>
        )}
        {ownershipNumber && (
          <Badge variant="condition" className="text-xs bg-white">
            {ownershipNumber} Owner
          </Badge>
        )}
        {inspectionCertificates && inspectionCertificates.length > 0 && (
          <span onClick={(e) => e.stopPropagation()}>
            <CertificateBadge certificates={inspectionCertificates} />
          </span>
        )}
      </div>
    </div>
  );
};

export default PriceDisplay;
