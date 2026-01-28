import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';

import AddCircle from '@mui/icons-material/AddCircle';
import ChangeCircle from '@mui/icons-material/ChangeCircle';
import ForkLeft from '@mui/icons-material/ForkLeft';
import ForkRight from '@mui/icons-material/ForkRight';
import Merge from '@mui/icons-material/Merge';
import RampLeft from '@mui/icons-material/RampLeft';
import RampRight from '@mui/icons-material/RampRight';
import RemoveCircle from '@mui/icons-material/RemoveCircle';
import RoundaboutLeft from '@mui/icons-material/RoundaboutLeft';
import RoundaboutRight from '@mui/icons-material/RoundaboutRight';
import Straight from '@mui/icons-material/Straight';
import TurnLeft from '@mui/icons-material/TurnLeft';
import TurnRight from '@mui/icons-material/TurnRight';
import TurnSharpLeft from '@mui/icons-material/TurnSharpLeft';
import TurnSharpRight from '@mui/icons-material/TurnSharpRight';
import TurnSlightLeft from '@mui/icons-material/TurnSlightLeft';
import TurnSlightRight from '@mui/icons-material/TurnSlightRight';
import UTurnLeft from '@mui/icons-material/UTurnLeft';
import UTurnRight from '@mui/icons-material/UTurnRight';

import { getDistance } from './GeometryUtil';
import GooglePalcesAutocomplete from "../../driving_simul/NewPlace";
import { MIN_DELTA_DISTANCE } from "../../driving_simul/SimulatedDriving";
import { saveData, removeData } from "../../../persistency/PersistentMemory";


const directionsInterval = {
    handle: null,
    period: 1000
};


