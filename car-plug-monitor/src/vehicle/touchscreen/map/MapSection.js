import { useState, useEffect, useContext } from "react";
import Iframe from 'react-iframe';

import Box from "@mui/material/Box";

import { AppContext } from '../../../AppContext';
import { VehicleContext } from "../../VehicleContext";
import { TouchscreenContext } from "../TouchscreenContext";
import DirectionsBox from "./DirectionsBox";
import MyGoogleMap from "./MyGoogleMap";

import { getDataSafely, saveData } from "../../../persistency/PersistentMemory";


const TILT = 45;


const MapSection = () => {

    const { isDarkTheme } = useContext(AppContext);

    const {
        map, setMap, isLoaded
    } = useContext(VehicleContext);

    const {
        autopilotOn, speed,
        destination, setDestination,
        mapProvider,
        latitude, longitude, heading
    } = useContext(TouchscreenContext);

    const [directionsResponse, setDirectionsResponse] = useState(null);
    const [currentLocation, setCurrentLocation] = useState(null);
    const [zoom, setZoom] = useState(getDataSafely("Map.Zoom", 15));    
    const [mapType, setMapType] = useState(getDataSafely("Map.MapType", "terrain"));
    const [isReloading, setIsReloading] = useState(false);

    useEffect(() => {
        if (latitude != null && longitude != null) {
            const loc = { lat: latitude, lng: longitude, hdng: heading };
            setCurrentLocation(loc);
        }
    }, [ latitude, longitude, heading ]);

    useEffect(() => {
        if (speed === 0) {
            if (!destination) {
                setZoom(15);
            }
        }
        else {
            const zoomIn = Math.min(Math.floor(speed / 30), 8);
            setZoom(19 - zoomIn);
        }

        if (!destination) {
            setIsReloading(true);
            setTimeout(() => setIsReloading(false), 100);
        }
    }, [ speed, destination ]);

    useEffect(() => {
        setIsReloading(true);
        setTimeout(() => setIsReloading(false), 100);
    }, [ isDarkTheme ]);

    useEffect(() => {
        saveData("Map.MapType", mapType);
    }, [ mapType ]);

    return (
        <Box sx={{ width: "100%", height: "100%", borderTopRightRadius: 8, overflow: "hidden", position: "relative" }}>
            {mapProvider === "Kakao" ?
                <Iframe url={"https://map.kakao.com"}
                    width="100%"
                    height="100%"
                    id="my-iframe"
                    className=""
                    display="block"
                    position="relative"
                />
                :
                <Box sx={{ width: "100%", height: "100%" }}>
                    {currentLocation && isLoaded && !isReloading &&
                        <MyGoogleMap
                            currentLocation={currentLocation}
                            zoom={zoom}
                            setZoom={setZoom}
                            map={map}
                            setMap={setMap}
                            mapType={mapType}
                            tilt={TILT}
                            directionsResponse={directionsResponse}
                            autopilotOn={autopilotOn}
                            speed={speed}
                            isDarkTheme={isDarkTheme}
                        />
                    }
                    {currentLocation && isLoaded &&
                        <DirectionsBox
                            destination={destination}
                            setDestination={setDestination}
                            directionsResponse={directionsResponse}
                            setDirectionsResponse={setDirectionsResponse}
                            autopilotOn={autopilotOn}
                            speed={speed}
                            currentLocation={currentLocation}
                            mapType={mapType}
                            setMapType={setMapType}
                            zoom={zoom}
                            setZoom={setZoom}
                            isDarkTheme={isDarkTheme}
                        />
                    }
                </Box>
            }
        </Box>
    );
};

export default MapSection;