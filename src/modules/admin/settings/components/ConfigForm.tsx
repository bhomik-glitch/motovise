import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SystemConfig } from '../settings.types';
import { useUpdateSystemConfig } from '../hooks/useSystemConfig';

const schema = z.object({
    maxLoginAttempts: z.number().min(1).max(10),
    fraudRiskThreshold: z.number().min(0).max(100),
    enableEmailVerification: z.boolean(),
});

type ConfigFormData = z.infer<typeof schema>;

interface ConfigFormProps {
    initialData: SystemConfig;
}

export const ConfigForm: React.FC<ConfigFormProps> = ({ initialData }) => {
    const { mutate: updateConfig, isPending } = useUpdateSystemConfig();

    const { register, handleSubmit, reset, formState: { errors } } = useForm<ConfigFormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            maxLoginAttempts: initialData.maxLoginAttempts,
            fraudRiskThreshold: initialData.fraudRiskThreshold,
            enableEmailVerification: initialData.enableEmailVerification,
        },
    });

    useEffect(() => {
        reset({
            maxLoginAttempts: initialData.maxLoginAttempts,
            fraudRiskThreshold: initialData.fraudRiskThreshold,
            enableEmailVerification: initialData.enableEmailVerification,
        });
    }, [initialData, reset]);

    const onSubmit = (data: ConfigFormData) => {
        updateConfig(data);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Max Login Attempts</label>
                    <input
                        type="number"
                        {...register('maxLoginAttempts', { valueAsNumber: true })}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                    />
                    {errors.maxLoginAttempts && <p className="mt-1 text-sm text-red-600">{errors.maxLoginAttempts.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Fraud Risk Threshold</label>
                    <input
                        type="number"
                        {...register('fraudRiskThreshold', { valueAsNumber: true })}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                    />
                    {errors.fraudRiskThreshold && <p className="mt-1 text-sm text-red-600">{errors.fraudRiskThreshold.message}</p>}
                </div>

                <div className="flex items-center space-x-3">
                    <input
                        type="checkbox"
                        id="enableEmailVerification"
                        {...register('enableEmailVerification')}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="enableEmailVerification" className="text-sm font-medium text-gray-700">
                        Enable Email Verification
                    </label>
                </div>
            </div>

            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={isPending}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                    {isPending ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </form>
    );
};