const DirectionsBox = ({
    destination,
    setDestination,
    directionsResponse,
    setDirectionsResponse,
    autopilotOn,
    speed,
    currentLocation,
    mapType, setMapType,
    zoom, setZoom,
    isDarkTheme
}) => {

    const maneuverIconMap = useMemo(fillIcons, []);

    const [directionsTicks, setDirectionsTicks] = useState(0);
    const [directions, setDirections] = useState([]);
    const [activeDirection, setActiveDirection] = useState(0);

    const [totalDirections, setTotalDirections] = useState([]);
    const [remainingDirections, setRemainingDirections] = useState([]);
    const [remainingDistance, setRemainingDistance] = useState(0);
    const [remainingTime, setRemainingTime] = useState(0);

    const destinationRef = useRef();
    const [inputValue, setInputValue] = useState("");
    const [value, setValue] = useState(null);

    const [lastLocation, setLastLocation] = useState(null);

    const calculateRoute = useCallback(async () => {
        let destinationText = destinationRef.current.value;
        if (!destinationText || destinationText.length < 3 || destination) {
            destinationRef.current.value = destination;
            destinationText = destination;
        }

        if (currentLocation && destinationText && destinationText.length >= 3) {
            const directionsService = new window.google.maps.DirectionsService();
            try {
                const results = await directionsService.route({
                    origin: currentLocation,
                    destination: destinationText,
                    travelMode: window.google.maps.TravelMode.DRIVING,
                });
                setDirectionsResponse(results);
                if (destination !== destinationText) {
                    setDestination(destinationText);
                    saveData("Map.Destination", destinationText);
                }
            }
            catch (e) {
                console.error(e);
            }
        }
    }, [currentLocation, destination, setDestination, setDirectionsResponse]);

    const clearRoute = useCallback(() => {
        setDestination(null);
        removeData("Map.Destination");
        setDirectionsResponse(null);
        setDirections([]);
        setTotalDirections([]);
        setRemainingDirections([]);

        if (destinationRef.current) {
            destinationRef.current.value = "";
        }
    }, [setDestination, setDirectionsResponse]);

    const getManeuverImageURL = useCallback((maneuver) => {
        if (maneuverIconMap.has(maneuver))
            return maneuverIconMap.get(maneuver);
        else
            return maneuverIconMap.get("straight");
    }, [maneuverIconMap]);
    
    const getRemainingDistance = useCallback(() => {
        let d = 0;
        if (directions.length > 0) {
            for (let i = activeDirection + 1; i < directions.length; i++) {
                d += directions[i].distance.value;
            }

            d += getDistance(currentLocation, directions[activeDirection].end_location);
        }

        return d;
    }, [activeDirection, currentLocation, directions]);

    const getRemainingDistanceTxt = useCallback((d = 0) => {
        if (d === 0) {
            d = getRemainingDistance();
        }
        if (d >= 1000) {
            return Number(d / 1000).toFixed(1) + " km";
        }
        else {
            return Number(d).toFixed(0) + " m";
        }
    }, [getRemainingDistance]);

    const makeDirections = useCallback(() => {
        if (directionsResponse) {
            const routes = directionsResponse.routes;
            if (routes && routes.length > 0) {
                const legs = routes[0].legs;
                if (legs && legs.length > 0) {
                    const steps = legs[0].steps;
                    if (steps && steps.length > 0) {
                        setDirections(steps);
                        setActiveDirection(0);

                        const newDirections = [];
                        steps.forEach((direction, idx) => {
                            newDirections.push({
                                isActiveDirection: false,
                                remainingStepDistance: getRemainingDistanceTxt(Number(direction.distance.value)),
                                imageURL: getManeuverImageURL(direction.maneuver),
                                maneuver: direction.maneuver,
                                instructions: direction.instructions
                            });
                        });
                        setTotalDirections(newDirections);
                    }
                }
            }
        }
    }, [directionsResponse, getManeuverImageURL, getRemainingDistanceTxt]);

    const forward = useCallback((delta_d) => {
        let curDirection = activeDirection;
        const distanceToMilestone = getDistance(currentLocation, directions[curDirection].end_location);
        if (distanceToMilestone < directions[curDirection].distance.value) {
            if (distanceToMilestone < delta_d) {
                if (curDirection < (directions.length - 1)) {
                    curDirection++;
                    setActiveDirection(curDirection);
                }
                else {
                    clearRoute();
                }
            }
        }
        else {
            for (let i = activeDirection + 1; i < directions.length; i++) {
                const direction = directions[i];
                const d1 = getDistance(currentLocation, direction.start_location);
                const d2 = getDistance(currentLocation, direction.end_location);
                if (d1 < direction.distance.value && d2 < direction.distance.value) {
                    setActiveDirection(i);
                    break;
                }
            }
        }
    }, [activeDirection, clearRoute, currentLocation, directions]);

    const getProperDirection = useCallback((idx) => {
        if (idx < directions.length) {
            const direction = directions[idx];
            if (idx === activeDirection && idx < (directions.length - 1)) {
                const maneuver = directions[idx + 1].maneuver;
                if (maneuver) {
                    if (maneuver === "turn-left" || maneuver === "turn-slight-left" || maneuver === "turn-sharp-left"
                        || maneuver === "turn-right" || maneuver === "turn-slight-right" || maneuver === "turn-sharp-right"
                        || maneuver === "u-turn-left" || maneuver === "u-turn-right"
                        || maneuver === "ramp-left" || maneuver === "ramp-right"
                        || maneuver === "roundabout-left" || maneuver === "roundabout-right"
                        || maneuver === "fork-left" || maneuver === "fork-right"
                        || maneuver === "merge"
                    ) {
                        const d = getDistance(currentLocation, direction.end_location);
                        if (d < 100) {
                            return null;
                        }
                        else {
                            const total_d = Number(direction.distance.value);
                            const ratio = d / total_d;
                            if (ratio < 0.25) {
                                return null;
                            }
                        }
                    }
                }
            }
            return direction;
        }
        return null;
    }, [activeDirection, currentLocation, directions]);

    const isActiveDirection = useCallback((idx) => {
        if (idx === activeDirection) {
            return true;
        }
        else if (idx === (activeDirection + 1)) {
            if (!getProperDirection(activeDirection)) {
                return true;
            }
        }
        return false;
    }, [activeDirection, getProperDirection]);

    const getDirectionImageURL = useCallback((idx) => {
        const maneuver = directions[idx].maneuver;
        if (idx !== activeDirection) {
            return getManeuverImageURL(maneuver);
        }
        else {
            if (maneuver === "straight"
                || maneuver === "ramp-left" || maneuver === "ramp-right"
                || maneuver === "roundabout-left" || maneuver === "roundabout-right") {
                return getManeuverImageURL(maneuver);
            }
        }
        return maneuverIconMap.get("straight");
    }, [activeDirection, directions, getManeuverImageURL, maneuverIconMap]);

    const getDirectionManeuver = useCallback((idx) => {
        const direction = directions[idx];
        if (idx === activeDirection) {
            const maneuver = direction.maneuver;
            if (maneuver) {
                if (maneuver === "turn-left" || maneuver === "turn-slight-left" || maneuver === "turn-sharp-left"
                    || maneuver === "turn-right" || maneuver === "turn-slight-right" || maneuver === "turn-sharp-right"
                    || maneuver === "u-turn-left" || maneuver === "u-turn-right"
                    || maneuver === "fork-left" || maneuver === "fork-right" || maneuver === "merge") {
                    return null;
                }
            }
        }
        return direction.maneuver;
    }, [activeDirection, directions]);

    const getRemainingTime = useCallback(() => {
        let t = 0;
        if (directions.length > 0) {
            for (let i = activeDirection + 1; i < directions.length; i++) {
                t += directions[i].duration.value;
            }

            if (directions[activeDirection].distance != null && directions[activeDirection].distance.value !== 0) {
                let d = getDistance(currentLocation, directions[activeDirection].end_location);
                t += (d * directions[activeDirection].duration.value) / directions[activeDirection].distance.value;
            }
        }

        return t;
    }, [activeDirection, currentLocation, directions]);

    const getRemainingTimeTxt = useCallback((t = 0) => {
        if (t === 0) {
            t = getRemainingTime();
        }
        if (t >= 60) {
            return Number(t / 60).toFixed(0) + " min";
        }
        else {
            return Number(t).toFixed(0) + " sec";
        }
    }, [getRemainingTime]);

    const getRemainingStepDistance = useCallback((idx, isActiveDirection) => {
        let d_meter;
        if (isActiveDirection) {
            d_meter = getDistance(currentLocation, directions[activeDirection].end_location);
        }
        else {
            d_meter = Number(directions[idx].distance.value);
        }
        return getRemainingDistanceTxt(d_meter);
    }, [activeDirection, currentLocation, directions, getRemainingDistanceTxt]);

    // eslint-disable-next-line
    const getRemainingStepTime = useCallback((idx, isActiveDirection) => {
        let time_sec;
        if (isActiveDirection) {
            const direction = directions[activeDirection];
            const d = getDistance(currentLocation, direction.end_location);
            time_sec = d * direction.duration.value / direction.distance.value;
        }
        else {
            time_sec = Number(directions[idx].duration.value);
        }

        return getRemainingTimeTxt(time_sec);
    }, [activeDirection, currentLocation, directions, getRemainingTimeTxt]);

    const changeMapType = useCallback(() => {
        if (mapType === "terrain") {
            setMapType("hybrid");
        }
        else {
            setMapType("terrain");
        }
    }, [mapType, setMapType]);

    const zoomIn = useCallback(() => {
        let newZoom = zoom + 1;
        if (newZoom > 21) {
            newZoom = 21;
        }
        setZoom(newZoom);
    }, [setZoom, zoom]);

    const zoomOut = useCallback(() => {
        let newZoom = zoom - 1;
        if (newZoom < 1) {
            newZoom = 1;
        }
        setZoom(newZoom);
    }, [setZoom, zoom]);

    useEffect(() => {
        voices = window.speechSynthesis.getVoices();

        return () => {
            if (directionsInterval.handle) {
                clearInterval(directionsInterval.handle);
                directionsInterval.handle = null;
            }
        };
    }, []);

    useEffect(() => {
        if (destination) {
            if (directions.length > 0) {
                if (!directionsInterval.handle) {
                    directionsInterval.handle = setInterval(() => {
                        setDirectionsTicks(directionsTicks => directionsTicks + 1);
                    }, directionsInterval.period);
                }
            }
            else {
                if (!directionsResponse) {
                    calculateRoute();
                }
                else {
                    makeDirections();
                    speech("경로 안내를 시작합니다", "ko");
                }
            }
        }
        else {
            if (directionsResponse || directions.length > 0) {
                clearRoute();
            }
            if (directionsInterval.handle) {
                clearInterval(directionsInterval.handle);
                directionsInterval.handle = null;
            }
        }
    }, [ destination, directionsResponse, directions, calculateRoute, clearRoute, makeDirections ]);

    useEffect(() => {
        let needsSave = true;
        if (autopilotOn) {
            if (speed > 0 && directions.length > 0) {
                if (lastLocation) {
                    const delta_d = getDistance(lastLocation, currentLocation);
                    if (delta_d > MIN_DELTA_DISTANCE) {
                        forward(delta_d);
                    }
                    else {
                        needsSave = false;
                    }
                }
            }
        }
        if (needsSave) {
            setLastLocation(currentLocation);
        }
    }, [ currentLocation, autopilotOn, directions, forward, lastLocation, speed ]);

    useEffect(() => {
        if (directions.length > 0) {
            let newDirections = [];
            for (let idx = activeDirection; idx < (activeDirection + 2); idx++) {
                if (getProperDirection(idx)) {
                    const isActive = isActiveDirection(idx);
                    newDirections.push({
                        isActiveDirection: isActive,
                        remainingStepDistance: getRemainingStepDistance(idx, isActive),
                        imageURL: getDirectionImageURL(idx),
                        maneuver: getDirectionManeuver(idx),
                        instructions: directions[idx].instructions
                    });
                }
            }
            if ((activeDirection + 2) < totalDirections.length) {
                newDirections = newDirections.concat(totalDirections.slice(activeDirection + 2));
            }
            setRemainingDirections(newDirections);

            setRemainingDistance(getRemainingDistance());
            setRemainingTime(getRemainingTime());
        }
    }, [
        directionsTicks, activeDirection, directions, totalDirections,
        getDirectionImageURL, getDirectionManeuver, getProperDirection,
        getRemainingDistance, getRemainingStepDistance, getRemainingTime, isActiveDirection
    ]);

    return (
        <>
            {directions.length === 0 &&
                <Stack direction="row" spacing={1}
                    sx={{
                        width: "50%", position: "absolute", top: 48, left: 32, padding: "8px",
                        bgcolor: isDarkTheme ? "#000000" : "#ffffff", borderRadius: "4px"
                    }}
                >
                    <Box sx={{ width: 1 }}>
                        <GooglePalcesAutocomplete
                            loaded={true} inputRef={destinationRef}
                            inputValue={inputValue} setInputValue={setInputValue}
                            value={value} setValue={setValue}
                        />
                    </Box>
                    <Button size="medium" variant="contained"
                        onClick={calculateRoute}
                    >
                        Search
                    </Button>
                </Stack>
            }

            {directions.length > 0 &&
                <Box sx={{
                    position: "absolute", right: 16, top: 16,
                    width: 360, maxHeight: 56 * 3,
                    color: isDarkTheme ? "#ffeb3b" : "#000000",
                    backgroundColor: isDarkTheme ? "#000000" : "#ffffff",
                    opacity: isDarkTheme ? 0.8 : 0.8,
                    overflowY: "scroll"
                }}
                >
                    <Directions remainingDirections={remainingDirections} isDarkTheme={isDarkTheme} />
                </Box>
            }

            <Stack spacing={1}
                sx={{
                    position: "absolute",
                    left: 16, bottom: 128,
                    color: isDarkTheme ? "#ffffff" : "#000000"
                }}
            >
                <IconButton size="small" color="primary"
                    onClick={changeMapType}
                    sx={{
                        opacity: 0.8,
                        fontSize: 32
                    }}
                >
                    <ChangeCircle fontSize="32"/>
                </IconButton>
                <IconButton size="small" color="primary"
                    onClick={zoomIn}
                    sx={{
                        opacity: 0.8,
                        fontSize: 32
                    }}
                >
                    <AddCircle fontSize="32"/>
                </IconButton>
                <IconButton size="small" color="primary"
                    onClick={zoomOut}
                    sx={{
                        opacity: 0.8,
                        fontSize: 32
                    }}
                >
                    <RemoveCircle fontSize="32"/>
                </IconButton>
            </Stack>

            {directions.length > 0 &&
                <Stack direction="row" spacing={1}
                    sx={{
                        position: "absolute",
                        left: 64, bottom: 16,
                        width: "100%", height: 40,
                        color: isDarkTheme ? "#ffeb3b" : "#000000"
                    }}
                >
                    <Box
                        sx={{
                            width: "40%", height: 40,
                            display: "flex",
                            justifyContent: "center", alignItems: "center",
                            backgroundColor: isDarkTheme ? "transparent" : "#ffffff",
                            opacity: isDarkTheme ? 1 : 0.8,
                            fontSize: 16
                        }}
                    >
                        {destination}
                    </Box>
                    <Box
                        sx={{
                            width: 128, height: 40,
                            display: "flex",
                            justifyContent: "center", alignItems: "center",
                            backgroundColor: isDarkTheme ? "transparent" : "#ffffff",
                            opacity: isDarkTheme ? 1 : 0.8,
                            fontSize: 16
                        }}
                    >
                        {getRemainingDistanceTxt(remainingDistance)}
                    </Box>
                    <Box
                        sx={{
                            width: 128, height: 40,
                            display: "flex",
                            justifyContent: "center", alignItems: "center",
                            backgroundColor: isDarkTheme ? "transparent" : "#ffffff",
                            opacity: isDarkTheme ? 1 : 0.8,
                            fontSize: 16
                        }}
                    >
                        {getRemainingTimeTxt(remainingTime)}
                    </Box>
                    <Button size="large" variant="contained"
                        onClick={clearRoute}
                        sx={{
                            width: 80, height: 40,
                            opacity: 0.8,
                            fontSize: 16,
                        }}
                    >
                        Cancel
                    </Button>
                </Stack>
            }
        </>
    );
};

