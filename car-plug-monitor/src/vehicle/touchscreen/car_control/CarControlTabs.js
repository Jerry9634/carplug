import { useCallback, useContext, useState } from "react";

import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';

import DirectionsCar from "@mui/icons-material/DirectionsCar";
import Download from "@mui/icons-material/Download";
import ElectricBolt from "@mui/icons-material/ElectricBolt";
import Lightbulb from "@mui/icons-material/Lightbulb";
import Lock from "@mui/icons-material/Lock";
import Monitor from "@mui/icons-material/Monitor";
import Navigation from "@mui/icons-material/Navigation";
import Route from "@mui/icons-material/Route";
import SafetyCheck from "@mui/icons-material/SafetyCheck";
import ToggleOn from "@mui/icons-material/ToggleOn";
import Upgrade from "@mui/icons-material/Upgrade";

import Icon from '@mdi/react';
import { mdiSteering, mdiCarWrench } from "@mdi/js";

import QuickControl from "./QuickControl";
import PedalsSteeringControl from "./PedalsSteeringControl";
import ChargingControl from "./ChargingControl";
import AutoPilotControl from "./AutoPilotControl";
import LightsControl from "./LightsControl";
import LocksControl from "./LocksControl";
import DisplayControl from "./DisplayControl";
import TripsControl from "./TripsControl";
import NavigationControl from "./NavigationControl";
import SafetyControls from "./SafetyControls";
import ServiceControl from "./ServiceControl";
import SoftwareControl from "./SoftwareControl";
import UpgradesControl from "./UpgradesControl";

import { AppContext } from '../../../AppContext';
import { TouchscreenBackground } from "../Touchscreen";


const CarControlTabs = ({
    APP_HEIGHT
}) => {

    const { isDarkTheme } = useContext(AppContext);

    const [value, setValue] = useState(0);

    const handleChange = useCallback((event, newValue) => {
        setValue(newValue);
    }, []);

    return (
        <Box
            sx={{
                position: "relative",
                zIndex: 2,
                height: APP_HEIGHT,
                width: "100%",
                borderTopRightRadius: 4,
                flexGrow: 1,
                bgcolor: TouchscreenBackground(isDarkTheme),
                display: 'flex',
            }}
        >
            <Tabs
                orientation="vertical"
                variant="scrollable"
                value={value}
                onChange={handleChange}
                sx={{ borderRight: 1, borderColor: 'divider' }}
            >
                <Tab label="Controls" {...a11yProps(0)} sx={TabItemStyles}
                    icon={<ToggleOn />} iconPosition="start" />
                <Tab label="Pedals & Steering" {...a11yProps(1)} sx={TabItemStyles}
                    icon={<DirectionsCar />} iconPosition="start" />
                <Tab label="Charging" {...a11yProps(2)} sx={TabItemStyles}
                    icon={<ElectricBolt />} iconPosition="start" />
                <Tab label="Autopilot" {...a11yProps(3)} sx={TabItemStyles}
                    icon={<Icon path={mdiSteering} size={1} />} iconPosition="start" />
                <Tab label="Locks" {...a11yProps(4)} sx={TabItemStyles}
                    icon={<Lock />} iconPosition="start" />
                <Tab label="Lights" {...a11yProps(5)} sx={TabItemStyles}
                    icon={<Lightbulb />} iconPosition="start" />
                <Tab label="Display" {...a11yProps(6)} sx={TabItemStyles}
                    icon={<Monitor />} iconPosition="start" />
                <Tab label="Trips" {...a11yProps(7)} sx={TabItemStyles}
                    icon={<Route />} iconPosition="start" />
                <Tab label="Navigation" {...a11yProps(8)} sx={TabItemStyles}
                    icon={<Navigation />} iconPosition="start" />
                <Tab label="Safety" {...a11yProps(9)} sx={TabItemStyles}
                    icon={<SafetyCheck />} iconPosition="start" />
                <Tab label="Service" {...a11yProps(10)} sx={TabItemStyles}
                    icon={<Icon path={mdiCarWrench} size={1} />} iconPosition="start" />
                <Tab label="Software" {...a11yProps(11)} sx={TabItemStyles}
                    icon={<Download />} iconPosition="start" />
                <Tab label="Upgrades" {...a11yProps(12)} sx={TabItemStyles}
                    icon={<Upgrade />} iconPosition="start" />
            </Tabs>
            <TabPanel value={value} index={0}>
                <QuickControl />
            </TabPanel>
            <TabPanel value={value} index={1}>
                <PedalsSteeringControl />
            </TabPanel>
            <TabPanel value={value} index={2}>
                <ChargingControl />
            </TabPanel>
            <TabPanel value={value} index={3}>
                <AutoPilotControl />
            </TabPanel>
            <TabPanel value={value} index={4}>
                <LocksControl />
            </TabPanel>
            <TabPanel value={value} index={5}>
                <LightsControl />
            </TabPanel>
            <TabPanel value={value} index={6}>
                <DisplayControl />
            </TabPanel>
            <TabPanel value={value} index={7}>
                <TripsControl />
            </TabPanel>
            <TabPanel value={value} index={8}>
                <NavigationControl />
            </TabPanel>
            <TabPanel value={value} index={9}>
                <SafetyControls />
            </TabPanel>
            <TabPanel value={value} index={10}>
                <ServiceControl />
            </TabPanel>
            <TabPanel value={value} index={11}>
                <SoftwareControl />
            </TabPanel>
            <TabPanel value={value} index={12}>
                <UpgradesControl />
            </TabPanel>
        </Box>
    );
};

const TabPanel = (props) => {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`vertical-tabpanel-${index}`}
            aria-labelledby={`vertical-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ padding: 6, width: 640 }}>
                    {children}
                </Box>
            )}
        </div>
    );
};

TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
};

const a11yProps = (index) => {
    return {
        id: `vertical-tab-${index}`,
        'aria-controls': `vertical-tabpanel-${index}`,
    };
};

const TabItemStyles = {
    fontSize: 20, fontWeight: 700, textTransform: "none",
    display: "flex", justifyContent: "flex-start", alignItems: "center",
};

export default CarControlTabs;