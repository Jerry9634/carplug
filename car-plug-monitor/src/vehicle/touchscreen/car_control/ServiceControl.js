import { useCallback } from "react";

import Box from "@mui/material/Box";
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from "@mui/material/Typography";

import { initEnumFromVSS } from "../../../signal_db/VssSocket";
import vssApi from "../../../signal_db/VssAPI.json";


const HMIType = vssApi.Vehicle.Cabin.Infotainment.HMI;


const ServiceControl = () => {
    
    const getePressureDisplay = useCallback((value) => {
        const tirePressureUnit = initEnumFromVSS(HMIType.TirePressureUnit);
        if (tirePressureUnit === "PSI") {
            return value + " psi";
        }
        else {
            return Number(0.0689476 * value).toFixed(3) + " bar";
        }
    }, []);

    return (
        <Box sx={{ width: 1, height: 1 }}>
            <Stack direction="row" sx={{ display: "flex" }}>
                <Box sx={{ width: 0.3 }}>
                    <Box sx={{ height: 0.5, display: "flex", justifyContent: "center", alignItems: "center" }}>
                        <Typography sx={{ fontSize: 18, fontWeight: 700, color: "text.secondary" }}>
                            {getePressureDisplay(47)}
                        </Typography>
                    </Box>
                    <Box sx={{ height: 0.5, display: "flex", justifyContent: "center", alignItems: "center" }}>
                        <Typography sx={{ fontSize: 18, fontWeight: 700, color: "text.secondary" }}>
                            {getePressureDisplay(47)}
                        </Typography>
                    </Box>
                </Box>
                <Box sx={{ width: 0.4, display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <img src="./touchscreen/car_control/topview.png" style={{ height: 320, width: "auto" }} alt="" />
                </Box>
                <Box sx={{ width: 0.3 }}>
                    <Box sx={{ height: 0.5, display: "flex", justifyContent: "center", alignItems: "center" }}>
                        <Typography sx={{ fontSize: 18, fontWeight: 700, color: "text.secondary" }}>
                            {getePressureDisplay(47)}
                        </Typography>
                    </Box>
                    <Box sx={{ height: 0.5, display: "flex", justifyContent: "center", alignItems: "center" }}>
                        <Typography sx={{ fontSize: 18, fontWeight: 700, color: "text.secondary" }}>
                            {getePressureDisplay(47)}
                        </Typography>
                    </Box>
                </Box>
            </Stack>

            <Box
                sx={{
                    display: "flex", flexDirection: "row", flexWrap: "wrap", marginTop: "24px"
                }}
            >
                <HalfButton label={"Owner's Manual"} />
                <HalfButton label={"Car Wash Mode"} />

                <HalfButton label={"Adjust Headlights"} />
                <HalfButton label={"Towing"} />

                <HalfButton label={"Reset TPMS sensors"} />
                <HalfButton label={"Wheel & Tire"} label1={"Configuration"} />

                <HalfButton label={"Notifications"} />
                <HalfButton label={"Camera Preview"} />

                <HalfButton label={"Camera Calibration"} />
                <HalfButton label={"Driver Seat, Steering &"} label1={"Mirrors Calibration"} />

                <HalfButton label={"Clear Browser Data"} />
                <HalfButton label={"Factory Reset"} />

                <HalfButton label={"Wiper Service Mode"} />
            </Box>
        </Box>
    );
};

const HalfButton = ({ label, label1 = null }) => {
    return (
        <div style={{ width: "50%", padding: 8 }}>
            <Button
                variant="outlined"
                sx={{ width: "100%", height: 56, textTransform: "none", fontSize: 16, fontWeight: 700 }}
            >
                <Stack>
                    <span>
                        {label}
                    </span>
                    {label1 &&
                        <span>
                            {label1}
                        </span>
                    }
                </Stack>
            </Button>
        </div>
    );
};

export default ServiceControl;