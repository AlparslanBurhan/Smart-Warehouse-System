import { api, getCompanyId } from './api';

export interface ProductStock {
    locationId: string;
    locationName: string;
    quantity: number;
}

export interface Product {
    id: string;
    name: string;
    skuCode: string;
    description: string;
    companyId: string;
    stocks?: ProductStock[];
    totalStock?: number;
}

export interface PagedResult<T> {
    success: boolean;
    data: T[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export const productService = {
    getProducts: async (page: number, pageSize: number, searchTerm: string = '', hasStock: boolean = false, zone: string = '') => {
        const res = await api.get<PagedResult<Product>>('/Product/list', {
            params: {
                companyId: getCompanyId(),
                page,
                pageSize,
                searchTerm,
                hasStock,
                zone
            }
        });
        return res.data;
    },
    createProduct: async (product: Partial<Product>) => {
        const res = await api.post('/Product/create', { ...product, companyId: getCompanyId() });
        return res.data;
    },
    updateProduct: async (product: Partial<Product>) => {
        const res = await api.post('/Product/update', { ...product, companyId: getCompanyId() });
        return res.data;
    },
    deleteProduct: async (id: string) => {
        const res = await api.post('/Product/delete', { id, companyId: getCompanyId() });
        return res.data;
    }
};
