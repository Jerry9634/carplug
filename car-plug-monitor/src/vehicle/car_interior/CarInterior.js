import { useContext, useEffect, useMemo, useState } from "react";
import { Tooltip } from 'react-tooltip';

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";

import { AppContext } from '../../AppContext';
import { VehicleContext } from "../VehicleContext";
import { CarInteriorContext } from "./CarInteriorContext";
import Cabin from "./Cabin";
import Cluster from "./Cluster";
import ReactStreetviewMulti from '../driving_simul/ReactStreetviewMulti';

import { getDataSafely, saveData } from "../../persistency/PersistentMemory";
import vssApi from "../../signal_db/VssAPI.json";
import { subscribeChannel, unsubscribeChannel, initBoolFromVSS } from "../../signal_db/VssSocket";


const MY_CHANNEL = "CarInterior";

const CurrentLocationType = vssApi.Vehicle.CurrentLocation;
const RangeType = vssApi.Vehicle.Powertrain.Range;

const Row1DriverSideDoorType = vssApi.Vehicle.Cabin.Door.Row1.DriverSide;
const Row1PassengerSideDoorType = vssApi.Vehicle.Cabin.Door.Row1.PassengerSide;
const Row2DriverSideDoorType = vssApi.Vehicle.Cabin.Door.Row2.DriverSide;
const Row2PassengerSideDoorType = vssApi.Vehicle.Cabin.Door.Row2.PassengerSide;

const HornType = vssApi.Vehicle.Body.Horn;
const HazardType = vssApi.Vehicle.Body.Lights.Hazard;
const FrontWipingType = vssApi.Vehicle.Body.Windshield.Front.Wiping;

const DirectionIndicatorType = vssApi.Vehicle.Body.Lights.DirectionIndicator;

const RainIntensityType = vssApi.Vehicle.Body.Raindetection.Intensity;


