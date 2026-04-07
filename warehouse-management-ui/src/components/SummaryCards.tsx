import { Box, Card, CardContent, Typography } from '@mui/material';

interface SummaryCardsProps {
    productCount: number;
    locationCount: number;
}

export default function SummaryCards({ productCount, locationCount }: SummaryCardsProps) {
    return (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 4, mb: 4 }}>
            <Box>
                <Card className="glass-panel">
                    <CardContent>
                        <Typography color="textSecondary" gutterBottom>Toplam Ürün Çeşidi</Typography>
                        <Typography variant="h3" fontWeight="bold">{productCount}</Typography>
                    </CardContent>
                </Card>
            </Box>
            <Box>
                <Card className="glass-panel">
                    <CardContent>
                        <Typography color="textSecondary" gutterBottom>Aktif Depo Bölgesi</Typography>
                        <Typography variant="h3" fontWeight="bold">{locationCount}</Typography>
                    </CardContent>
                </Card>
            </Box>
            <Box>
                <Card className="glass-panel">
                    <CardContent>
                        <Typography color="textSecondary" gutterBottom>Sistem Durumu</Typography>
                        <Typography variant="h3" fontWeight="bold" color="success.main">Stabil ⭐</Typography>
                    </CardContent>
                </Card>
            </Box>
        </Box>
    );
}
