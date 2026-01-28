import { useCallback, useEffect, useState, useContext } from "react";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import Slider from '@mui/material/Slider';
import Stack from "@mui/material/Stack";
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Tooltip from '@mui/material/Tooltip';

import Lightbulb from "@mui/icons-material/Lightbulb";
import LightMode from "@mui/icons-material/LightMode";

import Icon from '@mdi/react';
import { mdiSteering, mdiWiper } from "@mdi/js";

import PropTypes from 'prop-types';

import { TouchscreenContext } from "../TouchscreenContext";
import { setSignal, initBoolFromVSS, initEnumFromVSS, getVssFromEnum } from "../../../signal_db/VssSocket";
import vssApi from "../../../signal_db/VssAPI.json";
import { getBoolean, saveData } from "../../../persistency/PersistentMemory";


const LightSwitchType = vssApi.Vehicle.Body.Lights.LightSwitch;
const IsHighBeamSwitchOnType = vssApi.Vehicle.Body.Lights.IsHighBeamSwitchOn;

const DriverMirrorType = vssApi.Vehicle.Body.Mirrors.DriverSide;
const PassengerMirrorType = vssApi.Vehicle.Body.Mirrors.PassengerSide;

const LeftChildLockType = vssApi.Vehicle.Cabin.Door.Row2.DriverSide.IsChildLockActive;
const RightChildLockType = vssApi.Vehicle.Cabin.Door.Row2.PassengerSide.IsChildLockActive;

const IsWindowChildLockEngagedType = vssApi.Vehicle.Cabin.IsWindowChildLockEngaged;

const GloveBoxOpenType = vssApi.Vehicle.Cabin.Light.IsGloveBoxOn;

const FrontWipingType = vssApi.Vehicle.Body.Windshield.Front.Wiping;


