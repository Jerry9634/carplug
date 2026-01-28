import { useCallback, useEffect, useState } from "react";
import { IconButton, Stack } from "@mui/material";
import { setSignal } from "../../signal_db/VssSocket";

import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUp from "@mui/icons-material/KeyboardArrowUp";


const buttonStates = {
    longPressIntervals: new Array(4).fill(null),
    longPressONs: new Array(4).fill(false)
};

const DELTA = 10;


const DoorWindow = ({
    index,
    windowName,
    windowPos,
    windowChildLock = false
}) => {

    const [dir, setDir] = useState("none");

    const getNewValue = useCallback((oldValue, dir) => {
        let newValue;
        if (dir === "down") {
            newValue = oldValue + DELTA;
            if (newValue > 100) {
                newValue = 100;
            }
        }
        else {
            newValue = oldValue - DELTA;
            if (newValue < 0) {
                newValue = 0;
            }
        }
        return newValue;
    }, []);

    const handleMouseDown = useCallback((dir) => {
        setDir(dir);
        if (!windowChildLock) {
            buttonStates.longPressONs[index] = false;
            let newValue = windowPos;
            buttonStates.longPressIntervals[index] = setInterval(() => {
                buttonStates.longPressONs[index] = true;
                newValue = getNewValue(newValue, dir);
                setSignal(windowName, newValue);
            }, 200);
        }
    }, [getNewValue, index, windowChildLock, windowName, windowPos]);

    const handleMouseUp = useCallback((dir) => {
        setDir("none");
        if (!windowChildLock) {
            if (buttonStates.longPressIntervals[index]) {
                clearInterval(buttonStates.longPressIntervals[index]);
                buttonStates.longPressIntervals[index] = null;
                if (buttonStates.longPressONs[index]) {
                    buttonStates.longPressONs[index] = false;
                    return;
                }
            }
            setSignal(windowName, getNewValue(windowPos, dir));
        }
    }, [getNewValue, index, windowChildLock, windowName, windowPos]);

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
        <Stack spacing={1}>
            <IconButton className="window-up"
                sx={{ color: (dir === "up") ? "#fbb03b" : "#ffffff", bgcolor: "#000000", opacity: 0.8, padding: 0 }}
                onMouseDown={() => handleMouseDown("up")}
                onMouseUp={() => handleMouseUp("up")}
            >
                <KeyboardArrowUp sx={{ width: 40, height: 40 }} />
            </IconButton>
            <IconButton className="window-down"
                sx={{ color: (dir === "down") ? "#fbb03b" : "#ffffff", bgcolor: "#000000", opacity: 0.8, padding: 0 }}
                onMouseDown={() => handleMouseDown("down")}
                onMouseUp={() => handleMouseUp("down")}
            >
                <KeyboardArrowDown sx={{ width: 40, height: 40 }} />
            </IconButton>
        </Stack>
    );
};

export default DoorWindow;