const Directions = ({ remainingDirections, isDarkTheme }) => (
    <>
        {remainingDirections.map((direction, idx) =>
            <Stack direction="row"
                sx={{
                    width: "100%",
                    borderBottomWidth: "1px",
                    borderBottomStyle: "solid",
                    borderBottomColor: isDarkTheme ? "#ffffff" : "#000000",
                    fontSize: idx === 0 ? 16 : 14
                }}
                key={"direction-step-" + idx}
            >
                <Stack sx={{ width: "25%" }}>
                    {direction.imageURL ?
                        <Box
                            sx={{
                                width: "100%", height: 32, display: "flex", justifyContent: "center", alignItems: "center"
                            }}
                        >
                            {direction.imageURL}
                        </Box>
                        :
                        <Box
                            sx={{
                                fontSize: idx === 0 ? 12 : 11,
                                width: "100%", height: 32, display: "flex", justifyContent: "center", alignItems: "center"
                            }}
                        >
                            {direction.maneuver}
                        </Box>
                    }
                    <Box sx={{ width: "100%", height: 24, display: "flex", justifyContent: "center", alignItems: "center" }}>
                        {direction.remainingStepDistance}
                    </Box>
                </Stack>

                <Box sx={{ width: "75%", padding: "4px" }} dangerouslySetInnerHTML={{ __html: direction.instructions }} />
            </Stack>
        )}
    </>
);

