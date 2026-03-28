import React from 'react';
import { ShieldAlert, AlertTriangle, Activity, Settings2 } from 'lucide-react';
import { RiskPincode, FraudConfig } from '../risk.types';

interface RiskStatsCardsProps {
    data?: RiskPincode[];
    config?: FraudConfig;
    isLoading: boolean;
}

export function RiskStatsCards({ data, config, isLoading }: RiskStatsCardsProps) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm animate-pulse h-24" />
                ))}
            </div>
        );
    }

    const highRiskCount = data?.filter((p) => p.riskLevel === 'HIGH').length || 0;
    const avgRTO = data?.length
        ? data.reduce((acc, p) => acc + p.rtoRate, 0) / data.length
        : 0;
    const totalOrders = data?.reduce((acc, p) => acc + p.totalOrders, 0) || 0;

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">High Risk Pincodes</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">{highRiskCount}</h3>
                </div>
                <div className="p-3 bg-red-50 text-red-600 rounded-full">
                    <AlertTriangle size={24} />
                </div>
            </div>

            <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">Average RTO Rate</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">{avgRTO.toFixed(1)}%</h3>
                </div>
                <div className="p-3 bg-orange-50 text-orange-600 rounded-full">
                    <Activity size={24} />
                </div>
            </div>

            <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">Total Evaluated</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">{totalOrders.toLocaleString()}</h3>
                </div>
                <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
                    <ShieldAlert size={24} />
                </div>
            </div>

            <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">COD Enforcement</p>
                    <h3 className="text-xl font-bold text-gray-900 mt-1">
                        {config?.codEnforcement || 'LOADING'}
                    </h3>
                </div>
                <div className="p-3 bg-gray-50 text-gray-600 rounded-full">
                    <Settings2 size={24} />
                </div>
            </div>
        </div>
    );
}
