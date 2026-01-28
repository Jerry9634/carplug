import { useEffect, useState, useContext } from "react";

import Box from "@mui/material/Box";
import Slider from '@mui/material/Slider';
import Stack from "@mui/material/Stack";
import ToggleButton from "@mui/material/ToggleButton";
import Tooltip from '@mui/material/Tooltip';
import Typography from "@mui/material/Typography";

import LightMode from "@mui/icons-material/LightMode";
import Monitor from "@mui/icons-material/Monitor";

import PropTypes from 'prop-types';

import { setSignal, initEnumFromVSS, getVssFromEnum } from "../../../signal_db/VssSocket";
import vssApi from "../../../signal_db/VssAPI.json";

import { AppContext } from '../../../AppContext';
import { TouchscreenContext } from "../TouchscreenContext";
import ToggleButtons from "./components/ToggleButtons";
import { DARK_THEME_KEY, APPEARANCE_KEY, getDataSafely, saveData } from "../../../persistency/PersistentMemory";


const HMIType = vssApi.Vehicle.Cabin.Infotainment.HMI;


const DisplayControl = () => {

    const {
        isDarkTheme, setDarkTheme
    } = useContext(AppContext);

    const {
        timeHours, setTimeHours,
        energyDisplay, setEnergyDisplay,
        distanceUnit, setDistanceUnit,
        temperatureUnit, setTemperatureUnit,
        displayBrightness, setDisplayBrightness
    } = useContext(TouchscreenContext);

    const [displayMode, setDisplayMode] = useState(initEnumFromVSS(HMIType.DayNightMode));
    const [autoBrightness, setAutoBrightness] = useState(getDataSafely("Car.Display.AutoBrightness", false));

    const [tirePressureUnit, setTirePressureUnit] = useState(initEnumFromVSS(HMIType.TirePressureUnit));

    useEffect(() => {
        saveData("Car.Display.AutoBrightness", autoBrightness);
        saveData("Car.Display.Brightness", displayBrightness);
        saveData("Car.Display.TimeHours", timeHours);
        saveData("Car.Display.EnergyDisplay", energyDisplay);
        saveData("Car.Display.DistanceUnit", distanceUnit);
        saveData("Car.Display.TemperatureUnit", temperatureUnit);
        saveData("Car.Display.TirePressure", tirePressureUnit);

        setSignal(HMIType.Brightness.name, displayBrightness);
        setSignal(HMIType.TimeFormat.name, getVssFromEnum(HMIType.TimeFormat, timeHours));
        setSignal(HMIType.DistanceUnit.name, getVssFromEnum(HMIType.DistanceUnit, distanceUnit));
        setSignal(HMIType.TemperatureUnit.name, getVssFromEnum(HMIType.TemperatureUnit, temperatureUnit));
        setSignal(HMIType.TirePressureUnit.name, getVssFromEnum(HMIType.TirePressureUnit, tirePressureUnit));
    }, [
        autoBrightness, displayBrightness, timeHours, energyDisplay,
        distanceUnit, temperatureUnit, tirePressureUnit
    ]);

    useEffect(() => {
        let darkTheme = false;
        saveData(APPEARANCE_KEY, displayMode);

        if (displayMode === "Dark") {
            darkTheme = true;
        }
        else if (displayMode === "Auto") {
            const hours = new Date().getHours();
            const nightTime = hours < 6 || hours > 18; // Example: Day between 6 AM and 6 PM
            if (nightTime) {
                darkTheme = true;
            }
        }

        if (darkTheme !== isDarkTheme) {
            saveData(DARK_THEME_KEY, darkTheme);
            setDarkTheme(darkTheme);
            setSignal(HMIType.DayNightMode.name,
                darkTheme ?
                    HMIType.DayNightMode.allowed.NIGHT :
                    HMIType.DayNightMode.allowed.DAY);
        }
    }, [displayMode, isDarkTheme, setDarkTheme]);

    return (
        <Box sx={{ width: 1, height: 1 }}>
            <ToggleButtons
                name="Appearance"
                labelList={["Light", "Dark", "Auto"]}
                value={displayMode}
                setValue={setDisplayMode}
                firstRow={true}
            />

            <div style={{ height: 16 }} />

            <Stack direction="row" spacing={2} sx={{ height: 48, display: "flex", justifyContent: "flex-start", alignItems: "center" }}>
                <Monitor sx={{ width: 32, height: 32 }} />
                <Typography sx={{ fontSize: 18, fontWeight: 700, color: "text.secondary" }}>
                    Brightness
                </Typography>
            </Stack>
            <Stack direction="row" sx={{ width: "100%", height: 56 }}>
                <Stack direction="row"
                    onClick={() => {
                        //
                    }}
                    sx={{
                        width: "75%", height: 56,
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
                    onClick={() => setAutoBrightness(!autoBrightness)}
                    sx={{
                        width: "22%", height: 56, marginLeft: "3%",
                        textTransform: "none", fontSize: 16, fontWeight: 700
                    }}
                >
                    Auto
                </ToggleButton>
            </Stack>

            <ToggleButtons
                name="Time"
                labelList={["12 Hour", "24 Hour"]}
                value={timeHours}
                setValue={setTimeHours}
            />
            <ToggleButtons
                name="Energy Display"
                labelList={["Percentage", "Distance"]}
                value={energyDisplay}
                setValue={setEnergyDisplay}
            />
            <ToggleButtons
                name="Distance"
                labelList={["Kilometers", "Miles"]}
                value={distanceUnit}
                setValue={setDistanceUnit}
            />
            <ToggleButtons
                name="Temperature"
                labelList={["\u00B0C", "\u00B0F"]}
                value={temperatureUnit}
                setValue={setTemperatureUnit}
            />
            <ToggleButtons
                name="Tire Pressure"
                labelList={["Bar", "PSI"]}
                value={tirePressureUnit}
                setValue={setTirePressureUnit}
            />
        </Box>
    );
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

export default DisplayControl;
