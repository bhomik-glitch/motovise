export type AlertStatus = "ACTIVE" | "RESOLVED";

export type AlertType =
    | "OVERALL_RTO"
    | "PINCODE_RTO"
    | "CHARGEBACK_RATE"
    | "MANUAL_REVIEW_QUEUE";

export interface Alert {
    id: string;
    type: AlertType;
    status: AlertStatus;
    pincode: string;
    metricValue: number;
    thresholdValue: number;
    createdAt: string;
    resolvedAt?: string;
}

export interface AlertsResponse {
    alerts: Alert[];
    total: number;
    page: number;
    pages: number;
}

export interface GetAlertsParams {
    status?: AlertStatus;
    type?: AlertType;
    pincode?: string;
    page?: number;
    limit?: number;
}
