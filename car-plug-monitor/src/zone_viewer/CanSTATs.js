import { useCallback, useContext, useEffect, useMemo, useState } from "react";

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';

import { AppContext } from "../AppContext";
import { StyledTableCell, StyledFieldTableCell } from "../common_viewer/CustomStyles";
import { ZONE_CONFIG_KEY, getDataSafely, saveData } from "../persistency/PersistentMemory";
import { getZoneConfig } from "../signal_db/CanSync";
import routingDB from "../signal_db/routingDB.json";

import { SETTINGS } from "./ZoneConfig";


/* global BigInt */


const CanSTATs = () => {

    const { windowSize } = useContext(AppContext);

    const [zoneCfg, setZoneCfg] = useState(getDataSafely(ZONE_CONFIG_KEY, SETTINGS.firstZoneConfig));

    useEffect(() => {
        const refreshInterval = setInterval(() => {
            const zoneCfg1 = getZoneConfig();
            saveData(ZONE_CONFIG_KEY, zoneCfg1);
            setZoneCfg(zoneCfg1);
        }, 1000);

        return () => {
            clearInterval(refreshInterval);
        };
    }, []);

    return (
        <TableContainer sx={{ maxHeight: (windowSize.height - 108) }}>
            <Table size="small" stickyHeader>
                <TableHead>
                    <TableRow>
                        <StyledTableCell sx={{ minWidth: 125 }}>Zone</StyledTableCell>
                        <StyledTableCell sx={{ minWidth: 125 }}>Channel</StyledTableCell>
                        <StyledTableCell align="right" sx={{ minWidth: 150 }}>GW Rx (fr/s)</StyledTableCell>
                        <StyledTableCell align="right" sx={{ minWidth: 150 }}>GW Tx (fr/s)</StyledTableCell>
                        <StyledTableCell align="right" sx={{ minWidth: 150 }}>Total Frames</StyledTableCell>
                        <TableCell sx={{ minWidth: 50 }}/>
                        <StyledTableCell sx={{ width: "100%" }}>CAN Frames/s</StyledTableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {zoneCfg.channels.map((channelObj, channel) =>
                        <Channel key={channel}
                            channel={channel}
                            zone={channelObj.zone}
                            zoneCfg={zoneCfg}
                            initZoneCfg={routingDB}
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
                        <TableCell />
                        <TableCell />
                    </TableRow>
                </TableBody>
            </Table>
        </TableContainer>
    );
};

const Channel = ({
    channel, zone, zoneCfg, initZoneCfg
}) => {

    const { initZoneObj, initChannelObj, channelObj } = useMemo(() => {
        const initZoneObj = initZoneCfg.zones[zone];
        const local_channel = channel - initZoneObj.channels[0].index;
        const initChannelObj = initZoneCfg.zones[zone].channels[local_channel];

        return {
            initZoneObj: initZoneObj,
            initChannelObj: initChannelObj,
            channelObj: zoneCfg.channels[channel]
        };
    }, [channel, zone, initZoneCfg, zoneCfg]);

    const getFramesPerSec = useCallback((channelObj) => {
        return Number(channelObj.deltaCanRx) + Number(channelObj.deltaCanTx);
    }, []);

    const getDisplayBar = useCallback((channelObj) => {
        const count = getFramesPerSec(channelObj);
        let barWidth = parseInt(count / 100) + (count > 0 ? 1 : 0);
        if (barWidth > 40) {
            barWidth = 40;
        }
        const bars = [ ...Array(barWidth).keys() ];
        /*
            🟥	128997	1F7E5	
            🟦	128998	1F7E6	
            🟧	128999	1F7E7	
            🟨	129000	1F7E8	
            🟩	129001	1F7E9	
            🟪	129002	1F7EA	
            🟫	129003	1F7EB
        */
        return (
            <>
                {bars.map((val, index) =>
                    <span key={index}>🟨</span>
                )}
            </>
        );
    }, [getFramesPerSec]);

    const getTotalCan = useCallback((channelObj) => {
        const totalCan = BigInt(channelObj.totalCanTx) + BigInt(channelObj.totalCanRx);
        return totalCan.toString();
    }, []);

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
            <StyledFieldTableCell align="right">{channelObj.deltaCanRx}</StyledFieldTableCell>
            <StyledFieldTableCell align="right">{channelObj.deltaCanTx}</StyledFieldTableCell>
            <StyledFieldTableCell align="right">{getTotalCan(channelObj)}</StyledFieldTableCell>
            <TableCell/>
            <StyledFieldTableCell>
                <Stack direction="row" gap={2}>
                    <Box sx={{ width: 50, fontWeight: 700, display: "flex", justifyContent: "flex-end", alignItems: "center" }} >
                        {getFramesPerSec(channelObj)}
                    </Box>
                    <Box sx={{ fontSize: 10, minWidth: 700, width: "100%", display: "flex", justifyContent: "flex-start", alignItems: "center" }}>
                        {getDisplayBar(channelObj)}
                    </Box>
                </Stack>
            </StyledFieldTableCell>
        </TableRow>
    );
};

export default CanSTATs;