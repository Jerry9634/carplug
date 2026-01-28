import { useContext, useEffect, useMemo, useState } from "react";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";

import CloseFullscreen from "@mui/icons-material/CloseFullscreen";

import { AppContext } from '../../AppContext';
import { VehicleContext } from "../VehicleContext";
import { TouchscreenContext } from "./TouchscreenContext";
import { APP_TYPES } from "./nav/NavigationBar";
import CarStatus from "./car_status/CarStatus";
import MapSection from "./map/MapSection";
import NavigationBar from "./nav/NavigationBar";
import { MyTooltip } from "../car_interior/CarInterior";

import { getData, getDataSafely, saveData } from "../../persistency/PersistentMemory";
import vssApi from "../../signal_db/VssAPI.json";
import { subscribeChannel, unsubscribeChannel, initEnumFromVSS } from "../../signal_db/VssSocket";


const SCREEN_WIDTH = 1480;
const SCREEN_HEIGHT = 924;
const LEFT_WIDTH = SCREEN_WIDTH * 0.4;
const BORDER_WIDTH = 24;
const STATUS_BAR_MARGIN = 0;//32;

const TOUCHSCREEN_WIDTH = SCREEN_WIDTH + 2 * BORDER_WIDTH;
const TOUCHSCREEN_HEIGHT = SCREEN_HEIGHT + 2 * BORDER_WIDTH;

const BOTTOM_TASKBAR_HEIGHT = (SCREEN_HEIGHT - STATUS_BAR_MARGIN) * 0.1; // 10%
const UPPER_CONTENT_HEIGHT = SCREEN_HEIGHT - BOTTOM_TASKBAR_HEIGHT; // 90%
const APP_HEIGHT = UPPER_CONTENT_HEIGHT - STATUS_BAR_MARGIN;

const MY_CHANNEL = "Touchscreen";

const SelectedGearType = vssApi.Vehicle.Powertrain.Transmission.SelectedGear;
const PARK = SelectedGearType.allowed.Park;

const Row1DriverSideDoorType = vssApi.Vehicle.Cabin.Door.Row1.DriverSide;
const Row1PassengerSideDoorType = vssApi.Vehicle.Cabin.Door.Row1.PassengerSide;
const Row2DriverSideDoorType = vssApi.Vehicle.Cabin.Door.Row2.DriverSide;
const Row2PassengerSideDoorType = vssApi.Vehicle.Cabin.Door.Row2.PassengerSide;

const TrunkFrontType = vssApi.Vehicle.Body.Trunk.Front;
const TrunkRearType = vssApi.Vehicle.Body.Trunk.Rear;
const ChargePortStatusType = vssApi.Vehicle.Powertrain.TractionBattery.Charging.ChargingPort;

const CurrentLocationType = vssApi.Vehicle.CurrentLocation;

const HMIType = vssApi.Vehicle.Cabin.Infotainment.HMI;


