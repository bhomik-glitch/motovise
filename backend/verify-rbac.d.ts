declare const axios: any;
declare const PrismaClient: any, UserRole: any;
declare const prisma: any;
declare const API_URL = "http://localhost:3000";
declare const SCENARIOS: ({
    role: string;
    action: string;
    endpoint: string;
    method: string;
    body: {
        name: string;
        price: number;
        stock: number;
        images: any[];
    };
    expected: number;
} | {
    role: string;
    action: string;
    endpoint: string;
    method: string;
    body: {
        name: string;
        price: number;
        stock?: undefined;
        images?: undefined;
    };
    expected: number;
} | {
    role: string;
    action: string;
    endpoint: string;
    method: string;
    expected: number;
    body?: undefined;
})[];
declare function main(): Promise<void>;
