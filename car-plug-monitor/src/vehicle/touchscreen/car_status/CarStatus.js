import { useCallback, useContext, useEffect, useMemo, useState } from "react";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";

import ElectricBolt from "@mui/icons-material/ElectricBolt";
import Lock from "@mui/icons-material/Lock";
import LockOpen from "@mui/icons-material/LockOpen";

import vssApi from "../../../signal_db/VssAPI.json";
import { setSignal, setSignals } from "../../../signal_db/VssSocket";

import { AppContext } from '../../../AppContext';
import { VehicleContext } from "../../VehicleContext";
import { TouchscreenContext } from "../TouchscreenContext";
import IndicatorOverlay from "./IndicatorOverlay";
import ReactStreetviewMulti from "../../driving_simul/ReactStreetviewMulti";
import StatusOverlay from "./StatusOverlay";


const IMAGE_WIDTH = "auto";
const IMAGE_HEIGHT = 240;

const SelectedGearType = vssApi.Vehicle.Powertrain.Transmission.SelectedGear;
const DRIVE = SelectedGearType.allowed.Drive;

const Row1DriverSideDoorType = vssApi.Vehicle.Cabin.Door.Row1.DriverSide;
const Row1PassengerSideDoorType = vssApi.Vehicle.Cabin.Door.Row1.PassengerSide;
const Row2DriverSideDoorType = vssApi.Vehicle.Cabin.Door.Row2.DriverSide;
const Row2PassengerSideDoorType = vssApi.Vehicle.Cabin.Door.Row2.PassengerSide;

const TrunkFrontType = vssApi.Vehicle.Body.Trunk.Front;
const TrunkRearType = vssApi.Vehicle.Body.Trunk.Rear;
const ChargePortStatusType = vssApi.Vehicle.Powertrain.TractionBattery.Charging.ChargingPort;


