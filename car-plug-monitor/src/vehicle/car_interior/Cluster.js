import { useCallback, useEffect, useState, useContext } from "react";
import useSound from 'use-sound';
import seatbeltWarnSound from './sounds/car-seatbelt-alarm-86950.mp3';

import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import IconButton from "@mui/material/IconButton";
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import Icon from "@mdi/react";
import { mdiArrowLeftBold, mdiArrowRightBold, mdiWiper } from "@mdi/js";

import styled from '@emotion/styled';

import { VehicleContext } from "../VehicleContext";
import { CarInteriorContext } from "./CarInteriorContext";
import ExteriorConditions from "../car_exterior/ExteriorConditions";
import Battery from "../car_exterior/Battery";
import ClusterIndicators from "./ClusterIndicators";
import LockStatus from "../car_exterior/LockStatus";
import Passengers from "../car_exterior/Passengers";
import { MyTooltip } from "./CarInterior";

import vssApi from "../../signal_db/VssAPI.json";
import { setSignal } from "../../signal_db/VssSocket";


const SelectedGearType = vssApi.Vehicle.Powertrain.Transmission.SelectedGear;
const DRIVE = SelectedGearType.allowed.Drive;
const REVERSE = SelectedGearType.allowed.Reverse;

const FrontWipingType = vssApi.Vehicle.Body.Windshield.Front.Wiping;

const DirectionIndicatorType = vssApi.Vehicle.Body.Lights.DirectionIndicator;

const moduleStore = {
    seatbeltWarnInterval: null
};


