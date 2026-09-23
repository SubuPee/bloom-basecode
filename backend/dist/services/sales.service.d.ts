export declare const formatCurrencyINR: (amount: number) => string;
export declare const formatCurrencyLakhs: (amount: number) => string;
export declare const formatNumberWithCommas: (num: number) => string;
export interface SalesQuery {
    period?: string;
    startDate?: string;
    endDate?: string;
    channel?: string;
    interval?: string;
    format?: string;
    page?: number | string;
    limit?: number | string;
}
export declare const getSalesOverview: (query?: SalesQuery) => Promise<{
    period: string;
    dateRange: {
        startDate: string;
        endDate: string;
    };
    stats: {
        id: string;
        label: string;
        value: string;
        rawAmount: number;
        trend: string;
        up: boolean;
        tone: string;
        detail: string;
    }[];
    revenueOverview: {
        title: string;
        subtitle: string;
        bars: number[];
        points: {
            index: number;
            heightPercent: number;
            amount: number;
            formattedAmount: string;
        }[];
        labels: string[];
    };
    channels: {
        name: string;
        amount: number;
        formattedAmount: string;
        share: string;
        percentage: number;
        tone: string;
    }[];
    channelsTuples: string[][];
    topProducts: {
        rank: number;
        name: string;
        unitsSold: number;
        soldText: string;
        revenue: number;
        formattedRevenue: string;
    }[];
    topProductsTuples: string[][];
    customerMix: {
        totalCustomers: string;
        rawTotal: number;
        returning: {
            count: number;
            percentage: number;
            label: string;
            tone: string;
        };
        new: {
            count: number;
            percentage: number;
            label: string;
            tone: string;
        };
    };
}>;
export declare const getSalesMetrics: (query?: SalesQuery) => Promise<{
    period: string;
    dateRange: {
        startDate: string;
        endDate: string;
    };
    stats: {
        id: string;
        label: string;
        value: string;
        rawAmount: number;
        trend: string;
        up: boolean;
        tone: string;
        detail: string;
    }[];
}>;
export declare const getSalesChart: (query?: SalesQuery) => Promise<{
    interval: string;
    period: string;
    revenueOverview: {
        title: string;
        subtitle: string;
        bars: number[];
        points: {
            index: number;
            heightPercent: number;
            amount: number;
            formattedAmount: string;
        }[];
        labels: string[];
    };
}>;
export declare const getSalesChannels: (query?: SalesQuery) => Promise<{
    channels: {
        name: string;
        amount: number;
        formattedAmount: string;
        share: string;
        percentage: number;
        tone: string;
    }[];
    channelsTuples: string[][];
}>;
export declare const getTopProducts: (query?: SalesQuery) => Promise<{
    topProducts: {
        rank: number;
        name: string;
        unitsSold: number;
        soldText: string;
        revenue: number;
        formattedRevenue: string;
    }[];
    topProductsTuples: string[][];
}>;
export declare const getCustomerMix: (query?: SalesQuery) => Promise<{
    totalCustomers: string;
    rawTotal: number;
    returning: {
        count: number;
        percentage: number;
        label: string;
        tone: string;
    };
    new: {
        count: number;
        percentage: number;
        label: string;
        tone: string;
    };
}>;
export declare const getSalesTransactions: (query?: SalesQuery) => Promise<{
    transactions: {
        transactionId: string;
        orderNumber: any;
        customerName: any;
        customerEmail: any;
        date: any;
        formattedDate: string;
        channel: any;
        grossAmount: any;
        discount: any;
        tax: any;
        netRevenue: any;
        formattedNetRevenue: string;
        paymentStatus: any;
        paymentMethod: any;
        orderStatus: any;
    }[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}>;
export declare const exportSalesReport: (format?: string, query?: SalesQuery) => Promise<string | {
    summary: {
        period: string;
        stats: {
            id: string;
            label: string;
            value: string;
            rawAmount: number;
            trend: string;
            up: boolean;
            tone: string;
            detail: string;
        }[];
        channels: {
            name: string;
            amount: number;
            formattedAmount: string;
            share: string;
            percentage: number;
            tone: string;
        }[];
        customerMix: {
            totalCustomers: string;
            rawTotal: number;
            returning: {
                count: number;
                percentage: number;
                label: string;
                tone: string;
            };
            new: {
                count: number;
                percentage: number;
                label: string;
                tone: string;
            };
        };
    };
    topProducts: {
        rank: number;
        name: string;
        unitsSold: number;
        soldText: string;
        revenue: number;
        formattedRevenue: string;
    }[];
    recentTransactions: {
        transactionId: string;
        orderNumber: any;
        customerName: any;
        customerEmail: any;
        date: any;
        formattedDate: string;
        channel: any;
        grossAmount: any;
        discount: any;
        tax: any;
        netRevenue: any;
        formattedNetRevenue: string;
        paymentStatus: any;
        paymentMethod: any;
        orderStatus: any;
    }[];
}>;
declare const _default: {
    getSalesOverview: typeof getSalesOverview;
    getSalesMetrics: typeof getSalesMetrics;
    getSalesChart: typeof getSalesChart;
    getSalesChannels: typeof getSalesChannels;
    getTopProducts: typeof getTopProducts;
    getCustomerMix: typeof getCustomerMix;
    getSalesTransactions: typeof getSalesTransactions;
    exportSalesReport: typeof exportSalesReport;
};
export default _default;