const CarStatus = () => {

    const { isDarkTheme } = useContext(AppContext);

    const {
        MAP_API_KEY,
        streetViewPanoramaOptions
    } = useContext(VehicleContext);

    const {
        gear,
        // Doors Lock
        row1DriverDoorLocked,
        row1PassengerDoorLocked,
        row2DriverDoorLocked,
        row2PassengerDoorLocked,
        frunkLocked,
        trunkLocked,
        // Doors Open
        row1DriverDoorOpen,
        row1PassengerDoorOpen,
        row2DriverDoorOpen,
        row2PassengerDoorOpen,
        frunkOpen,
        trunkOpen,
        chargePortOpen,
    } = useContext(TouchscreenContext);

    const styledContainer = useMemo(() => ({
        position: "relative",
        height: "100%",
        width: "100%",
        backgroundColor: isDarkTheme ? "#181818" : "#f0f0f0",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        borderTopLeftRadius: 8,
        image: {
            position: "absolute",
            zIndex: 0,
            top: "6%",
            left: 0,
            width: "100%",
            height: "94%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
        },
        streetView: {
            position: "absolute",
            zIndex: 0,
            top: "6%",
            left: 0,
            width: "100%",
            height: "94%"
        }
    }), [isDarkTheme]);

    const [carLocked, setCarLocked] = useState(true);

    const {
        styledDoorLock, styledDoorLockVL,
        styledFrunk, styledFrunkVL, styledFrunkBtn,
        styledTrunk, styledTrunkVL, styledTrunkBtn,
        styledChargingDoor, styledChargingDoorVL, styledChargingDoorBtn
    } = useMemo(() => {
        const styledDoorLock = {
            position: "absolute",
            top: doorLockPosInit.top,
            left: doorLockPosInit.left,
            width: 64,
            height: 64
        };

        const styledDoorLockVL = {
            position: "absolute",
            backgroundColor: "#42a5f5",
            width: doorLockPosInit.vlWidth,
            height: 50,
            top: doorLockPosInit.vlTop,
            left: doorLockPosInit.vlLeft
        };

        const styledFrunk = {
            position: "absolute",
            top: frunkPosInit.vlTop,
            left: frunkPosInit.vlLeft - 64,
            width: 64,
            height: 64,
            textTransform: "none"
        };

        const styledFrunkVL = {
            position: "absolute",
            backgroundColor: "#42a5f5",
            height: 90,
            width: frunkPosInit.vlWidth,
            top: frunkPosInit.vlTop,
            left: frunkPosInit.vlLeft
        };

        const styledFrunkBtn = {
            cursor: "pointer",
            position: "absolute",
            width: frunkPosInit.width,
            height: frunkPosInit.height,
            top: frunkPosInit.top,
            left: frunkPosInit.left,
            //bgcolor: "yellow", opacity: 0.5,
            bgcolor: "transparent",
            border: 0
        };

        const styledTrunk = {
            position: "absolute",
            top: trunkPosInit.vlTop,
            left: trunkPosInit.vlLeft,
            width: 64,
            height: 64,
            textTransform: "none"
        };

        const styledTrunkVL = {
            position: "absolute",
            backgroundColor: "#42a5f5",
            height: trunkPosInit.vlHeight,
            width: trunkPosInit.vlWidth,
            top: trunkPosInit.vlTop,
            left: trunkPosInit.vlLeft
        };

        const styledTrunkBtn = {
            cursor: "pointer",
            position: "absolute",
            width: trunkPosInit.width,
            height: trunkPosInit.height,
            top: trunkPosInit.top,
            left: trunkPosInit.left,
            //bgcolor: "yellow", opacity: 0.5,
            bgcolor: "transparent",
            border: 0
        };

        const styledChargingDoor = {
            position: "absolute",
            top: chargingDoorPosInit.vlTop - 28,
            left: chargingDoorPosInit.vlLeft + chargingDoorPosInit.vlWidth,
            width: 56,
            height: 56
        };

        const styledChargingDoorVL = {
            position: "absolute",
            backgroundColor: "#42a5f5",
            height: chargingDoorPosInit.vlHeight,
            width: chargingDoorPosInit.vlWidth,
            top: chargingDoorPosInit.vlTop,
            left: chargingDoorPosInit.vlLeft
        };

        const styledChargingDoorBtn = {
            cursor: "pointer",
            position: "absolute",
            width: chargingDoorPosInit.width,
            height: chargingDoorPosInit.height,
            top: chargingDoorPosInit.top,
            left: chargingDoorPosInit.left,
            //bgcolor: "yellow", opacity: 0.5,
            bgcolor: "transparent",
            border: 0
        };

        const doorLockPos = doorLockPosInit;
        const frunkPos = { ...frunkPosInit };
        const trunkPos = { ...trunkPosInit };
        const chargingDoorPos = { ...chargingDoorPosInit };

        // 	width: 180,
        // 	height: 70,
        // 	top: 375,
        // 	left: 122,
        // 	vlTop: 340,
        // 	vlLeft: 162,
        // 	vlWidth: "1px"
        if (frunkOpen) {
            frunkPos.width = 180;
            frunkPos.height = 100;
            frunkPos.top = 405;
            frunkPos.left = 108;
        }
        // 	width: 100,
        // 	height: 60,
        // 	top: 304,
        // 	left: 392,
        // 	vlTop: 254,
        // 	vlLeft: 442,
        // 	vlWidth: "1px",
        // 	vlHeight: 92
        if (trunkOpen) {
            trunkPos.width = 250;
            trunkPos.height = 180;
            trunkPos.top = 320;
            trunkPos.left = 200;
            trunkPos.vlHeight = 136;
        }
        // 	width: 50,
        // 	height: 40,
        // 	top: 367,
        // 	left: 438,
        // 	vlTop: 387,
        // 	vlLeft: 476,
        // 	vlHeight: "1px",
        // 	vlWidth: 34
        if (chargePortOpen) {
            chargingDoorPos.width = 150;
            chargingDoorPos.height = 120;
            chargingDoorPos.top = 360;
            chargingDoorPos.left = 210;
            chargingDoorPos.vlLeft = 285;
            chargingDoorPos.vlWidth = 225;
        }

        return {
            styledDoorLock: {
                ...styledDoorLock,
                top: doorLockPos.vlTop - 64,
                left: doorLockPos.vlLeft - 32
            },
            styledDoorLockVL: {
                ...styledDoorLockVL,
                width: doorLockPos.vlWidth,
                top: doorLockPos.vlTop,
                left: doorLockPos.vlLeft
            },

            styledFrunk: {
                ...styledFrunk,
                top: frunkPos.vlTop,
                left: frunkPos.vlLeft - 64
            },
            styledFrunkVL: {
                ...styledFrunkVL,
                width: frunkPos.vlWidth,
                top: frunkPos.vlTop,
                left: frunkPos.vlLeft
            },
            styledFrunkBtn: {
                ...styledFrunkBtn,
                width: frunkPos.width,
                height: frunkPos.height,
                top: frunkPos.top,
                left: frunkPos.left
            },

            styledTrunk: {
                ...styledTrunk,
                top: trunkPos.vlTop,
                left: trunkPos.vlLeft
            },
            styledTrunkVL: {
                ...styledTrunkVL,
                height: trunkPos.vlHeight,
                width: trunkPos.vlWidth,
                top: trunkPos.vlTop,
                left: trunkPos.vlLeft
            },
            styledTrunkBtn: {
                ...styledTrunkBtn,
                width: trunkPos.width,
                height: trunkPos.height,
                top: trunkPos.top,
                left: trunkPos.left
            },

            styledChargingDoor: {
                ...styledChargingDoor,
                top: chargingDoorPos.vlTop - 28,
                left: chargingDoorPos.vlLeft + chargingDoorPos.vlWidth
            },
            styledChargingDoorVL: {
                ...styledChargingDoorVL,
                height: chargingDoorPos.vlHeight,
                width: chargingDoorPos.vlWidth,
                top: chargingDoorPos.vlTop,
                left: chargingDoorPos.vlLeft
            },
            styledChargingDoorBtn: {
                ...styledChargingDoorBtn,
                width: chargingDoorPos.width,
                height: chargingDoorPos.height,
                top: chargingDoorPos.top,
                left: chargingDoorPos.left
            }
        };
    }, [frunkOpen, trunkOpen, chargePortOpen]);

    const isAnySideDoorOpen = useCallback(() => {
        return (row1DriverDoorOpen || row1PassengerDoorOpen || row2DriverDoorOpen || row2PassengerDoorOpen);
    }, [row1DriverDoorOpen, row1PassengerDoorOpen, row2DriverDoorOpen, row2PassengerDoorOpen]);

    const getImage = useCallback(() => {
        if (isAnySideDoorOpen()) {
            return ("./tesla/DoorOpen.gif");
        }
        else if (frunkOpen) {
            return ("./tesla/FrunkOpen.png");
        }
        else if (trunkOpen) {
            return ("./tesla/TrunkOpen.png");
        }
        else if (chargePortOpen) {
            return ("./tesla/ChargeDoorOpen.png");
        }
        else {
            return ("./tesla/Model3.png");
        }
    }, [chargePortOpen, frunkOpen, isAnySideDoorOpen, trunkOpen]);

    const isAnyDoorOpen = useCallback(() => {
        return (isAnySideDoorOpen() || frunkOpen || trunkOpen);
    }, [frunkOpen, isAnySideDoorOpen, trunkOpen]);

    const isAllDoorClosed = useCallback(() => {
        return (!frunkOpen && !trunkOpen && !chargePortOpen);
    }, [chargePortOpen, frunkOpen, trunkOpen]);

    const handleCarLock = useCallback(() => {
        const lock = !carLocked && !isAnyDoorOpen();
        const vssLock = lock ? "True" : "False";

        setSignals({
            signals: [
                { name: Row1DriverSideDoorType.IsLocked.name, value: vssLock },
                { name: Row2DriverSideDoorType.IsLocked.name, value: vssLock },
            ]
        });
        setSignals({
            signals: [
                { name: Row1PassengerSideDoorType.IsLocked.name, value: vssLock },
                { name: Row2PassengerSideDoorType.IsLocked.name, value: vssLock },
            ]
        });
        setSignal(TrunkFrontType.IsLocked.name, vssLock);
        setSignal(TrunkRearType.IsLocked.name, vssLock);
    }, [carLocked, isAnyDoorOpen]);

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
        const open = !chargePortOpen;
        setSignal(ChargePortStatusType.AnyPosition.IsFlapOpen.name, open? "True" : "False");
    }, [chargePortOpen]);

    useEffect(() => {
        if (row1DriverDoorLocked && row1PassengerDoorLocked
            && row2DriverDoorLocked && row2PassengerDoorLocked
            && frunkLocked && trunkLocked) {
            setCarLocked(true);
        }
        else {
            setCarLocked(false);
        }
    }, [row1DriverDoorLocked, row1PassengerDoorLocked, row2DriverDoorLocked, row2PassengerDoorLocked, frunkLocked, trunkLocked]);

    return (
        <Box sx={styledContainer}>
            {gear === DRIVE ?
                <>
                    {streetViewPanoramaOptions &&
                        <Box sx={styledContainer.streetView}>
                            <ReactStreetviewMulti
                                viewId={"touchscreen-driving-view"}
                                apiKey={MAP_API_KEY}
                                streetViewPanoramaOptions={streetViewPanoramaOptions}
                            />
                            <Box sx={{ position: "absolute", zIndex: 1, top: 0, left: 0, width: 1, height: 1, bgcolor: "transparent" }} />
                        </Box>
                    }
                </>
                :
                <>
                    <Box sx={styledContainer.image}>
                        <img style={{ width: IMAGE_WIDTH, height: IMAGE_HEIGHT }} src={getImage()} alt="" />
                    </Box>
                    {!isAnySideDoorOpen() && isAllDoorClosed() &&
                        <>
                            <Button
                                sx={styledDoorLock}
                                onClick={handleCarLock}
                            >
                                {carLocked ?
                                    <Lock sx={styledDoorLockImg} />
                                    :
                                    <LockOpen sx={styledDoorLockImg} />
                                }
                            </Button>
                            <Box sx={styledDoorLockVL} />
                        </>
                    }

                    {!isAnySideDoorOpen() && (!trunkOpen && !chargePortOpen) &&
                        <>
                            <Button
                                sx={styledFrunk}
                                onClick={handleFrunkOpen}
                            >
                                <Stack>
                                    <span style={styledNormalLabel}>Frunk</span>
                                    <span style={styledLargeLabel}>{frunkOpen ? "Close" : "Open"}</span>
                                </Stack>
                            </Button>
                            <Box sx={styledFrunkVL} />
                            <Box
                                sx={styledFrunkBtn}
                                onClick={handleFrunkOpen}
                            />
                        </>
                    }

                    {!isAnySideDoorOpen() && (!frunkOpen && !chargePortOpen) &&
                        <>
                            <Button
                                sx={styledTrunk}
                                onClick={handleTrunkOpen}
                            >
                                <Stack>
                                    <span style={styledNormalLabel}>Trunk</span>
                                    <span style={styledLargeLabel}>{trunkOpen ? "Close" : "Open"}</span>
                                </Stack>
                            </Button>
                            <Box sx={styledTrunkVL} />
                            <Box
                                sx={styledTrunkBtn}
                                onClick={handleTrunkOpen}
                            />
                        </>
                    }

                    {!isAnySideDoorOpen() && (!frunkOpen && !trunkOpen) &&
                        <>
                            <Button
                                sx={styledChargingDoor}
                                onClick={handleChargeDoorOpen}
                            >
                                <ElectricBolt sx={styledChargingDoorImg} />
                            </Button>
                            <Box sx={styledChargingDoorVL} />
                            <Box
                                sx={styledChargingDoorBtn}
                                onClick={handleChargeDoorOpen}
                            />
                        </>
                    }
                </>
            }

            <StatusOverlay/>
            <IndicatorOverlay/>
        </Box>
    );
};

const doorLockPosInit = {
    top: 213,
    left: 294,
    vlTop: 277,
    vlLeft: 326,
    vlWidth: "1px"
};
const frunkPosInit = {
    width: 180,
    height: 70,
    top: 375,
    left: 122,
    vlTop: 340,
    vlLeft: 162,
    vlWidth: "1px"
};
const trunkPosInit = {
    width: 100,
    height: 60,
    top: 304,
    left: 392,
    vlTop: 254,
    vlLeft: 442,
    vlWidth: "1px",
    vlHeight: 92
};
const chargingDoorPosInit = {
    width: 50,
    height: 40,
    top: 367,
    left: 438,
    vlTop: 387,
    vlLeft: 476,
    vlHeight: "1px",
    vlWidth: 34
};

const styledDoorLockImg = {
    width: 48,
    height: 48
};

const styledNormalLabel = {
    fontSize: 16,
    fontWeight: 500
};
const styledLargeLabel = {
    fontSize: 20,
    fontWeight: 700
};

const styledChargingDoorImg = {
    width: 40,
    height: 40
};

export default CarStatus;