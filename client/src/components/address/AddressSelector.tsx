import React from 'react';
import { Plus, MapPin } from 'lucide-react';
import { UserAddress } from '../../services/addressService';
import { AddressCard } from './AddressCard';
import { Button } from '../ui/button';

interface AddressSelectorProps {
  addresses: UserAddress[];
  selectedAddressId: string | null;
  onSelectAddress: (address: UserAddress) => void;
  onAddNew: () => void;
  onEdit: (address: UserAddress) => void;
  onDelete: (id: string) => void;
  onSetDefault: (id: string) => void;
}

export const AddressSelector: React.FC<AddressSelectorProps> = ({
  addresses,
  selectedAddressId,
  onSelectAddress,
  onAddNew,
  onEdit,
  onDelete,
  onSetDefault,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-extrabold text-foreground uppercase tracking-wider">
          Saved Delivery Addresses ({addresses.length})
        </h4>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onAddNew}
          className="font-bold text-xs gap-1 border-dashed border-primary/50 text-primary"
        >
          <Plus className="h-3.5 w-3.5" /> Add New Address
        </Button>
      </div>

      {addresses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center space-y-3 bg-card/30">
          <MapPin className="h-8 w-8 text-muted-foreground mx-auto animate-bounce" />
          <div className="space-y-1">
            <h5 className="text-sm font-bold text-foreground">No saved addresses found</h5>
            <p className="text-xs text-muted-foreground">Add your home or office address to proceed with checkout</p>
          </div>
          <Button onClick={onAddNew} size="sm" className="font-extrabold gap-1.5">
            <Plus className="h-4 w-4" /> Add Delivery Address
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <AddressCard
              key={addr._id}
              address={addr}
              isSelected={selectedAddressId === addr._id}
              onSelect={() => onSelectAddress(addr)}
              onEdit={() => onEdit(addr)}
              onDelete={() => onDelete(addr._id)}
              onSetDefault={() => onSetDefault(addr._id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
