import { useCallback, useContext, useMemo, useEffect } from "react";
import useSound from 'use-sound';
import hornSound from './sounds/car-horn-90973.mp3';
import hazardLightsSound from './sounds/039355_hazard-lights-60570.mp3';

import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";

import OpenInFull from "@mui/icons-material/OpenInFull";

import styled from '@emotion/styled';

import Icon from "@mdi/react";
import {
    mdiAlphaPBoxOutline, mdiAlphaRBoxOutline, mdiAlphaNBoxOutline, mdiAlphaDBoxOutline,
    mdiBugle, mdiHazardLights, mdiSteering
} from "@mdi/js";

import DoorSwitch from "./DoorSwitch";
import DoorWindow from "./DoorWindow";
import LongPressButton from "./LongPressButton";
import { MyTooltip, MyTooltip2 } from "./CarInterior";

import { AppContext } from '../../AppContext';
import { VehicleContext } from "../VehicleContext";
import { CarInteriorContext } from "./CarInteriorContext";
import vssApi from "../../signal_db/VssAPI.json";
import { setSignal, setSignals } from "../../signal_db/VssSocket";


const SelectedGearType = vssApi.Vehicle.Powertrain.Transmission.SelectedGear;
const DRIVE = SelectedGearType.allowed.Drive;
const NEUTRAL = SelectedGearType.allowed.Neutral;
const PARK = SelectedGearType.allowed.Park;
const REVERSE = SelectedGearType.allowed.Reverse;
const SpeedType = vssApi.Vehicle.Speed;

const TrunkFrontType = vssApi.Vehicle.Body.Trunk.Front;
const TrunkRearType = vssApi.Vehicle.Body.Trunk.Rear;

const Row1DriverSideDoorType = vssApi.Vehicle.Cabin.Door.Row1.DriverSide;
const Row1PassengerSideDoorType = vssApi.Vehicle.Cabin.Door.Row1.PassengerSide;
const Row2DriverSideDoorType = vssApi.Vehicle.Cabin.Door.Row2.DriverSide;
const Row2PassengerSideDoorType = vssApi.Vehicle.Cabin.Door.Row2.PassengerSide;

const HeadingType = vssApi.Vehicle.CurrentLocation.Heading;
const HornType = vssApi.Vehicle.Body.Horn;
const HazardType = vssApi.Vehicle.Body.Lights.Hazard;

const moduleStore = {
    hornInterval: null,
    hazardLightsInterval: null
};