const CarInterior = ({
    streetViewPanoramaOptions
}) => {

    const { windowSize } = useContext(AppContext);

    const {
        MAP_API_KEY,
        row1DriverDoorOpen, row1PassengerDoorOpen, row2DriverDoorOpen, row2PassengerDoorOpen,
        frunkOpen, trunkOpen, chargePortOpen
    } = useContext(VehicleContext);

    const { DOOR_WINDOW_HEIGHT, DOOR_WINDOW_WIDTH } = useMemo(() => {
        const IMAGE_HEIGHT = (windowSize.height / 2) * 0.80;
        const IMAGE_WIDTH = IMAGE_HEIGHT * 2.88;

        return {
            DOOR_WINDOW_HEIGHT: IMAGE_HEIGHT,
            DOOR_WINDOW_WIDTH: (windowSize.width - IMAGE_WIDTH - 32) / 2
        };
    }, [windowSize]);

    const [heading, setHeading] = useState(getDataSafely(CurrentLocationType.Heading.name, 0));
    const [distanceToEmptyInKM, setDistanceToEmptyInKM] = useState(getDataSafely("Car.Cluster.DistanceToEmptyInKM", 500));

    const [carLocked, setCarLocked] = useState(getDataSafely("Car.Door.CarLocked", true));
    const [isAnyDoorOpen, setIsAnyDoorOpen] = useState(getDataSafely("Car.Door.IsAnyDoorOpen", false));

    const [hornReq, setHornReq] = useState(false);
    const [hazardReq, setHazardReq] = useState(false);
    const [leftTurnReq, setLeftTurnReq] = useState(false);
    const [rightTurnReq, setRightTurnReq] = useState(false);

    const [row1DriverWindowPos, setRow1DriverWindowPos] = useState(getDataSafely(Row1DriverSideDoorType.Window.Position.name, 0));
    const [row1PassengerWindowPos, setRow1PassengerWindowPos] = useState(getDataSafely(Row1PassengerSideDoorType.Window.Position.name, 0));

    const [leftChildLock, setLeftChildLock] = useState(initBoolFromVSS(Row2DriverSideDoorType.IsChildLockActive));
    const [rightChildLock, setRightChildLock] = useState(initBoolFromVSS(Row2PassengerSideDoorType.IsChildLockActive));

    const [frontWipingMode, setFrontWipingMode] = useState(getDataSafely(FrontWipingType.Mode.name, FrontWipingType.Mode.allowed.OFF));
    const [rainIntensity, setRainIntensity] = useState(getDataSafely(vssApi.Vehicle.Body.Raindetection.Intensity.name, 0));

    useEffect(() => {
        subscribeChannel(MY_CHANNEL, [
            { signal: CurrentLocationType.Heading, setter: setHeading },
            {
                signal: RangeType,
                callback: (value) => setDistanceToEmptyInKM(Math.floor(value / 1000))
            },
            { signal: HornType.IsActive, setter: setHornReq },
            { signal: HazardType.IsSignaling, setter: setHazardReq },
            { signal: Row1DriverSideDoorType.Window.Position, setter: setRow1DriverWindowPos },
            { signal: Row1PassengerSideDoorType.Window.Position, setter: setRow1PassengerWindowPos },
            { signal: Row2DriverSideDoorType.IsChildLockActive, setter: setLeftChildLock },
            { signal: Row2PassengerSideDoorType.IsChildLockActive, setter: setRightChildLock },
            { signal: DirectionIndicatorType.Left.IsSignaling, setter: setLeftTurnReq },
            { signal: DirectionIndicatorType.Right.IsSignaling, setter: setRightTurnReq },
            { signal: FrontWipingType.Mode, setter: setFrontWipingMode },
            { signal: RainIntensityType, setter: setRainIntensity }
        ]);

        return () => {
            unsubscribeChannel(MY_CHANNEL);
        };
    }, []);

    useEffect(() => {
        const anySideDoorOpen = row1DriverDoorOpen || row1PassengerDoorOpen || row2DriverDoorOpen || row2PassengerDoorOpen;
        const anyDoorOpen = anySideDoorOpen || frunkOpen || trunkOpen || chargePortOpen;
        setIsAnyDoorOpen(anyDoorOpen);
        saveData("Car.Door.IsAnySideDoorOpen", anySideDoorOpen);
        saveData("Car.Door.IsAnyDoorOpen", anyDoorOpen);
    }, [
        row1DriverDoorOpen, row1PassengerDoorOpen, row2DriverDoorOpen, row2PassengerDoorOpen,
        frunkOpen, trunkOpen, chargePortOpen
    ]);

    useEffect(() => {
        saveData("Car.Cluster.DistanceToEmptyInKM", distanceToEmptyInKM);
    }, [distanceToEmptyInKM]);

    return (
        <CarInteriorContext.Provider
            value={{
                heading,
                distanceToEmptyInKM,
                carLocked, setCarLocked,
                isAnyDoorOpen,
                hornReq,
                hazardReq,
                row1DriverWindowPos, row1PassengerWindowPos,
                leftChildLock, rightChildLock,
                leftTurnReq, setLeftTurnReq,
                rightTurnReq, setRightTurnReq,
                frontWipingMode, rainIntensity
            }}
        >
            <Box sx={{ width: "100%", height: "100%" }}>
                <Box sx={{ width: "100%", height: "20%" }}>
                    <Cluster/>
                </Box>

                <Stack direction="row" spacing={1} sx={{ width: "100%", height: "80%", justifyContent: "center", alignItems: "center" }}>
                    <Box sx={{ position: "relative", width: DOOR_WINDOW_WIDTH, height: DOOR_WINDOW_HEIGHT }}>
                        {streetViewPanoramaOptions &&
                            <ReactStreetviewMulti
                                viewId={"left-side-mirror"}
                                apiKey={MAP_API_KEY}
                                streetViewPanoramaOptions={{
                                    position: streetViewPanoramaOptions.position,
                                    pov: { heading: (heading - 135), pitch: 0 },
                                    zoom: 1
                                }}
                            />
                        }
                        <Box
                            sx={{
                                position: "absolute", right: 0, top: 0, width: "100%", height: "100%",
                                zIndex: 1, bgcolor: "transparent", opacity: 0.5,
                                borderWidth: 1, borderStyle: "solid", borderColor: "darkgray",
                            }}
                        >
                            <Box sx={{ width: "100%", height: row1DriverWindowPos + "%" }} />
                            <Box sx={{ width: "100%", height: (100 - row1DriverWindowPos) + "%", bgcolor: "lightgray" }} />
                            <Box
                                sx={{
                                    position: "absolute", width: "100%", height: "10%", top: 0,
                                    display: "flex", justifyContent: "center", alignItems: "center"
                                }}
                            >
                                {row1DriverWindowPos} %
                            </Box>
                        </Box>
                    </Box>

                    <Cabin heading={heading} />

                    <Box sx={{ position: "relative", width: DOOR_WINDOW_WIDTH, height: DOOR_WINDOW_HEIGHT }}>
                        {streetViewPanoramaOptions &&
                            <ReactStreetviewMulti
                                viewId={"right-side-mirror"}
                                apiKey={MAP_API_KEY}
                                streetViewPanoramaOptions={{
                                    position: streetViewPanoramaOptions.position,
                                    pov: { heading: (heading + 135), pitch: 0 },
                                    zoom: 1
                                }}
                            />
                        }
                        <Box
                            sx={{
                                position: "absolute", left: 0, top: 0, width: "100%", height: "100%",
                                zIndex: 1, bgcolor: "transparent", opacity: 0.5,
                                borderWidth: 1, borderStyle: "solid", borderColor: "darkgray",
                            }}
                        >
                            <Box sx={{ width: "100%", height: row1PassengerWindowPos + "%" }} />
                            <Box sx={{ width: "100%", height: (100 - row1PassengerWindowPos) + "%", bgcolor: "lightgray" }} />
                            <Box
                                sx={{
                                    position: "absolute", width: "100%", height: "10%", top: 0,
                                    display: "flex", justifyContent: "center", alignItems: "center"
                                }}
                            >
                                {row1PassengerWindowPos} %
                            </Box>
                        </Box>
                    </Box>
                </Stack>
            </Box>
        </CarInteriorContext.Provider>
    );
};

export const MyTooltip = ({
    id, label
}) => {
    return (
        <Tooltip
            anchorSelect={"#" + id} place="top"
            style={{ zIndex: 10, backgroundColor: "yellow", color: "#222", borderRadius: 8, fontSize: 20 }}
            content={label}
        />
    );
};

export const MyTooltip2 = ({
    id, label
}) => {
    return (
        <Tooltip
            anchorSelect={"." + id} place="top"
            style={{ zIndex: 10, backgroundColor: "yellow", color: "#222", borderRadius: 8, fontSize: 20 }}
            content={label}
        />
    );
};

export default CarInterior;