export interface Permission {
    id: string;
    key: string;
    label: string;
    description: string | null;
}

export interface Role {
    id: string;
    name: string;
    permissions?: Permission[];
    _count?: {
        permissions: number;
    };
}

export interface AdminUser {
    id: string;
    email: string;
    name: string | null;
    roleRef: Role | null;
}
