import { useCallback, useMemo } from 'react';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';

import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

import Close from "@mui/icons-material/Close";

import { StyledTableCell } from "../common_viewer/CustomStyles";


export const VssSignalDetails = ({ vssKey, vssSignal, open, onClose }) => {
    
    const handleClose = useCallback(() => {
        onClose();
    }, [onClose]);

    const getValueString = useCallback((value) => {
        if (Array.isArray(value)) {
            let ret = "[ ";
            for (let i = 0; i < (value.length - 1); i++) {
                ret += value[i] + ", ";
            }
            if (value.length > 0) {
                ret += value[value.length - 1] + " ]";
            }
            return ret;
        }
        else {
            return value;
        }
    }, []);

    return (
        <Dialog onClose={handleClose} open={open} maxWidth="lg">
            <DialogTitle><b>{vssKey}</b></DialogTitle>
            <DialogContent>
                <TableContainer sx={{ minWidth: 800 }} >
                    <Table size="small">
                        <TableBody>
                            <TableRow>
                                <StyledTableCell><b>Description</b></StyledTableCell>
                                <StyledTableCell>{vssSignal.description}</StyledTableCell>
                            </TableRow>
                            <TableRow>
                                <StyledTableCell><b>Type</b></StyledTableCell>
                                <StyledTableCell>{vssSignal.type}</StyledTableCell>
                            </TableRow>
                            {vssSignal.type !== "branch" &&
                                <>
                                    <TableRow>
                                        <StyledTableCell><b>Data type</b></StyledTableCell>
                                        <StyledTableCell>{vssSignal.datatype}</StyledTableCell>
                                    </TableRow>
                                    <TableRow>
                                        <StyledTableCell><b>Default</b></StyledTableCell>
                                        <StyledTableCell>{getValueString(vssSignal.default)}</StyledTableCell>
                                    </TableRow>
                                    <TableRow>
                                        <StyledTableCell><b>Min</b></StyledTableCell>
                                        <StyledTableCell>{vssSignal.min}</StyledTableCell>
                                    </TableRow>
                                    <TableRow>
                                        <StyledTableCell><b>Max</b></StyledTableCell>
                                        <StyledTableCell>{vssSignal.max}</StyledTableCell>
                                    </TableRow>
                                    <TableRow>
                                        <StyledTableCell><b>Unit</b></StyledTableCell>
                                        <StyledTableCell>{vssSignal.unit}</StyledTableCell>
                                    </TableRow>
                                    <TableRow>
                                        <StyledTableCell><b>Allowed</b></StyledTableCell>
                                        <StyledTableCell>
                                            <AllowedList allowed={vssSignal.allowed}/>
                                        </StyledTableCell>
                                    </TableRow>
                                </>
                            }
                            <TableRow>
                                <StyledTableCell><b>Comment</b></StyledTableCell>
                                <StyledTableCell>{vssSignal.comment}</StyledTableCell>
                            </TableRow>
                            <TableRow>
                                <StyledTableCell><b>Deprecation</b></StyledTableCell>
                                <StyledTableCell>{vssSignal.deprecation}</StyledTableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
            </DialogContent>
            <DialogActions>
                <Button size="large" onClick={handleClose} sx={{ fontSize: "large" }}
                    startIcon={<Close />}
                >
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};

const AllowedList = ({ allowed }) => {

    const allowedList = useMemo(() => {
        let list = "";
        if (allowed && allowed.length !== 0) {
            allowed.forEach((label) => {
                if (list.length === 0) {
                    list = label;
                }
                else {
                    list += "\n" + label;
                }
            });
        }
        return list;
    }, [allowed]);

    return (
        <TextField
            defaultValue={allowedList}
            multiline
            maxRows={10}
            sx={{ width: "100%" }}
            slotProps={{
                input: {
                    readOnly: true,
                },
            }}
        />
    );
};
