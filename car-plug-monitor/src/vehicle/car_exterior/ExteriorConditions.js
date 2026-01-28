import { useCallback, useContext, useEffect, useState } from "react";

import Box from "@mui/material/Box";
import IconButton from '@mui/material/IconButton';
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

import Icon from "@mdi/react";
import { mdiThermometer, mdiWaterPercent, mdiWeatherSunny, mdiWeatherRainy } from "@mdi/js";

import { VehicleContext } from "../VehicleContext";
import { getDataSafely } from "../../persistency/PersistentMemory";
import vssApi from "../../signal_db/VssAPI.json";
import { setSignal } from "../../signal_db/VssSocket";
import { getCurrentWeather } from "./Weather";


const ExteriorType = vssApi.Vehicle.Exterior;
const RainIntensityType = vssApi.Vehicle.Body.Raindetection.Intensity;


const ExteriorConditions = ({
    showLabel = false
}) => {

    const {
        airTemperature,
        humidity,
        lightIntensity,
        rainIntensity
    } = useContext(VehicleContext);

    const [weatherData, setWeatherData] = useState(null);

    useEffect(() => {
        const myInterval1 = setInterval(() => {
            const time = new Date();
            const mins = time.getMinutes() % 60;

            if (mins === 0 || mins === 15 || mins === 30 || mins === 45) {
                getCurrentWeather(setWeatherData);
            }
        }, 60000);

        const myTimeout1 = setTimeout(() => getCurrentWeather(setWeatherData), 200);

        return (() => {
            clearInterval(myInterval1);
            clearTimeout(myTimeout1);
        });
    }, []);

    useEffect(() => {
        setSignal(ExteriorType.AirTemperature.name, getDataSafely(ExteriorType.AirTemperature.name, airTemperature));
        setSignal(ExteriorType.Humidity.name, getDataSafely(ExteriorType.Humidity.name, humidity));

        const time = new Date();
        const hours = time.getHours();
        if (hours <= 6 || hours >= 18) {
            setSignal(ExteriorType.LightIntensity.name, 0);
        }
        else {
            setSignal(ExteriorType.LightIntensity.name, 100);
        }
    }, [weatherData, airTemperature, humidity]);

    return (
        <Stack direction="row" spacing={showLabel ? 3 : 0}>
            <EnvironmentValue
                title={"Air Temperature"}
                signalName={ExteriorType.AirTemperature.name}
                signalValue={airTemperature}
                unit={<> &#8451;</>}
                iconPath={mdiThermometer}
                showLabel={showLabel}
            />
            <EnvironmentValue
                title={"Humidity"}
                signalName={ExteriorType.Humidity.name}
                signalValue={humidity}
                unit={"%"}
                iconPath={mdiWaterPercent}
                showLabel={showLabel}
            />
            <EnvironmentValue
                title={"Light Intensity"}
                signalName={ExteriorType.LightIntensity.name}
                signalValue={lightIntensity}
                unit={"%"}
                iconPath={mdiWeatherSunny}
                showLabel={showLabel}
            />
            <EnvironmentValue
                title={"Rain Intensity"}
                signalName={RainIntensityType.name}
                signalValue={rainIntensity}
                unit={"%"}
                iconPath={mdiWeatherRainy}
                showLabel={showLabel}
            />
        </Stack>
    );
};

const moduleStore = {
    longPressInterval: null,
    longPressOn: false
};

const EnvironmentValue = ({
    title, signalName, signalValue, unit, iconPath, showLabel
}) => {

    const DELTA = 1;

    const getNewValue = useCallback((oldValue, dir) => {
        let newValue;
        if (dir === "up") {
            newValue = oldValue + DELTA;
            if (newValue > 100) {
                newValue = 100;
            }
        }
        else {
            newValue = oldValue - DELTA;
            if (signalName === ExteriorType.AirTemperature.name) {
                if (newValue < -100) {
                    newValue = -100;
                }
            }
            else {
                if (newValue < 0) {
                    newValue = 0;
                }
            }
        }
        return newValue;
    }, [signalName]);

    const handleMouseDown = useCallback((dir) => {
        moduleStore.longPressOn = false;
        let newValue = signalValue;
        moduleStore.longPressInterval = setInterval(() => {
            moduleStore.longPressOn = true;
            newValue = getNewValue(newValue, dir);
            setSignal(signalName, newValue);
        }, 100);
    }, [getNewValue, signalName, signalValue]);

    const handleMouseUp = useCallback((dir) => {
        if (moduleStore.longPressInterval) {
            clearInterval(moduleStore.longPressInterval);
            moduleStore.longPressInterval = null;
            if (moduleStore.longPressOn) {
                moduleStore.longPressOn = false;
                return;
            }
        }
        setSignal(signalName, getNewValue(signalValue, dir));
    }, [getNewValue, signalName, signalValue]);

    useEffect(() => {
        return () => {
            // Release timers
            if (moduleStore.longPressInterval) {
                clearInterval(moduleStore.longPressInterval);
                moduleStore.longPressInterval = null;
            }
        };
    }, []);

    return (
        <Stack spacing={1}>
            {showLabel &&
                <Box sx={{ justifyContent: "center", alignItems: "flex-start" }}
                >
                    <Typography fontSize="small" fontWeight="bold">
                        {title}
                    </Typography>
                </Box>
            }
            <Stack
                direction="row"
                sx={{
                    height: 40,
                    justifyContent: "center", alignItems: "center",
                    borderColor: "primary.main", borderRadius: "4px", borderWidth: showLabel ? 1 : 0, borderStyle: "solid"
                }}
            >
                {showLabel &&
                    <IconButton
                        size="small"
                        onMouseDown={() => handleMouseDown("down")}
                        onMouseUp={() => handleMouseUp("down")}
                        sx={{ width: 40, height:40 }}
                    >
                        <RemoveIcon color="primary"/>
                    </IconButton>
                }

                <Stack direction="row" spacing={1}
                    sx={{ width: 100, display: "flex", justifyContent: "center", alignItems: "center" }}
                >
                    <Icon path={iconPath} style={{ width: 32, height: 32 }} />
                    <Typography fontSize="normal" fontWeight="bold">
                        {signalValue}{unit}
                    </Typography>
                </Stack>

                {showLabel &&
                    <IconButton
                        onMouseDown={() => handleMouseDown("up")}
                        onMouseUp={() => handleMouseUp("up")}
                        size="small"
                        sx={{ width: 40, height:40 }}
                    >
                        <AddIcon color="primary"/>
                    </IconButton>
                }
            </Stack>
        </Stack>
    );
};

export default ExteriorConditions;