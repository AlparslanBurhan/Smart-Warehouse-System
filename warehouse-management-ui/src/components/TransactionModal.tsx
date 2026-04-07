import { useState, useEffect } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem } from '@mui/material';
import { transactionService } from '../services/transactionService';
import { locationService, type Location as WarehouseLocation } from '../services/locationService';
import type { ProductStock } from '../services/productService';

interface TransactionModalProps {
    open: boolean;
    onClose: () => void;
    productId: string;
    productName: string;
    type: 'input' | 'output';
    stocks?: ProductStock[];
    onSuccess: () => void;
}

export default function TransactionModal({ open, onClose, productId, productName, type, stocks, onSuccess }: TransactionModalProps) {
    const [locations, setLocations] = useState<WarehouseLocation[]>([]);
    const [locationId, setLocationId] = useState('');
    const [quantity, setQuantity] = useState<number | ''>('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            if (type === 'output' && stocks && stocks.length > 0) {
                // Eğer çıkış yapılıyorsa ve stok bilgisi varsa, sadece o lokasyonları kullan
                const availableLocations = stocks.map(s => ({
                    id: s.locationId,
                    zone: s.locationName.split(' - ')[0],
                    shelf: s.locationName.split(' - ')[1],
                    companyId: '' // UI için gerekli değil
                } as WarehouseLocation));
                setLocations(availableLocations);
            } else {
                // Giriş yapılıyorsa veya stok bilgisi yoksa (fail-safe), tüm lokasyonları çek
                locationService.getLocations(1, 100).then(res => setLocations(res.data || []));
            }
            setLocationId('');
            setQuantity('');
            setNotes('');
        }
    }, [open, type, stocks]);

    const handleSave = async () => {
        if (!locationId || !quantity) return;
        setLoading(true);
        try {
            const data = { productId, locationId, quantity: Number(quantity), notes };
            if (type === 'input') {
                await transactionService.processInput(data);
            } else {
                await transactionService.processOutput(data);
            }
            onSuccess();
            onClose();
        } catch (e: any) {
            console.error("Transaction Error", e);
            alert("İşlem başarısız: " + (e.response?.data?.message || e.message));
        }
        setLoading(false);
    };

    return (
        <Dialog open={open} onClose={onClose} PaperProps={{ sx: { minWidth: 400, borderRadius: 3 } }}>
            <DialogTitle fontWeight="bold" color={type === 'input' ? 'success.main' : 'error.main'}>
                {type === 'input' ? 'Stok Girişi Yap' : 'Stok Çıkışı Yap'} - {productName}
            </DialogTitle>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 3 }}>
                <TextField
                    select
                    label="Depo Lokasyonu"
                    variant="filled"
                    value={locationId}
                    onChange={e => setLocationId(e.target.value)}
                >
                    {locations.map((loc) => (
                        <MenuItem key={loc.id} value={loc.id}>
                            {loc.zone} - {loc.shelf}
                        </MenuItem>
                    ))}
                    {locations.length === 0 && <MenuItem disabled>Kayıtlı Lokasyon Yok</MenuItem>}
                </TextField>
                <TextField
                    label="Miktar"
                    type="number"
                    variant="filled"
                    value={quantity}
                    onChange={e => setQuantity(Number(e.target.value))}
                />
                <TextField
                    label="Not / Açıklama (İsteğe Bağlı)"
                    multiline rows={2}
                    variant="filled"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                />
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
                <Button onClick={onClose} color="inherit" sx={{ mr: 1 }} disabled={loading}>İptal</Button>
                <Button onClick={handleSave} variant="contained" color={type === 'input' ? 'success' : 'error'} disabled={loading}>
                    İşlemi Tamamla
                </Button>
            </DialogActions>
        </Dialog>
    );
}
