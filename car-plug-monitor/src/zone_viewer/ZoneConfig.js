import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { AppContext } from "../AppContext";
import { StyledTableCell, StyledFieldTableCell, HtmlTooltip } from "../common_viewer/CustomStyles";
import { ZONE_CONFIG_KEY, getDataSafely, saveData } from "../persistency/PersistentMemory";
import { getZoneConfig, sendResetRequest } from "../signal_db/CanSync";
import routingDB from "../signal_db/routingDB.json";

import ECU_NAMES from "./ECU_NAMES";


export const SETTINGS = {
    START_TIME: Date.now(),
    firstZoneConfig: getZoneConfig(),
};


const ZoneConfig = () => {

    const { isNameBlurred, windowSize } = useContext(AppContext);

    const { ecuNameMap, ecuFullNameMap, ecuIndexMap } = useMemo(initMap, []);

    const [zoneCfg, setZoneCfg] = useState(getDataSafely(ZONE_CONFIG_KEY, SETTINGS.firstZoneConfig));
    const [currentEcuList, setCurrentEcuList] = useState(getEcuList(zoneCfg));

    useEffect(() => {
        const refreshInterval = setInterval(() => {
            const jsonData = getZoneConfig();
            setZoneCfg(jsonData);
            saveData(ZONE_CONFIG_KEY, jsonData);
            setCurrentEcuList(getEcuList(jsonData));
        }, 1000);

        return () => {
            clearInterval(refreshInterval);
        };
    }, []);

    return (
        <Stack gap={4} sx={{ maxHeight: (windowSize.height - 108) }}>

            <TableContainer component={Paper}>
                <Table size="small" stickyHeader>
                    <TableHead>
                        <TableRow>
                            <StyledTableCell sx={{ minWidth: 125 }}>Zone</StyledTableCell>
                            <StyledTableCell sx={{ minWidth: 125 }}>Channel</StyledTableCell>
                            <StyledTableCell sx={{ minWidth: 125 }}>Type</StyledTableCell>
                            <StyledTableCell sx={{ minWidth: 75 }} align="right">Speed</StyledTableCell>
                            <StyledTableCell align="right" sx={{ minWidth: 75 }}>ECU</StyledTableCell>
                            <StyledTableCell sx={{ width: "100%" }}>
                                <Stack direction="row" gap={1}>
                                    <Chip label="OK" color="success" sx={{ minWidth: 100, height: 24, fontSize: "medium" }} />
                                    <Chip label="Missing" color="error" sx={{ minWidth: 100, height: 24, fontSize: "medium" }} />
                                    <Chip label="New" color="info" sx={{ minWidth: 100, height: 24, fontSize: "medium" }} />
                                    <Chip label="Unknown" sx={{ backgroundColor: "#FFBF00", minWidth: 100, height: 24, fontSize: "medium" }} />
                                </Stack>
                            </StyledTableCell>
                            <StyledTableCell sx={{ minWidth: 200 }}>Note</StyledTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {zoneCfg.channels.map((channelObj, channel) =>
                            <Channel key={channel}
                                channel={channel}
                                zone={channelObj.zone}
                                zoneCfg={zoneCfg}
                                initZoneCfg={routingDB}
                                isNameBlurred={isNameBlurred}
                                ecuNameMap={ecuNameMap}
                                ecuFullNameMap={ecuFullNameMap}
                                ecuIndexMap={ecuIndexMap}
                            />
                        )}
                        <TableRow
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                            <StyledTableCell><b>{zoneCfg.zones.length}</b></StyledTableCell>
                            <StyledTableCell><b>{zoneCfg.channels.length}</b></StyledTableCell>
                            <StyledTableCell>-</StyledTableCell>
                            <StyledTableCell align="right">-</StyledTableCell>
                            <StyledTableCell align="right"><b>{currentEcuList.length}</b></StyledTableCell>
                            <StyledTableCell />
                            <StyledTableCell>-</StyledTableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>

            <Stack direction="row" gap={4} width={"50%"}>
                <TableContainer component={Paper} sx={{ width: 500 }} >
                    <Table sx={{ width: "100%" }} size="small">
                        <TableHead>
                            <TableRow>
                                <StyledTableCell>Zone</StyledTableCell>
                                <StyledTableCell>Address</StyledTableCell>
                                <StyledTableCell>System Time</StyledTableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {zoneCfg.zones.map((zoneObj, zone) => (
                                <TableRow
                                    key={zone}
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                >
                                    <StyledTableCell component="th" scope="row">
                                        <b>{zoneObj.name}</b>
                                    </StyledTableCell>
                                    <StyledFieldTableCell>{zoneObj.address}</StyledFieldTableCell>
                                    <StyledFieldTableCell>{zoneObj.systemTime}</StyledFieldTableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <Stack gap={2}>
                    <Button variant="contained" sx={{ width: 125, height: 32, fontSize: "medium" }}
                        onClick={sendResetRequest}
                    >
                        Reset
                    </Button>
                </Stack>
            </Stack>

        </Stack>
    );
};

const Channel = (props) => {
    
    const { channel, isNameBlurred, ecuNameMap, ecuFullNameMap } = props;

    const { initZoneObj, initChannelObj, channelObj, allEcus, initEcuSet, curEcuSet } = useMemo(() => checkChannel(props), [props]);

    const getEcuName = useCallback((ecu) => {
        let name = "";
        if (ecuNameMap.has(ecu)) {

            const NAME = ecuNameMap.get(ecu);
            let index = NAME.indexOf("_FD_");
            if (index > -1) {
                name = NAME.substring(0, index);
            }
            else {
                index = NAME.indexOf("_HS_");
                if (index > -1) {
                    name = NAME.substring(0, index);
                }
                else {
                    name = NAME;
                }
            }
        }
        if (isNameBlurred) {
            name = name.substring(0, 3) + "*";
        }
        return name;
    }, [ecuNameMap, isNameBlurred]);

    const getFullName = useCallback((ecu) => {
        if (ecuNameMap.has(ecu)) {
            const shortName = ecuNameMap.get(ecu);
            if (ecuFullNameMap.has(shortName)) {
                return ecuFullNameMap.get(shortName);
            }
        }
        return getEcuName(ecu);
    }, [ecuFullNameMap, ecuNameMap, getEcuName]);

    const getColor = useCallback((ecu) => {
        if (initEcuSet.has(ecu)) {
            if (curEcuSet.has(ecu)) {
                return "success";
            }
            else {
                return "error";
            }
        }
        else {
            return "info";
        }
    }, [curEcuSet, initEcuSet]);

    const reportFindings = useCallback((ecu) => {
        return <></>;
    }, []);

    const getSpeed = useCallback((speed) => {
        if (speed >= 10000000) {
            return (speed / 1000000) + "M";
        }
        else {
            return (speed / 1000) + "K";
        }
    }, []);

    return (
        <TableRow>
            {initZoneObj.channels[0].index === channel &&
                <StyledTableCell rowSpan={initZoneObj.channels.length} sx={{ fontWeight: 700 }}>
                    {initZoneObj.name}
                </StyledTableCell>
            }
            <StyledTableCell sx={{ fontWeight: 700 }}>{initChannelObj.name}</StyledTableCell>
            <StyledTableCell>{initChannelObj.type}</StyledTableCell>
            <StyledTableCell align="right">{getSpeed(initChannelObj.baudrate)}</StyledTableCell>
            <StyledTableCell align="right">{allEcus.length}</StyledTableCell>
            <StyledTableCell>
                <Stack direction="row" spacing={1} >
                    {allEcus.map((ecu, index) =>
                        <HtmlTooltip
                            key={index}
                            title={
                                <React.Fragment>
                                    <Typography variant="subtitle1" color="inherit"><b>{getFullName(ecu)}</b></Typography>
                                </React.Fragment>
                            }
                        >
                            <Chip label={getEcuName(ecu)} color={getColor(ecu)} key={index}
                                sx={{ minWidth: 100, height: 24, fontSize: "medium", fontWeight: 500 }}
                            />
                        </HtmlTooltip>
                    )}
                    {channelObj.hasUnknownEcu &&
                        <Chip label={"Unknown"}
                            sx={{ backgroundColor: "#FFBF00", minWidth: 100, height: 24, fontSize: "medium", fontWeight: 700 }}
                        />
                    }
                </Stack>
            </StyledTableCell>
            <StyledFieldTableCell>{reportFindings()}</StyledFieldTableCell>
        </TableRow>
    );
};

const initMap = () => {
    const ecuFullNameMap = new Map(Object.entries(ECU_NAMES));
    const ecuNameMap = new Map();
    const ecuIndexMap = new Map();

    for (const ecu of routingDB.ecus) {
        ecuNameMap.set(ecu.index, ecu.name);
        ecuIndexMap.set(ecu.name, ecu.index);
    }

    return ({
        ecuNameMap: ecuNameMap,
        ecuFullNameMap: ecuFullNameMap,
        ecuIndexMap: ecuIndexMap
    });
};

const getEcuList = (zoneCfg) => {
    const curEcuList1 = [];
    for (const channelObj of zoneCfg.channels) {
        for (const ecu of channelObj.ecus) {
            curEcuList1.push(ecu);
        }
    }
    return curEcuList1;
};

const checkChannel = (props) => {
    const { channel, zone, zoneCfg, initZoneCfg, ecuIndexMap } = props;

    const initZoneObj = initZoneCfg.zones[zone];
    const local_channel = channel - initZoneObj.channels[0].index;
    const initChannelObj = initZoneCfg.zones[zone].channels[local_channel];
    const channelObj = zoneCfg.channels[channel];

    const allEcus = [];
    const initEcuSet = new Set();
    const curEcuSet = new Set();
    const allEcuSet = new Set();

    for (const node of initChannelObj.nodes) {
        const ecu = ecuIndexMap.get(node);
        initEcuSet.add(ecu);
        allEcuSet.add(ecu);
        allEcus.push(ecu);
    }

    for (const ecu of channelObj.ecus) {
        curEcuSet.add(ecu);
        if (!allEcuSet.has(ecu)) {
            allEcuSet.add(ecu);
            allEcus.push(ecu);
        }
    }

    allEcus.sort((a, b) => {
        if (a > b) return 1;
        else if (a < b) return -1;
        else return 0;
    });

    return {
        initZoneObj: initZoneObj,
        initChannelObj: initChannelObj,
        channelObj: channelObj,
        allEcus: allEcus,
        initEcuSet: initEcuSet,
        curEcuSet: curEcuSet,
    };
};

export default ZoneConfig;