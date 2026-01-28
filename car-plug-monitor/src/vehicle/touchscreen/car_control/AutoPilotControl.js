import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import ToggleButtons from "./components/ToggleButtons";
import SwitchControl from "./components/SwitchControl";
import ButtonArrayControl from "./components/ButtonArrayControl";
import PlusMinusButtons from "./components/PlusMinusButtons";

import { getDataSafely, saveData } from "../../../persistency/PersistentMemory";


const AutoPilotControl = () => {

    const [cruiseFollowDistance, setCruiseFollowDistance] = useState(getDataSafely("Car.Autopilot.CruiseFollowDistance", 5));
    const [autosteer, setAutosteer] = useState(getDataSafely("Car.Autopilot.Autosteer", true));
    const [autosteerActivation, setAutosteerActivation] = useState(getDataSafely("Car.Autopilot.AutosteerActivation", "Double Click"));
    const [navigateOnAutopilot, setNavigateOnAutopilot] = useState(getDataSafely("Car.Autopilot.NavigateOnAutopilot", true));
    const [trafficLight, setTrafficLight] = useState(getDataSafely("Car.Autopilot.TrafficLight", true));
    const [greenTrafficLightChime, setGreenTrafficLightChime] = useState(getDataSafely("Car.Autopilot.GreenTrafficLightChime", true));
    const [FsdVisualizationPreview, setFsdVisualizationPreview] = useState(getDataSafely("Car.Autopilot.FsdVisualizationPreview", true));
    const [summon, setSummon] = useState(getDataSafely("Car.Autopilot.Summon", true));

    useEffect(() => {
        saveData("Car.Autopilot.CruiseFollowDistance", cruiseFollowDistance);
        saveData("Car.Autopilot.Autosteer", autosteer);
        saveData("Car.Autopilot.AutosteerActivation", autosteerActivation);
        saveData("Car.Autopilot.NavigateOnAutopilot", navigateOnAutopilot);
        saveData("Car.Autopilot.TrafficLight", trafficLight);
        saveData("Car.Autopilot.GreenTrafficLightChime", greenTrafficLightChime);
        saveData("Car.Autopilot.FsdVisualizationPreview", FsdVisualizationPreview);
        saveData("Car.Autopilot.Summon", summon);
    }, [
        cruiseFollowDistance, autosteer, autosteerActivation, navigateOnAutopilot,
        trafficLight, greenTrafficLightChime, FsdVisualizationPreview, summon
    ]);

    return (
        <Box sx={{ width: 1, height: 1 }}>
            <PlusMinusButtons
                title="Cruise Follow Distance"
                value={cruiseFollowDistance}
                decrement={() => {
                    if (cruiseFollowDistance > 0) {
                        setCruiseFollowDistance(cruiseFollowDistance - 1);
                    }
                }}
                increment={() => {
                    if (cruiseFollowDistance < 10) {
                        setCruiseFollowDistance(cruiseFollowDistance + 1);
                    }
                }}
                getValueString={(val) => (val)}
                firstRow={true}
            />

            <SwitchControl
                name="Autosteer (Beta)"
                value={autosteer}
                setValue={setAutosteer}
            />
            <ToggleButtons
                name="Autosteer Activation"
                labelList={["Single Click", "Double Click"]}
                value={autosteerActivation}
                setValue={setAutosteerActivation}
            />
            <SwitchControl
                name="Navigate on Autopilot (Beta)"
                value={navigateOnAutopilot}
                setValue={setNavigateOnAutopilot}
            />

            <ButtonArrayControl labelList={["Customize Navigate on Autopilot"]} />

            <SwitchControl
                name="Traffic Light and Stop Sign Control (Beta)"
                value={trafficLight}
                setValue={setTrafficLight}
            />
            <SwitchControl
                name="Green Traffic Light Chime"
                value={greenTrafficLightChime}
                setValue={setGreenTrafficLightChime}
            />
            <SwitchControl
                name="Full Self-Driving Visualization Preview"
                value={FsdVisualizationPreview}
                setValue={setFsdVisualizationPreview}
            />
            <SwitchControl
                name="Summon (Beta)"
                value={summon}
                setValue={setSummon}
            />

            <ButtonArrayControl
                labelList={[
                    "Customize Summon",
                    "Standby Mode"
                ]}
            />
        </Box>
    );
};

export default AutoPilotControl;