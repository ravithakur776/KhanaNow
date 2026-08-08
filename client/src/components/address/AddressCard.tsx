import React from 'react';
import { Home, Briefcase, MapPin, Check, Edit2, Trash2 } from 'lucide-react';
import { UserAddress } from '../../services/addressService';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';

interface AddressCardProps {
  address: UserAddress;
  isSelected?: boolean;
  onSelect?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onSetDefault?: () => void;
}

export const AddressCard: React.FC<AddressCardProps> = ({
  address,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onSetDefault,
}) => {
  const Icon = {
    Home: Home,
    Work: Briefcase,
    Other: MapPin,
  }[address.label] || MapPin;

  return (
    <Card
      onClick={onSelect}
      className={`p-4 transition-all rounded-2xl border cursor-pointer relative flex flex-col justify-between space-y-3 ${
        isSelected
          ? 'border-primary bg-primary/5 shadow-md ring-1 ring-primary'
          : 'border-border bg-card/60 hover:border-border/90'
      }`}
    >
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="h-4 w-4" />
            </div>
            <span className="text-xs font-extrabold text-foreground">{address.label}</span>
            {address.isDefault && (
              <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/30">
                DEFAULT
              </Badge>
            )}
          </div>

          {isSelected && (
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white">
              <Check className="h-3 w-3 stroke-[3]" />
            </div>
          )}
        </div>

        <div>
          <h5 className="text-xs font-bold text-foreground truncate">{address.fullName}</h5>
          <p className="text-[11px] text-muted-foreground">{address.phone}</p>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          {address.addressLine1}
          {address.addressLine2 ? `, ${address.addressLine2}` : ''}
          {address.landmark ? ` (Near ${address.landmark})` : ''}, {address.city}, {address.state} -{' '}
          <span className="font-mono font-bold">{address.postalCode}</span>
        </p>
      </div>

      {/* Action Buttons */}
      <div
        className="flex items-center justify-between pt-2 border-t border-border/60 text-xs"
        onClick={(e) => e.stopPropagation()}
      >
        {!address.isDefault && onSetDefault ? (
          <button
            type="button"
            onClick={onSetDefault}
            className="text-[11px] font-bold text-muted-foreground hover:text-primary transition-colors"
          >
            Set as Default
          </button>
        ) : (
          <span />
        )}

        <div className="flex items-center gap-2">
          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="p-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="p-1 text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </Card>
  );
};
