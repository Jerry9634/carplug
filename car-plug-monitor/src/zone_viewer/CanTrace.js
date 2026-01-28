import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import Close from '@mui/icons-material/Close';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';

import { AppContext } from "../AppContext";
import { StyledTableCell } from "../common_viewer/CustomStyles";
import {
    ZONE_CONFIG_KEY, getDataSafely, saveData
} from "../persistency/PersistentMemory";
import { getZoneConfig } from "../signal_db/CanSync";
import routingDB from "../signal_db/routingDB.json";
import signalDB from "../signal_db/SignalDB.json";

import CanViewer from "./CanViewer";
import { SETTINGS } from "./ZoneConfig";


const CanTrace = () => {

    const { channel, setChannel, windowSize, isDarkTheme } = useContext(AppContext);

    const { ecu2ChannelMap, ecuIndexMap, pduDefMap, signalPduMap } = useMemo(initMap, []);

    const [zoneCfg, setZoneCfg] = useState(getDataSafely(ZONE_CONFIG_KEY, SETTINGS.firstZoneConfig));

    const updateMessageList = useCallback(() => {
        const jsonData = getZoneConfig();
        setZoneCfg(jsonData);
        saveData(ZONE_CONFIG_KEY, jsonData);

        const newEcus = new Set();
        for (const channelObj of jsonData.channels) {
            for (const ecu of channelObj.ecus) {
                if (!ecu2ChannelMap.has(ecu)) {
                    newEcus.add(ecu);
                    ecu2ChannelMap.set(ecu, channelObj.channel);
                }
            }
        }

        if (newEcus.size !== 0) {
            routingDB.messages.forEach((pdu) => {
                const ecu = ecuIndexMap.get(pdu.sender);
                if (newEcus.has(ecu)) {
                    const channel1 = ecu2ChannelMap.get(ecu);
                    const id = (channel1 << 29) + pdu.id;
                    pduDefMap.set(id, pdu);
                }
            });
        }
    }, [ecu2ChannelMap, ecuIndexMap, pduDefMap]);

    const handleOpen = useCallback((channel) => {
        setChannel(channel);
    }, [setChannel]);

    useEffect(() => {
        let refreshInterval = null;
        if (channel < 0) {
            refreshInterval = setInterval(() => {
                updateMessageList();
            }, 1000);
        }

        return () => {
            if (refreshInterval) {
                clearInterval(refreshInterval);
            }
        };
    }, [channel, updateMessageList]);

    return (
        <TableContainer sx={{ height: (windowSize.height - 108) }}>
            {channel < 0 ?
                <Table size="small" stickyHeader>
                    <TableHead>
                        <TableRow>
                            <StyledTableCell sx={{ minWidth: 125 }}>Zone</StyledTableCell>
                            <StyledTableCell sx={{ minWidth: 125 }}>Channel</StyledTableCell>
                            <StyledTableCell sx={{ minWidth: 100 }}>Messages</StyledTableCell>
                            <StyledTableCell sx={{ minWidth: 400 }}>
                                <Stack direction="row" gap={1} sx={{ justifyContent: "left", alignItems: "center" }}>
                                    <Rect color="success" width={14} isDarkTheme={isDarkTheme} />
                                    <span style={{ fontSize: 16, fontWeight: 500 }}>
                                        OK &nbsp;
                                    </span>
                                    <Rect color="error" width={14} isDarkTheme={isDarkTheme} />
                                    <span style={{ fontSize: 16, fontWeight: 500 }}>
                                        Timeout &nbsp;
                                    </span>
                                    <Rect color="unknown" width={14} isDarkTheme={isDarkTheme} />
                                    <span style={{ fontSize: 16, fontWeight: 500 }}>
                                        Unknown
                                    </span>
                                </Stack>
                            </StyledTableCell>
                            <StyledTableCell sx={{ width: "100%" }} />
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {zoneCfg.channels.map((channelObj, channel) =>
                            <Channel key={channel}
                                channel={channel}
                                zone={channelObj.zone}
                                initZoneCfg={routingDB}
                                pduList={channelObj.pduList}
                                pduDefMap={pduDefMap}
                                handleOpen={handleOpen}
                                isDarkTheme={isDarkTheme}
                            />
                        )}
                        <TableRow
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                            <TableCell />
                            <TableCell />
                            <TableCell />
                            <TableCell />
                            <TableCell />
                        </TableRow>
                    </TableBody>
                </Table>
                :
                <CanViewer
                    channel={channel}
                    initZoneCfg={routingDB}
                    pduDefMap={pduDefMap}
                    signalPduMap={signalPduMap}
                />
            }
        </TableContainer>
    );
};

