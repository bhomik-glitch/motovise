import { useAuth } from '@/hooks/useAuth';
import { FraudConfig } from '../risk.types';
import { useFraudConfigMutation } from '../hooks/useFraudConfig';
import { cn } from '@/lib/utils';
import { Shield } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';

interface EnforcementToggleProps {
    config?: FraudConfig;
}

export function EnforcementToggle({ config }: EnforcementToggleProps) {
    const { hasPermission } = useAuth();
    const canUpdate = hasPermission('fraud.config.update');
    const updateConfig = useFraudConfigMutation();
    const queryClient = useQueryClient();

    const activeMode = config?.codEnforcement;

    const handleModeChange = (newMode: string) => {
        if (!newMode || !canUpdate || newMode === activeMode) return;

        const mode = newMode as 'DISABLE' | 'FLAG';

        // Use standard mutation with local invalidation if needed, 
        // but hook already does it. I'll add optimistic logic here.
        updateConfig.mutate({ codEnforcement: mode });
    };

    return (
        <div className="bg-white rounded-xl border p-6 flex flex-col gap-4">
            <div>
                <h3 className="text-sm font-semibold text-gray-900">
                    COD Enforcement Mode
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                    Control checkout behavior for high-risk pincodes.
                </p>
            </div>

            <div className="flex justify-start relative group">
                <div className={cn(
                    "flex rounded-lg border bg-gray-100 p-1",
                    !canUpdate && "opacity-60 cursor-not-allowed"
                )}>
                    <button
                        onClick={() => handleModeChange('DISABLE')}
                        disabled={!canUpdate || updateConfig.isPending}
                        className={cn(
                            "px-4 py-1.5 text-sm rounded-md transition-all duration-200 ease-out active:scale-95",
                            activeMode === 'DISABLE'
                                ? "bg-white shadow text-gray-900"
                                : "text-gray-500 hover:text-gray-700 hover:bg-white/60"
                        )}
                    >
                        Disable
                    </button>
                    <button
                        onClick={() => handleModeChange('FLAG')}
                        disabled={!canUpdate || updateConfig.isPending}
                        className={cn(
                            "px-4 py-1.5 text-sm rounded-md transition-all duration-200 ease-out active:scale-95",
                            activeMode === 'FLAG'
                                ? "bg-white shadow text-gray-900"
                                : "text-gray-500 hover:text-gray-700 hover:bg-white/60"
                        )}
                    >
                        Flag
                    </button>
                </div>

                {!canUpdate && (
                    <div className="absolute bottom-full left-0 mb-2 w-max opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs py-1 px-2 rounded pointer-events-none">
                        Insufficient permission
                    </div>
                )}
            </div>
        </div>
    );
}
