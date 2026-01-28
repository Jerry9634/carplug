import { useCallback, useEffect, useMemo, useState } from 'react';

import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';

import DarkMode from '@mui/icons-material/DarkMode';
import LightMode from '@mui/icons-material/LightMode';

import { AppContext } from './AppContext';
import { CustomTabPanel, a11yProps } from './common_viewer/CustomStyles';
import {
    APPEARANCE_KEY, DARK_THEME_KEY, NAME_BLUR_KEY,
    getBoolean, getDataSafely, saveData
} from './persistency/PersistentMemory';
import { startCAN } from './signal_db/CanSync';
import vssApi from './signal_db/VssAPI.json';
import { startVSS, setSignal } from './signal_db/VssSocket';

import ZoneConfig from './zone_viewer/ZoneConfig';
import CanSTATs from './zone_viewer/CanSTATs';
import CanTrace, { CANChannelSelection } from './zone_viewer/CanTrace';
import CovesaVssPage from './zone_viewer/CovesaVssPage';
import Vehicle from './vehicle/Vehicle';


const appStore = {
    canStarted: false,
    vssStarted: false
};

export const PAGES = {
    ZONE_CONFIG: {
        index: 0,
        label: "Zone Config"
    },
    CAN_STATS: {
        index: 1,
        label: "CAN STATs"
    },
    CAN_TRACE: {
        index: 2,
        label: "CAN Trace"
    },
    COVESA_VSS: {
        index: 3,
        label: "COVESA VSS"
    },
    VEHICLE_SIMULATOR: {
        index: 4,
        label: "Vehicle Simulator"
    },
};

const BUTTON_SIZE = 40;

const HMIType = vssApi.Vehicle.Cabin.Infotainment.HMI;


