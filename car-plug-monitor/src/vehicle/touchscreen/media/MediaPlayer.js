import { useCallback, useEffect } from "react";

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';

import ArrowCircleDown from '@mui/icons-material/ArrowCircleDown';
import ArrowCircleUp from '@mui/icons-material/ArrowCircleUp';
import LibraryMusic from '@mui/icons-material/LibraryMusic';
import Pause from '@mui/icons-material/Pause';
import PlayArrow from '@mui/icons-material/PlayArrow';
import SkipNext from '@mui/icons-material/SkipNext';
import SkipPrevious from '@mui/icons-material/SkipPrevious';


const MediaPlayer = ({
    isPlaying,
    setIsPlaying,
    currentPlaying,
    nextSong,
    prevSong,
    toggleExpand,
    expand,
    currentApp,
    setVolumeRefresh
}) => {

    const playPause = useCallback((play) => {
        if (currentPlaying && currentPlaying.url && currentPlaying.url.length > 0) {
            const div = document.getElementById('myRadio');
            if (div) {
                const myRadio = div.getElementsByTagName("video")[0];
                if (myRadio) {
                    if (play) {
                        setVolumeRefresh(true);
                        myRadio.play().catch((e) => {
                            //
                        });
                    }
                    else {
                        myRadio.pause();
                    }
                }
            }
        }
    }, [currentPlaying, setVolumeRefresh]);
    
    useEffect(() => {
        if (currentPlaying && currentPlaying.url && currentPlaying.url.length > 0) {
            playPause(isPlaying);
        }
    }, [isPlaying, currentPlaying, playPause]);

    return (
        <Stack direction="row" sx={styledView} >
            <Stack direction="row" sx={styledView.currentMediaApps} >
                <Box sx={styledView.currentMediaApps.currentMediaApp} >
                    {(currentApp && currentApp.name !== "none") ?
                        <img
                            src={currentApp.image}
                            style={{
                                width: currentApp.style.width * 0.8,
                                height: currentApp.style.height * 0.8,
                                padding: currentApp.style.padding * 0.8
                            }}
                            alt=""
                        />
                        :
                        <LibraryMusic sx={{ width: 64, height: 64 }} />
                    }
                </Box>
                <Stack sx={styledView.currentMediaApps.currentPlaying} id="current-playing">
                    {currentApp.name !== "none" && currentPlaying && currentPlaying.name && currentPlaying.name !== "" &&
                        <span style={styledView.currentMediaApps.currentPlaying.title}>{currentPlaying.name}</span>
                    }
                    {currentApp.name !== "none" && currentPlaying && currentPlaying.desc && currentPlaying.desc !== "" &&
                        <span style={styledView.currentMediaApps.currentPlaying.desc}>{currentPlaying.desc}</span>
                    }
                </Stack>
            </Stack>
            <Stack direction="row" sx={styledView.controls} >
                <Button onClick={prevSong} sx={styledView.controls.button} disabled={currentApp.name === "none"}>
                    <SkipPrevious sx={styledView.controls.icon} />
                </Button>
                <Button onClick={() => setIsPlaying(!isPlaying)} sx={styledView.controls.button} disabled={currentApp.name === "none"}>
                    {isPlaying ? (
                        <Pause sx={styledView.controls.icon} />
                    ) : (
                        <PlayArrow sx={styledView.controls.icon} />
                    )}
                </Button>
                <Button onClick={nextSong} sx={styledView.controls.button} disabled={currentApp.name === "none"}>
                    <SkipNext sx={styledView.controls.icon} />
                </Button>
                <Divider orientation="vertical" variant="middle" sx={{ height: 48 }} />
                <Button onClick={toggleExpand} sx={styledView.controls.button} disabled={currentApp.name === "none"}>
                    {expand ? (
                        <ArrowCircleDown sx={styledView.controls.icon} />
                    ) : (
                        <ArrowCircleUp sx={styledView.controls.icon} />
                    )}
                </Button>
            </Stack>
        </Stack>
    );
};

export default MediaPlayer;

const styledView = {
    width: "100%",

    currentMediaApps: {
        width: "100%",
        currentMediaApp: {
            width: 120,
            height: 80,
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
        },
        currentPlaying: {
            width: "100%",
            height: 80,
            padding: "0 16px",
            justifyContent: "center",
            alignItems: "flex-start",
            title: {
                fontSize: 24,
                fontWeight: 700
            },
            desc: {
                fontSize: 16
            }
        },
    },

    controls: {
        height: 80,
        padding: "8px",
        justifyContent: "center",
        alignItems: "center",
        button: {
            width: 64,
            height: 64
        },
        icon: {
            width: 48,
            height: 48
        }
    }
};
