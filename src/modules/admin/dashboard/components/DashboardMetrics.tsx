import React from 'react';
import { DashboardMetrics as IDashboardMetrics } from '../dashboard.types';
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    ShoppingCart,
    CreditCard,
    Truck,
    AlertTriangle,
    ShieldAlert
} from 'lucide-react';

interface Props {
    metrics: IDashboardMetrics | null;
    isLoading: boolean;
}

export const DashboardMetrics: React.FC<Props> = ({ metrics, isLoading }) => {

    // Fallback while loading
    if (isLoading || !metrics) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                    <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 animate-pulse h-28">
                        <div className="h-4 bg-slate-200 rounded w-1/2 mb-4"></div>
                        <div className="h-8 bg-slate-200 rounded w-3/4"></div>
                    </div>
                ))}
            </div>
        );
    }

    const formatCurrency = (val: number) => `$${val.toFixed(2)}`;
    const formatPercent = (val: number) => `${val.toFixed(2)}%`;
    const formatNumber = (val: number) => val.toLocaleString();

    const metricCards = [
        {
            label: 'MTD GMV',
            value: formatCurrency(metrics.mtdGMV || 0),
            icon: <DollarSign className="w-5 h-5 text-emerald-500" />,
            trend: 'up',
            bgColor: 'bg-emerald-50'
        },
        {
            label: 'Orders Count',
            value: formatNumber(metrics.ordersCount || 0),
            icon: <ShoppingCart className="w-5 h-5 text-blue-500" />,
            trend: 'up',
            bgColor: 'bg-blue-50'
        },
        {
            label: 'Prepaid %',
            value: formatPercent(metrics.prepaidPercentage || 0),
            icon: <CreditCard className="w-5 h-5 text-indigo-500" />,
            trend: 'up', // higher is usually better
            bgColor: 'bg-indigo-50'
        },
        {
            label: '7-Day RTO %',
            value: formatPercent(metrics.rtoRate || 0),
            icon: <Truck className="w-5 h-5 text-amber-500" />,
            trend: 'down',
            bgColor: 'bg-amber-50'
        },
        {
            label: '30-Day Chargeback %',
            value: formatPercent(metrics.chargebackRate || 0),
            icon: <AlertTriangle className="w-5 h-5 text-red-500" />,
            trend: 'down',
            bgColor: 'bg-red-50'
        },
        {
            label: 'Avg Shipping Cost',
            value: formatCurrency(metrics.avgShippingCost || 0),
            icon: <Truck className="w-5 h-5 text-slate-500" />,
            trend: null,
            bgColor: 'bg-slate-50'
        },
        {
            label: 'Manual Review Pending',
            value: formatNumber(metrics.manualReviewPending || 0),
            icon: <ShieldAlert className="w-5 h-5 text-orange-500" />,
            trend: null,
            bgColor: 'bg-orange-50'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {metricCards.map((card, idx) => (
                <div key={idx} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-4">
                        <div className={`p-2 rounded-lg ${card.bgColor}`}>
                            {card.icon}
                        </div>
                        {card.trend && (
                            <span className={`text-xs font-semibold ${card.trend === 'up' ? 'text-emerald-500' : 'text-red-500'}`}>
                                {card.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                            </span>
                        )}
                    </div>
                    <div>
                        <h3 className="text-slate-500 text-sm font-medium">{card.label}</h3>
                        <p className="text-2xl font-bold text-slate-900 mt-1">{card.value}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};
