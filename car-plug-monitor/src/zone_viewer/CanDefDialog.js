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


/* global BigInt */


export const CanMessageDefDialog = (props) => {
    const { message, open, onClose } = props;

    const handleClose = useCallback(() => {
        onClose();
    }, [onClose]);

    return (
        <Dialog onClose={handleClose} open={open} maxWidth="lg">
            <DialogTitle><b>{`${message.name}, ID=${message.hexId}`}</b></DialogTitle>
            <DialogContent>
                <TableContainer sx={{ minWidth: 800 }} >
                    <Table size="small">
                        <TableBody>
                            <TableRow>
                                <StyledTableCell sx={{ width: 200 }}><b>ID</b></StyledTableCell>
                                <StyledTableCell><b>{message.hexId}</b></StyledTableCell>
                            </TableRow>
                            <TableRow>
                                <StyledTableCell><b>Length (byte)</b></StyledTableCell>
                                <StyledTableCell>{message.DLC}</StyledTableCell>
                            </TableRow>
                            <TableRow>
                                <StyledTableCell><b>Extended ID</b></StyledTableCell>
                                <StyledTableCell>{String(message.id > 0x7FF)}</StyledTableCell>
                            </TableRow>
                            <TableRow>
                                <StyledTableCell><b>Cycle (ms)</b></StyledTableCell>
                                <StyledTableCell>{message.GenMsgCycleTime}</StyledTableCell>
                            </TableRow>
                            <TableRow>
                                <StyledTableCell><b>Sender</b></StyledTableCell>
                                <StyledTableCell>{message.sender}</StyledTableCell>
                            </TableRow>
                            <TableRow>
                                <StyledTableCell><b>Bus</b></StyledTableCell>
                                <StyledTableCell>{message.bus}</StyledTableCell>
                            </TableRow>
                            <TableRow>
                                <StyledTableCell><b>Description</b></StyledTableCell>
                                <StyledTableCell>{message.desc}</StyledTableCell>
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

export const CanSignalDefDialog = (props) => {
    const { signal, message, open, onClose } = props;

    const handleClose = useCallback(() => {
        onClose();
    }, [onClose]);

    const getRange = useCallback(() => {
        let min = 0;
        let max;
        if (signal.length <= 32) {
            const enumSizeMax = 1 << signal.length;
            const enumSize = signal.valueTable?.length ?? 0;

            if (signal.signed && enumSize < enumSizeMax) {
                if (signal.length < 32) {
                    max = (1 << (signal.length - 1)) - 1;
                    min = -(max + 1);
                }
                else {
                    max = 0x7FFFFFFF;
                    min = -(0x80000000);
                }
            }
            else {
                if (signal.length < 32) {
                    max = (1 << signal.length) - 1;
                }
                else {
                    max = 0xFFFFFFFF;
                }
            }

            if (signal.factor !== 1) {
                max *= signal.factor;
                min *= signal.factor;
            }
            if (signal.offset !== 0) {
                max += signal.offset;
                min += signal.offset;
            }
            if (signal.factor !== 1) {
                max = Number(Number(max).toFixed(5));
                min = Number(Number(min).toFixed(5));
            }
        }
        else {
            max = 0xFFFFFFFFFFFFFFFFn;
            const div = BigInt(1 << (64 - signal.length));
            max /= div;
        }

        const range = min + " ~ " + max;

        return range;
    }, [signal]);

    return (
        <Dialog onClose={handleClose} open={open} maxWidth="lg">
            <DialogTitle><b>{signal.name}</b> &nbsp; {`[ ${message.bus} / ${message.sender} / ${message.name}, ID=${message.hexId} ]`}</DialogTitle>
            <DialogContent>
                <TableContainer sx={{ minWidth: 800 }} >
                    <Table size="small">
                        <TableBody>
                            <TableRow>
                                <StyledTableCell><b>Description</b></StyledTableCell>
                                <StyledTableCell>{signal.description}</StyledTableCell>
                            </TableRow>
                            <TableRow>
                                <StyledTableCell><b>Comment</b></StyledTableCell>
                                <StyledTableCell>{signal.comment}</StyledTableCell>
                            </TableRow>
                            <TableRow>
                                <StyledTableCell><b>Start Bit</b></StyledTableCell>
                                <StyledTableCell>{signal.startBit}</StyledTableCell>
                            </TableRow>
                            <TableRow>
                                <StyledTableCell><b>Length</b></StyledTableCell>
                                <StyledTableCell>{signal.length}</StyledTableCell>
                            </TableRow>
                            <TableRow>
                                <StyledTableCell><b>Init Value</b></StyledTableCell>
                                <StyledTableCell>{signal.initValue}</StyledTableCell>
                            </TableRow>
                            <TableRow>
                                <StyledTableCell><b>Signed</b></StyledTableCell>
                                <StyledTableCell>{signal.signed.toString()}</StyledTableCell>
                            </TableRow>
                            <TableRow>
                                <StyledTableCell><b>Factor</b></StyledTableCell>
                                <StyledTableCell>{signal.factor}</StyledTableCell>
                            </TableRow>
                            <TableRow>
                                <StyledTableCell><b>Offset</b></StyledTableCell>
                                <StyledTableCell>{signal.offset}</StyledTableCell>
                            </TableRow>
                            <TableRow>
                                <StyledTableCell><b>Min</b></StyledTableCell>
                                <StyledTableCell>{signal.min}</StyledTableCell>
                            </TableRow>
                            <TableRow>
                                <StyledTableCell><b>Max</b></StyledTableCell>
                                <StyledTableCell>{signal.max}</StyledTableCell>
                            </TableRow>
                            <TableRow>
                                <StyledTableCell><b>Unit</b></StyledTableCell>
                                <StyledTableCell>{signal.unit}</StyledTableCell>
                            </TableRow>
                            <TableRow>
                                <StyledTableCell><b>Data Type</b></StyledTableCell>
                                <StyledTableCell>{signal.dataType}</StyledTableCell>
                            </TableRow>
                            <TableRow>
                                <StyledTableCell><b>Range</b></StyledTableCell>
                                <StyledTableCell>{getRange()}</StyledTableCell>
                            </TableRow>
                            <TableRow>
                                <StyledTableCell><b>Value Descriptions</b></StyledTableCell>
                                <StyledTableCell>
                                    <ValueTable valueTable={signal.valueTable}/>
                                </StyledTableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
            </DialogContent>
            <DialogActions>
                <Button size="large" onClick={handleClose} sx={{ fontSize: 20 }}
                    startIcon={<Close />}
                >
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};

const ValueTable = ({ valueTable }) => {

    const vtText = useMemo(() => {
        let text = "";
        if (valueTable) {
            Object.keys(valueTable).forEach((key, index) => {
                const label = key + ": " + valueTable[key];
                if (text.length === 0) {
                    text = label;
                }
                else {
                    text += "\n" + label;
                }
            });
        }
        return text;
    }, [valueTable]);

    return (
        <TextField
            defaultValue={vtText}
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
