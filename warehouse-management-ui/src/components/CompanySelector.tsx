import React, { useState, useEffect } from 'react';
import { 
    Box, 
    Button, 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogActions, 
    TextField, 
    MenuItem, 
    Select, 
    FormControl, 
    InputLabel, 
    Typography,
    Divider,
    IconButton,
    Tooltip
} from '@mui/material';
import { Add as AddIcon, Business as BusinessIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { companyService, type Company } from '../services/companyService';
import { getCompanyId, setCompanyId as saveCompanyId } from '../services/api';

export default function CompanySelector() {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [selectedId, setSelectedId] = useState(getCompanyId());
    const [open, setOpen] = useState(false);
    const [newCompanyName, setNewCompanyName] = useState('');
    const [loading, setLoading] = useState(false);

    const fetchCompanies = async () => {
        try {
            const res = await companyService.getCompanies();
            if (res.success) {
                setCompanies(res.data);
            }
        } catch (error) {
            console.error("Şirketler yüklenemedi:", error);
        }
    };

    useEffect(() => {
        fetchCompanies();
    }, []);

    const handleSwitch = (id: string) => {
        saveCompanyId(id);
        setSelectedId(id);
        // Sayfayı yenileyerek tüm servislerin yeni companyId'yi almasını sağlıyoruz
        window.location.reload();
    };

    const handleCreate = async () => {
        if (!newCompanyName.trim()) return;
        setLoading(true);
        try {
            const res = await companyService.createCompany(newCompanyName);
            if (res.success) {
                await fetchCompanies();
                setOpen(false);
                setNewCompanyName('');
                // Opsiyonel: Yeni oluşturulan şirkete hemen geçiş yap
                // handleSwitch(res.data.companyId);
            }
        } catch (error) {
            alert("Şirket oluşturulurken hata oluştu.");
        }
        setLoading(false);
    };

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mr: 2 }}>
            <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel id="company-select-label" sx={{ color: 'primary.light' }}>Aktif Şirket</InputLabel>
                <Select
                    labelId="company-select-label"
                    value={selectedId}
                    label="Aktif Şirket"
                    onChange={(e) => handleSwitch(e.target.value)}
                    sx={{ 
                        borderRadius: 2,
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        '& .MuiSelect-select': { display: 'flex', alignItems: 'center', gap: 1 }
                    }}
                >
                    {companies.map((c) => (
                        <MenuItem key={c.id} value={c.companyId}>
                            <BusinessIcon fontSize="small" sx={{ mr: 1, opacity: 0.7 }} />
                            {c.name}
                        </MenuItem>
                    ))}
                    {companies.length === 0 && selectedId === "DemoCompany" && (
                        <MenuItem value="DemoCompany">Demo Şirketi</MenuItem>
                    )}
                </Select>
            </FormControl>

            <Tooltip title="Yeni Şirket Ekle">
                <IconButton 
                    onClick={() => setOpen(true)} 
                    color="primary" 
                    sx={{ 
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        '&:hover': { backgroundColor: 'rgba(59, 130, 246, 0.2)' }
                    }}
                >
                    <AddIcon />
                </IconButton>
            </Tooltip>

            <Tooltip title="Yenile">
                <IconButton onClick={fetchCompanies} size="small">
                    <RefreshIcon fontSize="small" />
                </IconButton>
            </Tooltip>

            <Dialog open={open} onClose={() => !loading && setOpen(false)} PaperProps={{ sx: { borderRadius: 3, minWidth: 350 } }}>
                <DialogTitle sx={{ fontWeight: 'bold' }}>Yeni Şirket Tanımla</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Sistemde yeni bir şirket oluşturarak verilerinizi izole bir şekilde yönetebilirsiniz.
                    </Typography>
                    <TextField
                        autoFocus
                        fullWidth
                        label="Şirket Adı"
                        variant="filled"
                        value={newCompanyName}
                        onChange={(e) => setNewCompanyName(e.target.value)}
                        disabled={loading}
                    />
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpen(false)} color="inherit" disabled={loading}>İptal</Button>
                    <Button onClick={handleCreate} variant="contained" disabled={loading || !newCompanyName.trim()}>
                        Şirketi Oluştur
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
