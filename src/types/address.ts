export interface Address {
    id: string;
    userId: string;
    type: string; // 'Home', 'Work', etc.
    name: string;
    phone?: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    isDefault: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateAddressInput {
    type: string;
    name: string;
    phone?: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    country?: string;
    isDefault?: boolean;
}

export interface UpdateAddressInput extends Partial<CreateAddressInput> { }
