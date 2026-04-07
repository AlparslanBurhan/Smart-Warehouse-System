import { api, getCompanyId } from './api';
import type { PagedResult } from './productService';

export interface Location {
    id: string;
    zone: string;
    shelf: string;
    companyId: string;
}

export interface LocationBatchCreate {
    zone: string;
    prefixStart: string;
    prefixEnd: string;
    numberEnd: number;
}

export const locationService = {
    getLocations: async (page: number, pageSize: number, searchTerm: string = '') => {
        const res = await api.get<PagedResult<Location>>('/Location/list', {
            params: {
                companyId: getCompanyId(),
                page,
                pageSize,
                searchTerm
            }
        });
        return res.data;
    },
    createLocation: async (location: Partial<Location>) => {
        const res = await api.post('/Location/create', { ...location, companyId: getCompanyId() });
        return res.data;
    },
    updateLocation: async (location: Partial<Location>) => {
        const res = await api.post('/Location/update', { ...location, companyId: getCompanyId() });
        return res.data;
    },
    deleteLocation: async (id: string) => {
        const res = await api.post('/Location/delete', { id, companyId: getCompanyId() });
        return res.data;
    },
    createBatch: async (data: LocationBatchCreate) => {
        const res = await api.post('/Location/create-batch', { ...data, companyId: getCompanyId() });
        return res.data;
    },
    getZones: async () => {
        const res = await api.get<{ success: boolean; data: string[] }>('/Location/zones', {
            params: { companyId: getCompanyId() }
        });
        return res.data.data;
    }
};