const Cabin = () => {

    const { windowSize } = useContext(AppContext);
    
    const {
        setTouchscreenOpen,
        autopilotOn, setAutopilotOn,
        speed,
        destination,
        gear,
        setDepartureReady,
        // door
        row1DriverDoorOpen,
        row1PassengerDoorOpen,
        row2DriverDoorOpen,
        row2PassengerDoorOpen
    } = useContext(VehicleContext);

    const {
        heading,
        distanceToEmptyInKM,
        // horn, hazard, turn signal
        hornReq,
        hazardReq,
        leftTurnReq, rightTurnReq,
        // window
        row1DriverWindowPos: frontLeftWindowPos,
        row1PassengerWindowPos: frontRightWindowPos,
        // child lock
        leftChildLock,
        rightChildLock,
    } = useContext(CarInteriorContext);

    const {
        IMAGE_HEIGHT, IMAGE_WIDTH,
        TOUCHSCREEN_X_POS, TOUCHSCREEN_Y_POS,
        HORN_X_POS, HORN_Y_POS,
        STEER_AUTO_X_POS, STEER_AUTO_Y_POS,
        STEER_LEFT_X_POS, STEER_RIGHT_X_POS, STEER_Y_POS,
        BRAKE_X_POS, BRAKE_Y_POS, ACCEL_X_POS,
        GEAR_X_POS, GEAR_Y_POS,
        DOOR_Y_POS
    } = useMemo(() => {
        const IMAGE_HEIGHT = (windowSize.height / 2) * 0.80;
        const IMAGE_WIDTH = IMAGE_HEIGHT * 2.88;

        const HORN_Y_POS = IMAGE_HEIGHT * 0.59;

        return {
            IMAGE_HEIGHT: IMAGE_HEIGHT,
            IMAGE_WIDTH: IMAGE_WIDTH,
            TOUCHSCREEN_X_POS: IMAGE_WIDTH * 0.47,
            TOUCHSCREEN_Y_POS: IMAGE_HEIGHT * 0.58,
            HORN_X_POS: IMAGE_WIDTH * 0.23,
            HORN_Y_POS: HORN_Y_POS,
            STEER_AUTO_X_POS: IMAGE_WIDTH * 0.31,
            STEER_AUTO_Y_POS: HORN_Y_POS,
            STEER_LEFT_X_POS: IMAGE_WIDTH * 0.17,
            STEER_RIGHT_X_POS: IMAGE_WIDTH * 0.30,
            STEER_Y_POS: IMAGE_HEIGHT * 0.42,
            BRAKE_X_POS: IMAGE_WIDTH * 0.33,
            BRAKE_Y_POS: IMAGE_HEIGHT * 0.23,
            ACCEL_X_POS: IMAGE_WIDTH * 0.39,
            GEAR_X_POS: IMAGE_WIDTH * 0.46,
            GEAR_Y_POS: IMAGE_HEIGHT * 0.25,
            DOOR_Y_POS: 8,
        }
    }, [windowSize]);

    const [playHorn, { stop: stopHorn }] = useSound(hornSound, { interrupt: true });

    const [playHazardLights, { stop: stopHazardLights }] = useSound(hazardLightsSound, { interrupt: true });

    const handleHorn = useCallback((req) => {
        setSignal(HornType.IsActive.name, req ? "True" : "False");
    }, []);

    const autoSteer = useCallback(() => {
        if (destination && destination.length >= 3 && distanceToEmptyInKM > 0) {
            setAutopilotOn(!autopilotOn);
        }
    }, [autopilotOn, destination, distanceToEmptyInKM, setAutopilotOn]);

    const getNewSteer = useCallback((oldVal, dir) => {
        let newVal = oldVal;
        const DELTA = 5;
        if (dir === "left") {
            if (gear !== REVERSE) {
                newVal -= DELTA;
            }
            else {
                newVal += DELTA;
            }
        }
        else {
            if (gear !== REVERSE) {
                newVal += DELTA;
            }
            else {
                newVal -= DELTA;
            }
        }

        if (newVal < 0) {
            newVal += 360;
        }
        if (newVal > 360) {
            newVal -= 360;
        }
        return newVal;
    }, [gear]);

    const getNewSpeed = useCallback((oldVal, dir) => {
        let delta;
        if (dir === "up") {
            if (oldVal < 20) {
                delta = 5;
            }
            else if (oldVal < 50) {
                delta = 10;
            }
            else if (oldVal < 100) {
                delta = 10;
            }
            else {
                delta = 20;
            }
        }
        else {
            if (oldVal <= 24) {
                delta = 5;
            }
            else if (oldVal <= 60) {
                delta = 10;
            }
            else if (oldVal <= 120) {
                delta = 20;
            }
            else {
                delta = 40;
            }
        }

        let newVal = oldVal;
        if (dir === "down") {
            newVal -= delta;
            if (newVal < 0) {
                newVal = 0;
            }
        }
        else {
            newVal += delta;
            if (newVal > 500) {
                newVal = 500;
            }
        }

        return newVal;
    }, []);

    const handleGearP = useCallback(() => {
        if (gear !== PARK && speed === 0 && !autopilotOn) {
            setSignals({
                signals: [
                    { name: SelectedGearType.name, value: PARK },
                    { name: SpeedType.name, value: 0 }
                ]
            });
        }
    }, [autopilotOn, gear, speed]);

    const handleGearR = useCallback(() => {
        if (gear !== REVERSE && speed === 0 && !autopilotOn) {
            setSignal(SelectedGearType.name, REVERSE);
        }
    }, [autopilotOn, gear, speed]);

    const handleGearN = useCallback(() => {
        if (gear !== NEUTRAL && speed === 0 && !autopilotOn) {
            setSignal(SelectedGearType.name, NEUTRAL);
        }
    }, [autopilotOn, gear, speed]);

    const handleGearD = useCallback(() => {
        if (gear !== DRIVE && speed === 0) {
            setSignal(SelectedGearType.name, DRIVE);
        }
    }, [gear, speed]);

    const handleHazardReq = useCallback(() => {
        const newVal = !hazardReq;
        setSignal(HazardType.IsSignaling.name, newVal ? "True" : "False");
    }, [hazardReq]);

    const handleFrontLeftDoorOpen = useCallback(() => {
        const newVal = !row1DriverDoorOpen;
        if (newVal) {
            if (speed === 0 && gear !== DRIVE && gear !== REVERSE) {
                setDepartureReady(false);
                if (hazardReq || leftTurnReq || rightTurnReq) {
                    stopHazardLights();
                    if (moduleStore.hazardLightsInterval) {
                        clearInterval(moduleStore.hazardLightsInterval);
                        moduleStore.hazardLightsInterval = null;
                    }
                }

                setSignals({
                    signals: [
                        { name: Row1DriverSideDoorType.IsOpen.name, value: "False" },
                        { name: Row2DriverSideDoorType.IsOpen.name, value: "False" },
                    ]
                });
                setSignals({
                    signals: [
                        { name: Row1PassengerSideDoorType.IsOpen.name, value: "False" },
                        { name: Row2PassengerSideDoorType.IsOpen.name, value: "False" },
                    ]
                });
                setSignal(TrunkFrontType.IsOpen.name, "False");
                setSignal(TrunkRearType.IsOpen.name, "False");
            }
        }
        else {
            setSignal(Row1DriverSideDoorType.IsOpen.name, "False");
        }
    }, [gear, hazardReq, leftTurnReq, rightTurnReq, row1DriverDoorOpen, setDepartureReady, speed, stopHazardLights]);

    const handleFrontRightDoorOpen = useCallback(() => {
        const newVal = !row1PassengerDoorOpen;
        if (newVal) {
            if (speed === 0) {
                setSignals({
                    signals: [
                        { name: Row1PassengerSideDoorType.IsLocked.name, value: "False" },
                        { name: Row1PassengerSideDoorType.IsOpen.name, value: "True" }
                    ]
                });
            }
        }
        else {
            setSignal(Row1PassengerSideDoorType.IsOpen.name, "False");
        }
    }, [row1PassengerDoorOpen, speed]);

    const handleRearLeftDoorOpen = useCallback(() => {
        const newVal = !row2DriverDoorOpen;
        if (newVal) {
            if (speed === 0 && !leftChildLock) {
                setSignals({
                    signals: [
                        { name: Row2DriverSideDoorType.IsLocked.name, value: "False" },
                        { name: Row2DriverSideDoorType.IsOpen.name, value: "True" }
                    ]
                });
            }
        }
        else {
            setSignal(Row2DriverSideDoorType.IsOpen.name, "False");
        }
    }, [leftChildLock, row2DriverDoorOpen, speed]);

    const handleRearRightDoorOpen = useCallback(() => {
        const newVal = !row2PassengerDoorOpen;
        if (newVal) {
            if (speed === 0 && !rightChildLock) {
                setSignals({
                    signals: [
                        { name: Row2PassengerSideDoorType.IsLocked.name, value: "False" },
                        { name: Row2PassengerSideDoorType.IsOpen.name, value: "True" }
                    ]
                });
            }
        }
        else {
            setSignal(Row2PassengerSideDoorType.IsOpen.name, "False");
        }
    }, [rightChildLock, row2PassengerDoorOpen, speed]);

    useEffect(() => {
        return () => {
            if (moduleStore.hornInterval) {
                clearInterval(moduleStore.hornInterval);
                moduleStore.hornInterval = null;
            }
            stopHorn();

            if (moduleStore.hazardLightsInterval) {
                clearInterval(moduleStore.hazardLightsInterval);
                moduleStore.hazardLightsInterval = null;
            }
            stopHazardLights();
        };
    }, [stopHazardLights, stopHorn]);

    useEffect(() => {
        if (hornReq) {
            if (!moduleStore.hornInterval) {
                moduleStore.hornInterval = setInterval(playHorn, 8000);
                playHorn();
            }
        }
        else {
            if (moduleStore.hornInterval) {
                clearInterval(moduleStore.hornInterval);
            }
            moduleStore.hornInterval = null;
            stopHorn();
        }
    }, [hornReq, playHorn, stopHorn]);

    useEffect(() => {
        if (hazardReq || leftTurnReq || rightTurnReq) {
            if (!moduleStore.hazardLightsInterval) {
                moduleStore.hazardLightsInterval = setInterval(playHazardLights, 23000);
                playHazardLights();
            }
        }
        else {
            if (moduleStore.hazardLightsInterval) {
                clearInterval(moduleStore.hazardLightsInterval);
            }
            moduleStore.hazardLightsInterval = null;
            stopHazardLights();
        }
    }, [hazardReq, leftTurnReq, rightTurnReq, playHazardLights, stopHazardLights]);

    return (
        <Box
            sx={{ position: "relative", height: IMAGE_HEIGHT, width: IMAGE_WIDTH }}
        >
            <img src="./tesla/6-Tesla-Model-S.webp" style={{ height: IMAGE_HEIGHT, width: IMAGE_WIDTH }} alt="" />

            <IconButton variant="outlined" id="touchscreen"
                sx={{
                    position: "absolute", left: TOUCHSCREEN_X_POS, bottom: TOUCHSCREEN_Y_POS,
                    width: 64, height: 64, color: "#ffffff", bgcolor: "#000000", opacity: 0.8
                }}
                onClick={() => setTouchscreenOpen(true)}
            >
                <OpenInFull sx={{ width: 48, height: 48 }} />
            </IconButton>

            <IconButton id="horn"
                sx={{
                    position: "absolute", left: HORN_X_POS, bottom: HORN_Y_POS,
                    color: hornReq ? "#fbb03b" : "#ffffff"
                }}
                onMouseDown={() => handleHorn(true)}
                onMouseUp={() => handleHorn(false)}
            >
                <Icon path={mdiBugle} style={{ width: 48, height: 48 }} />
            </IconButton>
            <IconButton id="autopilot"
                sx={{
                    position: "absolute", left: STEER_AUTO_X_POS, bottom: STEER_AUTO_Y_POS,
                    color: autopilotOn ? "#fbb03b" : "#ffffff"
                }}
                onClick={autoSteer}
            >
                <Icon path={mdiSteering} style={{ width: 48, height: 48 }} />
            </IconButton>
            <Box sx={{ position: "absolute", left: STEER_LEFT_X_POS, bottom: STEER_Y_POS }} id="left-steer">
                <LongPressButton
                    index={0}
                    signalName={HeadingType.name}
                    signalValue={heading}
                    getNewValue={getNewSteer}
                    dir="left"
                    enabled={!autopilotOn}
                />
            </Box>
            <Box sx={{ position: "absolute", left: STEER_RIGHT_X_POS, bottom: STEER_Y_POS }} id="right-steer">
                <LongPressButton
                    index={1}
                    signalName={HeadingType.name}
                    signalValue={heading}
                    getNewValue={getNewSteer}
                    dir="right"
                    enabled={!autopilotOn}
                />
            </Box>

            <Box sx={{ position: "absolute", left: BRAKE_X_POS, bottom: BRAKE_Y_POS }} id="brake">
                <LongPressButton
                    index={2}
                    signalName={SpeedType.name}
                    signalValue={speed}
                    getNewValue={getNewSpeed}
                    dir="down"
                    enabled={true}
                />
            </Box>
            <Box sx={{ position: "absolute", left: ACCEL_X_POS, bottom: BRAKE_Y_POS }} id="accel">
                <LongPressButton
                    index={3}
                    signalName={SpeedType.name}
                    signalValue={speed}
                    getNewValue={getNewSpeed}
                    dir="up"
                    enabled={distanceToEmptyInKM > 0 && (gear === DRIVE || gear === REVERSE)}
                />
            </Box>

            <Stack direction="row"
                sx={{ position: "absolute", left: GEAR_X_POS, bottom: GEAR_Y_POS, justifyContent: "center", alignItems: "center" }}
            >
                <IconButton id="gear-p" onClick={handleGearP} sx={{ padding: 0 }}>
                    <Icon path={mdiAlphaPBoxOutline}
                        style={{ color: gear === PARK ? "#fbb03b" : "#ffffff", width: 48, height: 48 }}
                    />
                </IconButton>
                <IconButton id="gear-r" onClick={handleGearR} sx={{ padding: 0 }}>
                    <Icon path={mdiAlphaRBoxOutline}
                        style={{ color: gear === REVERSE ? "#fbb03b" : "#ffffff", width: 48, height: 48 }}
                    />
                </IconButton>
                <IconButton id="hazard" color="error" onClick={handleHazardReq}>
                    {hazardReq ?
                        <BlinkDiv>
                            <Icon path={mdiHazardLights} style={{ width: 40, height: 40 }} />
                        </BlinkDiv>
                        :
                        <Icon path={mdiHazardLights} style={{ width: 40, height: 40 }} />
                    }
                </IconButton>
                <IconButton id="gear-n" onClick={handleGearN} sx={{ padding: 0 }}>
                    <Icon path={mdiAlphaNBoxOutline}
                        style={{ color: gear === NEUTRAL ? "#fbb03b" : "#ffffff", width: 48, height: 48 }}
                    />
                </IconButton>
                <IconButton id="gear-d" onClick={handleGearD} sx={{ padding: 0 }}>
                    <Icon path={mdiAlphaDBoxOutline}
                        style={{ color: gear === DRIVE ? "#fbb03b" : "#ffffff", width: 48, height: 48 }}
                    />
                </IconButton>
            </Stack>

            <Stack spacing={2}
                sx={{
                    position: "absolute", left: 8, bottom: DOOR_Y_POS,
                    display: "flex", justifyContent: "center", alignItems: "flex-start"
                }}
            >
                <Box>
                    <DoorWindow
                        index={0}
                        windowName={Row1DriverSideDoorType.Window.Position.name}
                        windowPos={frontLeftWindowPos}
                    />
                </Box>
                <Stack spacing={1}>
                    <Box className="door-switch">
                        <DoorSwitch
                            doorOpen={row1DriverDoorOpen}
                            pressSwitch={handleFrontLeftDoorOpen}
                            doorOpenImage={"./tesla/tesla-door-left-active.webp"}
                            doorClosedImage={"./tesla/tesla-door-left.webp"}
                        />
                    </Box>
                    <Box className="door-switch">
                        <DoorSwitch
                            doorOpen={row2DriverDoorOpen}
                            pressSwitch={handleRearLeftDoorOpen}
                            doorOpenImage={"./tesla/tesla-door-left-active.webp"}
                            doorClosedImage={"./tesla/tesla-door-left.webp"}
                        />
                    </Box>
                </Stack>
            </Stack>
            <Stack spacing={2}
                sx={{
                    position: "absolute", right: 8, bottom: DOOR_Y_POS,
                    display: "flex", justifyContent: "center", alignItems: "flex-end"
                }}
            >
                <Box>
                    <DoorWindow
                        index={1}
                        windowName={Row1PassengerSideDoorType.Window.Position.name}
                        windowPos={frontRightWindowPos}
                    />
                </Box>
                <Stack spacing={1}>
                    <Box className="door-switch">
                        <DoorSwitch
                            doorOpen={row1PassengerDoorOpen}
                            pressSwitch={handleFrontRightDoorOpen}
                            doorOpenImage={"./tesla/tesla-door-right-active.webp"}
                            doorClosedImage={"./tesla/tesla-door-right.webp"}
                        />
                    </Box>
                    <Box className="door-switch">
                        <DoorSwitch
                            doorOpen={row2PassengerDoorOpen}
                            pressSwitch={handleRearRightDoorOpen}
                            doorOpenImage={"./tesla/tesla-door-right-active.webp"}
                            doorClosedImage={"./tesla/tesla-door-right.webp"}
                        />
                    </Box>
                </Stack>
            </Stack>

            <MyTooltip id="left-steer" label="Left Steering" />
            <MyTooltip id="autopilot" label="Activate Autopilot" />
            <MyTooltip id="right-steer" label="Right Steering" />
            <MyTooltip id="horn" label="Horn" />

            <MyTooltip id="brake" label="Brake Pedal" />
            <MyTooltip id="accel" label="Accelerator Pedal" />

            <MyTooltip id="gear-p" label="Parking Gear" />
            <MyTooltip id="gear-r" label="Reverse Gear" />
            <MyTooltip id="hazard" label="Hazard Light" />
            <MyTooltip id="gear-n" label="Neutral Gear" />
            <MyTooltip id="gear-d" label="Drive Gear" />

            <MyTooltip2 id="door-switch" label="Open/Close Door" />
            <MyTooltip2 id="window-up" label="Window Up" />
            <MyTooltip2 id="window-down" label="Window Down" />

            <MyTooltip id="touchscreen" label="Open Touchscreen" />
        </Box>
    );
};

const BlinkDiv = styled.div`
  animation: blink 0.5s infinite;

  @keyframes blink {
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }
`;

export default Cabin;