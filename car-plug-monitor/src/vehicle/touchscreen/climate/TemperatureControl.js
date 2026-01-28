import { useCallback, useEffect } from "react";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import Add from "@mui/icons-material/Add";
import Remove from "@mui/icons-material/Remove";

import Icon from '@mdi/react';
import { mdiTemperatureCelsius } from "@mdi/js";

import vssApi from "../../../signal_db/VssAPI.json";
import { setSignal } from "../../../signal_db/VssSocket";


const ClimateTemperatureSetType = vssApi.Vehicle.Cabin.HVAC.Station.Row1.Driver.Temperature;
const MIN = ClimateTemperatureSetType.allowed.MIN;
const MAX = ClimateTemperatureSetType.allowed.MAX;
const LO = ClimateTemperatureSetType.allowed.LO;
const HI = ClimateTemperatureSetType.allowed.HI;

const buttonStates = {
    longPressIntervals: new Array(4).fill(null),
    longPressONs: new Array(4).fill(false)
};


const TemperatureControl = ({ index, signalName, temperature }) => {

    const getTempLabel = useCallback(() => {
        if (temperature >= MIN && temperature <= MAX) {
            return Number(temperature).toFixed(1).substring(0, 2);
        }
        else if (temperature === LO) {
            return "LO";
        }
        else if (temperature === HI) {
            return "HI";
        }
        else {
            return "--";
        }
    }, [temperature]);

    const getTempFraction = useCallback(() => {
        if (temperature >= MIN && temperature <= MAX) {
            return Number(temperature).toFixed(1).substring(2);
        }
        return null;
    }, [temperature]);

    const getNewValue = useCallback((oldValue, dir) => {
        let newValue;
        if (dir === "up") {
            if (oldValue === LO) {
                newValue = MIN; // LO to MIN
            }
            else if (oldValue === HI) {
                newValue = oldValue; // HI to HI
            }
            else if (oldValue >= MIN && oldValue < MAX) {
                newValue = oldValue + 0.5; // up
            }
            else if (oldValue === MAX) {
                newValue = HI; // MAX to HI
            }
            else {
                newValue = 25;
            }
        }
        else {
            if (oldValue === LO) {
                newValue = oldValue; // LO to LO
            }
            else if (oldValue === HI) {
                newValue = MAX; // HI to MAX
            }
            else if (oldValue > MIN && oldValue <= MAX) {
                newValue = oldValue - 0.5; // down
            }
            else if (oldValue === MIN) {
                newValue = LO; // MIN to LO
            }
            else {
                newValue = 25;
            }
        }
        return newValue;
    }, []);

    const handleMouseDown = useCallback((dir) => {
        buttonStates.longPressONs[index] = false;
        let newValue = temperature;
        buttonStates.longPressIntervals[index] = setInterval(() => {
            buttonStates.longPressONs[index] = true;
            newValue = getNewValue(newValue, dir);
            setSignal(signalName, newValue);
        }, 250);
    }, [getNewValue, index, signalName, temperature]);

    const handleMouseUp = useCallback((dir) => {
        if (buttonStates.longPressIntervals[index]) {
            clearInterval(buttonStates.longPressIntervals[index]);
            buttonStates.longPressIntervals[index] = null;
            if (buttonStates.longPressONs[index]) {
                buttonStates.longPressONs[index] = false;
                return;
            }
        }
        setSignal(signalName, getNewValue(temperature, dir));
    }, [getNewValue, index, signalName, temperature]);

    useEffect(() => {
        return () => {
            // Release timers
            if (buttonStates.longPressIntervals[index]) {
                clearInterval(buttonStates.longPressIntervals[index]);
                buttonStates.longPressIntervals[index] = null;
            }
        };
    }, [index]);

    return (
        <Stack direction="row">
            <Button
                onMouseDown={() => handleMouseDown("down")}
                onMouseUp={() => handleMouseUp("down")}
                sx={{ width: 64, height: 64 }}
                color="primary"
            >
                <Remove sx={{ width: 40, height: 40 }} />
            </Button>

            <Stack direction="row" sx={{ width: 100, height: 64, justifyContent: "center", alignItems: "center" }}>
                <Typography sx={{ fontSize: 32, fontWeight: 700 }}>
                    {getTempLabel()}
                </Typography>
                <Box sx={{ fontSize: 24, fontWeight: 700 }}>
                    <div style={{ height: 7 }} />
                    <Typography sx={{ fontSize: 24, fontWeight: 700 }}>
                        {getTempFraction()}
                    </Typography>
                </Box>
                {(temperature >= MIN && temperature <= MAX) &&
                    <Icon path={mdiTemperatureCelsius} style={{ width: 32, height: 32 }} />
                }
            </Stack>

            <Button
                onMouseDown={() => handleMouseDown("up")}
                onMouseUp={() => handleMouseUp("up")}
                sx={{ width: 64, height: 64 }}
                color="primary"
            >
                <Add sx={{ width: 40, height: 40 }} />
            </Button>
        </Stack>
    );
};

export default TemperatureControl;
