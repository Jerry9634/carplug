import { useCallback, useEffect, useState } from "react";

import IconButton from "@mui/material/IconButton";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUp from "@mui/icons-material/KeyboardArrowUp";

import { setSignal } from "../../signal_db/VssSocket";


const buttonStates = {
    longPressIntervals: new Array(8).fill(null),
    longPressONs: new Array(8).fill(false)
};


const LongPressButton = ({
    index,
    signalName,
    signalValue,
    getNewValue,
    dir,
    enabled = true
}) => {

    const [buttonPressed, setButtonPressed] = useState(false);

    const handlePressOut = useCallback(() => {
        if (buttonStates.longPressIntervals[index]) {
            clearInterval(buttonStates.longPressIntervals[index]);
            buttonStates.longPressIntervals[index] = null;
            if (buttonStates.longPressONs[index]) {
                buttonStates.longPressONs[index] = false;
                return;
            }
        }
        setSignal(signalName, getNewValue(signalValue, dir));
    }, [dir, getNewValue, index, signalName, signalValue]);

    const handlePressIn = useCallback(() => {
        buttonStates.longPressONs[index] = false;
        let newValue = signalValue;
        buttonStates.longPressIntervals[index] = setInterval(() => {
            buttonStates.longPressONs[index] = true;
            newValue = getNewValue(newValue, dir);
            setSignal(signalName, newValue);
        }, 200);
    }, [dir, getNewValue, index, signalName, signalValue]);

    const getArrow = useCallback(() => {
        if (dir === "left") {
            return <KeyboardArrowLeft sx={{ width: 64, height: 64 }} />
        }
        else if (dir === "right") {
            return <KeyboardArrowRight sx={{ width: 64, height: 64 }} />
        }
        else if (dir === "up") {
            return <KeyboardArrowUp sx={{ width: 64, height: 64 }} />
        }
        else if (dir === "down") {
            return <KeyboardArrowDown sx={{ width: 64, height: 64 }} />
        }
    }, [dir]);

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
        <IconButton sx={{ color: buttonPressed ? "#fbb03b" : "#ffffff", padding: 0 }}
            onMouseDown={() => {
                setButtonPressed(true);
                if (enabled) {
                    handlePressIn();
                }
            }}
            onMouseUp={() => {
                setButtonPressed(false);
                if (enabled) {
                    handlePressOut();
                }
            }}
        >
            {getArrow()}
        </IconButton>
    );
};

export default LongPressButton;