import ProtectedRoute from '@/components/auth/ProtectedRoute';
import RiskMonitoringPage from '@/modules/admin/risk/RiskMonitoringPage';

export default function RiskMonitoringRoute() {
    return (
        <ProtectedRoute permission="fraud.view">
            <RiskMonitoringPage />
        </ProtectedRoute>
    );
}
