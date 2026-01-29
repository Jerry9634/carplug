import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import useSound from 'use-sound';
import doorCloseSound from './sounds/car-door-close-6929.mp3';

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import Close from "@mui/icons-material/Close";
import PersonAdd from "@mui/icons-material/PersonAdd";
import PersonRemove from "@mui/icons-material/PersonRemove";

import { AppContext } from '../../AppContext';
import { VehicleContext } from "../VehicleContext";
import Battery from "./Battery";
import ExteriorConditions from "./ExteriorConditions";
import LockStatus from "./LockStatus";
import Passengers from "./Passengers";
import { MyTooltip } from "../car_interior/CarInterior";

import { getDataSafely, saveData } from "../../persistency/PersistentMemory";
import vssApi from "../../signal_db/VssAPI.json";
import { subscribeChannel, unsubscribeChannel, setSignal, setSignals } from "../../signal_db/VssSocket";


const MY_CHANNEL = "CarExterior";

const TrunkFrontType = vssApi.Vehicle.Body.Trunk.Front;
const TrunkRearType = vssApi.Vehicle.Body.Trunk.Rear;
const ChargePortStatusType = vssApi.Vehicle.Powertrain.TractionBattery.Charging.ChargingPort;

const Row1DriverSideDoorType = vssApi.Vehicle.Cabin.Door.Row1.DriverSide;
const Row1DriverSideSeatType = vssApi.Vehicle.Cabin.Seat.Row1.DriverSide;
const Row1PassengerSideDoorType = vssApi.Vehicle.Cabin.Door.Row1.PassengerSide;
const Row1PassengerSideSeatType = vssApi.Vehicle.Cabin.Seat.Row1.PassengerSide;
const Row2DriverSideDoorType = vssApi.Vehicle.Cabin.Door.Row2.DriverSide;
const Row2DriverSideSeatType = vssApi.Vehicle.Cabin.Seat.Row2.DriverSide;
const Row2PassengerSideDoorType = vssApi.Vehicle.Cabin.Door.Row2.PassengerSide;
const Row2PassengerSideSeatType = vssApi.Vehicle.Cabin.Seat.Row2.PassengerSide;

const TractionBatteryType = vssApi.Vehicle.Powertrain.TractionBattery;
const RangeType = vssApi.Vehicle.Powertrain.Range;

const chargingStatus = {
    distanceToEmpty: 0,
    chargingInterval: null
};