const Cluster = () => {

    const {
        speed,
        gear,
        departureReady,
        row1DriverDoorLocked,
        row1PassengerDoorLocked,
        row2DriverDoorLocked,
        row2PassengerDoorLocked,
        frunkLocked,
        trunkLocked,
        row1DriverSeatOccupied,
        row1DriverSeatBelted,
        row1PassengerSeatOccupied,
        row1PassengerSeatBelted,
        row2DriverSeatOccupied,
        row2DriverSeatBelted,
        row2PassengerSeatOccupied,
        row2PassengerSeatBelted,
    } = useContext(VehicleContext);

    const {
        distanceToEmptyInKM,
        hazardReq, leftTurnReq, rightTurnReq, setLeftTurnReq, setRightTurnReq,
        carLocked, setCarLocked,
        isAnyDoorOpen,
        frontWipingMode,
        rainIntensity
    } = useContext(CarInteriorContext);

    const [leftTurnLedOn, setLeftTurnLedOn] = useState(false);
    const [rightTurnLedOn, setRightTurnLedOn] = useState(false);
    const [isWiperOn, setIsWiperOn] = useState(false);

    const [isAnySeatBeltWarning, setIsAnySeatBeltWarning] = useState(false);
    const [playSeatbeltWarn, { stop: stopSeatbeltWarn }] = useSound(seatbeltWarnSound, { interrupt: true });

    const handleLeftTurnSignal = useCallback(() => {
        if (!hazardReq && (!leftTurnReq || !rightTurnReq)) {
            if (!leftTurnReq) {
                setSignal(DirectionIndicatorType.Left.IsSignaling.name, "True");
                if (rightTurnReq) {
                    setSignal(DirectionIndicatorType.Right.IsSignaling.name, "False");
                }
            }
            else {
                setSignal(DirectionIndicatorType.Left.IsSignaling.name, "False");
            }
        }
    }, [hazardReq, leftTurnReq, rightTurnReq]);

    const handleRightTurnSignal = useCallback(() => {
        if (!hazardReq && (!leftTurnReq || !rightTurnReq)) {
            if (!rightTurnReq) {
                setSignal(DirectionIndicatorType.Right.IsSignaling.name, "True");
                if (leftTurnReq) {
                    setSignal(DirectionIndicatorType.Left.IsSignaling.name, "False");
                }
            }
            else {
                setSignal(DirectionIndicatorType.Right.IsSignaling.name, "False");
            }
        }
    }, [hazardReq, leftTurnReq, rightTurnReq]);

    useEffect(() => {
        return () => {
            if (moduleStore.seatbeltWarnInterval) {
                clearInterval(moduleStore.seatbeltWarnInterval);
                moduleStore.seatbeltWarnInterval = null;
                stopSeatbeltWarn();
            }
        };
    }, [stopSeatbeltWarn]);

    useEffect(() => {
        if (hazardReq) {
            if (leftTurnReq) {
                setLeftTurnReq(false);
                setLeftTurnLedOn(false);
                setSignal(DirectionIndicatorType.Left.IsSignaling.name, "False");
            }
            if (rightTurnReq) {
                setRightTurnReq(false);
                setRightTurnLedOn(false);
                setSignal(DirectionIndicatorType.Right.IsSignaling.name, "False");
            }
            setTimeout(() => {
                setLeftTurnLedOn(true);
                setRightTurnLedOn(true);
            }, 100);
        }
        else if (leftTurnReq) {
            setLeftTurnLedOn(true);
            setRightTurnLedOn(false);
        }
        else if (rightTurnReq) {
            setLeftTurnLedOn(false);
            setRightTurnLedOn(true);
        }
        else {
            setLeftTurnLedOn(false);
            setRightTurnLedOn(false);
        }
    }, [hazardReq, leftTurnReq, rightTurnReq, setLeftTurnReq, setRightTurnReq]);

    useEffect(() => {
        if (frontWipingMode === FrontWipingType.Mode.allowed.RAIN_SENSOR) {
            if (rainIntensity >= 10) {
                setIsWiperOn(true);
            } else {
                setIsWiperOn(false);
            }
        }
        else {
            if (frontWipingMode === FrontWipingType.Mode.allowed.INTERVAL
                || frontWipingMode === FrontWipingType.Mode.allowed.SLOW
                || frontWipingMode === FrontWipingType.Mode.allowed.MEDIUM
                || frontWipingMode === FrontWipingType.Mode.allowed.FAST
            ) {
                setIsWiperOn(true);
            } else {
                setIsWiperOn(false);
            }
        }
    }, [frontWipingMode, rainIntensity]);

    useEffect(() => {
        let seatBeltWarning = false;
        if (row1DriverSeatOccupied && !row1DriverSeatBelted) {
            seatBeltWarning = true;
        }
        else if (row1PassengerSeatOccupied && !row1PassengerSeatBelted) {
            seatBeltWarning = true;
        }
        else if (row2DriverSeatOccupied && !row2DriverSeatBelted) {
            seatBeltWarning = true;
        }
        else if (row2PassengerSeatOccupied && !row2PassengerSeatBelted) {
            seatBeltWarning = true;
        }
        setIsAnySeatBeltWarning(seatBeltWarning);

        if ((isAnyDoorOpen || seatBeltWarning) && (gear === DRIVE || gear === REVERSE || speed > 0)) {
            if (!moduleStore.seatbeltWarnInterval) {
                playSeatbeltWarn();
                moduleStore.seatbeltWarnInterval = setInterval(() => {
                    playSeatbeltWarn();
                }, 7000);
            }
        }
        else {
            stopSeatbeltWarn();
            if (moduleStore.seatbeltWarnInterval) {
                clearInterval(moduleStore.seatbeltWarnInterval);
                moduleStore.seatbeltWarnInterval = null;
            }
        }
    }, [
        isAnyDoorOpen,
        row1DriverSeatOccupied, row1DriverSeatBelted, row1PassengerSeatOccupied, row1PassengerSeatBelted,
        row2DriverSeatOccupied, row2DriverSeatBelted, row2PassengerSeatOccupied, row2PassengerSeatBelted,
        gear, speed, playSeatbeltWarn, stopSeatbeltWarn
    ]);

    return (
        <Stack direction="row" spacing={6}
            sx={{ width: "100%", height: "100%", alignItems: "center" }}
        >
            <Box sx={{ paddingLeft: 2 }}>
                <ExteriorConditions />
            </Box>

            <Stack direction="row" spacing={1}
                sx={{ width: "100%", justifyContent: "center", alignItems: "center" }}
            >
                <Stack direction="row">
                    <Box sx={{ width: 128, height: 64, display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
                        <Typography sx={{ fontSize: 48, fontWeight: 700 }}>{speed}</Typography>
                    </Box>
                    <Box sx={{ width: 64, height: 64, display: "flex", justifyContent: "center", alignItems: "flex-end", paddingBottom: "12px" }}>
                        <Typography sx={{ fontSize: 16, fontWeight: 700 }}>km/h</Typography>
                    </Box>
                </Stack>

                <Divider orientation="vertical" variant="middle" sx={{ height: 48 }} />

                <Stack direction="row" spacing={1}
                    sx={{ height: 64, display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                    <Typography sx={{ fontSize: 16, fontWeight: 700 }}>
                        {distanceToEmptyInKM} km
                    </Typography>
                    <Battery distanceToEmptyInKM={distanceToEmptyInKM} size={32} />
                </Stack>

                <Divider orientation="vertical" variant="middle" sx={{ height: 48 }} />

                <Stack direction="row">
                    <IconButton id="left-turn"
                        color="success"
                        onClick={handleLeftTurnSignal}
                    >
                        {leftTurnLedOn ?
                            <BlinkLeftTurn />
                            :
                            <Icon path={mdiArrowLeftBold} style={{ width: 32, height: 32 }} />
                        }
                    </IconButton>
                    <IconButton id="right-turn"
                        color="success"
                        onClick={handleRightTurnSignal}
                    >
                        {rightTurnLedOn ?
                            <BlinkRightTurn />
                            :
                            <Icon path={mdiArrowRightBold} style={{ width: 32, height: 32 }} />
                        }
                    </IconButton>
                    <MyTooltip id="left-turn" label="Left Turn Signal" />
                    <MyTooltip id="right-turn" label="Right Turn Signal" />
                </Stack>

                <Divider orientation="vertical" variant="middle" sx={{ height: 48 }} />

                {isWiperOn &&
                    <>
                        <Icon path={mdiWiper} style={{ width: 32, height: 32 }} />
                        <Divider orientation="vertical" variant="middle" sx={{ height: 48 }} />
                    </>
                }

                <ClusterIndicators isAnySeatBeltWarning={isAnySeatBeltWarning} />
            </Stack>

            <Stack direction="row" spacing={1}
                sx={{ paddingRight: 2, height: "100%", justifyContent: "center", alignItems: "center" }}
            >
                <Box id="belted-passengers">
                    <Passengers
                        size={24}
                        row1DriverSeatOccupied={row1DriverSeatOccupied} row1PassengerSeatOccupied={row1PassengerSeatOccupied}
                        row2DriverSeatOccupied={row2DriverSeatOccupied} row2PassengerSeatOccupied={row2PassengerSeatOccupied}
                        row1DriverSeatBelted={row1DriverSeatBelted} row1PassengerSeatBelted={row1PassengerSeatBelted}
                        row2DriverSeatBelted={row2DriverSeatBelted} row2PassengerSeatBelted={row2PassengerSeatBelted}
                        departureReady={departureReady}
                    />
                </Box>
                <Divider orientation="vertical" variant="middle" sx={{ height: 48 }} />
                <LockStatus
                    size={40} isAnyDoorOpen={isAnyDoorOpen} speed={speed}
                    carLocked={carLocked} setCarLocked={setCarLocked}
                    row1DriverDoorLocked={row1DriverDoorLocked}
                    row1PassengerDoorLocked={row1PassengerDoorLocked}
                    row2DriverDoorLocked={row2DriverDoorLocked}
                    row2PassengerDoorLocked={row2PassengerDoorLocked}
                    frunkLocked={frunkLocked}
                    trunkLocked={trunkLocked}
                />
                <MyTooltip id="belted-passengers" label="Seatbelt" />
            </Stack>
        </Stack>
    );
};

const BlinkLeftTurn = () => {
    return (
        <BlinkDiv>
            <Icon path={mdiArrowLeftBold} style={{ width: 32, height: 32 }} />
        </BlinkDiv>
    );
};

const BlinkRightTurn = () => {
    return (
        <BlinkDiv>
            <Icon path={mdiArrowRightBold} style={{ width: 32, height: 32 }} />
        </BlinkDiv>
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

export default Cluster;