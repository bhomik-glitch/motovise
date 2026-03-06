import api from '@/lib/api-client';
import { Address, CreateAddressInput, UpdateAddressInput } from '@/types/address';

export const addressService = {
    getAddresses: async (): Promise<Address[]> => {
        const response = await api.get('/addresses');
        return response.data;
    },

    getDefaultAddress: async (): Promise<Address> => {
        const response = await api.get('/addresses/default');
        return response.data;
    },

    createAddress: async (data: CreateAddressInput): Promise<Address> => {
        const response = await api.post('/addresses', data);
        return response.data;
    },

    updateAddress: async (id: string, data: UpdateAddressInput): Promise<Address> => {
        const response = await api.patch(`/addresses/${id}`, data);
        return response.data;
    },

    deleteAddress: async (id: string): Promise<void> => {
        await api.delete(`/addresses/${id}`);
    },
};
