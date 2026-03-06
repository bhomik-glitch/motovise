import { LayoutDashboard, ShoppingCart, Users, Settings, Shield, CreditCard, ShieldAlert } from 'lucide-react';

export type AdminRoute = {
    label: string;
    path: string;
    permission: string;
    icon: React.ElementType;
};

export const adminRoutes: AdminRoute[] = [
    {
        label: "Dashboard",
        path: "/admin/dashboard",
        permission: "analytics.view",
        icon: LayoutDashboard
    },
    {
        label: "Orders",
        path: "/admin/orders",
        permission: "order.read",
        icon: ShoppingCart
    },
    {
        label: "Payments",
        path: "/admin/payments",
        permission: "payment.read",
        icon: CreditCard
    },
    {
        label: "Users",
        path: "/admin/users",
        permission: "user.manage",
        icon: Users
    },
    {
        label: "Risk & Fraud",
        path: "/admin/risk",
        permission: "fraud.view",
        icon: ShieldAlert
    },
    {
        label: "Roles & Permissions",
        path: "/admin/roles",
        permission: "rbac.manage",
        icon: Shield
    },
    {
        label: "Settings",
        path: "/admin/settings",
        permission: "SYSTEM_CONFIG_EDIT",
        icon: Settings
    }
];
