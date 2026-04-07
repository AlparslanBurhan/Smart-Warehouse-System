import { useState, useEffect } from 'react';
import { Box, Typography, Tabs, Tab } from '@mui/material';
import { Inventory2, Category, Place, History } from '@mui/icons-material';
import SummaryCards from '../components/SummaryCards';
import ProductTable from '../components/ProductTable';
import LocationTable from '../components/LocationTable';
import TransactionLogsTable from '../components/TransactionLogsTable';
import CompanySelector from '../components/CompanySelector';
import { productService } from '../services/productService';
import { locationService } from '../services/locationService';

export default function Dashboard() {
    const [tabVal, setTabVal] = useState(0);
    const [productCount, setProductCount] = useState(0);
    const [locationCount, setLocationCount] = useState(0);

    // Initial loads for summary stats
    useEffect(() => {
        productService.getProducts(1, 1).then(res => setProductCount(res.totalCount || 0));
        locationService.getLocations(1, 1).then(res => setLocationCount(res.totalCount || 0));
    }, [tabVal]); // Refresh counts on tab change

    return (
        <Box sx={{ p: { xs: 2, md: 5 }, minHeight: '100vh' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4, flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Inventory2 sx={{ color: 'primary.main', fontSize: 40, mr: 2 }} />
                    <Typography variant="h4" sx={{ color: 'text.primary', letterSpacing: '-1px' }}>
                        Akıllı Depo Yönetimi
                    </Typography>
                </Box>
                <CompanySelector />
            </Box>

            <SummaryCards productCount={productCount} locationCount={locationCount} />

            <Box sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tabVal} onChange={(_e, v) => setTabVal(v)} textColor="primary" indicatorColor="primary">
                    <Tab icon={<Category sx={{ mr: 1 }} />} iconPosition="start" label="Ürünler ve Stok İzleme" />
                    <Tab icon={<Place sx={{ mr: 1 }} />} iconPosition="start" label="Depo & Raf Lokasyonları" />
                    <Tab icon={<History sx={{ mr: 1 }} />} iconPosition="start" label="Geçmiş İşlemler (Log)" />
                </Tabs>
            </Box>

            {tabVal === 0 && <ProductTable />}
            {tabVal === 1 && <LocationTable />}
            {tabVal === 2 && <TransactionLogsTable />}
        </Box>
    );
}
