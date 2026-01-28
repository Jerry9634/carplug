import { useCallback, useEffect, useState } from "react";

import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";

import Add from "@mui/icons-material/Add";
import Remove from "@mui/icons-material/Remove";
import VolumeOff from "@mui/icons-material/VolumeOff";
import VolumeUp from "@mui/icons-material/VolumeUp";


const volumeState = {
    volume: 100,
    mute: false,
    volumeTimerHandle: null,
    longPressOn: false,
    longPressInterval: null,
    muteInterval: null
};


const VolumeControl = ({
    refresh, setRefresh
}) => {

    const [volumeDisplay, setVolumeDisplay] = useState(volumeState.volume);
    const [muteDisplay, setMuteDisplay] = useState(volumeState.mute);
    const [volumeVisible, setVolumeVisible] = useState(false);

    const getNewValue = useCallback((oldValue, direction, delta = 1) => {
        let newValue;
        if (direction === "up") {
            newValue = oldValue + delta;
            if (newValue > 100) {
                newValue = 100;
            }
        }
        else {
            newValue = oldValue - delta;
            if (newValue < 0) {
                newValue = 0;
            }
        }
        return newValue;
    }, []);

    const showsVolume = useCallback((volume) => {
        setVolumeDisplay(volume);
        setVolumeVisible(true);

        if (volumeState.volumeTimerHandle) {
            clearTimeout(volumeState.volumeTimerHandle);
        }
        volumeState.volumeTimerHandle = setTimeout(() => {
            setVolumeVisible(false);
            volumeState.volumeTimerHandle = null;
        }, 3000);
    }, []);

    const handleMouseDown = useCallback((dir) => {
        volumeState.mute = false;
        let longPressTimer = 0;
        volumeState.longPressInterval = setInterval(() => {
            longPressTimer += 50;
            if (longPressTimer >= 500) {
                volumeState.longPressOn = true;
                const newVal = getNewValue(volumeState.volume, dir);
                setMediaVolume(newVal, true);
                showsVolume(newVal);
            }
        }, 50);
    }, [getNewValue, showsVolume]);

    const handleMouseUp = useCallback((dir) => {
        if (volumeState.longPressInterval) {
            clearInterval(volumeState.longPressInterval);
            volumeState.longPressInterval = null;
            if (volumeState.longPressOn) {
                volumeState.longPressOn = false;
                return;
            }
        }

        const newVal = getNewValue(volumeState.volume, dir, 5);
        setMediaVolume(newVal, true);
        showsVolume(newVal);
    }, [getNewValue, showsVolume]);

    const storeVolume = useCallback(() => {
        volumeState.mute = true;
        setMediaVolume(0);
        setMuteDisplay(true);
    }, []);

    const restoreVolume = useCallback(() => {
        volumeState.mute = false;
        setMediaVolume(volumeState.volume);
        setMuteDisplay(false);
    }, []);

    const handleMuteMouseDown = useCallback(() => {
        let longPressTimer = 0;
        volumeState.muteInterval = setInterval(() => {
            longPressTimer += 50;
            if (longPressTimer >= 500) {
                if (!volumeState.mute) {
                    storeVolume();
                }
                else {
                    restoreVolume();
                }

                clearInterval(volumeState.muteInterval);
                volumeState.muteInterval = null;
            }
        }, 50);
    }, [restoreVolume, storeVolume]);

    const handleMuteMouseUp = useCallback(() => {
        if (volumeState.muteInterval) {
            clearInterval(volumeState.muteInterval);
            volumeState.muteInterval = null;
        }
    }, []);

    useEffect(() => {
        if (volumeState.mute) {
            setMediaVolume(0);
        }
        else {
            setMediaVolume(volumeState.volume);
        }

        return () => {
            // Release timers
            if (volumeState.longPressInterval) {
                clearInterval(volumeState.longPressInterval);
                volumeState.longPressInterval = null;
            }
            if (volumeState.muteInterval) {
                clearInterval(volumeState.muteInterval);
                volumeState.muteInterval = null;
            }
        };
    }, []);

    useEffect(() => {
        if (refresh) {
            if (volumeState.mute) {
                volumeState.mute = false;
                setMuteDisplay(false);
            }
            setVolumeDisplay(volumeState.volume);

            setMediaVolume(volumeState.volume);
            setRefresh(false);
        }
    }, [refresh, setRefresh]);

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

            <Button
                onMouseDown={handleMuteMouseDown}
                onMouseUp={handleMuteMouseUp}
                sx={{ width: 80, height: 64, fontSize: 32, fontWeight: 700 }}
                color="primary"
            >
                {volumeVisible ?
                    <span>{volumeDisplay}</span>
                    :
                    <>
                        {(muteDisplay || volumeDisplay === 0) ?
                            <VolumeOff sx={{ width: 48, height: 48 }} />
                            :
                            <VolumeUp sx={{ width: 48, height: 48 }} />
                        }
                    </>
                }
            </Button>

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

export default VolumeControl;

export const muteMediaVolume = (timeout) => {
    setMediaVolume(0);
    setTimeout(() => {
        setMediaVolume(volumeState.volume);
    }, timeout);
    return true;
};

export const setMediaVolume = (volume, store = false) => {
    if (store) {
        volumeState.volume = volume;
    }
    let div = document.getElementById("myRadio");
    if (div != null) {
        let video = div.getElementsByTagName("video")[0];
        if (video != null) {
            video.volume = volume / 100;
        }
    }
};