const CarExterior = () => {

    const { closeVehicle, windowSize } = useContext(AppContext);

    const {
        setDepartureReady,
        row1DriverDoorOpen, row1PassengerDoorOpen, row2DriverDoorOpen, row2PassengerDoorOpen,
        frunkOpen, trunkOpen, chargePortOpen,
        row1DriverDoorLocked, row1PassengerDoorLocked, row2DriverDoorLocked, row2PassengerDoorLocked,
        frunkLocked, trunkLocked,
        row1DriverSeatOccupied, row1DriverSeatBelted,
        row1PassengerSeatOccupied, row1PassengerSeatBelted,
        row2DriverSeatOccupied, row2DriverSeatBelted,
        row2PassengerSeatOccupied, row2PassengerSeatBelted,
        startStopCharging
    } = useContext(VehicleContext);

    const IMAGE_HEIGHT = useMemo(() => windowSize.height * 0.4, [windowSize]);

    const [playDoorClose] = useSound(doorCloseSound, { interrupt: true });

    const [carLocked, setCarLocked] = useState(getDataSafely("Car.Door.CarLocked", true));
    const [isAnyDoorOpen, setIsAnyDoorOpen] = useState(getDataSafely("Car.Door.IsAnyDoorOpen", false));
    const [isAnySideDoorOpen, setIsAnySideDoorOpen] = useState(getDataSafely("Car.Door.IsAnySideDoorOpen", false));
    const [numberOfPassengers, setNumberOfPassengers] = useState(getDataSafely("Car.Seat.NumberOfPassengers", 0));

    const [chargingOngoing, setChargingOngoing] = useState(getDataSafely("Car.Charging.ChargingOngoing", false));

    const [distanceToEmpty, setDistanceToEmpty] = useState(getDataSafely(RangeType.name, 500000));
    const [distanceToEmptyInKM, setDistanceToEmptyInKM] = useState(getDataSafely("Car.Cluster.DistanceToEmptyInKM", 500));

    const [carImage, setCarImage] = useState("./tesla/Model3.png");

    const handleCharging = useCallback(() => {
        if (chargePortOpen) {
            const newVal = !chargingOngoing;
            
            if (newVal) {
                if (startStopCharging !== TractionBatteryType.Charging.StartStopCharging.allowed.START) {
                    setSignal(
                        TractionBatteryType.Charging.StartStopCharging.name,
                        TractionBatteryType.Charging.StartStopCharging.allowed.START
                    );
                }
            }
            else {
                if (startStopCharging !== TractionBatteryType.Charging.StartStopCharging.allowed.STOP) {
                    setSignal(
                        TractionBatteryType.Charging.StartStopCharging.name,
                        TractionBatteryType.Charging.StartStopCharging.allowed.STOP
                    );
                }
            }
        }
    }, [chargePortOpen, chargingOngoing, startStopCharging]);

    const handleFrunkOpen = useCallback(() => {
        const open = !frunkOpen;

        const jsonData = {
            signals: [
                { name: TrunkFrontType.IsOpen.name, value: open ? "True" : "False" }
            ]
        };
        if (open) {
            jsonData.signals.push({ name: TrunkFrontType.IsLocked.name, value: "False" });
        }        
        setSignals(jsonData);
    }, [frunkOpen]);

    const handleTrunkOpen = useCallback(() => {
        const open = !trunkOpen;
        
        const jsonData = {
            signals: [
                { name: TrunkRearType.IsOpen.name, value: open ? "True" : "False" }
            ]
        };
        if (open) {
            jsonData.signals.push({ name: TrunkRearType.IsLocked.name, value: "False" });
        }
        setSignals(jsonData);
    }, [trunkOpen]);

    const handleChargeDoorOpen = useCallback(() => {
        if (!chargePortOpen) {
            setSignal(ChargePortStatusType.AnyPosition.IsFlapOpen.name, "True");
        }
        else {
            if (!chargingOngoing) {
                setSignal(ChargePortStatusType.AnyPosition.IsFlapOpen.name, "False");
            }
        }
    }, [chargePortOpen, chargingOngoing]);

    const handleDriverDoorOpen = useCallback(() => {
        const open = !row1DriverDoorOpen;
        if (!open) {
            playDoorClose();
        }

        const jsonData = {
            signals: [
                { name: Row1DriverSideDoorType.IsOpen.name, value: open ? "True" : "False" }
            ]
        };
        if (open) {
            jsonData.signals.push({ name: Row1DriverSideDoorType.IsLocked.name, value: "False" });
        }
        setSignals(jsonData);
    }, [row1DriverDoorOpen, playDoorClose]);

    const handleGetIn = useCallback(() => {
        if (numberOfPassengers < 4) {
            if (!row1DriverSeatOccupied) {
                setSignal(Row1DriverSideSeatType.IsOccupied.name, "True");
            }
            else if (!row1PassengerSeatOccupied) {
                setSignal(Row1PassengerSideSeatType.IsOccupied.name, "True");
            }
            else if (!row2PassengerSeatOccupied) {
                setSignal(Row2PassengerSideSeatType.IsOccupied.name, "True");
            }
            else if (!row2DriverSeatOccupied) {
                setSignal(Row2DriverSideSeatType.IsOccupied.name, "True");
            }
        }
    }, [numberOfPassengers, row1DriverSeatOccupied, row1PassengerSeatOccupied, row2DriverSeatOccupied, row2PassengerSeatOccupied]);

    const handleGetOut = useCallback(() => {
        if (numberOfPassengers > 0) {
            if (row2DriverSeatOccupied) {
                setSignals({
                    signals: [
                        { name: Row2DriverSideSeatType.IsOccupied.name, value: "False" },
                        { name: Row2DriverSideSeatType.IsBelted.name, value: "False" }
                    ]
                });
            }
            else if (row2PassengerSeatOccupied) {
                setSignals({
                    signals: [
                        { name: Row2PassengerSideSeatType.IsOccupied.name, value: "False" },
                        { name: Row2PassengerSideSeatType.IsBelted.name, value: "False" }
                    ]
                });
            }
            else if (row1PassengerSeatOccupied) {
                setSignals({
                    signals: [
                        { name: Row1PassengerSideSeatType.IsOccupied.name, value: "False" },
                        { name: Row1PassengerSideSeatType.IsBelted.name, value: "False" }
                    ]
                });
            }
            else if (row1DriverSeatOccupied) {
                setSignals({
                    signals: [
                        { name: Row1DriverSideSeatType.IsOccupied.name, value: "False" },
                        { name: Row1DriverSideSeatType.IsBelted.name, value: "False" }
                    ]
                });
            }
        }
    }, [numberOfPassengers, row1DriverSeatOccupied, row1PassengerSeatOccupied, row2DriverSeatOccupied, row2PassengerSeatOccupied]);

    const handleTripStart = useCallback(() => {
        if (row1DriverSeatOccupied && !chargingOngoing) {
            setTimeout(() => setDepartureReady(true), 100);

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
    }, [chargingOngoing, row1DriverSeatOccupied, setDepartureReady]);

    useEffect(() => {
        subscribeChannel(MY_CHANNEL, [
            { signal: RangeType, setter: setDistanceToEmpty },
        ]);

        return () => {
            unsubscribeChannel(MY_CHANNEL);

            if (chargingStatus.chargingInterval) {
                clearInterval(chargingStatus.chargingInterval);
                chargingStatus.chargingInterval = null;
            }
        };
    }, []);

    useEffect(() => {
        let numPassengers = 0;
        if (row1DriverSeatOccupied) {
            numPassengers++;
        }
        if (row1PassengerSeatOccupied) {
            numPassengers++;
        }
        if (row2DriverSeatOccupied) {
            numPassengers++;
        }
        if (row2PassengerSeatOccupied) {
            numPassengers++;
        }
        setNumberOfPassengers(numPassengers);
        saveData("Car.Seat.NumberOfPassengers", numPassengers);
    }, [row1DriverSeatOccupied, row1PassengerSeatOccupied, row2DriverSeatOccupied, row2PassengerSeatOccupied]);

    useEffect(() => {
        if ((startStopCharging === TractionBatteryType.Charging.StartStopCharging.allowed.START && !chargingOngoing)
            || (startStopCharging === TractionBatteryType.Charging.StartStopCharging.allowed.STOP && chargingOngoing)) {
            handleCharging();
        }
    }, [startStopCharging, chargingOngoing, handleCharging]);

    useEffect(() => {
        if (chargingOngoing) {
            setCarImage("./tesla/Supercharger.png");
        }
        else if (chargePortOpen) {
            setCarImage("./tesla/ChargeDoorOpen.png");
        }
        else if (frunkOpen) {
            setCarImage("./tesla/FrunkOpen.png");
        }
        else if (trunkOpen) {
            setCarImage("./tesla/TrunkOpen.png");
        }
        else if (row1DriverDoorOpen) {
            setCarImage("./tesla/DoorOpen.gif");
        }
        else {
            setCarImage("./tesla/Model3.png");
        }

        const anySideDoorOpen = row1DriverDoorOpen || row1PassengerDoorOpen || row2DriverDoorOpen || row2PassengerDoorOpen;
        const anyDoorOpen = anySideDoorOpen || frunkOpen || trunkOpen || chargePortOpen;
        setIsAnySideDoorOpen(anySideDoorOpen);
        setIsAnyDoorOpen(anyDoorOpen);
        saveData("Car.Door.IsAnySideDoorOpen", anySideDoorOpen);
        saveData("Car.Door.IsAnyDoorOpen", anyDoorOpen);
        saveData("Car.Charging.ChargingOngoing", chargingOngoing);
    }, [
        row1DriverDoorOpen, row1PassengerDoorOpen, row2DriverDoorOpen, row2PassengerDoorOpen,
        frunkOpen, trunkOpen, chargePortOpen, chargingOngoing
    ]);
    
    useEffect(() => {
        if (chargingOngoing) {
            if (!chargingStatus.chargingInterval) {
                chargingStatus.distanceToEmpty = distanceToEmpty;
                chargingStatus.chargingInterval = setInterval(() => {
                    if (chargingStatus.distanceToEmpty < 1023000) {
                        chargingStatus.distanceToEmpty += 1000;
                        setSignal(RangeType.name, Math.floor(chargingStatus.distanceToEmpty));
                    }
                }, 1000);
            }
        }
        else {
            if (chargingStatus.chargingInterval) {
                clearInterval(chargingStatus.chargingInterval);
                chargingStatus.chargingInterval = null;
            }
        }

        saveData("Car.Charging.ChargingOngoing", chargingOngoing);
    }, [
        chargingOngoing, distanceToEmpty
    ]);

    useEffect(() => {
        setSignal(RangeType.name, Math.floor(distanceToEmpty));
        const DTE = Math.floor(distanceToEmpty/1000);
        setDistanceToEmptyInKM(DTE);
        saveData("Car.Cluster.DistanceToEmptyInKM", DTE);
        if (distanceToEmpty >= 1023000) {
            if (chargingOngoing) {
                setTimeout(() => {
                    setSignal(
                        TractionBatteryType.Charging.StartStopCharging.name,
                        TractionBatteryType.Charging.StartStopCharging.allowed.STOP
                    );
                    setChargingOngoing(false);
                }, 3000);
            }
        }
    }, [distanceToEmpty, chargingOngoing]);

    useEffect(() => {
        setChargingOngoing(startStopCharging === TractionBatteryType.Charging.StartStopCharging.allowed.START);
    }, [startStopCharging]);

    return (
        <Stack sx={{ width: "100%", height: "100%", justifyContent: "space-around", alignItems: "center" }}>
            <Box sx={{ width: "100%", height: 150, paddingTop: 1, paddingLeft: 4, justifyContent: "center", alignItems: "flex-start" }}>
                <ExteriorConditions showLabel={true} />
            </Box>

            <Box sx={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                <Box sx={{ position: "relative" }}>
                    <img
                        src={carImage} alt=""
                        style={{
                            width: "auto",
                            height: IMAGE_HEIGHT,
                            transition: "all 0.6s ease-in"
                        }}
                    />
                    {!isAnyDoorOpen &&
                        <Box sx={{ position: "absolute", top: -80, left: "50%" }}>
                            <LockStatus
                                size={56} isAnyDoorOpen={isAnyDoorOpen} speed={0}
                                carLocked={carLocked} setCarLocked={setCarLocked}
                                row1DriverDoorLocked={row1DriverDoorLocked}
                                row1PassengerDoorLocked={row1PassengerDoorLocked}
                                row2DriverDoorLocked={row2DriverDoorLocked}
                                row2PassengerDoorLocked={row2PassengerDoorLocked}
                                frunkLocked={frunkLocked}
                                trunkLocked={trunkLocked}
                            />
                        </Box>
                    }

                    {(!isAnyDoorOpen || frunkOpen) &&
                        <Button sx={{ position: "absolute", top: "35%", left: frunkOpen ? -60 : -20, width: 64, height: 64 }}
                            onClick={handleFrunkOpen}
                        >
                            <Stack>
                                <span>Frunk</span>
                                <span style={{ fontSize: 20 }}>{frunkOpen ? "Close" : "Open"}</span>
                            </Stack>
                        </Button>
                    }
                    {(!isAnyDoorOpen || trunkOpen) &&
                        <Button sx={{ position: "absolute", top: -40, right: 40, width: 64, height: 64 }}
                            onClick={handleTrunkOpen}
                        >
                            <Stack>
                                <span>Trunk</span>
                                <span style={{ fontSize: 20 }}>{trunkOpen ? "Close" : "Open"}</span>
                            </Stack>
                        </Button>
                    }
                    {(!isAnyDoorOpen || isAnySideDoorOpen) &&
                        <Button sx={{ position: "absolute", bottom: 40, left: isAnySideDoorOpen ? "40%" : "70%", width: 64, height: 64 }}
                            onClick={handleDriverDoorOpen}
                        >
                            <Stack>
                                <span>Door</span>
                                <span style={{ fontSize: 20 }}>{isAnySideDoorOpen ? "Close" : "Open"}</span>
                            </Stack>
                        </Button>
                    }
                    {(!isAnyDoorOpen || chargePortOpen) && !chargingOngoing &&
                        <Button sx={{ position: "absolute", top: "18%", right: chargePortOpen ? "25%" : -20, width: 64, height: 64 }}
                            onClick={handleChargeDoorOpen}
                        >
                            <Stack>
                                <span>Charge Port</span>
                                <span style={{ fontSize: "20" }}>{chargePortOpen ? "Close" : "Open"}</span>
                            </Stack>
                        </Button>
                    }
                </Box>
            </Box>

            <Stack direction="row"
                sx={{ width: "100%", height: 125, justifyContent: "space-evenly", alignItems: "center" }}
            >
                <ButtonGroup variant="outlined" size="large" sx={{ height: 64 }}>
                    <Button sx={{ width: 96, height: 64 }} id="add-passenger"
                        onClick={handleGetIn}
                    >
                        <PersonAdd sx={{ width: 48, height: 48 }} />
                    </Button>
                    <Button sx={{ width: 96, height: 64 }} id="remove-passenger"
                        onClick={handleGetOut}
                    >
                        <PersonRemove sx={{ width: 48, height: 48 }} />
                    </Button>
                    <Button sx={{ width: 96, height: 64 }} >
                        <Passengers
                            size={24}
                            row1DriverSeatOccupied={row1DriverSeatOccupied} row1PassengerSeatOccupied={row1PassengerSeatOccupied}
                            row2DriverSeatOccupied={row2DriverSeatOccupied} row2PassengerSeatOccupied={row2PassengerSeatOccupied}
                            row1DriverSeatBelted={row1DriverSeatBelted} row1PassengerSeatBelted={row1PassengerSeatBelted}
                            row2DriverSeatBelted={row2DriverSeatBelted} row2PassengerSeatBelted={row2PassengerSeatBelted}
                        />
                    </Button>
                    <Button sx={{ width: 96, height: 64 }} id="trip-start"
                        onClick={handleTripStart}
                    >
                        <Stack>
                            <span>Trip</span>
                            <span style={{ fontSize: "large" }}>Start</span>
                        </Stack>
                    </Button>
                </ButtonGroup>

                <Button variant="outlined" size="large" sx={{ height: 64, width: 180 }} id="charging-start"
                    onClick={handleCharging}
                >
                    <Stack direction="row" sx={{ height: 1, width: 1 }}>
                        <Stack direction="row" sx={{ width: "67%", height: 1, justifyContent: "center", alignItems: "center" }}>
                            <Typography sx={{ fontSize: "large", fontWeight: "bold" }}>
                                {distanceToEmptyInKM}
                            </Typography>
                            <Typography sx={{ fontSize: "normal", fontWeight: "bold", textTransform: "none" }}>
                                &nbsp; km
                            </Typography>
                        </Stack>
                        <Box sx={{ width: "33%", height: 1, justifyContent: "center", alignItems: "center" }}>
                            <Battery distanceToEmptyInKM={distanceToEmptyInKM} chargingOngoing={chargingOngoing} size={48} />
                        </Box>
                    </Stack>
                </Button>
            </Stack>

            <MyTooltip id="car-lock" label={carLocked ? "Unlock the Car" : "Lock the Car"} />

            {numberOfPassengers < 5 &&
                <MyTooltip id="add-passenger" label={"Add Passenger"} />
            }
            {numberOfPassengers > 0 &&
                <MyTooltip id="remove-passenger" label={"Remove Passenger"} />
            }
            <MyTooltip id="trip-start" label={row1DriverSeatOccupied ? "Kick the Road" : "No Driver"} />

            {!chargePortOpen &&
                <MyTooltip id="charging-start" label={"Open Charge Port first"} />
            }
            {chargePortOpen && !chargingOngoing &&
                <MyTooltip id="charging-start" label={"Start Charging"} />
            }
            {chargePortOpen && chargingOngoing &&
                <MyTooltip id="charging-start" label={"Stop Charging"} />
            }

            <Button size="large" onClick={closeVehicle}
                sx={{ position: "absolute", zIndex: 10, bottom: 16, right: 16, width: 150, height: 48, fontSize: 20 }}
                startIcon={<Close />}
            >
                Close
            </Button>
        </Stack>
    );
};

export default CarExterior;