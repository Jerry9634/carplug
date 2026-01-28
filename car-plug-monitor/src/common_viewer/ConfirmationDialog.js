import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Dialog from '@mui/material/Dialog';

import DialogContentText from '@mui/material/DialogContentText';


function ConfirmationDialogRaw(props) {
    const { onClose, open, title, message, ...other } = props;

    const handleCancel = () => {
        onClose(false);
    };

    const handleOk = () => {
        onClose(true);
    };

    return (
        <Dialog
            sx={{ '& .MuiDialog-paper': { width: '80%', maxHeight: 435 } }}
            maxWidth="xs"
            open={open}
            {...other}
        >
            <DialogTitle>{title}</DialogTitle>
            <DialogContent dividers>
                <span style={{ fontSize: "large" }}>{message}</span>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleOk} size="large" sx={{ fontSize: "large" }}>
                    Ok
                </Button>
                <Button autoFocus onClick={handleCancel} size="large" sx={{ fontSize: "large" }}>
                    Cancel
                </Button>
            </DialogActions>
        </Dialog>
    );
}

ConfirmationDialogRaw.propTypes = {
    onClose: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    title: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
};

export default function ConfirmationDialog({
    open, setOpen, title, message, doThis
}) {

    const handleClose = (confirm) => {
        setOpen(false);
        if (confirm) {
            doThis();
        }
    };

    return (
        <>
            {open &&
                <ConfirmationDialogRaw
                    id="ringtone-menu"
                    keepMounted
                    open={open}
                    onClose={handleClose}
                    title={title}
                    message={message}
                />
            }
        </>
    );
}

export function AlertDialog({
    title, message, open, onClose
}) {

    const handleClose = () => {
        onClose();
    };

    return (
        <Dialog
            sx={{ '& .MuiDialog-paper': { width: '80%', maxHeight: 435 } }}
            open={open}
            onClose={handleClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">
                {title}
            </DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    {message}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} size="large" sx={{ fontSize: "large" }}>
                    Ok
                </Button>
            </DialogActions>
        </Dialog>
    );
}