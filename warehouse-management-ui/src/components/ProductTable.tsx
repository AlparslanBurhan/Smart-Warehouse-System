import { useState, useEffect, useMemo } from 'react';
import { Box, Button, Card, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Typography, Tooltip, Chip, FormControl, InputLabel, Select, MenuItem, Switch, FormControlLabel, type AlertColor } from '@mui/material';
import { DataGrid, type GridColDef, type GridPaginationModel } from '@mui/x-data-grid';
import { productService, type Product, type ProductStock } from '../services/productService';
import { locationService } from '../services/locationService';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon, AddCircleOutline, RemoveCircleOutline, SwapHoriz } from '@mui/icons-material';
import TransactionModal from './TransactionModal';
import TransferModal from './TransferModal';
import Notification from './Notification';

export default function ProductTable() {
    const [products, setProducts] = useState<Product[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 5 });
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [hasStock, setHasStock] = useState(false);
    const [selectedZone, setSelectedZone] = useState('');
    const [zones, setZones] = useState<string[]>([]);

    const [open, setOpen] = useState(false);
    const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({});
    const [isEdit, setIsEdit] = useState(false);

    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteId, setDeleteId] = useState('');

    // Transaction Modal State
    const [txOpen, setTxOpen] = useState(false);
    const [txType, setTxType] = useState<'input' | 'output'>('input');
    const [txProductId, setTxProductId] = useState('');
    const [txProductName, setTxProductName] = useState('');

    // Transfer Modal State
    const [transferOpen, setTransferOpen] = useState(false);
    const [txStocks, setTxStocks] = useState<ProductStock[]>([]);

    // Notification State
    const [notify, setNotify] = useState<{ open: boolean; message: string; severity: AlertColor }>({ open: false, message: '', severity: 'success' });
    const showNotify = (message: string, severity: AlertColor = 'success') => setNotify({ open: true, message, severity });

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const fetchZones = async () => {
        try {
            const res = await locationService.getZones();
            setZones(res || []);
        } catch (e) {
            console.error("Error fetching zones:", e);
        }
    };

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await productService.getProducts(
                paginationModel.page + 1, 
                paginationModel.pageSize, 
                debouncedSearch,
                hasStock,
                selectedZone
            );
            setProducts(res.data || []);
            setTotalCount(res.totalCount || 0);
        } catch (e) {
            console.error("Error fetching products:", e);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchZones();
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [paginationModel, debouncedSearch, hasStock, selectedZone]);

    const handleSave = async () => {
        try {
            if (isEdit) {
                await productService.updateProduct(currentProduct);
                showNotify('Ürün başarıyla güncellendi!');
            } else {
                await productService.createProduct(currentProduct);
                showNotify('Yeni ürün başarıyla eklendi!');
            }
            setOpen(false);
            fetchProducts();
        } catch (e: any) {
            showNotify('İşlem başarısız: ' + (e.response?.data?.message || e.message), 'error');
        }
    };

    const handleDelete = async () => {
        try {
            await productService.deleteProduct(deleteId);
            showNotify('Ürün başarıyla silindi!');
            setDeleteOpen(false);
            fetchProducts();
        } catch (e: any) {
            showNotify('Silme işlemi başarısız: ' + (e.response?.data?.message || e.message), 'error');
        }
    };

    const columns = useMemo<GridColDef[]>(() => [
        { field: 'skuCode', headerName: 'SKU Kod', minWidth: 100, flex: 0.5 },
        { field: 'name', headerName: 'Ürün Adı', minWidth: 150, flex: 1 },
        { field: 'description', headerName: 'Açıklama', minWidth: 150, flex: 1.5 },
        {
            field: 'totalStock',
            headerName: 'Toplam Stok',
            minWidth: 130,
            flex: 0.8,
            renderCell: (params) => {
                const stocks = params.row.stocks || [];
                const total = stocks.reduce((acc: number, s: ProductStock) => acc + s.quantity, 0);
                return (
                    <Tooltip 
                        title={stocks.length > 0 ? stocks.map((s: ProductStock) => `${s.locationName}: ${s.quantity}`).join(' | ') : 'Stok Yok'}
                        arrow
                    >
                        <Chip label={`${total} Adet`} color={total > 0 ? "primary" : "default"} variant="outlined" />
                    </Tooltip>
                );
            }
        },
        {
            field: 'transactions',
            headerName: 'Stok İşlemi',
            minWidth: 180,
            flex: 1,
            renderCell: (params) => (
                <Box>
                    <Button sx={{ minWidth: 0, mr: 1 }} variant="outlined" color="success" onClick={() => {
                        setTxProductId(params.row.id);
                        setTxProductName(params.row.name);
                        setTxType('input');
                        setTxOpen(true);
                    }}>
                        <AddCircleOutline fontSize="small" />
                    </Button>
                    <Button sx={{ minWidth: 0, mr: 1 }} variant="outlined" color="error" onClick={() => {
                        setTxProductId(params.row.id);
                        setTxProductName(params.row.name);
                        setTxType('output');
                        setTxStocks(params.row.stocks || []);
                        setTxOpen(true);
                    }}>
                        <RemoveCircleOutline fontSize="small" />
                    </Button>
                    <Button sx={{ minWidth: 0 }} variant="outlined" color="primary" onClick={() => {
                        setTxProductId(params.row.id);
                        setTxProductName(params.row.name);
                        setTxStocks(params.row.stocks || []);
                        setTransferOpen(true);
                    }}>
                        <SwapHoriz fontSize="small" />
                    </Button>
                </Box>
            )
        },
        {
            field: 'actions',
            headerName: 'Düzenle/Sil',
            minWidth: 120,
            flex: 0.5,
            renderCell: (params) => (
                <Box>
                    <Button sx={{ minWidth: 0, mr: 1 }} variant="text" color="primary" onClick={() => {
                        setCurrentProduct(params.row);
                        setIsEdit(true);
                        setOpen(true);
                    }}>
                        <EditIcon fontSize="small" />
                    </Button>
                    <Button sx={{ minWidth: 0 }} variant="text" color="error" onClick={() => {
                        setDeleteId(params.row.id);
                        setDeleteOpen(true);
                    }}>
                        <DeleteIcon fontSize="small" />
                    </Button>
                </Box>
            )
        }
    ], []);

    return (
        <>
            <Card className="glass-panel" sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                        <TextField
                            placeholder="Ürün veya SKU ile ara..."
                            variant="filled"
                            size="small"
                            sx={{ width: '250px' }}
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setPaginationModel({ ...paginationModel, page: 0 });
                            }}
                        />
                        <FormControl variant="filled" size="small" sx={{ minWidth: 150 }}>
                            <InputLabel id="zone-filter-label" shrink>Depo Filtresi</InputLabel>
                            <Select
                                labelId="zone-filter-label"
                                value={selectedZone}
                                displayEmpty
                                onChange={(e) => {
                                    setSelectedZone(e.target.value);
                                    setPaginationModel({ ...paginationModel, page: 0 });
                                }}
                                label="Depo Filtresi"
                            >
                                <MenuItem value="">
                                    <em>Tüm Depolar</em>
                                </MenuItem>
                                {zones.map(z => <MenuItem key={z} value={z}>{z}</MenuItem>)}
                            </Select>
                        </FormControl>
                        <FormControlLabel
                            control={
                                <Switch 
                                    checked={hasStock} 
                                    onChange={(e) => {
                                        setHasStock(e.target.checked);
                                        setPaginationModel({ ...paginationModel, page: 0 });
                                    }} 
                                />
                            }
                            label="Sadece Stoğu Olanlar"
                        />
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => {
                            setCurrentProduct({});
                            setIsEdit(false);
                            setOpen(true);
                        }}
                    >
                        Yeni Ürün
                    </Button>
                </Box>
                <DataGrid
                    rows={products}
                    columns={columns}
                    rowCount={totalCount}
                    loading={loading}
                    pageSizeOptions={[5, 10, 25]}
                    paginationModel={paginationModel}
                    paginationMode="server"
                    onPaginationModelChange={setPaginationModel}
                    autoHeight
                    disableRowSelectionOnClick
                />
            </Card>

            <Dialog open={open} onClose={() => setOpen(false)} PaperProps={{ sx: { minWidth: 400, borderRadius: 3 } }}>
                <DialogTitle fontWeight="bold">{isEdit ? 'Ürünü Düzenle' : 'Yeni Ürün Tanımla'}</DialogTitle>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 3 }}>
                    <TextField
                        label="Ürün Adı"
                        variant="filled"
                        value={currentProduct.name || ''}
                        onChange={e => setCurrentProduct({ ...currentProduct, name: e.target.value })}
                    />
                    <TextField
                        label="SKU Kodu (Benzersiz)"
                        variant="filled"
                        value={currentProduct.skuCode || ''}
                        onChange={e => setCurrentProduct({ ...currentProduct, skuCode: e.target.value })}
                    />
                    <TextField
                        label="Açıklama"
                        multiline rows={3}
                        variant="filled"
                        value={currentProduct.description || ''}
                        onChange={e => setCurrentProduct({ ...currentProduct, description: e.target.value })}
                    />
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpen(false)} color="inherit" sx={{ mr: 1 }}>İptal</Button>
                    <Button onClick={handleSave} variant="contained">Kaydet</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle>Emin misiniz?</DialogTitle>
                <DialogContent>
                    <Typography>Bu ürünü katalogdan silmek istediğinize emin misiniz? İşlem geri alınamaz.</Typography>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setDeleteOpen(false)} color="inherit">İptal Vazgeç</Button>
                    <Button onClick={handleDelete} color="error" variant="contained">Evet, Kesinlikle Sil</Button>
                </DialogActions>
            </Dialog>

            <TransactionModal
                open={txOpen}
                onClose={() => setTxOpen(false)}
                productId={txProductId}
                productName={txProductName}
                type={txType}
                stocks={txType === 'output' ? txStocks : []}
                onSuccess={() => {
                    showNotify('Stok işlemi başarıyla gerçekleşti!');
                    fetchProducts();
                }}
            />

            <TransferModal
                open={transferOpen}
                onClose={() => setTransferOpen(false)}
                productId={txProductId}
                productName={txProductName}
                stocks={txStocks}
                onSuccess={() => {
                    showNotify('Transfer işlemi başarıyla gerçekleşti!');
                    fetchProducts();
                }}
            />

            <Notification
                open={notify.open}
                message={notify.message}
                severity={notify.severity}
                onClose={() => setNotify({ ...notify, open: false })}
            />
        </>
    );
}