const QuickControl = () => {

    const {
        displayBrightness, setDisplayBrightness
    } = useContext(TouchscreenContext);

    const [lightSwitch, setLightSwitch] = useState(initEnumFromVSS(LightSwitchType));
    const [highBeamSwitch, setHighBeamSwitch] = useState(initBoolFromVSS(IsHighBeamSwitchOnType));

    const [leftMirrorFolded, setLeftMirrorFolded] = useState(initBoolFromVSS(DriverMirrorType));
    const [rightMirrorFolded, setRightMirrorFolded] = useState(initBoolFromVSS(PassengerMirrorType));

    const [leftChildLock, setLeftChildLock] = useState(initBoolFromVSS(LeftChildLockType));
    const [rightChildLock, setRightChildLock] = useState(initBoolFromVSS(RightChildLockType));

    const [isWindowChildLockEngaged, setIsWindowChildLockEngaged] = useState(initBoolFromVSS(IsWindowChildLockEngagedType));

    const [gloveboxOpen, setGloveboxOpen] = useState(initBoolFromVSS(GloveBoxOpenType));

    const [frontWipingMode, setFrontWipingMode] = useState(initEnumFromVSS(FrontWipingType.Mode));

    const [autoBrightness, setAutoBrightness] = useState(getBoolean("Car.Display.AutoBrightness"));

    const [formats, setFormats] = useState([]);

    const updateLightSwitch = useCallback((event, value) => {
        if (value) {
            setLightSwitch(value);
            saveData("Car.Lights.Headlights", value);
            setSignal(LightSwitchType.name, getVssFromEnum(LightSwitchType, value));
        }
    }, []);

    const updateHighBeamSwitch = useCallback(() => {
        const newVal = !highBeamSwitch;
        setHighBeamSwitch(newVal);
        saveData("Car.Lights.AutoHighBeam", newVal);
        setSignal(IsHighBeamSwitchOnType.name, newVal ? "True" : "False");
    }, [highBeamSwitch]);

    const updateMirrorStatus = useCallback(() => {
        const newVal = !(leftMirrorFolded || rightMirrorFolded);
        setLeftMirrorFolded(newVal);
        setRightMirrorFolded(newVal);
        saveData("Car.Controls.FoldMirrors", newVal);
        setSignal(DriverMirrorType.IsFolded.name, newVal ? "True" : "False");
        setSignal(PassengerMirrorType.IsFolded.name, newVal ? "True" : "False");
    }, [leftMirrorFolded, rightMirrorFolded]);

    const updateChildLockStatus = useCallback(() => {
        let leftLock;
        let rightLock;

        if (leftChildLock) {
            if (rightChildLock) {
                leftLock = false;
                rightLock = false;
            }
            else {
                leftLock = false;
                rightLock = true;
            }
        }
        else {
            if (rightChildLock) {
                leftLock = true;
                rightLock = true;
            }
            else {
                leftLock = true;
                rightLock = false;
            }
        }

        setLeftChildLock(leftLock);
        setRightChildLock(rightLock);
        saveData("Car.Door.LeftChildLock", leftLock);
        saveData("Car.Door.RightChildLock", rightLock);

        setSignal(LeftChildLockType.name, leftLock ? "True" : "False");
        setSignal(RightChildLockType.name, rightLock ? "True" : "False");
    }, [leftChildLock, rightChildLock]);

    const getChildLockStatus = useCallback(() => {
        if (leftChildLock) {
            if (rightChildLock) {
                return "Both";
            }
            else {
                return "Left";
            }
        }
        else if (rightChildLock) {
            return "Right";
        }
        else {
            return "Off";
        }
    }, [leftChildLock, rightChildLock]);

    const updateWindowLock = useCallback(() => {
        const newVal = !isWindowChildLockEngaged;
        setIsWindowChildLockEngaged(newVal);
        saveData("Car.Controls.IsWindowChildLockEngaged", newVal);
        setSignal(IsWindowChildLockEngagedType.name, newVal ? "True" : "False");
    }, [isWindowChildLockEngaged]);

    const updateGlovebox = useCallback(() => {
        const newVal = !gloveboxOpen;
        setGloveboxOpen(newVal);
        saveData("Car.Controls.GloveboxOpen", newVal);
        setSignal(GloveBoxOpenType.name, newVal ? "True" : "False");
    }, [gloveboxOpen]);

    const updateWiper = useCallback((event, value) => {
        if (value) {
            setFrontWipingMode(value);
            saveData("Car.Wiper.FrontWipingMode", value);
            setSignal(FrontWipingType.Mode.name, getVssFromEnum(FrontWipingType.Mode, value));
        }
    }, []);

    const updateAutoBrightness = useCallback(() => {
        const newVal = !autoBrightness;
        setAutoBrightness(newVal);
        saveData("Car.Display.AutoBrightness", newVal);
    }, [autoBrightness]);

    useEffect(() => {
        const newFormats = [];
        if (leftMirrorFolded || rightMirrorFolded) {
            newFormats.push("Mirrors");
        }
        if (leftChildLock || rightChildLock) {
            newFormats.push("Child Lock");
        }
        if (isWindowChildLockEngaged) {
            newFormats.push("Window Lock");
        }
        if (gloveboxOpen) {
            newFormats.push("Globebox");
        }
        setFormats(newFormats);
    }, [leftMirrorFolded, rightMirrorFolded, leftChildLock, rightChildLock, isWindowChildLockEngaged, gloveboxOpen]);

    useEffect(() => {
        saveData("Car.Display.AutoBrightness", autoBrightness);
        saveData("Car.Display.Brightness", displayBrightness);

        setSignal(vssApi.Vehicle.Cabin.Infotainment.HMI.Brightness.name, displayBrightness);
    }, [
        autoBrightness, displayBrightness
    ]);

    return (
        <Stack spacing={2} sx={STYLES.container}>
            <Stack direction="row" sx={STYLES.fullWidthRow}>
                <ToggleButtonGroup value={lightSwitch} exclusive color="primary" sx={{ width: "76%" }}
                    onChange={updateLightSwitch}
                >
                    <ToggleButton size="large" value={"Off"}
                        sx={{
                            width: "25%", height: 75,
                            textTransform: "none", fontSize: 16, fontWeight: 700
                        }}
                    >
                        <Stack direction="row" spacing={1} sx={{ justifyContent: "center", alignItems: "center" }}>
                            <Lightbulb sx={{ width: 24, height: 24 }} />
                            <span>Off</span>
                        </Stack>
                    </ToggleButton>
                    <ToggleButton size="large" value={"Parking"}
                        sx={{
                            width: "25%", height: 75,
                            textTransform: "none", fontSize: 16, fontWeight: 700
                        }}
                    >
                        Parking
                    </ToggleButton>
                    <ToggleButton size="large" value={"On"}
                        sx={{
                            width: "25%", height: 75,
                            textTransform: "none", fontSize: 16, fontWeight: 700
                        }}
                    >
                        On
                    </ToggleButton>
                    <ToggleButton size="large" value={"Auto"}
                        sx={{
                            width: "25%", height: 75,
                            textTransform: "none", fontSize: 16, fontWeight: 700
                        }}
                    >
                        Auto
                    </ToggleButton>
                </ToggleButtonGroup>

                <ToggleButton size="large" value="Auto" selected={highBeamSwitch}
                    color="primary"
                    onClick={updateHighBeamSwitch}
                    sx={{
                        width: "22%", height: 75,
                        marginLeft: "2%"
                    }}
                >
                    <img
                        src={highBeamSwitch ? "./touchscreen/car_control/auto-high-beam-enabled-on.png" : "./touchscreen/car_control/auto-high-beam-enabled-off.png"}
                        style={{ width: 48, height: 48 }} alt=""
                    />
                </ToggleButton>
            </Stack>

            <ToggleButtonGroup value={formats} sx={STYLES.fullWidthRow} >
                <ToggleButton size="large" value={"Mirrors"} color="primary"
                    onClick={updateMirrorStatus}
                    sx={{
                        width: "25%", height: 140, textTransform: "none", fontSize: 16, fontWeight: 700
                    }}
                >
                    <Stack sx={{ width: "100%", height: "100%", justifyContent: "center", alignItems: "center" }}>
                        <Box sx={{ width: "100%", height: "50%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                            <img
                                src={(leftMirrorFolded || rightMirrorFolded) ? "./touchscreen/car_control/side-mirror-left-active.png" : "./touchscreen/car_control/side-mirror-left.png"}
                                style={{ width: 32, height: 32 }} alt=""
                            />
                        </Box>
                        <Box sx={{ width: "100%", height: "25%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                            {(leftMirrorFolded || rightMirrorFolded) ? "Unfold" : "Fold"}
                        </Box>
                        <Box sx={{ width: "100%", height: "25%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                            Mirrors
                        </Box>
                    </Stack>
                </ToggleButton>
                <ToggleButton size="large" value={"Child Lock"} color="primary"
                    onClick={updateChildLockStatus}
                    sx={{
                        width: "25%", height: 140, textTransform: "none", fontSize: 16, fontWeight: 700
                    }}
                >
                    <Stack sx={{ width: "100%", height: "100%", justifyContent: "center", alignItems: "center" }}>
                        <Box sx={{ width: "100%", height: "50%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                            <img
                                src={(leftChildLock || rightChildLock) ? "./touchscreen/car_control/child-lock-active.png" : "./touchscreen/car_control/child-lock.png"}
                                style={{ width: 32, height: 32 }} alt=""
                            />
                        </Box>
                        <Box sx={{ width: "100%", height: "25%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                            Child Lock
                        </Box>
                        <Box sx={{ width: "100%", height: "25%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                            {getChildLockStatus()}
                        </Box>
                    </Stack>
                </ToggleButton>
                <ToggleButton size="large" value={"Window Lock"} color="primary"
                    onClick={updateWindowLock}
                    sx={{
                        width: "25%", height: 140, textTransform: "none", fontSize: 16, fontWeight: 700
                    }}
                >
                    <Stack sx={{ width: "100%", height: "100%", justifyContent: "center", alignItems: "center" }}>
                        <Box sx={{ width: "100%", height: "50%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                            <img
                                src={isWindowChildLockEngaged ? "./touchscreen/car_control/window-lock-active.png" : "./touchscreen/car_control/window-lock.png"}
                                style={{ width: 32, height: 32 }} alt=""
                            />
                        </Box>
                        <Box sx={{ width: "100%", height: "25%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                            Window
                        </Box>
                        <Box sx={{ width: "100%", height: "25%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                            Lock
                        </Box>
                    </Stack>
                </ToggleButton>
                <ToggleButton size="large" value={"Globebox"} color="primary"
                    onClick={updateGlovebox}
                    sx={{
                        width: "25%", height: 140, cursor: "none", textTransform: "none", fontSize: 16, fontWeight: 700
                    }}
                >
                    <Stack sx={{ width: "100%", height: "100%", justifyContent: "center", alignItems: "center" }}>
                        <Box sx={{ width: "100%", height: "50%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                            <img
                                src={gloveboxOpen ? "./touchscreen/car_control/wallet-active.png" : "./touchscreen/car_control/wallet.png"}
                                style={{ width: 32, height: 32 }} alt=""
                            />
                        </Box>
                        <Box sx={{ width: "100%", height: "50%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                            Glovebox
                        </Box>
                    </Stack>
                </ToggleButton>
            </ToggleButtonGroup>

            <ToggleButtonGroup value={frontWipingMode} exclusive color="primary" sx={STYLES.fullWidthRow}
                onChange={updateWiper}
            >
                <ToggleButton size="large" value={"Off"}
                    sx={{ width: "25%", height: 75, textTransform: "none", fontSize: 16, fontWeight: 700 }}
                >
                    <Stack direction="row" spacing={1} sx={{ justifyContent: "center", alignItems: "center" }}>
                        <Icon path={mdiWiper} style={{ width: 32, height: 32 }} />
                        <span>Off</span>
                    </Stack>
                </ToggleButton>
                <ToggleButton size="large" value={"I"}
                    sx={{ width: "12.5%", height: 75, textTransform: "none", fontSize: 16, fontWeight: 700 }}
                >
                    I
                </ToggleButton>
                <ToggleButton size="large" value={"II"}
                    sx={{ width: "12.5%", height: 75, textTransform: "none", fontSize: 16, fontWeight: 700 }}
                >
                    II
                </ToggleButton>
                <ToggleButton size="large" value={"III"}
                    sx={{ width: "12.5%", height: 75, textTransform: "none", fontSize: 16, fontWeight: 700 }}
                >
                    III
                </ToggleButton>
                <ToggleButton size="large" value={"IIII"}
                    sx={{ width: "12.5%", height: 75, textTransform: "none", fontSize: 16, fontWeight: 700 }}
                >
                    IIII
                </ToggleButton>
                <ToggleButton size="large" value={"Auto"}
                    sx={{ width: "25%", height: 75, textTransform: "none", fontSize: 16, fontWeight: 700 }}
                >
                    Auto
                </ToggleButton>
            </ToggleButtonGroup>

            <Stack direction="row" sx={STYLES.fullWidthRow}>
                <ButtonGroup orientation="vertical" sx={{ width: "50%", height: 240, paddingRight: "12px" }}>
                    <Button size="large"
                        onClick={() => { }}
                        sx={{ width: "100%", height: 120, textTransform: "none", fontSize: 16, fontWeight: 700 }}
                        startIcon={
                            <img
                                src={"./touchscreen/car_control/side-mirror-left.png"}
                                style={{ width: 32, height: 32 }} alt=""
                            />
                        }
                    >
                        Mirrors
                    </Button>
                    <Button size="large"
                        onClick={() => { }}
                        sx={{ width: "100%", height: 120, textTransform: "none", fontSize: 16, fontWeight: 700 }}
                        startIcon={
                            <Icon path={mdiSteering} style={{ width: 32, height: 32 }} />
                        }
                    >
                        Steering
                    </Button>
                </ButtonGroup>
                <ButtonGroup orientation="vertical" sx={{ width: "50%", height: 240, paddingLeft: "12px" }}>
                    <Button size="large"
                        onClick={() => { }}
                        sx={{ width: "100%", height: 120, textTransform: "none", fontSize: 16, fontWeight: 700 }}
                        startIcon={
                            <img
                                src={"./touchscreen/car_control/dashcam-recording.png"}
                                style={{ width: 32, height: 32 }} alt=""
                            />
                        }
                    >
                        Recording
                    </Button>
                    <Button size="large"
                        onClick={() => { }}
                        sx={{ width: "100%", height: 120, textTransform: "none", fontSize: 16, fontWeight: 700 }}
                        startIcon={
                            <img
                                src={"./touchscreen/car_control/SentryMode.png"}
                                style={{ width: 32, height: 32 }} alt=""
                            />
                        }
                    >
                        Sentry
                    </Button>
                </ButtonGroup>
            </Stack>

            <Stack direction="row" sx={STYLES.fullWidthRow}>
                <Stack direction="row"
                    onClick={() => {
                        //
                    }}
                    sx={{
                        width: "75%", height: 75,
                        display: "flex", justifyContent: "center", alignItems: "center",
                        borderWidth: 2, borderRadius: "4px", borderColor: "lightgray", borderStyle: "solid",
                    }}
                >
                    <Box sx={{ width: "85%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                        <Slider
                            valueLabelDisplay="auto"
                            slots={{
                                valueLabel: ValueLabelComponent,
                            }}
                            min={20} max={100}
                            defaultValue={displayBrightness}
                            sx={{ width: "90%" }}
                            onChange={(event, value) => setDisplayBrightness(value)}
                        />
                    </Box>
                    <Box sx={{ width: "15%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                        <LightMode sx={{ width: 32, height: 32 }} />
                    </Box>
                </Stack>

                <ToggleButton size="large" value="Auto" selected={autoBrightness}
                    color="primary"
                    onClick={updateAutoBrightness}
                    sx={{
                        width: "22%", height: 75, marginLeft: "3%",
                        textTransform: "none", fontSize: 16, fontWeight: 700
                    }}
                >
                    Auto
                </ToggleButton>
            </Stack>
        </Stack>
    );
};

export default QuickControl;

const STYLES = {
    container: {
        width: "100%",
        height: "100%",
    },
    fullWidthRow: {
        width: "100%",
    },
};

const ValueLabelComponent = (props) => {
  const { children, value } = props;

  return (
    <Tooltip enterTouchDelay={0} placement="top" title={value}>
      {children}
    </Tooltip>
  );
};

ValueLabelComponent.propTypes = {
  children: PropTypes.element.isRequired,
  value: PropTypes.node,
};
