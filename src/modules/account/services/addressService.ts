import api from '@/lib/api-client';
import { Address, CreateAddressInput, UpdateAddressInput } from '@/types/address';

// Backend uses different field names — map to/from frontend shape
function toBackend(data: CreateAddressInput | UpdateAddressInput) {
    const mapped: Record<string, unknown> = { ...data };
    if ('name' in mapped) { mapped.fullName = mapped.name; delete mapped.name; }
    if ('street' in mapped) { mapped.addressLine1 = mapped.street; delete mapped.street; }
    if ('zip' in mapped) { mapped.postalCode = mapped.zip; delete mapped.zip; }
    // Ensure phone is always a string (DB column is non-nullable)
    if (!mapped.phone) mapped.phone = '';
    // 'type' is not a backend field — strip it
    delete mapped.type;
    return mapped;
}

function fromBackend(raw: Record<string, unknown>): Address {
    return {
        id: raw.id as string,
        userId: raw.userId as string,
        type: 'Home', // Backend doesn't store type, default to Home
        name: (raw.fullName ?? raw.name ?? '') as string,
        phone: raw.phone as string | undefined,
        street: (raw.addressLine1 ?? raw.street ?? '') as string,
        city: raw.city as string,
        state: raw.state as string,
        zip: (raw.postalCode ?? raw.zip ?? '') as string,
        country: (raw.country ?? 'India') as string,
        isDefault: raw.isDefault as boolean,
        createdAt: raw.createdAt as string,
        updatedAt: raw.updatedAt as string,
    };
}

export const addressService = {
    getAddresses: async (): Promise<Address[]> => {
        const response = await api.get('/addresses');
        const raw = response.data.data;
        return Array.isArray(raw) ? raw.map(fromBackend) : [];
    },

    getDefaultAddress: async (): Promise<Address> => {
        const response = await api.get('/addresses/default');
        return fromBackend(response.data.data);
    },

    createAddress: async (data: CreateAddressInput): Promise<Address> => {
        const response = await api.post('/addresses', toBackend(data));
        return fromBackend(response.data.data);
    },

    updateAddress: async (id: string, data: UpdateAddressInput): Promise<Address> => {
        const response = await api.patch(`/addresses/${id}`, toBackend(data));
        return fromBackend(response.data.data);
    },

    deleteAddress: async (id: string): Promise<void> => {
        await api.delete(`/addresses/${id}`);
    },
};
