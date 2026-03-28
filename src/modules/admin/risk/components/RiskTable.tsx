import React from 'react';
import { RiskPincode } from '../risk.types';
import { cn } from '@/lib/utils';
import { MapPin } from 'lucide-react';

interface RiskTableProps {
    data?: RiskPincode[];
    isLoading: boolean;
    codEnforcement?: 'DISABLE' | 'FLAG';
}

export function RiskTable({ data, isLoading, codEnforcement }: RiskTableProps) {
    return (
        <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg shadow-sm">
            <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Pincode</th>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Orders</th>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">RTO %</th>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Risk Level</th>
                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-sm">
                    {isLoading ? (
                        <tr>
                            <td colSpan={5} className="px-4 py-8 text-center text-gray-500">Loading risk data...</td>
                        </tr>
                    ) : data?.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="px-4 py-14 text-center">
                                <div className="flex flex-col items-center gap-2 text-gray-400">
                                    <MapPin size={32} className="opacity-40" />
                                    <span className="text-sm font-medium">No risk pincodes found</span>
                                </div>
                            </td>
                        </tr>
                    ) : (
                        data?.map((item) => {
                            const codRestricted = item.riskLevel === 'HIGH' && codEnforcement === 'DISABLE';

                            return (
                                <tr key={item.pincode} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 font-medium text-gray-900">{item.pincode}</td>
                                    <td className="px-4 py-3 text-gray-600">{item.totalOrders.toLocaleString()}</td>
                                    <td className="px-4 py-3 font-medium text-gray-900">{item.rtoRate.toFixed(1)}%</td>
                                    <td className="px-4 py-3">
                                        <span
                                            className={cn(
                                                'px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full',
                                                item.riskLevel === 'HIGH' && 'bg-red-100 text-red-800',
                                                item.riskLevel === 'MEDIUM' && 'bg-orange-100 text-orange-800',
                                                item.riskLevel === 'LOW' && 'bg-green-100 text-green-800'
                                            )}
                                        >
                                            {item.riskLevel}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span
                                            className={cn(
                                                'px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full',
                                                codRestricted ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
                                            )}
                                        >
                                            {codRestricted ? 'COD Restricted' : 'Allowed'}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>
        </div>
    );
}
