import React from 'react';
import { ActiveAlert } from '../dashboard.types';
import { AlertCircle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Props {
    alerts: ActiveAlert[];
    isLoading: boolean;
}

export const ActiveAlertsBanner: React.FC<Props> = ({ alerts, isLoading }) => {
    if (isLoading) return null; // Don't show skeleton for banner, keeps UI cleaner

    if (!alerts || alerts.length === 0) return null;

    return (
        <div className="mb-8 space-y-4">
            {alerts.map((alert, idx) => (
                <div key={alert.id || idx} className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-4 shadow-sm">
                    <div className="flex-shrink-0 mt-0.5">
                        <AlertCircle className="w-5 h-5 text-red-500" />
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between items-start">
                            <h4 className="text-sm font-semibold text-red-800 uppercase tracking-wide">
                                {alert.type} Alert
                            </h4>
                            {alert.createdAt && (
                                <span className="text-xs text-red-600 flex items-center">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}
                                </span>
                            )}
                        </div>
                        <p className="mt-1 text-sm text-red-700">
                            {alert.message}
                            {alert.pincode ? ` (Pincode: ${alert.pincode})` : ''}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
};
