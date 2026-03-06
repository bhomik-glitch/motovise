// modules/admin/orders/index.ts — Public API for the Orders module
export * from './components/FraudScoreBadge';
export * from './components/RiskBadge';
export * from './components/OrdersFilters';
export * from './components/PaginationControls';
export * from './components/OrderActionsPanel';
export * from './components/OrderDetailDrawer';
export * from './components/OrdersTable';
export * from './components/OrdersPage';
export * from './hooks/useOrders';
export * from './hooks/useOrderDetails';
export * from './hooks/useOrderMutations';
// Value exports (lifecycle guard arrays)
export { CANCELLABLE_STATUSES, SHIPPABLE_STATUSES, TERMINAL_STATUSES } from './orders.types';
// Type exports
export type {
    Order,
    OrderItem,
    ShipmentInfo,
    OrdersQueryParams,
    OrdersResponse,
    OrderStatus,
    PaymentStatus,
    PaymentMethod,
    RiskLevel,
    ManualReviewStatus,
} from './orders.types';
