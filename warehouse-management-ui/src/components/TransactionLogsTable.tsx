import { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Box, Card, Typography, Chip, Tooltip, FormControl, InputLabel, Select, MenuItem,
    type AlertColor
} from '@mui/material';
import { DataGrid, type GridColDef, type GridPaginationModel } from '@mui/x-data-grid';
import { transactionService, type TransactionLog } from '../services/transactionService';
import Notification from './Notification';
import { History as HistoryIcon } from '@mui/icons-material';

const TYPE_CONFIG: Record<string, { label: string; color: 'success' | 'error' | 'info' | 'warning' }> = {
    In: { label: 'Giriş', color: 'success' },
    Out: { label: 'Çıkış', color: 'error' },
    Transfer: { label: 'Transfer', color: 'info' },
};

function formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    try {
        return new Intl.DateTimeFormat('tr-TR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        }).format(new Date(dateStr));
    } catch {
        return dateStr;
    }
}

export default function TransactionLogsTable() {
    const [logs, setLogs] = useState<TransactionLog[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 25 });
    const [transactionType, setTransactionType] = useState('');
    const [notify, setNotify] = useState<{ open: boolean; message: string; severity: AlertColor }>({
        open: false, message: '', severity: 'success'
    });

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        try {
            const res = await transactionService.getLogs(
                paginationModel.page + 1,
                paginationModel.pageSize,
                transactionType
            );
            setLogs(res.data || []);
            setTotalCount(res.totalCount || 0);
        } catch (e) {
            console.error('Log verisi alınamadı:', e);
            setNotify({ open: true, message: 'İşlem geçmişi yüklenemedi.', severity: 'error' });
        }
        setLoading(false);
    }, [paginationModel, transactionType]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const columns = useMemo<GridColDef[]>(() => [
        {
            field: 'createdAt',
            headerName: 'Tarih & Saat',
            flex: 1.2,
            minWidth: 150,
            renderCell: (params) => (
                <Typography variant="body2" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', height: '100%' }}>
                    {formatDate(params.value)}
                </Typography>
            )
        },
        {
            field: 'transactionType',
            headerName: 'İşlem Tipi',
            flex: 0.8,
            minWidth: 110,
            renderCell: (params) => {
                const cfg = TYPE_CONFIG[params.value] ?? { label: params.value, color: 'warning' as const };
                return (
                    <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                        <Chip
                            label={cfg.label}
                            color={cfg.color}
                            size="small"
                            sx={{ fontWeight: 600, minWidth: 72 }}
                        />
                    </Box>
                );
            }
        },
        {
            field: 'productName',
            headerName: 'Ürün',
            flex: 1.5,
            minWidth: 160,
            renderCell: (params) => (
                <Typography variant="body2" fontWeight={500} sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                    {params.value}
                </Typography>
            )
        },
        {
            field: 'locationName',
            headerName: 'Lokasyon',
            flex: 1,
            minWidth: 130,
            renderCell: (params) => (
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', height: '100%', color: 'primary.main' }}>
                    {params.value}
                </Typography>
            )
        },
        {
            field: 'quantity',
            headerName: 'Miktar',
            flex: 0.6,
            minWidth: 80,
            type: 'number',
            renderCell: (params) => {
                const type = params.row.transactionType;
                const color = type === 'In' ? 'success.main' : type === 'Out' ? 'error.main' : 'info.main';
                const prefix = type === 'In' ? '+' : type === 'Out' ? '-' : '↔';
                return (
                    <Typography variant="body2" fontWeight={700} sx={{ color, display: 'flex', alignItems: 'center', height: '100%' }}>
                        {prefix}{params.value}
                    </Typography>
                );
            }
        },
        {
            field: 'notes',
            headerName: 'Notlar',
            flex: 1.5,
            minWidth: 160,
            renderCell: (params) => (
                <Tooltip title={params.value || ''} placement="top">
                    <Typography
                        variant="body2"
                        sx={{
                            display: 'flex', alignItems: 'center', height: '100%',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            maxWidth: '100%', color: 'text.secondary'
                        }}
                    >
                        {params.value || '—'}
                    </Typography>
                </Tooltip>
            )
        }
    ], []);

    return (
        <>
            <Card className="glass-panel" sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, gap: 2, flexWrap: 'wrap' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <HistoryIcon sx={{ color: 'primary.main', fontSize: 28 }} />
                        <Box>
                            <Typography variant="h6" fontWeight={700}>
                                Geçmiş İşlemler
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                Stok giriş, çıkış ve transfer hareketleri · {totalCount} kayıt
                            </Typography>
                        </Box>
                    </Box>

                    <FormControl variant="filled" size="small" sx={{ minWidth: 150 }}>
                        <InputLabel id="tx-type-filter-label" shrink>İşlem Tipi</InputLabel>
                        <Select
                            labelId="tx-type-filter-label"
                            value={transactionType}
                            displayEmpty
                            onChange={(e) => {
                                setTransactionType(e.target.value);
                                setPaginationModel({ ...paginationModel, page: 0 });
                            }}
                            label="İşlem Tipi"
                        >
                            <MenuItem value="">
                                <em>Tümü</em>
                            </MenuItem>
                            <MenuItem value="In">Giriş</MenuItem>
                            <MenuItem value="Out">Çıkış</MenuItem>
                        </Select>
                    </FormControl>
                </Box>

                <DataGrid
                    rows={logs}
                    columns={columns}
                    rowCount={totalCount}
                    loading={loading}
                    pageSizeOptions={[25, 50, 100]}
                    paginationModel={paginationModel}
                    paginationMode="server"
                    onPaginationModelChange={setPaginationModel}
                    autoHeight
                    disableRowSelectionOnClick
                    sx={{
                        '& .MuiDataGrid-row:hover': {
                            backgroundColor: 'rgba(99, 102, 241, 0.06)',
                        }
                    }}
                />
            </Card>

            <Notification
                open={notify.open}
                message={notify.message}
                severity={notify.severity}
                onClose={() => setNotify({ ...notify, open: false })}
            />
        </>
    );
}
