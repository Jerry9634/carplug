import { useEffect, useMemo, useState } from 'react';
import {
    GoogleMap,
    Marker,
    DirectionsRenderer
} from '@react-google-maps/api';
import { getDataSafely, saveData } from "../../../persistency/PersistentMemory";


const MyGoogleMap = ({
    currentLocation,
    zoom, setZoom,
    map, setMap,
    mapType,
    tilt,
    directionsResponse,
    autopilotOn, speed,
    isDarkTheme
}) => {

    const carArrow = useMemo(() => ({
        path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
        scale: 6,
        fillColor: "red",
        fillOpacity: 0.8,
        strokeWeight: 2,
        rotation: currentLocation.hdng
    }), [currentLocation.hdng]);

    const [center, setCenter] = useState(null);

    useEffect(() => {
        if (autopilotOn || speed > 0) {
            setCenter(currentLocation);
        }
    }, [ currentLocation, speed, autopilotOn ]);

    useEffect(() => {
        if (!center || !directionsResponse) {
            setCenter(currentLocation);
        }
    }, [ currentLocation, directionsResponse, center ]);

    return (
        <GoogleMap
            center={center}
            zoom={zoom}
            mapContainerStyle={{ height: '100%', width: '100%' }}
            options={{
                zoomControl: false,
                zoomControlOptions: {
                    position: window.google.maps.ControlPosition.RIGHT_BOTTOM,
                    style: window.google.maps.ZoomControlStyle.SMALL,
                },
                mapTypeId: mapType,
                colorScheme: isDarkTheme ? "DARK" : "LIGHT",
                mapTypeControl: false,
                mapTypeControlOptions: {
                    position: window.google.maps.ControlPosition.TOP_RIGHT,
                    style: window.google.maps.MapTypeControlStyle.DROPDOWN_MENU,
                },
                streetViewControl: false,
                fullscreenControl: false,
                heading: 0,
                tilt: tilt
            }}
            onLoad={(_map) => setMap(_map)}
            onZoomChanged={() => {
                if (map) {
                    const zoom1 = map.getZoom();
                    setZoom(zoom1);
                    if (zoom1 === 0) {
                        setTimeout(() => setZoom(getDataSafely("Map.Zoom", 15)), 1000);
                    }
                    else if (zoom1 < zoom) {
                        saveData("Map.Zoom", zoom1);
                    }
                }
            }}
        >
            {map && center &&
                <Marker icon={carArrow} position={center} />
            }
            {map && directionsResponse &&
                <DirectionsRenderer directions={directionsResponse} />
            }
        </GoogleMap>
    );
};

export default MyGoogleMap;