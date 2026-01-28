import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import ToggleButtons from "./components/ToggleButtons";
import SwitchControl from "./components/SwitchControl";
import ButtonArrayControl from "./components/ButtonArrayControl";

import { getDataSafely, saveData } from "../../../persistency/PersistentMemory";


const SafetyControls = () => {

    const [sentryMode, setSentryMode] = useState(getDataSafely("Car.Safety.SentryMode", "On"));
    const [cameraBasedDetection, setCameraBasedDetection] = useState(getDataSafely("Car.Safety.CameraBasedDetection", true));
    const [disableSentryModeSounds, setDisableSentryModeSounds] = useState(getDataSafely("Car.Safety.DisableSentryModeSounds", false));
    const [viewLiveCameraViaMobileApp, setViewLiveCameraViaMobileApp] = useState(getDataSafely("Car.Safety.ViewLiveCameraViaMobileApp", true));

    const [allowMobileAccess, setAllowMobileAccess] = useState(getDataSafely("Car.Safety.AllowMobileAccess", true));
    const [PINToDrive, setPINToDrive] = useState(getDataSafely("Car.Safety.PINToDrive", false));
    const [gloveboxPIN, setGloveboxPIN] = useState(getDataSafely("Car.Safety.GloveboxPIN", false));

    const [dashcam, setDashcam] = useState(getDataSafely("Car.Safety.Dashcam", "Auto"));

    useEffect(() => {
        saveData("Car.Safety.SentryMode", sentryMode);
        saveData("Car.Safety.CameraBasedDetection", cameraBasedDetection);
        saveData("Car.Safety.DisableSentryModeSounds", disableSentryModeSounds);
        saveData("Car.Safety.ViewLiveCameraViaMobileApp", viewLiveCameraViaMobileApp);

        saveData("Car.Safety.AllowMobileAccess", allowMobileAccess);
        saveData("Car.Safety.PINToDrive", PINToDrive);
        saveData("Car.Safety.GloveboxPIN", gloveboxPIN);

        saveData("Car.Safety.Dashcam", dashcam);
    }, [
        sentryMode, cameraBasedDetection, disableSentryModeSounds, viewLiveCameraViaMobileApp,
        allowMobileAccess, PINToDrive, gloveboxPIN, dashcam
    ]);

    return (
        <Box sx={{ width: 1, height: 1 }}>
            <ToggleButtons
                name="Sentry Mode"
                labelList={["Off", "On"]}
                value={sentryMode}
                setValue={setSentryMode}
                desc={["Sentry Mode will be enabled when you leave the car"]}
                firstRow={true}
            />
            <SwitchControl
                name="Camera-Based Detection"
                value={cameraBasedDetection}
                setValue={setCameraBasedDetection}
            />
            <SwitchControl
                name="Disable Sentry Mode Sounds"
                value={disableSentryModeSounds}
                setValue={setDisableSentryModeSounds}
            />
            <SwitchControl
                name="View Live Camera via Mobile App"
                value={viewLiveCameraViaMobileApp}
                setValue={setViewLiveCameraViaMobileApp}
            />

            <ToggleButtons
                name="Dashcam"
                labelList={["Off", "Manual", "Auto"]}
                value={dashcam}
                setValue={setDashcam}
            />

            <ButtonArrayControl labelList={["Disable Dashcam Clips", "Format USB Drive"]} />

            <SwitchControl
                name="Allow Mobile Access"
                value={allowMobileAccess}
                setValue={setAllowMobileAccess}
            />
            <SwitchControl
                name="PIN to Drive"
                value={PINToDrive}
                setValue={setPINToDrive}
            />
            <SwitchControl
                name="Glovebox PIN"
                value={gloveboxPIN}
                setValue={setGloveboxPIN}
            />
        </Box>
    );
};

export default SafetyControls;