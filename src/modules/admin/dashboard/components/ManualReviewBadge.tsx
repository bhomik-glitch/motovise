import React from 'react';
import Link from 'next/link';
import { AlertTriangle, ChevronRight } from 'lucide-react';

interface Props {
    manualReviewPending: number;
    isLoading: boolean;
}

export const ManualReviewBadge: React.FC<Props> = ({ manualReviewPending, isLoading }) => {

    if (isLoading) {
        return (
            <div className="mb-6 p-4 rounded-xl border border-slate-200 bg-slate-50 animate-pulse h-16 w-full max-w-md"></div>
        );
    }

    if (!manualReviewPending || manualReviewPending === 0) {
        return null;
    }

    return (
        <Link href="/admin/reviews" className="block mb-6 max-w-md group">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between shadow-sm transition-all hover:bg-amber-100 hover:shadow-md">
                <div className="flex items-center space-x-3 text-amber-800">
                    <div className="bg-amber-200 bg-opacity-50 p-2 rounded-lg">
                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-sm">Action Required</h4>
                        <p className="text-sm">⚠ Manual Reviews Pending: <span className="font-bold">{manualReviewPending}</span></p>
                    </div>
                </div>
                <ChevronRight className="w-5 h-5 text-amber-500 group-hover:translate-x-1 transition-transform" />
            </div>
        </Link>
    );
};