let voices;
let kor_voice;
let en_voice;

const speech = (txt, lang) => {
    if (!voices) {
        voices = window.speechSynthesis.getVoices();
    }

    /* 한국어 vocie 찾기
       디바이스 별로 한국어는 ko-KR 또는 ko_KR로 voice가 정의되어 있다.
    */
    const ko = "ko-KR";
    kor_voice = voices.find(
        (elem) => elem.lang === ko || elem.lang === ko.replace("-", "_")
    );
    const en = "en";
    en_voice = voices.find(
        (elem) => elem.lang.startsWith(en)
    );

    if (window.speechSynthesis.onvoiceschanged !== undefined) {
        //voice list에 변경됐을때, voice를 다시 가져온다.
        voices = window.speechSynthesis.getVoices();
        window.speechSynthesis.onvoiceschanged = voices;
    }

    const utterThis = new SpeechSynthesisUtterance(txt);

    utterThis.lang = lang;


    //힌국어 voice가 있다면 ? utterance에 목소리를 설정한다 : 리턴하여 목소리가 나오지 않도록 한다.
    if (lang === "ko") {
        utterThis.voice = kor_voice;
    } else {
        utterThis.voice = en_voice;
    }

    //utterance를 재생(speak)한다.
    window.speechSynthesis.speak(utterThis);
};

