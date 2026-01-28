import Box from "@mui/material/Box";
import Card from '@mui/material/Card';
import Checkbox from '@mui/material/Checkbox';
import Divider from "@mui/material/Divider";
import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';


const TripsControl = () => {

    return (
        <Box sx={{ width: 1, height: 1 }}>
            <Stack sx={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "flex-start" }}>
                <Stack direction="row" sx={{ width: "100%", height: 36, display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <Box sx={{ width: "50%" }}>
                        <Typography sx={{ fontSize: 18, fontWeight: 700, color: "text.secondary" }}>
                            Current Drive
                        </Typography>
                    </Box>
                    <Box sx={{ width: "50%", display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
                        <FormControlLabel control={<Checkbox defaultChecked />}
                            label={<Typography sx={{ fontSize: 16, fontWeight: 700, color: "text.secondary" }}>
                                Show in Trips Card
                            </Typography>}
                        />
                    </Box>
                </Stack>
                <Stack direction="row" sx={{ width: "100%", display: "flex", justifyContent: "flex-start", alignItems: "center" }}>
                    <Card sx={{ width: 1, height: 1 }}>
                        <Stack direction="row" sx={{ width: 1, height: 1 }}>
                            <Stack spacing={1} sx={{ width: "33%", height: 80, display: "flex", justifyContent: "center", alignItems: "flex-start", padding: "16px" }}>
                                <Typography sx={{ fontSize: 18, fontWeight: 700, color: "text.secondary" }}>
                                    Distance
                                </Typography>
                                <Typography sx={{ fontSize: 18, fontWeight: 700, color: "text.secondary" }}>
                                    12 mi
                                </Typography>
                            </Stack>
                            <Divider orientation="vertical" flexItem />
                            <Stack spacing={1} sx={{ width: "34%", height: 80, display: "flex", justifyContent: "center", alignItems: "flex-start", padding: "16px" }}>
                                <Typography sx={{ fontSize: 18, fontWeight: 700, color: "text.secondary" }}>
                                    Duration
                                </Typography>
                                <Typography sx={{ fontSize: 18, fontWeight: 700, color: "text.secondary" }}>
                                    13 min
                                </Typography>
                            </Stack>
                            <Divider orientation="vertical" flexItem />
                            <Stack spacing={1} sx={{ width: "33%", height: 80, display: "flex", justifyContent: "center", alignItems: "flex-start", padding: "16px" }}>
                                <Typography sx={{ fontSize: 18, fontWeight: 700, color: "text.secondary" }}>
                                    Avg. Energy
                                </Typography>
                                <Typography sx={{ fontSize: 18, fontWeight: 700, color: "text.secondary" }}>
                                    130 Wh/mi
                                </Typography>
                            </Stack>
                        </Stack>
                    </Card>
                </Stack>
            </Stack>
            <Stack sx={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "flex-start", marginTop: "32px" }}>
                <Stack direction="row" sx={{ width: "100%", height: 36, display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <Box sx={{ width: "50%" }}>
                        <Typography sx={{ fontSize: 18, fontWeight: 700, color: "text.secondary" }}>
                            Since Last Charge
                        </Typography>
                    </Box>
                    <Box sx={{ width: "50%", display: "flex", justifyContent: "flex-end", alignItems: "center", color: "#6F6F6F" }}>
                        <FormControlLabel control={<Checkbox defaultChecked />}
                            label={<Typography sx={{ fontSize: 16, fontWeight: 700, color: "text.secondary" }}>
                                Show in Trips Card
                            </Typography>}
                        />
                    </Box>
                </Stack>
                <Stack direction="row" sx={{ width: "100%", display: "flex", justifyContent: "flex-start", alignItems: "center" }}>
                    <Card sx={{ width: 1, height: 1 }}>
                        <Stack direction="row" sx={{ width: 1, height: 1 }}>
                            <Stack spacing={1} sx={{ width: "33%", height: 80, display: "flex", justifyContent: "center", alignItems: "flex-start", padding: "16px" }}>
                                <Typography sx={{ fontSize: 18, fontWeight: 700, color: "text.secondary" }}>
                                    Distance
                                </Typography>
                                <Typography sx={{ fontSize: 18, fontWeight: 700, color: "text.secondary" }}>
                                    55 mi
                                </Typography>
                            </Stack>
                            <Divider orientation="vertical" flexItem />
                            <Stack spacing={1} sx={{ width: "34%", height: 80, display: "flex", justifyContent: "center", alignItems: "flex-start", padding: "16px" }}>
                                <Typography sx={{ fontSize: 18, fontWeight: 700, color: "text.secondary" }}>
                                    Total Energy
                                </Typography>
                                <Typography sx={{ fontSize: 18, fontWeight: 700, color: "text.secondary" }}>
                                    11 kWh
                                </Typography>
                            </Stack>
                            <Divider orientation="vertical" flexItem />
                            <Stack spacing={1} sx={{ width: "33%", height: 80, display: "flex", justifyContent: "center", alignItems: "flex-start", padding: "16px" }}>
                                <Typography sx={{ fontSize: 18, fontWeight: 700, color: "text.secondary" }}>
                                    Avg. Energy
                                </Typography>
                                <Typography sx={{ fontSize: 18, fontWeight: 700, color: "text.secondary" }}>
                                    205 Wh/mi
                                </Typography>
                            </Stack>
                        </Stack>
                    </Card>
                </Stack>
            </Stack>

            <Divider orientation="horizontal" flexItem sx={{ marginTop: "32px" }} />
            <Stack direction="row" sx={{ width: "100%", height: 36, display: "flex", justifyContent: "center", alignItems: "center", marginTop: "8px" }}>
                <Box sx={{ width: "50%", display: "flex", flexDirection: "row" }}>
                    <Typography sx={{ fontSize: 18, fontWeight: 700, color: "text.secondary" }}>
                        Odometer : &nbsp;
                    </Typography>
                    <Typography sx={{ fontSize: 18, fontWeight: 700, color: "text.secondary" }}>
                        25,903 mi
                    </Typography>
                </Box>
                <Box sx={{ width: "50%", display: "flex", justifyContent: "flex-end", alignItems: "center", color: "#6F6F6F" }}>
                    <FormControlLabel control={<Checkbox defaultChecked />}
                        label={<Typography sx={{ fontSize: 16, fontWeight: 700, color: "text.secondary" }}>
                            Show in Trips Card
                        </Typography>}
                    />
                </Box>
            </Stack>
        </Box>
    );
};

export default TripsControl;