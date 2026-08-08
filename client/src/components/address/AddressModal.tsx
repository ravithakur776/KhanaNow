import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, MapPin, Check, Building, Home, Briefcase } from 'lucide-react';
import { UserAddress } from '../../services/addressService';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Checkbox } from '../ui/checkbox';

const addressSchema = z.object({
  label: z.enum(['Home', 'Work', 'Other']),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  phone: z.string().regex(/^[0-9]{10}$/, 'Phone number must be exactly 10 digits'),
  addressLine1: z.string().min(5, 'Address line 1 is required'),
  addressLine2: z.string().optional(),
  landmark: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  postalCode: z.string().regex(/^[0-9]{6}$/, 'Postal code must be exactly 6 digits'),
  country: z.string().default('India'),
  isDefault: z.boolean().optional().default(false),
});

type AddressFormData = z.infer<typeof addressSchema>;

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AddressFormData) => void;
  initialData?: UserAddress | null;
  isLoading?: boolean;
}

export const AddressModal: React.FC<AddressModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading,
}) => {
  const form = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      label: initialData?.label || 'Home',
      fullName: initialData?.fullName || '',
      phone: initialData?.phone || '',
      addressLine1: initialData?.addressLine1 || '',
      addressLine2: initialData?.addressLine2 || '',
      landmark: initialData?.landmark || '',
      city: initialData?.city || 'New Delhi',
      state: initialData?.state || 'Delhi',
      postalCode: initialData?.postalCode || '',
      country: 'India',
      isDefault: initialData?.isDefault || false,
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl glass-panel border border-white/10 bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-foreground">
                {initialData ? 'Edit Delivery Address' : 'Add Delivery Address'}
              </h3>
              <p className="text-xs text-muted-foreground">Save your destination for 18-minute express delivery</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-muted-foreground hover:bg-white/10 hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Address Form */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Label Selector: Home / Work / Other */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Address Label
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Home', 'Work', 'Other'] as const).map((lbl) => (
                <button
                  key={lbl}
                  type="button"
                  onClick={() => form.setValue('label', lbl)}
                  className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    form.watch('label') === lbl
                      ? 'bg-primary text-white shadow-md'
                      : 'border border-border bg-card/60 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {lbl === 'Home' && <Home className="h-3.5 w-3.5" />}
                  {lbl === 'Work' && <Briefcase className="h-3.5 w-3.5" />}
                  {lbl === 'Other' && <Building className="h-3.5 w-3.5" />}
                  <span>{lbl}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Recipient Full Name"
              placeholder="Aarav Sharma"
              error={form.formState.errors.fullName?.message}
              {...form.register('fullName')}
            />

            <Input
              label="10-Digit Mobile Number"
              placeholder="9876543210"
              error={form.formState.errors.phone?.message}
              {...form.register('phone')}
            />
          </div>

          <Input
            label="Flat / House No. / Building"
            placeholder="Flat 402, Tower B, Green Valley Heights"
            error={form.formState.errors.addressLine1?.message}
            {...form.register('addressLine1')}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Street / Area (Optional)"
              placeholder="Sector 62"
              {...form.register('addressLine2')}
            />
            <Input
              label="Landmark (Optional)"
              placeholder="Near Metro Station"
              {...form.register('landmark')}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="City"
              placeholder="New Delhi"
              error={form.formState.errors.city?.message}
              {...form.register('city')}
            />
            <Input
              label="State"
              placeholder="Delhi"
              error={form.formState.errors.state?.message}
              {...form.register('state')}
            />
            <Input
              label="6-Digit Pincode"
              placeholder="110001"
              error={form.formState.errors.postalCode?.message}
              {...form.register('postalCode')}
            />
          </div>

          <div className="pt-2">
            <Checkbox
              label="Set as default delivery address"
              checked={form.watch('isDefault')}
              onChange={(e) => form.setValue('isDefault', e.target.checked)}
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 font-bold h-11"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isLoading}
              className="flex-1 font-extrabold h-11 shadow-lg shadow-primary/30"
            >
              Save Address <Check className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
