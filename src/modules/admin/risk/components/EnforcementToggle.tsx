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

            <div className="w-full md:w-auto grid grid-cols-2 gap-2 relative group">
                <Button
                    variant={activeMode === 'DISABLE' ? 'default' : 'outline'}
                    disabled={!canUpdate || updateConfig.isPending}
                    onClick={() => handleModeChange('DISABLE')}
                    className="w-full"
                >
                    Disable
                </Button>
                <Button
                    variant={activeMode === 'FLAG' ? 'default' : 'outline'}
                    disabled={!canUpdate || updateConfig.isPending}
                    onClick={() => handleModeChange('FLAG')}
                    className="w-full"
                >
                    Flag
                </Button>

                {!canUpdate && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs py-1 px-2 rounded pointer-events-none">
                        Insufficient permission
                    </div>
                )}
            </div>
        </div>
    );
}
