import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import ReactPlayer from 'react-player/lazy';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';

import MediaApps from "./MediaApps";
import MediaPlayer from "./MediaPlayer";
import { RadioStreamingList, getInternetStations } from "./RadioStreamingList";
import { TouchscreenBackground } from "../Touchscreen";
import { getDataSafely, saveData } from "../../../persistency/PersistentMemory";

import { AppContext } from '../../../AppContext';


const MediaMain = ({
    APP_HEIGHT,
    setVolumeRefresh,
    currentApp, setCurrentApp,
    setFullScreenApp
}) => {

    const { isDarkTheme } = useContext(AppContext);

    const { korStations, bbcStations } = useMemo(() => getInternetStations(), []);
    const [stations, setStations] = useState([]);
    const [currentStation, setCurrentStation] = useState(0);

    const [currentPlaying, setCurrentPlaying] = useState({ name: "", image: "", desc: "" });
    const [isPlaying, setIsPlaying] = useState(true);

    const [expand, setExpand] = useState(true);

    const nextSong = useCallback(() => {
        let newIndex;
        if (currentApp.name === "Korean Radio" || currentApp.name === "BBC Radio") {
            if (stations.length > 0) {
                if (currentStation + 1 < stations.length) {
                    newIndex = currentStation + 1;
                } else {
                    newIndex = 0;
                }
                setCurrentStation(newIndex);
                setCurrentPlaying(stations[newIndex]);
            }
        }
    }, [currentApp.name, currentStation, stations]);

    const prevSong = useCallback(() => {
        let newIndex;
        if (currentApp.name === "Korean Radio" || currentApp.name === "BBC Radio") {
            if (stations.length > 0) {
                if (currentStation > 0) {
                    newIndex = currentStation - 1;
                } else {
                    newIndex = stations.length - 1;
                }
                setCurrentStation(newIndex);
                setCurrentPlaying(stations[newIndex]);
            }
        }
    }, [currentApp.name, currentStation, stations]);

    const toggleExpand = useCallback(() => {
        setExpand(!expand);
    }, [expand]);

    const _onReady = useCallback((event) => {
        // access to player in all event handlers via event.target
    }, []);

    useEffect(() => {
        const app = getDataSafely("Media.CurrentApp", { name: "none" });

        if (app.name !== "none") {
            setExpand(getDataSafely("Media.Expand", true));
            setIsPlaying(getDataSafely("Media.IsPlaying", true));

            if (app.name === "Korean Radio" || app.name === "BBC Radio") {
                setCurrentApp(app);
                if (app.name === "Korean Radio") {
                    const _station = getDataSafely("Media.KOR.CurrentStation", 0);
                    setStations(korStations);
                    setCurrentStation(_station);
                    if (_station < korStations.length) {
                        setCurrentPlaying(korStations[_station]);
                    }
                }
                else {
                    const _station = getDataSafely("Media.BBC.CurrentStation", 0);
                    setStations(bbcStations);
                    setCurrentStation(_station);
                    if (_station < bbcStations.length) {
                        setCurrentPlaying(bbcStations[_station]);
                    }
                }
            }
        }
    }, [bbcStations, korStations, setCurrentApp]);

    useEffect(() => {
        if (currentApp && currentApp.name === "none" && !expand) {
            setExpand(true);
        }
    }, [currentApp, expand]);

    useEffect(() => {
        saveData("Media.CurrentApp", currentApp);
        saveData("Media.IsPlaying", isPlaying);
        saveData("Media.Expand", expand);

        if (currentApp.name !== "none") {
            if (currentApp.name === "Korean Radio") {
                saveData("Media.KOR.Stations", stations);
                saveData("Media.KOR.CurrentStation", currentStation);
            }
            else if (currentApp.name === "BBC Radio") {
                saveData("Media.BBC.Stations", stations);
                saveData("Media.BBC.CurrentStation", currentStation);
            }
        }

        if (currentApp.name !== "none" && currentApp.name !== "Korean Radio" && currentApp.name !== "BBC Radio" && currentApp.url.length > 0) {
            setFullScreenApp(true);
        }
    }, [currentApp, stations, currentStation, isPlaying, expand, setFullScreenApp]);

    return (
        <Box
            sx={{
                position: "relative",
                zIndex: 2,
                width: "100%",
                height: (expand ? APP_HEIGHT : 80),
                backgroundColor: TouchscreenBackground(isDarkTheme),
                borderTopRightRadius: 4,
            }}
        >
            <MediaPlayer
                currentPlaying={currentPlaying}
                isPlaying={isPlaying}
                setIsPlaying={setIsPlaying}
                nextSong={nextSong}
                prevSong={prevSong}
                setExpand={setExpand}
                toggleExpand={toggleExpand}
                expand={expand}
                currentApp={currentApp}
                setVolumeRefresh={setVolumeRefresh}
            />

            {expand && currentApp.name === "none" &&
                <Stack direction="row" sx={mediaMainStyle.mediaApps}>
                    <MediaApps
                        currentApp={currentApp} setCurrentApp={setCurrentApp}
                        setStations={setStations} setCurrentStation={setCurrentStation}
                        setCurrentPlaying={setCurrentPlaying} setIsPlaying={setIsPlaying}
                        korStations={korStations} bbcStations={bbcStations}
                        isDarkTheme={isDarkTheme}
                    />
                </Stack>
            }
            {(currentApp.name === "Korean Radio" || currentApp.name === "BBC Radio") &&
                <Stack direction="row" sx={mediaMainStyle.radioPlaylist}>
                    <RadioStreamingList
                        stations={stations}
                        setCurrentStation={setCurrentStation}
                        setCurrentPlaying={setCurrentPlaying}
                        setIsPlaying={setIsPlaying}
                        isDarkTheme={isDarkTheme}
                    />
                    <ReactPlayer
                        id="myRadio"
                        controls={false}
                        playing={isPlaying}
                        muted={false}
                        width="0px"
                        height="0px"
                        url={currentPlaying.url}
                        onReady={_onReady}
                    />
                </Stack>
            }
        </Box>
    );
};

export default MediaMain;

const mediaMainStyle = {
    mediaApps: {
        padding: "8px",
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        alignItems: "center",
    },

    radioPlaylist: {
        padding: "8px",
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        alignItems: "center",
        width: "100%",
        maxHeight: "calc(100% - 84px)",
        overflow: "scroll"
    },
};
