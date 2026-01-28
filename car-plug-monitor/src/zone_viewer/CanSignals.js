import { useCallback, useMemo } from "react";

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import Button from '@mui/material/Button';

import Close from "@mui/icons-material/Close";

import { StyledTableCell, StyledFieldTableCell } from "../common_viewer/CustomStyles";


/* global BigInt */


const DATA_BYTE_LEN_MAX = 32;


const CanSignals = ({ pdu, signals, data, open, onClose, initZoneCfg, isNameBlurred }) => {

    const { zoneObj, channelObj } = useMemo(() => {
        const zoneObj = initZoneCfg.zones[pdu.zone];
        const local_channel = pdu.channel - zoneObj.channels[0].index;
        const channelObj = initZoneCfg.zones[pdu.zone].channels[local_channel];

        return {
            zoneObj: zoneObj,
            channelObj: channelObj
        };
    }, [pdu, initZoneCfg]);

    const getSignalName = useCallback((signalDef) => {
        if (isNameBlurred) {
            return signalDef.name.substring(0, 5) + "***";
        }
        return signalDef.name;
    }, [isNameBlurred]);

    const getSenderName = useCallback((msgObj) => {
        if (isNameBlurred && msgObj.senderName && msgObj.senderName.length > 3) {
            return msgObj.senderName.substring(0, 3) + "*";
        }
        return msgObj.senderName;
    }, [isNameBlurred]);

    return (
        <Dialog onClose={onClose} open={open} fullWidth={true} maxWidth="xl">
            <DialogTitle><b>{`${zoneObj.name} / ${channelObj.name} / ${getSenderName(pdu)} / ${pdu.name}, ID=${pdu.hexId}`}</b></DialogTitle>
            <DialogContent>
                <Table size="small" stickyHeader>
                    <TableHead>
                        <TableRow>
                            <StyledTableCell sx={{ width: 150 }}>
                                Signal
                            </StyledTableCell>
                            <StyledTableCell sx={{ width: 100 }}>
                                Physical Value
                            </StyledTableCell>
                            <StyledTableCell sx={{ width: 75 }}>
                                Unit
                            </StyledTableCell>
                            <StyledTableCell sx={{ width: 250 }}>
                                Value Description
                            </StyledTableCell>
                            <StyledTableCell sx={{ width: 100 }}>
                                Raw Value
                            </StyledTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {signals.map((signalDef, signal_index) =>
                            <TableRow key={signal_index}>
                                <StyledTableCell>
                                    {getSignalName(signalDef)}
                                </StyledTableCell>
                                <StyledFieldTableCell>
                                    {getPhysicalValue(signalDef, data)}
                                </StyledFieldTableCell>
                                <StyledTableCell>
                                    {signalDef.unit}
                                </StyledTableCell>
                                <StyledFieldTableCell>
                                    {getValueDesc(signalDef, data)}
                                </StyledFieldTableCell>
                                <StyledFieldTableCell>
                                    {getRawValue(signalDef, data)}
                                </StyledFieldTableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </DialogContent>
            <DialogActions>
                <Button size="large" onClick={onClose} sx={{ fontSize: "large" }}
                    startIcon={<Close />}
                >
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};

const getRawValue = (signalDef, data) => {
    const startBitOffset = signalDef.startBit % 8;
    const endBit = signalDef.startBit + signalDef.length - 1;
    const endBitOffset = endBit % 8;
    const startByte = Math.floor(signalDef.startBit / 8);
    const endByte = Math.floor(endBit / 8);
    const byteLen = endByte - startByte + 1;

    // definition check
    if (signalDef.startBit < (DATA_BYTE_LEN_MAX * 8) && signalDef.length !== 0) {
        // big value
        if (signalDef.length >= 32) {
            if (startBitOffset === 0) {
                let sigVal = 0;
                let byteIndex = startByte;
                for (let i = 0; i < 4; i++, byteIndex++) {
                    sigVal += data[byteIndex] * (1 << (i * 8));
                }

                if (signalDef.length > 32) {
                    const limit = byteLen - 4;
                    let sigValHigh = 0;
                    for (let i = 0; i < limit; i++, byteIndex++) {
                        sigValHigh += data[byteIndex] * (1 << (i * 8));
                    }

                    let bigValue = BigInt(sigVal);
                    bigValue += BigInt(sigValHigh) * 0x100000000n;
                    return bigValue.toString();
                }
                else {
                    return sigVal;
                }
            }
        }
        else {
            let sigVal = 0;

            for (let i = 0; i < byteLen; i++) {
                let maskLow = 0xFF;
                let maskHigh = 0xFF;

                if (i === 0) {
                    if (startBitOffset !== 0) {
                        maskLow = (maskLow << startBitOffset) & 0xFF;
                    }
                    if ((byteLen === 1) && (endBitOffset !== 7)) {
                        maskHigh = maskHigh >>> (7 - endBitOffset);
                    }
                }
                else if (i === (byteLen - 1)) {
                    if (endBitOffset !== 7) {
                        maskHigh = maskHigh >>> (7 - endBitOffset);
                    }
                }

                const mask = maskHigh & maskLow;
                let delta = data[startByte + i] & mask;
                if (i !== 0) {
                    delta <<= (i * 8);
                }
                sigVal |= delta;
            }

            if (startBitOffset !== 0) {
                sigVal >>>= startBitOffset;
            }

            return sigVal;
        }
    }

    return 0;
};

const rawToPhys = (rawVal, signalDef) => {
    let physVal = rawVal;
    if (signalDef.factor > 0) {
        physVal *= signalDef.factor;
        physVal += signalDef.offset;
        if (!Number.isInteger(physVal) || signalDef.apType === "float") {
            physVal = Number(physVal.toFixed(5));
        }
    }
    return physVal;
};

// eslint-disable-next-line
const physToRaw = (physVal, signalDef) => {
    let rawVal = physVal;
    if (signalDef.factor > 0) {
        rawVal -= signalDef.offset;
        rawVal /= signalDef.factor;
    }
    rawVal = Math.round(rawVal);
    return rawVal;
};

export const getPhysicalValue = (signalDef, data) => {
    const rawValue = getRawValue(signalDef, data);
    if (signalDef.length > 32) {
        return rawValue;
    }
    else {
        return rawToPhys(rawValue, signalDef);
    }
};

const getValueDesc = (signalDef, data) => {
    const rawValue = getRawValue(signalDef, data);
    let valueDesc = "-";
    for (const key in signalDef.valueDescAry) {
        if (Number(key.substring(5)) === rawValue) {
            valueDesc = signalDef.valueDescAry[key];
        }
    }
    return valueDesc;
};

export default CanSignals;