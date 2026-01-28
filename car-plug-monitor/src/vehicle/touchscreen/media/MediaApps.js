import { useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { getDataSafely } from '../../../persistency/PersistentMemory';


const MediaApps = ({
    currentApp, setCurrentApp,
    setStations, setCurrentStation,
    setCurrentPlaying, setIsPlaying,
    korStations, bbcStations,
    isDarkTheme
}) => {

    const clearCurrentDisplay = useCallback(() => {
        setStations([]);
        setCurrentPlaying({ name: "", image: "", desc: "" });
    }, [setCurrentPlaying, setStations]);

    const startApp = useCallback((app) => {
        if (app.name !== currentApp.name) {
            let ok = false;
            setCurrentApp(app);
            if (app.name === "Korean Radio" || app.name === "BBC Radio") {
                let _stations;
                let _currentStation;

                if (app.name === "Korean Radio") {
                    _stations = korStations;
                    _currentStation = getDataSafely("Media.KOR.CurrentStation", 0);
                }
                else {
                    _stations = bbcStations;
                    _currentStation = getDataSafely("Media.BBC.CurrentStation", 0);
                }

                if (_stations.length > 0 && _currentStation < _stations.length) {
                    ok = true;
                    setStations(_stations);
                    setCurrentStation(_currentStation);
                    setCurrentPlaying(_stations[_currentStation]);
                    setIsPlaying(true);
                }
            }

            if (!ok) {
                clearCurrentDisplay();
            }
        }
    }, [
        bbcStations, clearCurrentDisplay, currentApp.name, korStations, 
        setCurrentApp, setCurrentPlaying, setCurrentStation, setIsPlaying, setStations
    ]);

    return (
        <>
            {mediaApps(isDarkTheme).map((app, idx) =>
                <Box sx={styledView} key={idx}>
                    <Card sx={styledView.innerBorder}>
                        <CardActionArea sx={{ width: 1, height: 1 }}
                            onClick={() => {
                                startApp(app);
                            }}
                        >
                            <CardContent sx={{ width: 1, height: 1 }}>
                                <Stack sx={{ width: 1, height: 1 }}>
                                    <Box sx={{ width: 1, height: 1 / 2, display: "flex", justifyContent: "center", alignItems: "center" }}>
                                        <img src={app.image} style={app.style} alt="" />
                                    </Box>
                                    <Box sx={{ width: 1, height: 1 / 4, display: "flex", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
                                        <Typography gutterBottom variant="h6" component="div">
                                            {app.name}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ width: 1, height: 1 / 4, display: "flex", justifyContent: "center", alignItems: "flex-start" }}>
                                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                            {(app.desc && app.desc.length) > 0 ?
                                                app.desc : app.name
                                            }
                                        </Typography>
                                    </Box>
                                </Stack>
                            </CardContent>
                        </CardActionArea>
                    </Card>
                </Box>
            )}
        </>
    );
};

const mediaApps = (isDarkTheme) => [
    {
        name: "Korean Radio",
        image: "./touchscreen/media/K-Radio.webp",
        desc: "Korean Radio Stations",
        url: "",
        style: { width: 72, height: 72, padding: 4 },
    },
    {
        name: "BBC Radio",
        image: isDarkTheme ? "./touchscreen/media/BBC_Radio_Dark.png" : "./touchscreen/media/BBC_Radio.png",
        desc: "BBC Radio Stations",
        url: "",
        style: { width: 80, height: 80, padding: 0 },
    },
    {
        name: "Bluetooth",
        image: "./touchscreen/media/Bluetooth.png",
        desc: "Playing Media from Bluetooth Devices",
        url: "",
        style: { width: 80, height: 80, padding: 0 },
    },
    {
        name: "Melon Music",
        image: "./touchscreen/media/melon_music.png",
        desc: "Melon Music",
        url: "melon.com",
        style: { width: 100, height: 100, padding: 0 },
    },
    {
        name: "Spotify",
        image: "./touchscreen/media/Spotify.png",
        desc: "Spotify: Music for everyone",
        url: "spotify.com",
        style: { width: 100, height: 100, padding: 0 },
    },
    {
        name: "Apple Music",
        image: "./touchscreen/media/AppleMusic.png",
        desc: "Listen to millions of songs, watch music videos, and experience live performances all on Apple Music.",
        url: "music.apple.com",
        style: { width: 72, height: 72, padding: 4 },
    },
    {
        name: "YouTube Music",
        image: "./touchscreen/media/youtube_music.png",
        desc: "With the YouTube Music app, enjoy over 100 million songs at ...",
        url: "music.youtube.com",
        style: { width: 72, height: 72, padding: 4 },
    },
    {
        name: "Caraoke",
        image: "./touchscreen/media/Caraoke.png",
        desc: "Sing along with various song",
        url: "",
        style: { width: 72, height: 72, padding: 4 },
    },
    {
        name: "TuneIn",
        image: "./touchscreen/media/TuneIn.png",
        desc: "Free Internet Radio",
        url: "tunein.com",
        style: { width: 100, height: 100, padding: 0 },
    },
    {
        name: "Tidal",
        image: "./touchscreen/media/Tidal.png",
        desc: "High Fidelity Music Streaming",
        url: "tidal.com",
        style: { width: 100, height: 100, padding: 0 },
    },
    {
        name: "Netflix",
        image: "./touchscreen/media/netflix.png",
        desc: "Watch TV Shows Online, Watch Movies Online",
        url: "netflix.com",
        style: { width: 72, height: 72, padding: 4 },
    },
    {
        name: "YouTube",
        image: "./touchscreen/media/youtube.png",
        desc: "Share your videos with friends, family, and the world.",
        url: "youtube.com",
        style: { width: 72, height: 72, padding: 4 },
    },
];

const styledView = {
    width: 1 / 4,
    height: 224,
    padding: "8px",
    innerBorder: {
        borderRadius: "8px",
        width: 1,
        height: 1,
        fontSize: "1.2rem"
    }
};

export default MediaApps;