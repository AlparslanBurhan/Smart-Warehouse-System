import { Snackbar, Alert, type AlertColor } from '@mui/material';

interface NotificationProps {
    open: boolean;
    message: string;
    severity: AlertColor;
    onClose: () => void;
}

export default function Notification({ open, message, severity, onClose }: NotificationProps) {
    return (
        <Snackbar
            open={open}
            autoHideDuration={4000}
            onClose={onClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
            <Alert
                onClose={onClose}
                severity={severity}
                variant="filled"
                sx={{
                    width: '100%',
                    backdropFilter: 'blur(12px)',
                    fontWeight: 600,
                    borderRadius: 2,
                }}
            >
                {message}
            </Alert>
        </Snackbar>
    );
}
