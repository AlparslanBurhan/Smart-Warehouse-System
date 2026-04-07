import { api } from './api';
import type { PagedResult } from './productService';

export interface Company {
    id: string;
    name: string;
    companyId: string;
    createdAt: string;
}

export const companyService = {
    getCompanies: async (searchTerm: string = '', page: number = 1, pageSize: number = 50) => {
        const res = await api.get<PagedResult<Company>>('/Company', {
            params: { searchTerm, page, pageSize }
        });
        return res.data;
    },
    createCompany: async (name: string) => {
        const res = await api.post('/Company', { name });
        return res.data;
    }
};
