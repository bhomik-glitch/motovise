'use client';

import { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
    user: any | null;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    isLoading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Initial auth check logic would go here
        setIsLoading(false);
    }, []);

    return (
        <AuthContext.Provider value={{ user, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
