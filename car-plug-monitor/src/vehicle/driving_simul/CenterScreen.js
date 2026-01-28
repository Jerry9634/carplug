import { useCallback, useContext, useEffect, useRef, useState } from "react";

import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";

import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUp from "@mui/icons-material/KeyboardArrowUp";

import { VehicleContext } from "../VehicleContext";
import DirectionsBox from "./DirectionsBox";
import DrivingView from "./DrivingView";
import LeftSideBar from "./LeftSideBar";
import ReactStreetviewMulti from "./ReactStreetviewMulti";
import { MyTooltip } from "../car_interior/CarInterior";

import { getData, getDataSafely, saveData } from "../../persistency/PersistentMemory";
import vssApi from "../../signal_db/VssAPI.json";
import { subscribeChannel, unsubscribeChannel, setSignals } from "../../signal_db/VssSocket";


const MY_CHANNEL = "CenterScreen";
const CurrentLocationType = vssApi.Vehicle.CurrentLocation;
const RangeType = vssApi.Vehicle.Powertrain.Range;
const OdometerType = vssApi.Vehicle.TraveledDistance;
const TripType = vssApi.Vehicle.TraveledDistanceSinceStart;


const CenterScreen = ({
	streetViewPanoramaOptions
}) => {

    const {
        MAP_API_KEY, isLoaded,
        setDestination,
        autopilotOn,
        setStreetViewPanoramaOptions,
    } = useContext(VehicleContext);

    const originRef = useRef();
    const destinationRef = useRef();

    const [carPosition, setCarPosition] = useState(null);
    const [heading, setHeading] = useState(getDataSafely(CurrentLocationType.Heading.name, 0));

    const [directionsResponse, setDirectionsResponse] = useState(null);
    
    const [streetViewService, setStreetViewService] = useState(null);

    const [distanceToEmpty, setDistanceToEmpty] = useState(getDataSafely(RangeType.name, 500000));
    const [traveledDistanceSinceStart, setTraveledDistanceSinceStart] = useState(getDataSafely(TripType.name, 0));
    const [traveledDistance, setTraveledDistance] = useState(getDataSafely(OdometerType.name, 0));

    const [panoUpdateTimer, setPanoUpdateTimer] = useState(null);

    const [roomMirrorDown, setRoomMirrorDown] = useState(false);

    const setCurrentLocation = useCallback((lat, lng, hdng) => {
        setCarPosition({ lat: lat, lng: lng });

        const time = new Date().toISOString();
        setSignals({
            signals: [
                { name: CurrentLocationType.Timestamp.name, value: time },
                { name: CurrentLocationType.Latitude.name, value: lat },
                { name: CurrentLocationType.Longitude.name, value: lng },
                { name: CurrentLocationType.Heading.name, value: hdng },
            ]
        });

        saveData(CurrentLocationType.Latitude.name, lat);
        saveData(CurrentLocationType.Longitude.name, lng);
        saveData(CurrentLocationType.Heading.name, hdng);
    }, []);

    useEffect(() => {
        subscribeChannel(MY_CHANNEL, [
            { signal: RangeType, setter: setDistanceToEmpty },
            { signal: CurrentLocationType.Heading, setter: setHeading }
        ]);

        const myInterval = setInterval(() => {
            setDestination(getData("Map.Destination"));
        }, 500);

        // AirPlug
        setCurrentLocation(
            getDataSafely(CurrentLocationType.Latitude.name, 37.486592),
            getDataSafely(CurrentLocationType.Longitude.name, 127.1136256),
            getDataSafely(CurrentLocationType.Heading.name, 0),
        );

        return () => {
            unsubscribeChannel(MY_CHANNEL);
            clearInterval(myInterval);
        };
    }, [setCurrentLocation, setDestination]);

    useEffect(() => {
        if (isLoaded) {
            setStreetViewService(new window.google.maps.StreetViewService());
        }
    }, [isLoaded]);

    useEffect(
        () => {
            if (!autopilotOn && streetViewPanoramaOptions && !panoUpdateTimer) {
                setStreetViewPanoramaOptions({
                    position: streetViewPanoramaOptions.position,
                    pov: { heading: heading, pitch: 0 },
                    zoom: 1
                });
                const handle = setTimeout(() => {
                    setPanoUpdateTimer(null);
                }, 400);
                setPanoUpdateTimer(handle);
            }
        },
        // eslint-disable-next-line
        [ heading, autopilotOn ]
    );

    return (
        <Stack direction="row" sx={{ width: 1, height: 1 }}>
            <Box
                sx={{
                    width: autopilotOn ? 0 : "30%",
                    height: "100%",
                    padding: autopilotOn ? 0 : 1
                }}
            >
                {!autopilotOn &&
                    <LeftSideBar
                        originRef={originRef} destinationRef={destinationRef}
                        setCurrentLocation={setCurrentLocation}
                    />
                }
            </Box>
            <Box sx={{ width: autopilotOn ? "100%" : "70%", height: "100%" }}>
                <DrivingView
                    streetViewService={streetViewService}
                    streetViewPanoramaOptions={streetViewPanoramaOptions}
                    panoUpdateTimer={panoUpdateTimer} setPanoUpdateTimer={setPanoUpdateTimer}
                    carPosition={panoUpdateTimer ? null : carPosition}
                    heading={panoUpdateTimer ? null : heading}
                />
                <Box sx={{ position: "absolute", zIndex: 1, top: 0, left: "40%", width: "20%", height: roomMirrorDown ? "16%" : "8%" }}>
                    {streetViewPanoramaOptions &&
                        <ReactStreetviewMulti
                            viewId={"room-mirror"}
                            apiKey={MAP_API_KEY}
                            streetViewPanoramaOptions={{
                                position: streetViewPanoramaOptions.position,
                                pov: { heading: (heading + 180), pitch: 0 },
                                zoom: 1
                            }}
                        />
                    }
                    <Box sx={{ position: "absolute", zIndex: 1, top: 0, left: 0, width: 1, height: 1, bgcolor: "transparent" }} />
                </Box>

                <IconButton id="room-mirror"
                    sx={{
                        position: "absolute", zIndex: 1, top: (roomMirrorDown ? "16%" : "8%"), left: "40%",
                        bgcolor: "#000000", opacity: 0.5, 
                        color: "#fbb03b", padding: 0
                    }}
                    onClick={(e) => {
                        setRoomMirrorDown(!roomMirrorDown);
                    }}
                    size="small"
                >
                    {roomMirrorDown ?
                        <KeyboardArrowUp sx={{ width: 32, height: 32 }} />
                        :
                        <KeyboardArrowDown sx={{ width: 32, height: 32 }} />
                    }
                </IconButton>

                {carPosition && isLoaded &&
                    <DirectionsBox
                        originRef={originRef} destinationRef={destinationRef}
                        panoUpdateTimer={panoUpdateTimer} setPanoUpdateTimer={setPanoUpdateTimer}
                        directionsResponse={directionsResponse} setDirectionsResponse={setDirectionsResponse}
                        carPosition={carPosition} heading={heading} setCurrentLocation={setCurrentLocation}
                        traveledDistance={traveledDistance} setTraveledDistance={setTraveledDistance}
                        traveledDistanceSinceStart={traveledDistanceSinceStart} setTraveledDistanceSinceStart={setTraveledDistanceSinceStart}
                        distanceToEmpty={distanceToEmpty}
                    />
                }

                <MyTooltip id="room-mirror" label={roomMirrorDown ? "Room Mirror Up" : "Room Mirror Down"} />
            </Box>
        </Stack>
    );
};

export default CenterScreen;