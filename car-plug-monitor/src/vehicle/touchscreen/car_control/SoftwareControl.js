import { useEffect, useState } from "react";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";

import ToggleButtons from "./components/ToggleButtons";

import { getDataSafely, saveData } from "../../../persistency/PersistentMemory";
import { Typography } from "@mui/material";


const SoftwareControl = () => {

    const [softwareUpdatePreference, setSoftwareUpdatePreference] = useState(getDataSafely("Car.Software.SoftwareUpdatePreference", "Advanced"));

    useEffect(() => {
        saveData("Car.Software.SoftwareUpdatePreference", softwareUpdatePreference);
    }, [softwareUpdatePreference]);

    return (
        <Box sx={{ width: 1, height: 1 }}>
            <Stack sx={{ height: 64, display: "flex", justifyContent: "center", alignItems: "flex-start" }}>
                <Stack direction="row">
                    <Typography sx={{ fontSize: 18, fontWeight: 700, color: "text.secondary" }}>
                        Autopilot Computer: &nbsp;
                    </Typography>
                    <Typography sx={{ fontSize: 18, fontWeight: 700, color: "text.secondary" }}>
                        Full self-driving computer
                    </Typography>
                </Stack>
                <Button sx={{ fontSize: 16, fontWeight: 700, textTransform: "none", padding: 0 }}>
                    Additional Vehicle Information
                </Button>
            </Stack>
            <Stack sx={{ height: 64, display: "flex", justifyContent: "center", alignItems: "flex-start" }}>
                <Typography sx={{ fontSize: 18, fontWeight: 700, color: "text.secondary" }}>
                    Full Self Driving Capability
                </Typography>
                <Typography sx={{ fontSize: 16, fontWeight: 700, color: "text.secondary" }}>
                    Included package
                </Typography>
            </Stack>
            <Stack sx={{ height: 64, display: "flex", justifyContent: "center", alignItems: "flex-start" }}>
                <Typography sx={{ fontSize: 18, fontWeight: 700, color: "text.secondary" }}>
                    Premium Connectivity
                </Typography>
                <Typography sx={{ fontSize: 16, fontWeight: 700, color: "text.secondary" }}>
                    Auto renewal Mar 7, 2023
                </Typography>
            </Stack>

            <Divider orientation="horizontal" flexItem sx={{ marginTop: "16px", marginBottom: "16px" }} />
            <Stack sx={{ height: 64, display: "flex", justifyContent: "center", alignItems: "flex-start" }}>
                <Typography sx={{ fontSize: 18, fontWeight: 700, color: "text.secondary" }}>
                    Software
                </Typography>
                <Typography sx={{ fontSize: 16, fontWeight: 700, color: "text.secondary" }}>
                    v11.1 (2023.2.12 a734fb860b32)
                </Typography>
            </Stack>
            <Stack sx={{ height: 64, display: "flex", justifyContent: "center", alignItems: "flex-start" }}>
                <Typography sx={{ fontSize: 18, fontWeight: 700, color: "text.secondary" }}>
                    Navigation Data
                </Typography>
                <Typography sx={{ fontSize: 16, fontWeight: 700, color: "text.secondary" }}>
                    NA-2022.28-14046
                </Typography>
            </Stack>
            <Box sx={{ height: 40, display: "flex", justifyContent: "flex-start", alignItems: "center" }}>
                <Typography sx={{ fontSize: 16, fontWeight: 700, color: "text.secondary" }}>
                    Your car software is up to date as of Mar 5 4:13 pm
                </Typography>
            </Box>

            <ToggleButtons
                name="Software Update Preference"
                labelList={["Standard", "Advanced"]}
                value={softwareUpdatePreference}
                setValue={setSoftwareUpdatePreference}
            />

            <Divider orientation="horizontal" flexItem sx={{ marginTop: "16px", marginBottom: "16px" }} />
            <Box sx={{ height: 40, display: "flex", justifyContent: "flex-start", alignItems: "center" }}>
                <Typography sx={{ fontSize: 18, fontWeight: 700, color: "text.secondary" }}>
                    Privacy
                </Typography>
            </Box>
            <Box
                sx={{
                    display: "flex", flexDirection: "row", flexWrap: "wrap"
                }}
            >
                <HalfButton label={"Data Sharing"} />
                <HalfButton label={"Cabin Camera"} />
                <HalfButton label={"Location"} />
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


export default SoftwareControl;