const App = () => {

    const DARK_THEME_VAL = useMemo(() => getBoolean(DARK_THEME_KEY), []);

    const INITIAL_THEME = useMemo(() => {
        return createTheme({
            palette: {
                mode: DARK_THEME_VAL ? 'dark' : 'light',
            },
        });
    }, [DARK_THEME_VAL]);

    const [windowSize, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });

    const [page, setPage] = useState(0);
    const [isDarkTheme, setDarkTheme] = useState(DARK_THEME_VAL);
    const [myTheme, setMyTheme] = useState(INITIAL_THEME);
    const [isNameBlurred, setNameBlurred] = useState(getDataSafely(NAME_BLUR_KEY, false));
    const [channel, setChannel] = useState(-1);

    const handlePageChange = useCallback((event, newValue) => {
        setPage(newValue);
        if (page === PAGES.CAN_TRACE.index && newValue !== PAGES.CAN_TRACE.index && channel > -1) {
            setChannel(-1);
        }
    }, [page, channel]);

    const closeVehicle = useCallback(() => {
        setPage(0);
    }, []);

    useEffect(() => {
        const handleResize = () => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };

        document.addEventListener("contextmenu", (e) => {
            e.preventDefault();
        }, false);

        window.addEventListener('resize', handleResize);

        if (!appStore.vssStarted) {
            appStore.vssStarted = true;
            startVSS();
        }
        if (!appStore.canStarted) {
            appStore.canStarted = true;
            startCAN();
        }

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
        saveData(DARK_THEME_KEY, isDarkTheme);
        const appearance = getDataSafely(APPEARANCE_KEY, "Light");
        if (appearance !== "Auto") {
            if (isDarkTheme) {
                saveData(APPEARANCE_KEY, "Dark");
            }
            else {
                saveData(APPEARANCE_KEY, "Light");
            }
        }

        setSignal(HMIType.DayNightMode.name,
            isDarkTheme ?
                HMIType.DayNightMode.allowed.NIGHT :
                HMIType.DayNightMode.allowed.DAY);

        const theme = createTheme({
            palette: {
                mode: isDarkTheme ? 'dark' : 'light',
            },
        });
        setMyTheme(theme);
    }, [isDarkTheme]);

    useEffect(() => {
        saveData(NAME_BLUR_KEY, isNameBlurred);
    }, [isNameBlurred]);

    return (
        <AppContext.Provider
            value={{
                channel, setChannel,
                isDarkTheme, setDarkTheme,
                isNameBlurred,
                windowSize,
                closeVehicle
            }}
        >
            <ThemeProvider theme={myTheme}>
                <CssBaseline />
                {page < PAGES.VEHICLE_SIMULATOR.index ?
                    <Box>
                        <Stack
                            direction="row" gap={1}
                            sx={{
                                borderBottom: 1, borderColor: 'divider', position: "sticky", top: 0, zIndex: 1,
                                width: "100%", display: "flex", alignItems: "center"
                            }}
                        >
                            <Tabs value={page} onChange={handlePageChange} variant="scrollable" scrollButtons="auto" sx={{ width: "70%" }}>
                                {/* CAN */}
                                <Tab label={PAGES.ZONE_CONFIG.label} {...a11yProps(PAGES.ZONE_CONFIG.index)} sx={{ fontSize: 20, fontWeight: "bold" }} />
                                <Tab label={PAGES.CAN_STATS.label} {...a11yProps(PAGES.CAN_STATS.index)} sx={{ fontSize: 20, fontWeight: "bold" }} />
                                <Tab label={PAGES.CAN_TRACE.label} {...a11yProps(PAGES.CAN_TRACE.index)} sx={{ fontSize: 20, fontWeight: "bold" }} />
                                {/* VSS */}
                                <Tab label={PAGES.COVESA_VSS.label} {...a11yProps(PAGES.COVESA_VSS.index)} sx={{ fontSize: 20, fontWeight: "bold" }} />
                                <Tab label={PAGES.VEHICLE_SIMULATOR.label} {...a11yProps(PAGES.VEHICLE_SIMULATOR.index)} sx={{ fontSize: 20, fontWeight: "bold" }} />
                            </Tabs>

                            <Stack direction="row" gap={0} sx={{ width: "30%", display: "flex", alignItems: "center", justifyContent: "flex-end" }} >
                                <CANChannelSelection channel={channel} setChannel={setChannel} />
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={isNameBlurred}
                                            onChange={() => setNameBlurred(!isNameBlurred)}
                                            title="Name Blurring"
                                        />
                                    }
                                    label={isNameBlurred ? "On" : "Off"}
                                    sx={{ ml: 1 }}
                                />
                                <Button
                                    onClick={() => setDarkTheme(!isDarkTheme)}
                                    sx={{ paddingRight: 2 }}
                                    title={isDarkTheme ? "To Light Mode" : "To Dark Mode"}
                                >
                                    {isDarkTheme ?
                                        <DarkMode sx={{ width: BUTTON_SIZE, height: BUTTON_SIZE }} />
                                        : <LightMode sx={{ width: BUTTON_SIZE, height: BUTTON_SIZE }} />}
                                </Button>
                            </Stack>
                        </Stack>

                        <CustomTabPanel value={page} index={PAGES.ZONE_CONFIG.index}>
                            <ZoneConfig />
                        </CustomTabPanel>
                        <CustomTabPanel value={page} index={PAGES.CAN_STATS.index}>
                            <CanSTATs />
                        </CustomTabPanel>
                        <CustomTabPanel value={page} index={PAGES.CAN_TRACE.index}>
                            <CanTrace />
                        </CustomTabPanel>

                        <CustomTabPanel value={page} index={PAGES.COVESA_VSS.index}>
                            <CovesaVssPage />
                        </CustomTabPanel>
                        {/* <CustomTabPanel value={page} index={PAGES.VEHICLE_SIMULATOR.index}>
                            <Vehicle />
                        </CustomTabPanel> */}
                    </Box>
                    :
                    <Vehicle />
                }
            </ThemeProvider>
        </AppContext.Provider>
    );
};

export default App;
