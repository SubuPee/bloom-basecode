export declare const ensureDefaultReportsData: () => Promise<void>;
export declare const getReportsOverview: (filters: {
    vendorId?: string;
    dateRange?: string;
}) => Promise<{
    kpis: {
        totalSales: any;
        totalCommission: any;
        totalOrdersCount: number;
        totalInventoryUnits: number;
        totalProducedUnits: number;
        totalSettledAmount: any;
        totalRefundAmount: any;
    };
    ordersCount: number;
    settlementsCount: number;
    productionsCount: number;
}>;
export declare const getSalesReport: (filters: {
    search?: string;
    vendorId?: string;
    dateRange?: string;
    page?: number;
    limit?: number;
}) => Promise<{
    data: {
        id: any;
        orderNumber: any;
        date: any;
        vendorName: any;
        vendorId: any;
        customerName: any;
        vendorGross: any;
        commissionAmount: any;
        vendorEarnings: any;
        orderStatus: any;
        paymentStatus: any;
    }[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        pages: number;
    };
}>;
export declare const getOrdersReport: (filters: {
    search?: string;
    vendorId?: string;
    dateRange?: string;
    page?: number;
    limit?: number;
}) => Promise<{
    data: {
        id: any;
        orderNumber: any;
        date: any;
        vendorName: any;
        itemsCount: any;
        vendorGross: any;
        orderStatus: any;
        paymentStatus: any;
        items: any;
    }[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        pages: number;
    };
}>;
export declare const getInventoryReport: (filters: {
    search?: string;
    vendorId?: string;
    page?: number;
    limit?: number;
}) => Promise<{
    data: {
        id: any;
        productName: any;
        variantName: any;
        sku: any;
        vendorName: any;
        warehouseName: any;
        availableStock: any;
        reservedStock: any;
        damagedStock: any;
        minStock: number;
        unitCode: any;
        price: any;
    }[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        pages: number;
    };
}>;
export declare const getProductionReport: (filters: {
    search?: string;
    vendorId?: string;
    dateRange?: string;
    page?: number;
    limit?: number;
}) => Promise<{
    data: {
        id: any;
        batchNumber: any;
        productName: any;
        variantName: any;
        vendorName: any;
        plannedQuantity: any;
        goodQuantity: any;
        rejectedQuantity: any;
        unit: any;
        status: any;
        expectedCompletion: any;
        completedAt: any;
    }[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        pages: number;
    };
}>;
export declare const getTransactionsReport: (filters: {
    search?: string;
    vendorId?: string;
    dateRange?: string;
    page?: number;
    limit?: number;
}) => Promise<{
    data: {
        id: any;
        createdDate: any;
        vendorName: any;
        type: any;
        amount: any;
        referenceId: any;
        status: any;
        description: any;
    }[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        pages: number;
    };
}>;
export declare const getSettlementsReport: (filters: {
    search?: string;
    vendorId?: string;
    page?: number;
    limit?: number;
}) => Promise<{
    data: {
        id: any;
        settlementPeriod: any;
        vendorName: any;
        totalSales: any;
        commission: any;
        netPayable: any;
        paymentStatus: any;
        paidDate: any;
        referenceNumber: any;
    }[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        pages: number;
    };
}>;
export declare const getReturnsReport: (filters: {
    search?: string;
    vendorId?: string;
    page?: number;
    limit?: number;
}) => Promise<{
    data: {
        id: any;
        orderNumber: any;
        productName: any;
        vendorName: any;
        reason: any;
        inspectionResult: any;
        refundAmount: any;
        status: any;
        date: any;
    }[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        pages: number;
    };
}>;
export declare const exportReportData: (category: string, filters: {
    vendorId?: string;
    dateRange?: string;
    search?: string;
}, format?: "csv" | "json") => Promise<{
    filename: string;
    csvContent: string;
    headers?: undefined;
    rows?: undefined;
} | {
    csvContent?: undefined;
    filename: string;
    headers: string[];
    rows: any[][];
}>;
