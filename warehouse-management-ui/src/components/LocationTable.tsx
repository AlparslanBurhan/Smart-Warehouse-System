import { useState, useEffect, useMemo } from 'react';
import {
    Box, Button, Card, TextField, Dialog, DialogTitle, DialogContent, DialogActions,
    Typography, Tabs, Tab, type AlertColor
} from '@mui/material';
import { DataGrid, type GridColDef, type GridPaginationModel } from '@mui/x-data-grid';
import { locationService, type Location } from '../services/locationService';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import Notification from './Notification';

export default function LocationTable() {
    const [locations, setLocations] = useState<Location[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 5 });
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // Ana modal durumu
    const [open, setOpen] = useState(false);
    const [modalTab, setModalTab] = useState<0 | 1>(0); // 0=Tekli, 1=Toplu

    // Tekli ekleme/düzenleme
    const [currentLocation, setCurrentLocation] = useState<Partial<Location>>({});
    const [isEdit, setIsEdit] = useState(false);

    // Toplu ekleme formu
    const [batchForm, setBatchForm] = useState({ zone: '', prefixStart: 'A', prefixEnd: 'A', numberEnd: 5 });

    // Silme
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteId, setDeleteId] = useState('');

    // Bildirim
    const [notify, setNotify] = useState<{ open: boolean; message: string; severity: AlertColor }>({ open: false, message: '', severity: 'success' });
    const showNotify = (message: string, severity: AlertColor = 'success') => setNotify({ open: true, message, severity });

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const fetchLocations = async () => {
        setLoading(true);
        try {
            const res = await locationService.getLocations(paginationModel.page + 1, paginationModel.pageSize, debouncedSearch);
            setLocations(res.data || []);
            setTotalCount(res.totalCount || 0);
        } catch (e) {
            console.error('Error fetching locations:', e);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchLocations();
    }, [paginationModel, debouncedSearch]);

    const handleOpenNew = () => {
        setCurrentLocation({});
        setIsEdit(false);
        setModalTab(0);
        setBatchForm({ zone: '', prefixStart: 'A', prefixEnd: 'A', numberEnd: 5 });
        setOpen(true);
    };

    const handleSaveSingle = async () => {
        try {
            if (isEdit) {
                await locationService.updateLocation(currentLocation);
                showNotify('Lokasyon başarıyla güncellendi!');
            } else {
                await locationService.createLocation(currentLocation);
                showNotify('Yeni lokasyon başarıyla eklendi!');
            }
            setOpen(false);
            fetchLocations();
        } catch (e: any) {
            showNotify('İşlem başarısız: ' + (e.response?.data?.message || e.message), 'error');
        }
    };

    const handleSaveBatch = async () => {
        if (!batchForm.zone.trim()) {
            showNotify('Lütfen bölge adını (Zone) giriniz.', 'warning');
            return;
        }
        if (!batchForm.prefixStart || !batchForm.prefixEnd) {
            showNotify('Lütfen harf aralığını giriniz.', 'warning');
            return;
        }
        if (batchForm.prefixStart.toUpperCase() > batchForm.prefixEnd.toUpperCase()) {
            showNotify('Başlangıç harfi bitiş harfinden büyük olamaz.', 'error');
            return;
        }
        try {
            await locationService.createBatch({
                zone: batchForm.zone,
                prefixStart: batchForm.prefixStart.toUpperCase(),
                prefixEnd: batchForm.prefixEnd.toUpperCase(),
                numberEnd: batchForm.numberEnd
            });
            const total = (batchForm.prefixEnd.toUpperCase().charCodeAt(0) - batchForm.prefixStart.toUpperCase().charCodeAt(0) + 1) * batchForm.numberEnd;
            showNotify(`Toplu oluşturma tamamlandı! ${total} lokasyon eklendi.`);
            setOpen(false);
            fetchLocations();
        } catch (e: any) {
            showNotify('Toplu ekleme başarısız: ' + (e.response?.data?.message || e.message), 'error');
        }
    };

    const handleDelete = async () => {
        try {
            await locationService.deleteLocation(deleteId);
            showNotify('Lokasyon başarıyla silindi!');
            setDeleteOpen(false);
            fetchLocations();
        } catch (e: any) {
            showNotify('Silme başarısız: ' + (e.response?.data?.message || e.message), 'error');
        }
    };

    const columns = useMemo<GridColDef[]>(() => [
        { field: 'zone', headerName: 'Depo Bölgesi (Zone)', flex: 1, minWidth: 160 },
        { field: 'shelf', headerName: 'Raf (Shelf)', flex: 1, minWidth: 120 },
        {
            field: 'actions',
            headerName: 'İşlemler',
            width: 160,
            sortable: false,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, height: '100%' }}>
                    <Button
                        sx={{ minWidth: 0 }}
                        variant="outlined"
                        color="primary"
                        size="small"
                        onClick={() => {
                            setCurrentLocation(params.row);
                            setIsEdit(true);
                            setModalTab(0);
                            setOpen(true);
                        }}
                    >
                        <EditIcon fontSize="small" />
                    </Button>
                    <Button
                        sx={{ minWidth: 0 }}
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => {
                            setDeleteId(params.row.id);
                            setDeleteOpen(true);
                        }}
                    >
                        <DeleteIcon fontSize="small" />
                    </Button>
                </Box>
            )
        }
    ], []);

    return (
        <>
            <Card className="glass-panel" sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                    <TextField
                        placeholder="Bölge veya Raf ara..."
                        variant="filled"
                        size="small"
                        sx={{ width: '300px' }}
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setPaginationModel({ ...paginationModel, page: 0 });
                        }}
                    />
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        size="large"
                        onClick={handleOpenNew}
                    >
                        Yeni Lokasyon Ekle
                    </Button>
                </Box>
                <DataGrid
                    rows={locations}
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

            {/* ——— Ekleme / Düzenleme Modalı ——— */}
            <Dialog open={open} onClose={() => setOpen(false)} PaperProps={{ sx: { minWidth: 440, borderRadius: 3 } }}>
                <DialogTitle fontWeight="bold">
                    {isEdit ? 'Lokasyonu Düzenle' : 'Yeni Lokasyon'}
                </DialogTitle>

                {/* Tekli/Toplu sekmesi — sadece yeni eklemede göster */}
                {!isEdit && (
                    <Box sx={{ px: 3 }}>
                        <Tabs
                            value={modalTab}
                            onChange={(_e, v) => setModalTab(v)}
                            variant="fullWidth"
                            sx={{ borderBottom: 1, borderColor: 'divider', mb: 0 }}
                        >
                            <Tab label="Tekli Ekle" />
                            <Tab label="Toplu Ekle" />
                        </Tabs>
                    </Box>
                )}

                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 3 }}>
                    {/* ——— TEKLİ ——— */}
                    {(isEdit || modalTab === 0) && (
                        <>
                            <TextField
                                label="Depo Bölgesi (Zone)  Örn: A Modülü"
                                variant="filled"
                                value={currentLocation.zone || ''}
                                onChange={e => setCurrentLocation({ ...currentLocation, zone: e.target.value })}
                                fullWidth
                            />
                            <TextField
                                label="Raf (Shelf)  Örn: R-14"
                                variant="filled"
                                value={currentLocation.shelf || ''}
                                onChange={e => setCurrentLocation({ ...currentLocation, shelf: e.target.value })}
                                fullWidth
                            />
                        </>
                    )}

                    {/* ——— TOPLU ——— */}
                    {!isEdit && modalTab === 1 && (
                        <>
                            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                                Harf aralığı ve sayı limiti girerek otomatik lokasyonlar oluşturun.
                                <br />
                                <strong>Örn:</strong> A → C, limit 5 → A-1 ... A-5, B-1 ... B-5, C-1 ... C-5 (15 adet)
                            </Typography>
                            <TextField
                                label="Bölge Adı (Zone)  Örn: Ana Depo"
                                variant="filled"
                                value={batchForm.zone}
                                onChange={e => setBatchForm({ ...batchForm, zone: e.target.value })}
                                fullWidth
                            />
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <TextField
                                    label="Başlangıç Harfi"
                                    variant="filled"
                                    value={batchForm.prefixStart}
                                    inputProps={{ maxLength: 1, style: { textTransform: 'uppercase' } }}
                                    onChange={e => setBatchForm({ ...batchForm, prefixStart: e.target.value.replace(/[^a-zA-Z]/g, '') })}
                                    sx={{ flex: 1 }}
                                    helperText="Örn: A"
                                />
                                <TextField
                                    label="Bitiş Harfi"
                                    variant="filled"
                                    value={batchForm.prefixEnd}
                                    inputProps={{ maxLength: 1, style: { textTransform: 'uppercase' } }}
                                    onChange={e => setBatchForm({ ...batchForm, prefixEnd: e.target.value.replace(/[^a-zA-Z]/g, '') })}
                                    sx={{ flex: 1 }}
                                    helperText="Örn: C"
                                />
                                <TextField
                                    label="Sayı Limiti"
                                    variant="filled"
                                    type="number"
                                    value={batchForm.numberEnd}
                                    inputProps={{ min: 1, max: 100 }}
                                    onChange={e => setBatchForm({ ...batchForm, numberEnd: Math.max(1, parseInt(e.target.value) || 1) })}
                                    sx={{ flex: 1 }}
                                    helperText="Örn: 10"
                                />
                            </Box>
                            {batchForm.prefixStart && batchForm.prefixEnd && batchForm.numberEnd > 0 && (
                                <Box sx={{ backgroundColor: 'rgba(99,102,241,0.08)', borderRadius: 2, p: 1.5 }}>
                                    <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600 }}>
                                        Önizleme: {batchForm.prefixStart.toUpperCase()}-1 ... {batchForm.prefixEnd.toUpperCase()}-{batchForm.numberEnd}
                                        {' '}→ Toplam {
                                            Math.max(0, batchForm.prefixEnd.toUpperCase().charCodeAt(0) - batchForm.prefixStart.toUpperCase().charCodeAt(0) + 1) * batchForm.numberEnd
                                        } lokasyon
                                    </Typography>
                                </Box>
                            )}
                        </>
                    )}
                </DialogContent>

                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpen(false)} color="inherit" sx={{ mr: 1 }}>İptal</Button>
                    {(isEdit || modalTab === 0) && (
                        <Button onClick={handleSaveSingle} variant="contained">Kaydet</Button>
                    )}
                    {!isEdit && modalTab === 1 && (
                        <Button onClick={handleSaveBatch} variant="contained" color="success">
                            Toplu Oluştur
                        </Button>
                    )}
                </DialogActions>
            </Dialog>

            {/* ——— Silme Onay Modalı ——— */}
            <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle>Emin misiniz?</DialogTitle>
                <DialogContent>
                    <Typography>Bu lokasyonu silmek istediğinize emin misiniz? İşlem geri alınamaz.</Typography>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setDeleteOpen(false)} color="inherit">İptal</Button>
                    <Button onClick={handleDelete} color="error" variant="contained">Sil</Button>
                </DialogActions>
            </Dialog>

            <Notification
                open={notify.open}
                message={notify.message}
                severity={notify.severity}
                onClose={() => setNotify({ ...notify, open: false })}
            />
        </>
    );
}
