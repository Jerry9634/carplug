import { useContext, useEffect, useState } from "react";
import styled from "styled-components";

import { Box, Stack, Typography } from "@mui/material";

import { AppContext } from '../../../AppContext';
import { VehicleContext } from "../../VehicleContext";
import { TouchscreenContext } from "../TouchscreenContext";
import Battery from "../../car_exterior/Battery";
import ReactStreetviewMulti from "../../driving_simul/ReactStreetviewMulti";
import { TouchscreenBackground } from "../Touchscreen";


const Dashcam = ({
    APP_HEIGHT
}) => {

    const { isDarkTheme } = useContext(AppContext);

    const {
        MAP_API_KEY,
        streetViewPanoramaOptions
    } = useContext(VehicleContext);

    const {
        speed, distanceToEmptyInKM,
        distanceUnit, energyDisplay
    } = useContext(TouchscreenContext);

    const [energyValue, setEnergyValue] = useState("");
    const [energyUnit, setEnergyUnit] = useState("");
    const [speedValue, setSpeedValue] = useState("");
    const [speedUnit, setSpeedUnit] = useState("");


    useEffect(() => {
        if (distanceUnit === "Miles") {
            setSpeedValue(Number(speed * 0.621371).toFixed(0));
        }
        else {
            setSpeedValue(Number(speed).toFixed(0));
        }

        if (distanceUnit === "Miles") {
            setSpeedUnit("mi/h");
        }
        else {
            setSpeedUnit("km/h");
        }
    }, [speed, distanceUnit]);

    useEffect(() => {
        const DTE = distanceToEmptyInKM;

        if (energyDisplay === "Percentage") {
            setEnergyValue(Number((DTE + 1) * 100 / 1024).toFixed(0));
            setEnergyUnit("%");
        }
        else {
            if (distanceUnit === "Miles") {
                setEnergyValue(Number(DTE * 0.621371).toFixed(0));
                setEnergyUnit(" mi");
            }
            else {
                setEnergyValue(Number(DTE).toFixed(0));
                setEnergyUnit(" km");
            }
        }
    }, [distanceToEmptyInKM, energyDisplay, distanceUnit]);

    return (
        <StyledDiv $APP_HEIGHT={APP_HEIGHT} style={{ backgroundColor: TouchscreenBackground(isDarkTheme) }}>
            <Box sx={{ width: "100%", height: "70%" }}>
                {streetViewPanoramaOptions &&
                    <ReactStreetviewMulti
                        viewId={"dashcam-front-view"}
                        apiKey={MAP_API_KEY}
                        streetViewPanoramaOptions={streetViewPanoramaOptions}
                    />
                }
            </Box>

            <Stack
                sx={{
                    position: "absolute", zIndex: 3, left: 16, top: 16,
                    padding: "8px",
                    bgcolor: "#000000", color: "#ffffff", opacity: 0.5
                }}
            >
                <Stack direction="row" spacing={1} paddingLeft={1}
                    sx={{ justifyContent: "flex-start", alignItems: "center" }}
                >
                    <Typography sx={{ fontSize: 16, fontWeight: 700 }}>
                        {energyValue}{energyUnit}
                    </Typography>
                    <Battery distanceToEmptyInKM={distanceToEmptyInKM} size={32} />
                </Stack>
                <Stack direction="row" spacing={1}>
                    <Typography sx={{ height: 64, fontSize: 56, fontWeight: 500 }}>
                        {speedValue}
                    </Typography>
                    <Stack>
                        <div style={{ height: 40 }} />
                        <Typography sx={{ fontSize: 16, fontWeight: 700 }}>
                            {speedUnit}
                        </Typography>
                    </Stack>
                </Stack>
            </Stack>

            <Stack direction="row" sx={{ width: "100%", height: "30%" }}>
                <Box sx={{ width: "30%", height: "100%" }}>
                    {streetViewPanoramaOptions &&
                        <ReactStreetviewMulti
                            viewId={"dashcam-left-side-mirror"}
                            apiKey={MAP_API_KEY}
                            streetViewPanoramaOptions={
                                {
                                    position: streetViewPanoramaOptions.position,
                                    pov: { heading: (streetViewPanoramaOptions.pov.heading - 135), pitch: 0 },
                                    zoom: 1
                                }
                            }
                        />
                    }
                </Box>
                <Box sx={{ width: "40%", height: "100%" }}>
                    {streetViewPanoramaOptions &&
                        <ReactStreetviewMulti
                            viewId={"dashcam-rear-view"}
                            apiKey={MAP_API_KEY}
                            streetViewPanoramaOptions={
                                {
                                    position: streetViewPanoramaOptions.position,
                                    pov: { heading: (streetViewPanoramaOptions.pov.heading + 180), pitch: 0 },
                                    zoom: 1
                                }
                            }
                        />
                    }
                </Box>
                <Box sx={{ width: "30%", height: "100%" }}>
                    {streetViewPanoramaOptions &&
                        <ReactStreetviewMulti
                            viewId={"dashcam-right-side-mirror"}
                            apiKey={MAP_API_KEY}
                            streetViewPanoramaOptions={
                                {
                                    position: streetViewPanoramaOptions.position,
                                    pov: { heading: (streetViewPanoramaOptions.pov.heading + 135), pitch: 0 },
                                    zoom: 1
                                }
                            }
                        />
                    }
                </Box>
            </Stack>

            <Box sx={{ position: "absolute", zIndex: 1, top: 0, left: 0, width: 1, height: 1, bgcolor: "transparent" }} />
        </StyledDiv>
    );
};

export default Dashcam;

const StyledDiv = styled.div`
    height: ${(props) => (props.$APP_HEIGHT)}px;
    width: 100%;
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
`;