const Touchscreen = () => {

    const { windowSize } = useContext(AppContext);

    const {
        touchscreenOpen, setTouchscreenOpen,
        autopilotOn, destination, setDestination
    } = useContext(VehicleContext);

    const { TRANSFORM } = useMemo(() => {
        const isLargeWindow = (windowSize.width > (TOUCHSCREEN_WIDTH * 0.8) && windowSize.height > (TOUCHSCREEN_HEIGHT * 0.8));
        const scaleFactor = isLargeWindow? 0.8 : 0.7;
        const TOP_OFFSET = (windowSize.height - TOUCHSCREEN_HEIGHT) / 2;
        const LEFT_OFFSET = (windowSize.width - TOUCHSCREEN_WIDTH) / 2;
        const TRANSFORM = `translate(${LEFT_OFFSET}px, ${TOP_OFFSET}px) scale(${scaleFactor});`
        return {
            TOP_OFFSET: TOP_OFFSET,
            LEFT_OFFSET: LEFT_OFFSET,
            TRANSFORM: TRANSFORM
        };
    }, [windowSize]);
    
    const [timeHours, setTimeHours] = useState(initEnumFromVSS(HMIType.TimeFormat));
    const [distanceUnit, setDistanceUnit] = useState(initEnumFromVSS(HMIType.DistanceUnit));
    const [temperatureUnit, setTemperatureUnit] = useState(initEnumFromVSS(HMIType.TemperatureUnit));
    const [energyDisplay, setEnergyDisplay] = useState(getDataSafely("Car.Display.EnergyDisplay", "Percentage"));
    
    const [mapProvider, setMapProvider] = useState(getDataSafely("Car.Navigation.MapProvider", "Google"));

    const [gear, setGear] = useState(PARK);
    const [speed, setSpeed] = useState(0);
    const [distanceToEmptyInKM, setDistanceToEmptyInKM] = useState(getDataSafely("Car.Cluster.DistanceToEmptyInKM", 500));
    const [hazardReq, setHazardReq] = useState(false);

    const [row1DriverDoorLocked, setRow1DriverDoorLocked] = useState(true);
    const [row1PassengerDoorLocked, setRow1PassengerDoorLocked] = useState(true);
    const [row2DriverDoorLocked, setRow2DriverDoorLocked] = useState(true);
    const [row2PassengerDoorLocked, setRow2PassengerDoorLocked] = useState(true);
    const [frunkLocked, setFrunkLocked] = useState(true);
    const [trunkLocked, setTrunkLocked] = useState(true);

    const [row1DriverDoorOpen, setRow1DriverDoorOpen] = useState(false);
    const [row1PassengerDoorOpen, setRow1PassengerDoorOpen] = useState(false);
    const [row2DriverDoorOpen, setRow2DriverDoorOpen] = useState(false);
    const [row2PassengerDoorOpen, setRow2PassengerDoorOpen] = useState(false);
    const [frunkOpen, setFrunkOpen] = useState(false);
    const [trunkOpen, setTrunkOpen] = useState(false);
    const [chargePortOpen, setChargePortOpen] = useState(false);

    const [leftTurnOn, setLeftTurnOn] = useState(false);
    const [rightTurnOn, setRightTurnOn] = useState(false);

    const [latitude, setLatitude] = useState(getData(CurrentLocationType.Latitude.name));
    const [longitude, setLongitude] = useState(getData(CurrentLocationType.Longitude.name));
    const [heading, setHeading] = useState(getDataSafely(CurrentLocationType.Heading.name, 0));

    const [tabIndex, setTabIndex] = useState(-1);
    const [displayBrightness, setDisplayBrightness] = useState(getDataSafely(HMIType.Brightness.name, 100));

    useEffect(() => {
        return () => {
            unsubscribeChannel(MY_CHANNEL);
        };
    }, []);

    useEffect(() => {
        if (touchscreenOpen) {
            subscribeChannel(MY_CHANNEL, [
                // Global
                { signal: SelectedGearType, setter: setGear },
                { signal: vssApi.Vehicle.Speed, setter: setSpeed },
                {
                    signal: vssApi.Vehicle.Powertrain.Range,
                    callback: (value) => setDistanceToEmptyInKM(Math.floor(value/1000))
                },
                { signal: vssApi.Vehicle.Body.Lights.Hazard.IsSignaling, setter: setHazardReq },
                // Doors Lock
                { signal: Row1DriverSideDoorType.IsLocked, setter: setRow1DriverDoorLocked },
                { signal: Row1PassengerSideDoorType.IsLocked, setter: setRow1PassengerDoorLocked },
                { signal: Row2DriverSideDoorType.IsLocked, setter: setRow2DriverDoorLocked },
                { signal: Row2PassengerSideDoorType.IsLocked, setter: setRow2PassengerDoorLocked },
                { signal: TrunkFrontType.IsLocked, setter: setFrunkLocked },
                { signal: TrunkRearType.IsLocked, setter: setTrunkLocked },
                // Doors Open
                { signal: Row1DriverSideDoorType.IsOpen, setter: setRow1DriverDoorOpen },
                { signal: Row1PassengerSideDoorType.IsOpen, setter: setRow1PassengerDoorOpen },
                { signal: Row2DriverSideDoorType.IsOpen, setter: setRow2DriverDoorOpen },
                { signal: Row2PassengerSideDoorType.IsOpen, setter: setRow2PassengerDoorOpen },
                { signal: TrunkFrontType.IsOpen, setter: setFrunkOpen },
                { signal: TrunkRearType.IsOpen, setter: setTrunkOpen },
                { signal: ChargePortStatusType.AnyPosition.IsFlapOpen, setter: setChargePortOpen },
                // Turn Signals
                { signal: vssApi.Vehicle.Body.Lights.DirectionIndicator.Left.IsSignaling, setter: setLeftTurnOn },
                { signal: vssApi.Vehicle.Body.Lights.DirectionIndicator.Right.IsSignaling, setter: setRightTurnOn },
                // Current Location
                { signal: CurrentLocationType.Latitude, setter: setLatitude },
                { signal: CurrentLocationType.Longitude, setter: setLongitude },
                { signal: CurrentLocationType.Heading, setter: setHeading },
            ]);
        }

        return (() => {
            unsubscribeChannel(MY_CHANNEL);
        });
    }, [touchscreenOpen]);

    useEffect(() => {
        saveData("Car.Cluster.DistanceToEmptyInKM", distanceToEmptyInKM);
    }, [distanceToEmptyInKM]);

    return (
        <TouchscreenContext.Provider
            value={{
                // Car
                timeHours, setTimeHours,
                distanceUnit, setDistanceUnit,
                energyDisplay, setEnergyDisplay,
                temperatureUnit, setTemperatureUnit,
                // Map
                autopilotOn, destination, setDestination, mapProvider, setMapProvider,
                // Global
                gear, speed, distanceToEmptyInKM, hazardReq,
                // Doors Lock
                row1DriverDoorLocked, row1PassengerDoorLocked, row2DriverDoorLocked, row2PassengerDoorLocked,
                frunkLocked, trunkLocked,
                // Doors Open
                row1DriverDoorOpen, row1PassengerDoorOpen, row2DriverDoorOpen, row2PassengerDoorOpen,
                frunkOpen, trunkOpen, chargePortOpen,
                // Turn Signals
                leftTurnOn, rightTurnOn,
                // Current Location
                latitude, longitude, heading,
                //
                displayBrightness, setDisplayBrightness
            }}
        >
            <Stack
                sx={{
                    position: "absolute",
                    zIndex: touchscreenOpen ? 100 : -1,
                    width: touchscreenOpen ? TOUCHSCREEN_WIDTH : 0,
                    height: touchscreenOpen ? TOUCHSCREEN_HEIGHT : 0,
                    border: touchscreenOpen ? BORDER_WIDTH + "px solid #0e0e0e" : 0,
                    borderRadius: "16px",
                    backgroundColor: "#000000",
                    filter: `brightness(${displayBrightness}%);`,
                    transform: TRANSFORM
                }}
            >
                <Stack direction="row" sx={{ width: "100%", height: UPPER_CONTENT_HEIGHT }}>
                    <Box sx={{ width: "40%", height: "100%" }}>
                        {touchscreenOpen && tabIndex !== APP_TYPES.DASHCAM &&
                            <CarStatus />
                        }
                    </Box>

                    <Box sx={{ width: "60%", height: "100%" }}>
                        <MapSection />
                    </Box>
                </Stack>

                <Box sx={{ width: "100%", height: BOTTOM_TASKBAR_HEIGHT }}>
                    <NavigationBar
                        APP_LEFT={LEFT_WIDTH} APP_HEIGHT={APP_HEIGHT}
                        tabIndex={tabIndex} setTabIndex={setTabIndex}
                    />
                </Box>

                {touchscreenOpen &&
                    <Button
                        onClick={() => setTouchscreenOpen(false)}
                        sx={{ position: "absolute", left: 0, bottom: 0, width: 64, height: 64 }}
                        id="enlarged-touchscreen"
                    >
                        <CloseFullscreen sx={{ width: 48, height: 48 }} />
                    </Button>
                }

                <MyTooltip id="enlarged-touchscreen" label="Close Touchscreen" />
            </Stack>
        </TouchscreenContext.Provider>
    );
};

export const TouchscreenBackground = (isDarkMode) => (isDarkMode ? "#282828" : "#f8f8f8");

export default Touchscreen;