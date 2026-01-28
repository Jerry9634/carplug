import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import ToggleButtons from "./components/ToggleButtons";
import SwitchControl from "./components/SwitchControl";

import { getDataSafely, saveData } from "../../../persistency/PersistentMemory";


const PedalsSteeringControl = () => {

    const [acceleration, setAcceleration] = useState(getDataSafely("Car.PedalsSteering.Acceleration", "Standard"));
    const [steeringMode, setSteeringMode] = useState(getDataSafely("Car.PedalsSteering.SteeringMode", "Standard"));
    const [stoppingMode, setStoppingMode] = useState(getDataSafely("Car.PedalsSteering.StoppingMode", "Creep"));
    const [regenerativeBraking, setRegenerativeBraking] = useState(getDataSafely("Car.PedalsSteering.RegenerativeBraking", "Standard"));

    const [offRoadAssist, setOffRoadAssist] = useState(getDataSafely("Car.PedalsSteering.OffRoadAssist", false));
    const [slipStart, setSlipStart] = useState(getDataSafely("Car.PedalsSteering.SlipStart", false));

    useEffect(() => {
        saveData("Car.PedalsSteering.Acceleration", acceleration);
        saveData("Car.PedalsSteering.SteeringMode", steeringMode);
        saveData("Car.PedalsSteering.StoppingMode", stoppingMode);
        saveData("Car.PedalsSteering.RegenerativeBraking", regenerativeBraking);
        saveData("Car.PedalsSteering.OffRoadAssist", offRoadAssist);
        saveData("Car.PedalsSteering.SlipStart", slipStart);
    }, [acceleration, steeringMode, stoppingMode, regenerativeBraking, offRoadAssist, slipStart]);

    return (
        <Box sx={{ width: 1, height: 1 }}>
            <ToggleButtons
                name={"Acceleration"}
                labelList={["Chill", "Standard"]}
                value={acceleration}
                setValue={setAcceleration}
                firstRow={true}
            />
            <ToggleButtons
                name={"Steering Mode"}
                labelList={["Comfort", "Standard", "Sport"]}
                value={steeringMode}
                setValue={setSteeringMode}
            />
            <ToggleButtons
                name={"Stopping Mode"}
                labelList={["Creep", "Roll", "Hold"]}
                value={stoppingMode}
                setValue={setStoppingMode}
                desc={[
                    "Slowly move when pedals are released",
                    "Roll when pedals are released",
                    "Maximises range by extending regenerative braking to lower speeds and automatically blends in brakes to hold the vehicle at a stop"
                ]}
            />
            <ToggleButtons
                name={"Regenerative Braking"}
                labelList={["Low", "Standard"]}
                value={regenerativeBraking}
                setValue={setRegenerativeBraking}
            />

            <div style={{ height: 16 }} />

            <SwitchControl
                name="Off-Road Assist"
                value={offRoadAssist}
                setValue={setOffRoadAssist}
            />
            <SwitchControl
                name="Slip Start"
                value={slipStart}
                setValue={setSlipStart}
                desc={["Use to help free vehicle stuck in snow, sand or mud."]}
            />
        </Box>
    );
};

export default PedalsSteeringControl;