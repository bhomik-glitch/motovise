import React from 'react';
import { HighRiskPincode } from '../dashboard.types';

interface Props {
    pincodes: HighRiskPincode[];
    isLoading: boolean;
}

export const HighRiskPincodeTable: React.FC<Props> = ({ pincodes, isLoading }) => {

    if (isLoading) {
        return (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm animate-pulse h-64">
                <div className="bg-slate-50 p-4 border-b border-slate-200 h-14"></div>
                <div className="p-4 space-y-4">
                    {[1, 2, 3].map(i => <div key={i} className="h-10 bg-slate-100 rounded w-full"></div>)}
                </div>
            </div>
        );
    }

    if (!pincodes || pincodes.length === 0) {
        return (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm p-8 text-center">
                <p className="text-slate-500">No high risk pincodes detected.</p>
            </div>
        );
    }

    const renderBadge = (level: string) => {
        switch (level) {
            case 'HIGH':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">HIGH</span>;
            case 'MEDIUM':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">MEDIUM</span>;
            case 'LOW':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">LOW</span>;
            default:
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">{level}</span>;
        }
    };

    return (
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
            <div className="p-5 border-b border-gray-200 bg-white">
                <h3 className="text-lg font-semibold text-gray-900">High Risk Pincodes</h3>
                <p className="text-sm text-gray-500 mt-1 font-medium">Pincodes with elevated return or fraud rates.</p>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Pincode</th>
                            <th scope="col" className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Total Orders</th>
                            <th scope="col" className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">RTO %</th>
                            <th scope="col" className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Risk Level</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {pincodes.map((pin, idx) => (
                            <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-gray-900">
                                    {pin.pincode}
                                </td>
                                <td className="px-6 py-4 text-gray-800 font-medium tracking-tight">
                                    {pin.totalOrders.toLocaleString()}
                                </td>
                                <td className="px-6 py-4 text-gray-800 font-medium tracking-tight">
                                    {pin.rtoRate.toFixed(2)}%
                                </td>
                                <td className="px-6 py-4">
                                    {renderBadge(pin.riskLevel)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
