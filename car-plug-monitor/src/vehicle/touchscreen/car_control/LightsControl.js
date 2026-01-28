import { useEffect, useState } from "react";
import Box from "@mui/material/Box";

import ToggleButtons from "./components/ToggleButtons";
import SwitchControl from "./components/SwitchControl";
import ButtonArrayControl from "./components/ButtonArrayControl";

import { setSignal, initBoolFromVSS, initEnumFromVSS, getVssFromEnum } from "../../../signal_db/VssSocket";
import vssApi from "../../../signal_db/VssAPI.json";
import { getDataSafely, saveData } from "../../../persistency/PersistentMemory";

const LightSwitchType = vssApi.Vehicle.Body.Lights.LightSwitch;
const IsHighBeamSwitchOnType = vssApi.Vehicle.Body.Lights.IsHighBeamSwitchOn;


const LightsControl = () => {

    const [headlights, setHeadlights] = useState(initEnumFromVSS(LightSwitchType));
    const [domeLights, setDomeLights] = useState(getDataSafely("Car.Lights.DomeLights", "Auto"));
    const [ambientIndicatorMode, setAmbientIndicatorMode] = useState(getDataSafely("Car.Lights.AmbientIndicatorMode", "Auto Cancel"));

    const [autoHighBeam, setAutoHighBeam] = useState(initBoolFromVSS(IsHighBeamSwitchOnType));
    const [headlightsAfterExit, setHeadlightsAfterExit] = useState(getDataSafely("Car.Lights.HeadlightsAfterExit", true));
    const [steeringWheelLights, setSteeringWheelLights] = useState(getDataSafely("Car.Lights.SteeringWheelLights", true));

    useEffect(() => {
        saveData("Car.Lights.DomeLights", domeLights);
        saveData("Car.Lights.AmbientIndicatorMode", ambientIndicatorMode);
        saveData("Car.Lights.HeadlightsAfterExit", headlightsAfterExit);
        saveData("Car.Lights.SteeringWheelLights", steeringWheelLights);
    }, [domeLights, ambientIndicatorMode, headlightsAfterExit, steeringWheelLights]);

    useEffect(() => {
        saveData("Car.Lights.Headlights", headlights);
        setSignal(LightSwitchType.name, getVssFromEnum(LightSwitchType, headlights));
    }, [headlights]);

    useEffect(() => {
        saveData("Car.Lights.AutoHighBeam", autoHighBeam);
        setSignal(IsHighBeamSwitchOnType.name, autoHighBeam ? "True" : "False");
    }, [autoHighBeam]);

    return (
        <Box sx={{ width: 1, height: 1 }}>
            <ToggleButtons
                name="Headlights"
                labelList={["Off", "Parking", "On", "Auto"]}
                value={headlights}
                setValue={setHeadlights}
                firstRow={true}
            />

            <ButtonArrayControl labelList={["Front Fog", "Rear Fog"]} />

            <ToggleButtons
                name="Dome Lights"
                labelList={["Off", "On", "Auto"]}
                value={domeLights}
                setValue={setDomeLights}
            />

            <ButtonArrayControl labelList={["Ambient Lights"]} />

            <ToggleButtons
                name="Ambient Indicator Mode"
                labelList={["Off", "Auto Cancel"]}
                value={ambientIndicatorMode}
                setValue={setAmbientIndicatorMode}
            />
            <SwitchControl
                name="Auto High Beam"
                value={autoHighBeam}
                setValue={setAutoHighBeam}
            />
            <SwitchControl
                name="Headlights After Exit"
                value={headlightsAfterExit}
                setValue={setHeadlightsAfterExit}
            />
            <SwitchControl
                name="Steering Wheel Lights"
                value={steeringWheelLights}
                setValue={setSteeringWheelLights}
            />
        </Box>
    );
};

export default LightsControl;