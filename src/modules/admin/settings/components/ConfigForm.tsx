import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SystemConfig } from '../settings.types';
import { useUpdateSystemConfig } from '../hooks/useSystemConfig';

const schema = z.object({
    codThreshold: z.number().min(0).max(100),
    fraudThreshold: z.number().min(0).max(100),
    alertThreshold: z.number().min(0).max(100),
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
            codThreshold: initialData.codThreshold,
            fraudThreshold: initialData.fraudThreshold,
            alertThreshold: initialData.alertThreshold,
        },
    });

    useEffect(() => {
        reset({
            codThreshold: initialData.codThreshold,
            fraudThreshold: initialData.fraudThreshold,
            alertThreshold: initialData.alertThreshold,
        });
    }, [initialData, reset]);

    const onSubmit = (data: ConfigFormData) => {
        updateConfig(data);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">COD Restriction Threshold</label>
                    <input
                        type="number"
                        {...register('codThreshold', { valueAsNumber: true })}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                    />
                    {errors.codThreshold && <p className="mt-1 text-sm text-red-600">{errors.codThreshold.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Fraud Manual Review Threshold</label>
                    <input
                        type="number"
                        {...register('fraudThreshold', { valueAsNumber: true })}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                    />
                    {errors.fraudThreshold && <p className="mt-1 text-sm text-red-600">{errors.fraudThreshold.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Alert Trigger Threshold</label>
                    <input
                        type="number"
                        {...register('alertThreshold', { valueAsNumber: true })}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                    />
                    {errors.alertThreshold && <p className="mt-1 text-sm text-red-600">{errors.alertThreshold.message}</p>}
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
