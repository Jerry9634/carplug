import { useContext, useEffect, useMemo, useState } from "react";

import { Box } from "@mui/material";

import { TouchscreenContext } from "../TouchscreenContext";
import vssApi from "../../../signal_db/VssAPI.json";
import { subscribeChannel, unsubscribeChannel } from "../../../signal_db/VssSocket";


const MY_CHANNEL = "Touchscreen/Indicators";

const Row1DriverSideSeatType = vssApi.Vehicle.Cabin.Seat.Row1.DriverSide;
const Row1PassengerSideSeatType = vssApi.Vehicle.Cabin.Seat.Row1.PassengerSide;
const Row2DriverSideSeatType = vssApi.Vehicle.Cabin.Seat.Row2.DriverSide;
const Row2PassengerSideSeatType = vssApi.Vehicle.Cabin.Seat.Row2.PassengerSide;

const SelectedGearType = vssApi.Vehicle.Powertrain.Transmission.SelectedGear;
const DRIVE = SelectedGearType.allowed.Drive;


const IndicatorOverlay = () => {

    const {
        autopilotOn,
        gear,
        frunkOpen, trunkOpen, chargePortOpen,
        row1DriverDoorOpen,
        row1PassengerDoorOpen,
        row2DriverDoorOpen,
        row2PassengerDoorOpen,
    } = useContext(TouchscreenContext);

    const styledContainer = useMemo(() => ({
        position: "absolute",
        top: gear === DRIVE ? 176 : 60,
        left: 8,
        width: 48,
        bgcolor: gear === DRIVE ? "#000000" : "transparent",
        opacity: gear === DRIVE ? 0.5 : 1,
        alignItems: "center"
    }), [gear]);

    const [parkingBrakeEngaged, setParkingBrakeEngaged] = useState(false);

    const [lowBeamOn, setLowBeamOn] = useState(false);
    const [highBeamOn, setHighBeamOn] = useState(false);
    const [frontFogLightOn, setFrontFogLightOn] = useState(false);
    const [rearFogLightOn, setRearFogLightOn] = useState(false);
    const [parkingLightOn, setParkingLightOn] = useState(false);

    const [row1LeftTirePressureLow, setRow1LeftTirePressureLow] = useState(false);
    const [row1RightTirePressureLow, setRow1RightTirePressureLow] = useState(false);
    const [row2LeftTirePressureLow, setRow2LeftTirePressureLow] = useState(false);
    const [row2RightTirePressureLow, setRow2RightTirePressureLow] = useState(false);

    const [row1DriverSeatOccupied, setRow1DriverSeatOccupied] = useState(false);
    const [row1PassengerSeatOccupied, setRow1PassengerSeatOccupied] = useState(false);
    const [row2DriverSeatOccupied, setRow2DriverSeatOccupied] = useState(false);
    const [row2PassengerSeatOccupied, setRow2PassengerSeatOccupied] = useState(false);
    const [row1DriverSeatBelted, setRow1DriverSeatBelted] = useState(false);
    const [row1PassengerSeatBelted, setRow1PassengerSeatBelted] = useState(false);
    const [row2DriverSeatBelted, setRow2DriverSeatBelted] = useState(false);
    const [row2PassengerSeatBelted, setRow2PassengerSeatBelted] = useState(false);

    const [frontDefrosterActive, setFrontDefrosterActive] = useState(false);
    const [RearDefrosterActive, setRearDefrosterActive] = useState(false);

    const [trailerMode, setTrailerMode] = useState(false);
    const [ABSError, setABSError] = useState(false);
    const [stabilityControlOn, setStabilityControlOn] = useState(false);

    const [isAnyDoorOpen, setIsAnyDoorOpen] = useState(false);
    const [isAnySeatBeltWarning, setIsAnySeatBeltWarning] = useState(false);
    const [isTirePressureLow, setIsTirePressureLow] = useState(false);

    useEffect(() => {
        subscribeChannel(MY_CHANNEL, [
            // Lights
            { signal: vssApi.Vehicle.Chassis.ParkingBrake.IsEngaged, setter: setParkingBrakeEngaged },
            { signal: vssApi.Vehicle.Body.Lights.Beam.Low.IsOn, setter: setLowBeamOn },
            { signal: vssApi.Vehicle.Body.Lights.Beam.High.IsOn, setter: setHighBeamOn },
            { signal: vssApi.Vehicle.Body.Lights.Fog.Front.IsOn, setter: setFrontFogLightOn },
            { signal: vssApi.Vehicle.Body.Lights.Fog.Rear.IsOn, setter: setRearFogLightOn },
            { signal: vssApi.Vehicle.Body.Lights.Parking.IsOn, setter: setParkingLightOn },
            // Tire Pressure
            { signal: vssApi.Vehicle.Chassis.Axle.Row1.Wheel.Left.Tire.IsPressureLow, setter: setRow1LeftTirePressureLow },
            { signal: vssApi.Vehicle.Chassis.Axle.Row1.Wheel.Right.Tire.IsPressureLow, setter: setRow1RightTirePressureLow },
            { signal: vssApi.Vehicle.Chassis.Axle.Row2.Wheel.Left.Tire.IsPressureLow, setter: setRow2LeftTirePressureLow },
            { signal: vssApi.Vehicle.Chassis.Axle.Row2.Wheel.Right.Tire.IsPressureLow, setter: setRow2RightTirePressureLow },
            // Seat Belt
            { signal: Row1DriverSideSeatType.IsOccupied, setter: setRow1DriverSeatOccupied },
            { signal: Row1PassengerSideSeatType.IsOccupied, setter: setRow1PassengerSeatOccupied },
            { signal: Row2DriverSideSeatType.IsOccupied, setter: setRow2DriverSeatOccupied },
            { signal: Row2PassengerSideSeatType.IsOccupied, setter: setRow2PassengerSeatOccupied },
            { signal: Row1DriverSideSeatType.IsBelted, setter: setRow1DriverSeatBelted },
            { signal: Row1PassengerSideSeatType.IsBelted, setter: setRow1PassengerSeatBelted },
            { signal: Row2DriverSideSeatType.IsBelted, setter: setRow2DriverSeatBelted },
            { signal: Row2PassengerSideSeatType.IsBelted, setter: setRow2PassengerSeatBelted },
            // Defroster
            { signal: vssApi.Vehicle.Cabin.HVAC.IsFrontDefrosterActive, setter: setFrontDefrosterActive },
            { signal: vssApi.Vehicle.Cabin.HVAC.IsRearDefrosterActive, setter: setRearDefrosterActive },
            // Trailer
            { signal: vssApi.Vehicle.Trailer.IsConnected, setter: setTrailerMode },
            // Braking
            { signal: vssApi.Vehicle.ADAS.ABS.IsError, setter: setABSError },
            { signal: vssApi.Vehicle.ADAS.ESC.IsEnabled, setter: setStabilityControlOn },
        ]);

        return () => {
            unsubscribeChannel(MY_CHANNEL);
        };
    }, []);

    useEffect(() => {
        const anyDoorOpen = row1DriverDoorOpen || row1PassengerDoorOpen || row2DriverDoorOpen || row2PassengerDoorOpen
            || frunkOpen || trunkOpen || chargePortOpen;
        setIsAnyDoorOpen(anyDoorOpen);
    }, [
        row1DriverDoorOpen, row1PassengerDoorOpen, row2DriverDoorOpen, row2PassengerDoorOpen,
        frunkOpen, trunkOpen, chargePortOpen
    ]);

    useEffect(() => {
        const seatBeltWarning = (row1DriverSeatOccupied && !row1DriverSeatBelted)
            || (row1PassengerSeatOccupied && !row1PassengerSeatBelted)
            || (row2DriverSeatOccupied && !row2DriverSeatBelted)
            || (row2PassengerSeatOccupied && !row2PassengerSeatBelted);
        setIsAnySeatBeltWarning(seatBeltWarning);
    }, [
        row1DriverSeatOccupied, row1DriverSeatBelted, row1PassengerSeatOccupied, row1PassengerSeatBelted,
        row2DriverSeatOccupied, row2DriverSeatBelted, row2PassengerSeatOccupied, row2PassengerSeatBelted,
    ]);

    useEffect(() => {
        setIsTirePressureLow(row1LeftTirePressureLow || row1RightTirePressureLow || row2LeftTirePressureLow || row2RightTirePressureLow);
    }, [row1LeftTirePressureLow, row1RightTirePressureLow, row2LeftTirePressureLow, row2RightTirePressureLow]);

    return (
        <Box sx={styledContainer}>
            {
                // <img src={"./tesla/icons/parking-brake-fault.png"} alt=""
                // 	style={{ width: 32, height: 32, margin: 8 }} />
            }
            {parkingBrakeEngaged &&
                <img src={"./tesla/icons/parking-brake-manual.png"} alt=""
                    style={{ width: 36, height: 36, margin: 6 }} />
            }
            {lowBeamOn &&
                <img src={"./tesla/icons/low-beam.png"} alt=""
                    style={{ width: 36, height: 36, margin: 6 }} />
            }
            {highBeamOn &&
                <img src={"./tesla/icons/high-beam.png"} alt=""
                    style={{ width: 36, height: 36, margin: 6 }} />
            }
            {parkingLightOn &&
                <img src={"./tesla/icons/parking-light.png"} alt=""
                    style={{ width: 40, height: 40, margin: 4 }} />
            }
            {(frontFogLightOn || rearFogLightOn) &&
                <img src={"./tesla/icons/front-fog-light.png"} alt=""
                    style={{ width: 40, height: 40, margin: 4 }} />
            }
            {
                // <img src={"./tesla/icons/auto-high-beam-enabled-off.png"} alt=""
                // 	style={{ width: 40, height: 40, margin: 4 }} />
                // <img src={"./tesla/icons/auto-high-beam-enabled-on.png"} alt=""
                // 	style={{ width: 40, height: 40, margin: 4 }} />
            }
            {isTirePressureLow &&
                <img src={"./tesla/icons/tire-pressure-warning.png"} alt=""
                    style={{ width: 48, height: 48, margin: 0 }} />
            }
            {isAnySeatBeltWarning &&
                <img src={"./tesla/icons/seat-belt-reminder.png"} alt=""
                    style={{ width: 48, height: 48, margin: 0 }} />
            }
            {
                // <img src={"./tesla/icons/airbag-safety-warning.png"} alt=""
                // 	style={{ width: 48, height: 48, margin: 0 }} />
            }
            {(frontDefrosterActive || RearDefrosterActive) &&
                <img src={"./tesla/icons/blue-snowflake.png"} alt=""
                    style={{ width: 32, height: 32, margin: 8 }} />
            }
            {isAnyDoorOpen &&
                <img src={"./tesla/icons/door-frunk-trunk-open.png"} alt=""
                    style={{ width: 36, height: 36, margin: 6 }} />
            }
            {trailerMode &&
                <img src={"./tesla/icons/trailer-mode.png"} alt=""
                    style={{ width: 36, height: 36, margin: 6 }} />
            }
            {autopilotOn ?
                <img src={"./tesla/icons/car-steering-wheel.png"} alt=""
                    style={{ width: 24, height: 24, margin: 12 }} />
                :
                <img src={"./tesla/icons/autosteer-inactive.png"} alt=""
                    style={{ width: 42, height: 42, margin: 2 }} />
            }
            {
                // <img src={"./tesla/icons/brake-system-fault.png"} alt=""
                // 	style={{ width: 34, height: 34, margin: 7 }} />
            }
            {ABSError &&
                <img src={"./tesla/icons/ABS-fault.png"} alt=""
                    style={{ width: 32, height: 32, margin: 8 }} />
            }
            {
                // <img src={"./tesla/icons/brake-booster-fault.png"} alt=""
                // 	style={{ width: 34, height: 34, margin: 7 }} />
            }
            {
                // <img src={"./tesla/icons/electronic-stability-control-off.png"} alt=""
                // 	style={{ width: 42, height: 42, margin: 3 }} />
            }
            {stabilityControlOn &&
                <img src={"./tesla/icons/stability-control.png"} alt=""
                    style={{ width: 48, height: 48, margin: 0 }} />
            }
            {
                // <img src={"./tesla/icons/regen-braking-limited.png"} alt=""
                // 	style={{ width: 38, height: 38, margin: 5 }} />
            }
            {
                // <img src={"./tesla/icons/vehicle-hold.png"} alt=""
                // 	style={{ width: 36, height: 36, margin: 6 }} />
            }
            {
                // <img src={"./tesla/icons/vehicle-power-limited.png"} alt=""
                // 	style={{ width: 32, height: 32, margin: 8 }} />
            }
        </Box>
    );
};

export default IndicatorOverlay;