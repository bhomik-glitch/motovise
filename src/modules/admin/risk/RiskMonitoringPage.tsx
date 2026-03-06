'use client';

import React from 'react';
import { useRiskData } from './hooks/useRiskData';
import { useFraudConfigQuery } from './hooks/useFraudConfig';
import { RiskStatsCards } from './components/RiskStatsCards';
import { RiskChart } from './components/RiskChart';
import { EnforcementToggle } from './components/EnforcementToggle';
import { RiskTable } from './components/RiskTable';
import { ShieldAlert } from 'lucide-react';

export default function RiskMonitoringPage() {
    const { data: riskData, isLoading: isLoadingRisk } = useRiskData();
    const { data: configData, isLoading: isLoadingConfig } = useFraudConfigQuery();

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
                        <ShieldAlert className="text-red-500" size={28} />
                        Risk & Fraud Monitoring
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Monitor high risk pincodes, RTO rates, and configure checkout enforcement.
                    </p>
                </div>
            </div>

            <RiskStatsCards
                data={riskData}
                config={configData}
                isLoading={isLoadingRisk || isLoadingConfig}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="lg:col-span-2">
                    <RiskChart data={riskData} isLoading={isLoadingRisk} />
                </div>
                <div className="lg:col-span-1">
                    <EnforcementToggle config={configData} />

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                        <h4 className="font-semibold mb-1 flex items-center gap-2">
                            How it works
                        </h4>
                        <p className="opacity-90 leading-relaxed">
                            Pincodes are dynamically updated as <b>HIGH</b>, <b>MEDIUM</b>, or <b>LOW</b> risk based on historical Return-to-Origin (RTO) rates.
                            Changes in Enforcement Mode affect the availability of Cash on Delivery at checkout for high risk regions.
                        </p>
                    </div>
                </div>
            </div>

            <RiskTable
                data={riskData}
                isLoading={isLoadingRisk}
                codEnforcement={configData?.codEnforcement}
            />
        </div>
    );
}
