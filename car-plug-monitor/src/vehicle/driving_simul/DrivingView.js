import { useContext, useEffect } from 'react';
import { Box } from '@mui/material';

import { VehicleContext } from "../VehicleContext";
import ReactStreetview from './ReactStreetview';


const STREET_VIEW_UPDATE_INTERVAL = 5000;


const DrivingView = ({
    streetViewService,
    streetViewPanoramaOptions,
    panoUpdateTimer, setPanoUpdateTimer,
    carPosition, heading
}) => {

    const {
        MAP_API_KEY,
        setStreetViewPanoramaOptions,
        autopilotOn,
        speed
    } = useContext(VehicleContext);

    useEffect(() => {
        if (streetViewService && carPosition && !panoUpdateTimer) {
            if (autopilotOn || speed > 0) {
                const handle = setTimeout(() => {
                    setPanoUpdateTimer(null);
                }, STREET_VIEW_UPDATE_INTERVAL);
                setPanoUpdateTimer(handle);
            }

            const panoRequest = {
                location: new window.google.maps.LatLng(carPosition.lat, carPosition.lng),
                preference: window.google.maps.StreetViewPreference.NEAREST,
                radius: 150,
                source: window.google.maps.StreetViewSource.OUTDOOR
            };

            streetViewService.getPanorama(panoRequest, (panoData, status) => {
                if (status === window.google.maps.StreetViewStatus.OK) {
                    // location: description, latLng, pano, shortDescription
                    // links
                    setStreetViewPanoramaOptions({
                        position: panoData.location.latLng,
                        pov: { heading: heading, pitch: 0 },
                        zoom: 1
                    });
                }
                else {
                    //Handle other statuses here
                }
            });
        }
    }, [
        streetViewService, carPosition, panoUpdateTimer,
        autopilotOn, heading, speed,
        setPanoUpdateTimer, setStreetViewPanoramaOptions
    ]);

    return (
        <Box sx={{ position: "relative", width: "100%", height: "100%" }}>
            {streetViewPanoramaOptions &&
                <ReactStreetview
                    apiKey={MAP_API_KEY}
                    streetViewPanoramaOptions={{
                        position: streetViewPanoramaOptions.position,
                        pov: { heading: heading, pitch: 0 },
                        zoom: 1
                    }}
                    showControls={false}
                />
            }
            <Box sx={{ position: "absolute", zIndex: 1, top: 0, left: 0, width: 1, height: 1, bgcolor: "transparent" }} />
        </Box>
    );
};

export default DrivingView;