import { useAuth } from '@/hooks/useAuth';
import { FraudConfig } from '../risk.types';
import { useFraudConfigMutation } from '../hooks/useFraudConfig';
import { cn } from '@/lib/utils';
import { Shield } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/ToggleGroup';
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
        <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Shield size={20} className="text-gray-500" />
                    COD Enforcement Mode
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                    Control checkout behavior for high-risk pincodes.
                </p>
            </div>

            <div className="w-full md:w-auto relative group">
                <ToggleGroup
                    type="single"
                    value={activeMode}
                    onValueChange={handleModeChange}
                    disabled={!canUpdate || updateConfig.isPending}
                    className={cn(
                        "bg-gray-100 p-1 rounded-lg w-full flex gap-1",
                        !canUpdate && "opacity-60 cursor-not-allowed"
                    )}
                >
                    <ToggleGroupItem
                        value="DISABLE"
                        className={cn(
                            "flex-1 px-4 py-2 text-xs font-bold rounded-md transition-all",
                            activeMode === 'DISABLE' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
                        )}
                    >
                        DISABLE
                    </ToggleGroupItem>
                    <ToggleGroupItem
                        value="FLAG"
                        className={cn(
                            "flex-1 px-4 py-2 text-xs font-bold rounded-md transition-all",
                            activeMode === 'FLAG' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
                        )}
                    >
                        FLAG
                    </ToggleGroupItem>
                </ToggleGroup>

                {!canUpdate && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs py-1 px-2 rounded pointer-events-none">
                        Insufficient permission
                    </div>
                )}
            </div>
        </div>
    );
}
