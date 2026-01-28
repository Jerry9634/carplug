import { useEffect, useState, useContext } from "react";

import { Stack } from "@mui/material";

import { VehicleContext } from "../VehicleContext";
import { CarInteriorContext } from "./CarInteriorContext";

import { getDataSafely } from "../../persistency/PersistentMemory";
import vssApi from "../../signal_db/VssAPI.json";
import { subscribeChannel, unsubscribeChannel, setSignals } from "../../signal_db/VssSocket";


const MY_CHANNEL = "CarInterior/Indicators";

const LightSwitchType = vssApi.Vehicle.Body.Lights.LightSwitch;
const HighBeamLightOnType = vssApi.Vehicle.Body.Lights.Beam.High.IsOn;
const LowBeamLightOnType = vssApi.Vehicle.Body.Lights.Beam.Low.IsOn;
const ParkingLightOnType = vssApi.Vehicle.Body.Lights.Parking.IsOn;
const RunningLightOnType = vssApi.Vehicle.Body.Lights.Running.IsOn;


const ClusterIndicators = ({
    isAnySeatBeltWarning
}) => {

    const { autopilotOn } = useContext(VehicleContext);
    const { isAnyDoorOpen } = useContext(CarInteriorContext);

    const [parkingBrakeEngaged, setParkingBrakeEngaged] = useState(false);

    const [lowBeamOn, setLowBeamOn] = useState(false);
    const [highBeamOn, setHighBeamOn] = useState(false);
    const [frontFogLightOn, setFrontFogLightOn] = useState(false);
    const [rearFogLightOn, setRearFogLightOn] = useState(false);
    const [parkingLightOn, setParkingLightOn] = useState(false);

    const [lightSwitch, setLightSwitch] = useState(getDataSafely(LightSwitchType.name, LightSwitchType.allowed.OFF));
    const [highBeamSwitch, setHighBeamSwitch] = useState(false);
    const [lightIntensity, setLightIntensity] = useState(getDataSafely(vssApi.Vehicle.Exterior.LightIntensity.name, 100));

    const [row1LeftTirePressureLow, setRow1LeftTirePressureLow] = useState(false);
    const [row1RightTirePressureLow, setRow1RightTirePressureLow] = useState(false);
    const [row2LeftTirePressureLow, setRow2LeftTirePressureLow] = useState(false);
    const [row2RightTirePressureLow, setRow2RightTirePressureLow] = useState(false);

    const [frontDefrosterActive, setFrontDefrosterActive] = useState(false);
    const [rearDefrosterActive, setRearDefrosterActive] = useState(false);

    const [trailerMode, setTrailerMode] = useState(false);

    const [ABSError, setABSError] = useState(false);
    const [stabilityControlOn, setStabilityControlOn] = useState(false);

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
            { signal: LightSwitchType, setter: setLightSwitch },
            { signal: vssApi.Vehicle.Body.Lights.IsHighBeamSwitchOn, setter: setHighBeamSwitch },
            { signal: vssApi.Vehicle.Exterior.LightIntensity, setter: setLightIntensity },
            // Tire Pressure
            { signal: vssApi.Vehicle.Chassis.Axle.Row1.Wheel.Left.Tire.IsPressureLow, setter: setRow1LeftTirePressureLow },
            { signal: vssApi.Vehicle.Chassis.Axle.Row1.Wheel.Right.Tire.IsPressureLow, setter: setRow1RightTirePressureLow },
            { signal: vssApi.Vehicle.Chassis.Axle.Row2.Wheel.Left.Tire.IsPressureLow, setter: setRow2LeftTirePressureLow },
            { signal: vssApi.Vehicle.Chassis.Axle.Row2.Wheel.Right.Tire.IsPressureLow, setter: setRow2RightTirePressureLow },
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
        setIsTirePressureLow(row1LeftTirePressureLow || row1RightTirePressureLow || row2LeftTirePressureLow || row2RightTirePressureLow);
    }, [row1LeftTirePressureLow, row1RightTirePressureLow, row2LeftTirePressureLow, row2RightTirePressureLow]);

    useEffect(() => {
        let runningLight = false;
        let parkingLight = false;
        let lowBeamLight = false;
        let highBeamLight = false;
        if (lightSwitch === LightSwitchType.allowed.AUTO) {
            if (lightIntensity > 75) {
                runningLight = true;
            }
            else if (lightIntensity > 50) {
                parkingLight = true;
            }
            else {
                if (highBeamSwitch) {
                    highBeamLight = true;
                }
                else {
                    lowBeamLight = true;
                }
            }
        }
        else if (lightSwitch === LightSwitchType.allowed.BEAM) {
            if (highBeamSwitch) {
                highBeamLight = true;
            }
            else {
                lowBeamLight = true;
            }
        }
        else if (lightSwitch === LightSwitchType.allowed.POSITION) {
            parkingLight = true;
        }

        setSignals({
            signals: [
                { name: RunningLightOnType.name, value: runningLight ? "True" : "False" },
                { name: ParkingLightOnType.name, value: parkingLight ? "True" : "False" },
                { name: LowBeamLightOnType.name, value: lowBeamLight ? "True" : "False" },
                { name: HighBeamLightOnType.name, value: highBeamLight ? "True" : "False" }
            ]
        });
    }, [lightSwitch, lightIntensity, highBeamSwitch]);

    return (
        <Stack direction="row" sx={clusterIndicatorsStyle}>
            {
                //<img src={"./tesla/icons/parking-brake-fault.png"} alt=""
                //	style={{ width: 32, height: 32, margin: 8 }} />
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
            {(frontDefrosterActive || rearDefrosterActive) &&
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
        </Stack>
    );
};

const clusterIndicatorsStyle = {
    height: 64,
    minWidth: 48 * 5 + 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    padding: "8px",
    image: {
        width: 32,
        height: 32,
    }
};

export default ClusterIndicators;