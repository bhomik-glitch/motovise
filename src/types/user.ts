export interface User {
    id: string;
    email: string;
    name?: string;
    role: 'USER' | 'ADMIN';
    image?: string;
    createdAt: string;
}

export interface AuthResponse {
    user: User;
    token: string;
}
