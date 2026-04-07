import { useState, useEffect } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Typography, Box } from '@mui/material';
import { transactionService } from '../services/transactionService';
import { locationService, type Location } from '../services/locationService';
import { type ProductStock } from '../services/productService';
import { ArrowForward } from '@mui/icons-material';

interface TransferModalProps {
    open: boolean;
    onClose: () => void;
    productId: string;
    productName: string;
    stocks: ProductStock[];
    onSuccess: () => void;
}

export default function TransferModal({ open, onClose, productId, productName, stocks, onSuccess }: TransferModalProps) {
    const [locations, setLocations] = useState<Location[]>([]);
    const [fromLocationId, setFromLocationId] = useState('');
    const [toLocationId, setToLocationId] = useState('');
    const [quantity, setQuantity] = useState<number | ''>('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    
    // For confirmation
    const [confirmOpen, setConfirmOpen] = useState(false);

    useEffect(() => {
        if (open) {
            locationService.getLocations(1, 100).then(res => setLocations(res.data || []));
            setFromLocationId('');
            setToLocationId('');
            setQuantity('');
            setNotes('');
            setConfirmOpen(false);
        }
    }, [open]);

    const handleInitialSave = () => {
        if (!fromLocationId || !toLocationId || !quantity) return;
        if (fromLocationId === toLocationId) {
            alert('Kaynak ve Hedef lokasyonlar aynı olamaz!');
            return;
        }
        
        const stockInfo = stocks.find(s => s.locationId === fromLocationId);
        if (!stockInfo || stockInfo.quantity < Number(quantity)) {
            alert('Kaynak lokasyonda yeterli stok bulunmuyor!');
            return;
        }
        
        setConfirmOpen(true);
    };

    const handleConfirmTransfer = async () => {
        setLoading(true);
        try {
            await transactionService.processTransfer({
                productId,
                fromLocationId,
                toLocationId,
                quantity: Number(quantity),
                notes
            });
            onSuccess();
            onClose();
        } catch (e: any) {
            console.error("Transfer Error", e);
            alert("İşlem başarısız: " + (e.response?.data?.message || e.message));
        }
        setLoading(false);
        setConfirmOpen(false);
    };

    return (
        <>
            <Dialog open={open} onClose={() => !loading && onClose()} PaperProps={{ sx: { minWidth: 400, borderRadius: 3 } }}>
                <DialogTitle fontWeight="bold" color="primary.main">
                    Depolar Arası Transfer - {productName}
                </DialogTitle>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 3 }}>
                    <TextField
                        select
                        label="Kaynak Depo (Nereden)"
                        variant="filled"
                        value={fromLocationId}
                        onChange={e => setFromLocationId(e.target.value)}
                    >
                        {stocks.map((s) => (
                            <MenuItem key={s.locationId} value={s.locationId}>
                                {s.locationName} (Mevcut: {s.quantity})
                            </MenuItem>
                        ))}
                        {stocks.length === 0 && <MenuItem disabled>Ürünün stoğu olan depo yok</MenuItem>}
                    </TextField>

                    <Box sx={{ display: 'flex', justifyContent: 'center', color: 'text.secondary' }}>
                        <ArrowForward />
                    </Box>

                    <TextField
                        select
                        label="Hedef Depo (Nereye)"
                        variant="filled"
                        value={toLocationId}
                        onChange={e => setToLocationId(e.target.value)}
                    >
                        {locations.map((loc) => (
                            <MenuItem key={loc.id} value={loc.id}>
                                {loc.zone} - {loc.shelf}
                            </MenuItem>
                        ))}
                        {locations.length === 0 && <MenuItem disabled>Kayıtlı Lokasyon Yok</MenuItem>}
                    </TextField>

                    <TextField
                        label="Transfer Miktarı"
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
                    <Button onClick={handleInitialSave} variant="contained" color="primary" disabled={loading}>
                        Transferi Başlat
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Confirmation Dialog */}
            <Dialog open={confirmOpen} onClose={() => !loading && setConfirmOpen(false)} PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle>Transfer Onayı</DialogTitle>
                <DialogContent>
                    <Typography>
                        <b>{quantity}</b> adet <b>{productName}</b>, belirtilen yeni depoya transfer edilecektir. Bu işlemi onaylıyor musunuz?
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setConfirmOpen(false)} color="inherit" disabled={loading}>Vazgeç</Button>
                    <Button onClick={handleConfirmTransfer} color="primary" variant="contained" disabled={loading}>Evet, Transferi Onayla</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
