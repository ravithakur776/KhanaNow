import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './apiClient';

export interface UserAddress {
  _id: string;
  label: 'Home' | 'Work' | 'Other';
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
  isDefault: boolean;
}

export const useUserAddresses = (isEnabled: boolean = true) => {
  return useQuery({
    queryKey: ['user_addresses'],
    queryFn: async () => {
      const response = await apiClient.get('/addresses');
      return response.data.data as UserAddress[];
    },
    enabled: isEnabled,
  });
};

export const useCreateAddressMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Omit<UserAddress, '_id'>) => {
      const response = await apiClient.post('/addresses', payload);
      return response.data.data as UserAddress;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_addresses'] });
    },
  });
};

export const useUpdateAddressMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<UserAddress> }) => {
      const response = await apiClient.patch(`/addresses/${id}`, data);
      return response.data.data as UserAddress;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_addresses'] });
    },
  });
};

export const useDeleteAddressMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/addresses/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_addresses'] });
    },
  });
};

export const useSetDefaultAddressMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.patch(`/addresses/${id}/default`);
      return response.data.data as UserAddress;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_addresses'] });
    },
  });
};
