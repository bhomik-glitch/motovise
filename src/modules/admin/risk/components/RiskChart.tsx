'use client';

import React, { useEffect, useState } from 'react';
import { RiskPincode } from '../risk.types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface RiskChartProps {
    data?: RiskPincode[];
    isLoading: boolean;
}

export function RiskChart({ data, isLoading }: RiskChartProps) {
    const [mount, setMount] = useState(false);

    useEffect(() => {
        setMount(true);
    }, []);

    if (isLoading || !mount) {
        return (
            <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm min-h-[400px] flex items-center justify-center">
                <p className="text-gray-500 animate-pulse">Loading chart data...</p>
            </div>
        );
    }

    // Top 10 highest RTO pincodes
    const chartData = (data || [])
        .slice()
        .sort((a, b) => b.rtoRate - a.rtoRate)
        .slice(0, 10)
        .map(p => ({
            name: p.pincode,
            rto: p.rtoRate
        }));

    return (
        <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Top 10 Highest RTO Pincodes</h3>
            <div style={{ width: '100%', height: '300px' }}>
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis
                                dataKey="name"
                                stroke="#6B7280"
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                                interval={0}
                            />
                            <YAxis
                                stroke="#6B7280"
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `${value}%`}
                            />
                            <Tooltip
                                cursor={{ fill: '#F3F4F6' }}
                                contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Bar dataKey="rto" name="RTO %" fill="#EF4444" radius={[4, 4, 0, 0]} barSize={32} />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex items-center justify-center text-gray-500 border border-dashed border-gray-200 rounded">
                        No data available for chart
                    </div>
                )}
            </div>
        </div>
    );
}
