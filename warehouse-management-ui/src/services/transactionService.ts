import { api, getCompanyId } from './api';

export interface TransactionRequest {
    productId: string;
    locationId?: string;
    quantity: number;
    notes?: string;
}

export interface TransactionTransferRequest {
    productId: string;
    fromLocationId: string;
    toLocationId: string;
    quantity: number;
    notes?: string;
}

export interface TransactionLog {
    id: string;
    productName: string;
    locationName: string;
    transactionType: string;
    quantity: number;
    notes: string;
    createdAt: string;
}

export interface PagedLogsResult {
    success: boolean;
    data: TransactionLog[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export const transactionService = {
    processInput: async (data: TransactionRequest) => {
        const res = await api.post('/Transaction/input', { ...data, companyId: getCompanyId() });
        return res.data;
    },
    processOutput: async (data: TransactionRequest) => {
        const res = await api.post('/Transaction/output', { ...data, companyId: getCompanyId() });
        return res.data;
    },
    processTransfer: async (data: TransactionTransferRequest) => {
        const res = await api.post('/Transaction/transfer', { ...data, companyId: getCompanyId() });
        return res.data;
    },
    getLogs: async (page: number = 1, pageSize: number = 50, transactionType: string = ''): Promise<PagedLogsResult> => {
        const res = await api.get<PagedLogsResult>('/Transaction/logs', {
            params: { 
                companyId: getCompanyId(), 
                page, 
                pageSize,
                transactionType 
            }
        });
        return res.data;
    }
};