const fillIcons = () => {
    const iconMap = new Map();
    const iconStyle = { width: 32, height: 32 };
    iconMap.set("fork-left", <ForkLeft sx={iconStyle} />);
    iconMap.set("fork-right", <ForkRight sx={iconStyle} />);
    iconMap.set("merge", <Merge sx={iconStyle} />);
    iconMap.set("ramp-left", <RampLeft sx={iconStyle} />);
    iconMap.set("ramp-right", <RampRight sx={iconStyle} />);
    iconMap.set("roundabout-left", <RoundaboutLeft sx={iconStyle} />);
    iconMap.set("roundabout-right", <RoundaboutRight sx={iconStyle} />);
    iconMap.set("straight", <Straight sx={iconStyle} />);
    iconMap.set("turn-left", <TurnLeft sx={iconStyle} />);
    iconMap.set("turn-right", <TurnRight sx={iconStyle} />);
    iconMap.set("turn-sharp-left", <TurnSharpLeft sx={iconStyle} />);
    iconMap.set("turn-sharp-right", <TurnSharpRight sx={iconStyle} />);
    iconMap.set("turn-slight-left", <TurnSlightLeft sx={iconStyle} />);
    iconMap.set("turn-slight-right", <TurnSlightRight sx={iconStyle} />);
    iconMap.set("u-turn-left", <UTurnLeft sx={iconStyle} />);
    iconMap.set("u-turn-right", <UTurnRight sx={iconStyle} />);
    return iconMap;
};

export default DirectionsBox;