const Channel = ({
    channel, zone, initZoneCfg, pduList, pduDefMap, handleOpen, isDarkTheme
}) => {

    const { initZoneObj, initChannelObj } = useMemo(() => {
        const initZoneObj = initZoneCfg.zones[zone];
        const local_channel = channel - initZoneObj.channels[0].index;
        const initChannelObj = initZoneCfg.zones[zone].channels[local_channel];

        return {
            initZoneObj: initZoneObj,
            initChannelObj: initChannelObj
        };
    }, [channel, zone, initZoneCfg]);

    const isTimeout = useCallback((msgObj) => {
        const pduDef = pduDefMap.get(msgObj.id);
        if (pduDef && pduDef.cycle > 0) {
            const diff = msgObj.timestamp_now - msgObj.timestamp;
            if (diff > (2 * pduDef.cycle)) {
                return true;
            }
        }
        return false;
    }, [pduDefMap]);

    const getMessageStatus = useCallback((msgObj, index) => {
        let color = "success";
        let width = 8;
        let height = 20;
        if (msgObj.known) {
            if (isTimeout(msgObj)) {
                color = "error";
                width = 20;
            }
        }
        else {
            color = "unknown";
            width = 20;
        }

        return <Rect key={index} color={color} width={width} height={height} isDarkTheme={isDarkTheme} />;
    }, [isTimeout, isDarkTheme]);

    return (
        <TableRow>
            {initZoneObj.channels[0].index === channel &&
                <StyledTableCell rowSpan={initZoneObj.channels.length}>
                    <b>{initZoneObj.name}</b>
                </StyledTableCell>
            }
            <StyledTableCell>
                <b>{initChannelObj.name}</b>
            </StyledTableCell>
            <StyledTableCell>
                <Stack direction="row" sx={{ justifyContent: "left", alignItems: "center" }}>
                    <Typography sx={{ width: 48 }}>{pduList.length}</Typography>
                    <Button variant='outlined' size="small"
                        onClick={() => handleOpen(channel)}
                    >
                        Details
                    </Button>
                </Stack>
            </StyledTableCell>
            <StyledTableCell colSpan={2}>
                <Stack direction="row" useFlexGap spacing={0.5} sx={{ flexWrap: 'wrap' }} >
                    {pduList.map((msgObj, index) =>
                        getMessageStatus(msgObj, index)
                    )}
                </Stack>
            </StyledTableCell>
        </TableRow>
    );
};

const Rect = ({ color, width = 20, height = 20, isDarkTheme }) => {
    const getColorCode = useCallback(() => {
        if (color === "error") {
            return isDarkTheme ? "#ef5350" : "#d32f2f"
        }
        else if (color === "unknown") {
            return "#FFBF00";
        }
        else {
            return isDarkTheme ? "#4caf50" : "#2e7d32";
        }
    }, [color, isDarkTheme]);

    return (
        <span
            style={{
                height: height,
                width: width,
                backgroundColor: getColorCode(),
                display: "inline-block"
            }}
        />
    );
};

const initMap = () => {
    const ecu2ChannelMap = new Map();
    const ecuIndexMap = new Map();
    const pduDefMap = new Map();
    const signalPduMap = new Map();

    for (const ecu of routingDB.ecus) {
        ecuIndexMap.set(ecu.name, ecu.index);
    }
    signalDB.clusters.forEach((cluster) => {
        cluster.pdus.forEach((pdu) => {
            signalPduMap.set(pdu.bus + "_" + pdu.id, pdu);
        });
    });

    return ({
        ecu2ChannelMap: ecu2ChannelMap,
        ecuIndexMap: ecuIndexMap,
        pduDefMap: pduDefMap,
        signalPduMap: signalPduMap
    });
};


export const CANChannelSelection = ({ channel, setChannel }) => {

    const handleChannelChange = useCallback((event) => {
        setChannel(Number(event.target.value));
    }, [setChannel]);

    const handleCanViewerClose = useCallback((event) => {
        setChannel(-1);
    }, [setChannel]);

    return (
        <React.Fragment>
            {channel > -1 &&
                <React.Fragment>
                    <FormControl sx={{ m: 1, width: 250 }}>
                        <InputLabel htmlFor="grouped-native-select">Channel</InputLabel>
                        <Select native id="grouped-native-select" value={channel} label="Channel"
                            autoWidth size="small"
                            onChange={handleChannelChange}
                        >
                            {routingDB.zones.map((zoneObj, zone) =>
                                <optgroup label={zoneObj.name} key={zone}>
                                    {zoneObj.channels.map((channelObj) =>
                                        <option value={channelObj.index} key={channelObj.index}>{zoneObj.name} / {channelObj.name}</option>
                                    )}
                                </optgroup>
                            )}
                        </Select>
                    </FormControl>
                    <Button size="medium" onClick={handleCanViewerClose} startIcon={<Close />}
                        sx={{ ml: 1, mr: 2 }}
                    >
                        <b>Close</b>
                    </Button>
                    <Divider orientation='vertical' variant='middle' flexItem sx={{ borderWidth: 1, height: 40 }} />
                </React.Fragment>
            }
        </React.Fragment>
    );
};

export default CanTrace;