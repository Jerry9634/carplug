import React, { useCallback, useContext, useEffect, useState } from "react";

import { GridActionsCellItem } from '@mui/x-data-grid';
import Stack from '@mui/material/Stack';
import Topic from '@mui/icons-material/Topic';

import { AppContext } from "../AppContext";
import CustomDataGrid from "../common_viewer/CustomDataGrid";
import { getStorageMap, getUnknownCanMsgMap } from "../signal_db/CanSync";

import CanSignals from "./CanSignals";
import { SETTINGS } from "./ZoneConfig";


const CanViewer = (props) => {
    const {
        channel, initZoneCfg,
        pduDefMap, signalPduMap
    } = props;

    const { isDarkTheme, isNameBlurred } = useContext(AppContext);

    const [messages, setMessages] = useState([]);

    const [openPdu, setOpenPdu] = useState(null);

    const columns = [
        { field: 'timestamp', headerName: 'Time', width: 125, valueFormatter: (value, row) => getTimestamp(row) },
        { field: 'canId', headerName: 'ID', width: 125, valueFormatter: (value, row) => row.hexId },
        { field: 'name', headerName: 'Message', width: 225, valueGetter: (value, row) => getMessageName(row) },
        { field: 'sender', headerName: 'Sender', width: 125, valueGetter: (value, row) => getSenderName(row) },
        { field: 'DLC', headerName: 'DLC', width: 75 },
        {
            field: 'data', headerName: 'Data', width: 800, sortable: false,
            renderCell: (params) => {
                const msgObj = params.row;
                return (
                    <Stack direction="row" gap={1} sx={{ display: "flex", height: "100%", alignItems: "center" }} >
                        <div style={{ width: 160, color: isDarkTheme ? "yellow" : "blue" }}>{getDataByte(msgObj.data, 0)}</div>
                        <div style={{ width: 160, color: isDarkTheme ? "yellow" : "blue" }}>{getDataByte(msgObj.data, 8)}</div>
                        <div style={{ width: 160, color: isDarkTheme ? "yellow" : "blue" }}>{getDataByte(msgObj.data, 16)}</div>
                        <div style={{ width: 160, color: isDarkTheme ? "yellow" : "blue" }}>{getDataByte(msgObj.data, 24)}</div>
                        {msgObj.signals?.length > 0 &&
                            <GridActionsCellItem
                                icon={<Topic sx={{ width: 24, height: 24 }} />}
                                label="Show Signals"
                                material={{ sx: { color: 'primary.main', }, }}
                                onClick={() => {
                                    setOpenPdu(msgObj);
                                }}
                                title="Show Signals"
                                size="medium"
                            />
                        }
                    </Stack>
                );
            },
        },
    ];

    const updateMessageList = useCallback(() => {
        const pduList = [];
        const storageMap = getStorageMap();
        const timeNow = Date.now();
        storageMap.forEach((msgObj) => {
            if (channel === msgObj.channel) {
                if (msgObj.hexId == null) {
                    const pduDef = pduDefMap.get(msgObj.id);
                    if (pduDef) {
                        msgObj.hexId = pduDef.hexId;
                        msgObj.name = pduDef.name;
                        msgObj.senderName = pduDef.sender;
                        msgObj.cycle = pduDef.cycle;
                        msgObj.signals = [];

                        const signalPduKey = pduDef.bus + "_" + msgObj.canId;
                        const signalPdu = signalPduMap.get(signalPduKey);
                        if (signalPdu) {
                            msgObj.senderName = signalPdu.sender;
                            msgObj.signals = signalPdu.signals;
                        }
                    }
                }
                msgObj.timestamp_now = timeNow;
                pduList.push(msgObj);
            }
        });

        const unknownCanMsgMap = getUnknownCanMsgMap();
        unknownCanMsgMap.forEach((msgObj) => {
            if (channel === msgObj.channel) {
                if (msgObj.hexId == null) {
                    let hexId;
                    if (msgObj.canId < 0x800) {
                        hexId = "0x" + msgObj.canId.toString(16).padStart(3, "0").toUpperCase();
                    }
                    else {
                        hexId = "0x" + msgObj.canId.toString(16).padStart(8, "0").toUpperCase();
                    }

                    msgObj.hexId = hexId;
                    msgObj.name = "-";
                    msgObj.senderName = "-";
                    msgObj.cycle = 0;
                    msgObj.signals = [];
                }
                pduList.push(msgObj);
            }
        });

        setMessages(pduList);
    }, [channel, pduDefMap, signalPduMap]);

    const getTimestamp = useCallback((msgObj) => {
        const time = msgObj.timestamp - SETTINGS.START_TIME;
        return Number(time / 1000).toFixed(3);
    }, []);

    const getMessageName = useCallback((msgObj) => {
        if (isNameBlurred && msgObj.name && msgObj.name.length > 5) {
            return msgObj.name.substring(0, 5) + "***";
        }
        return msgObj.name;
    }, [isNameBlurred]);

    const getSenderName = useCallback((msgObj) => {
        if (isNameBlurred && msgObj.senderName && msgObj.senderName.length > 3) {
            return msgObj.senderName.substring(0, 3) + "*";
        }
        return msgObj.senderName;
    }, [isNameBlurred]);

    const getDataByte = useCallback((data, offset) => {
        let byteArr = "";
        if (data && offset < data.length) {
            const len = Math.min(8, (data.length - offset));
            for (let i = 0; i < 8; i++) {
                if (i < len) {
                    byteArr += data[offset + i].toString(16).padStart(2, "0").toUpperCase();
                }
                else {
                    byteArr += "**";
                }
            }
            return <span>{byteArr}</span>;
        }
        return null;
    }, []);

    const closeViewer = useCallback(() => {
        setOpenPdu(null);
    }, []);

    useEffect(() => {
        const refreshInterval = setInterval(() => {
            updateMessageList();
        }, 200);

        return () => {
            clearInterval(refreshInterval);
        };
    }, [channel, updateMessageList]);

    return (
        <React.Fragment>
            <CustomDataGrid
                gridName="CanTracePage.CanViewer"
                rows={messages}
                defaultColumns={columns}
            />

            {openPdu &&
                <CanSignals
                    pdu={openPdu}
                    signals={openPdu.signals}
                    data={openPdu.data}
                    open={openPdu != null}
                    onClose={closeViewer}
                    initZoneCfg={initZoneCfg}
                    isNameBlurred={isNameBlurred}
                />
            }
        </React.Fragment>
    );
};

export default CanViewer;