import { useCallback, useContext, useEffect, useState } from "react";
import styled from '@emotion/styled';

import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

import Close from "@mui/icons-material/Close";

import Icon from "@mdi/react";
import {
    mdiArrowLeftBold, mdiArrowRightBold,
    mdiWeatherSunny, mdiWeatherCloudy, mdiWeatherRainy, mdiWeatherLightning, mdiWeatherSnowy, mdiWeatherFog
} from "@mdi/js";

import { StyledTableCell } from "../../../common_viewer/CustomStyles";

import { TouchscreenContext } from "../TouchscreenContext";
import Battery from "../../car_exterior/Battery";
import { getCurrentWeather } from "../../car_exterior/Weather";
import vssApi from "../../../signal_db/VssAPI.json";

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';


const SelectedGearType = vssApi.Vehicle.Powertrain.Transmission.SelectedGear;
const DRIVE = SelectedGearType.allowed.Drive;
const NEUTRAL = SelectedGearType.allowed.Neutral;
const PARK = SelectedGearType.allowed.Park;
const REVERSE = SelectedGearType.allowed.Reverse;

const moduleStore = {
    myInterval1: null,
    myTimeout1: null
};


const StatusOverlay = () => {

    const {
        gear, speed, distanceToEmptyInKM,
        hazardReq, leftTurnOn, rightTurnOn,
        timeHours, distanceUnit, energyDisplay, temperatureUnit
    } = useContext(TouchscreenContext);

    const [clock, setClock] = useState(new Date());
    const [hours, setHours] = useState(clock.getHours());
    const [mins, setMins] = useState(clock.getMinutes());

    const [weatherData, setWeatherData] = useState(null);

    const [tempearture, setTempearture] = useState("");
    const [weatherIco, setWeatherIco] = useState(null);
    const [openWeather, setOpenWeather] = useState(false);

    const [energyValue, setEnergyValue] = useState("");
    const [energyUnit, setEnergyUnit] = useState("");
    const [speedValue, setSpeedValue] = useState("");
    const [speedUnit, setSpeedUnit] = useState("");

    const [openCalendar, setOpenCalendar] = useState(false);

    const getHours = useCallback(() => {
        if (timeHours === "12 Hour") {
            if (hours > 12) {
                return (hours % 12);
            }
        }
        return hours;
    }, [hours, timeHours]);

    useEffect(() => {
        moduleStore.myInterval1 = setInterval(() => {
            const time = new Date();
            const mins = time.getMinutes();

            setClock(time);
            setHours(time.getHours());
            setMins(mins);

            if ((mins === 0 || mins === 15 || mins === 30 || mins === 45) && time.getSeconds() === 0) {
                getCurrentWeather(setWeatherData);
            }
        }, 1000);

        moduleStore.myTimeout1 = setTimeout(() => getCurrentWeather(setWeatherData), 200);

        return (() => {
            clearInterval(moduleStore.myInterval1);
            moduleStore.myInterval1 = null;
            clearTimeout(moduleStore.myTimeout1);
            moduleStore.myTimeout1 = null;
        });
    }, []);

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

    useEffect(() => {
        if (weatherData && weatherData.main) {
            const temp = weatherData.main.temp;
            const convTemp = (temperatureUnit === "\u00B0F" ? ((temp - 273.15) * 9 / 5 + 32) : (temp - 273.15));
            
            const weather = weatherData.weather[0];
            const icon = weather?.icon;
            if (icon) {
                if (icon.startsWith("01")) {
                    setWeatherIco(<Icon path={mdiWeatherSunny} style={{ width: 32, height: 32 }} />);
                }
                else if (icon.startsWith("02") || icon.startsWith("03") || icon.startsWith("04")) {
                    setWeatherIco(<Icon path={mdiWeatherCloudy} style={{ width: 32, height: 32 }} />);
                }
                else if (icon.startsWith("09") || icon.startsWith("10")) {
                    setWeatherIco(<Icon path={mdiWeatherRainy} style={{ width: 32, height: 32 }} />);
                }
                else if (icon.startsWith("11")) {
                    setWeatherIco(<Icon path={mdiWeatherLightning} style={{ width: 32, height: 32 }} />);
                }
                else if (icon.startsWith("13")) {
                    setWeatherIco(<Icon path={mdiWeatherSnowy} style={{ width: 32, height: 32 }} />);
                }
                else if (icon.startsWith("50")) {
                    setWeatherIco(<Icon path={mdiWeatherFog} style={{ width: 32, height: 32 }} />);
                }
                else {
                    setWeatherIco(null);
                }
            }
            else {
                setWeatherIco(null);
            }
            setTempearture(convTemp.toFixed(1) + temperatureUnit);
        }
    }, [weatherData, temperatureUnit]);

    return (
        <>
            <Stack direction="row" paddingLeft={2} paddingRight={2} spacing={1}
                sx={{
                    position: "absolute", top: 0, left: 0, width: "100%", height: 48,
                    display: "flex", justifyContent: "space-around", alignItems: "center"
                }}
            >
                <Stack direction="row" sx={{ height: 1, fontSize: 24, fontWeight: 700 }}>
                    <Box
                        sx={{
                            width: 24, height: 1, display: "flex", justifyContent: "center", alignItems: "center",
                            color: gear === PARK ? "inherit" : "gray"
                        }}
                    >
                        P
                    </Box>
                    <Box
                        sx={{
                            width: 24, height: 1, display: "flex", justifyContent: "center", alignItems: "center",
                            color: gear === REVERSE ? "inherit" : "gray"
                        }}
                    >
                        R
                    </Box>
                    <Box
                        sx={{
                            width: 24, height: 1, display: "flex", justifyContent: "center", alignItems: "center",
                            color: gear === NEUTRAL ? "inherit" : "gray"
                        }}
                    >
                        N
                    </Box>
                    <Box
                        sx={{
                            width: 24, height: 1, display: "flex", justifyContent: "center", alignItems: "center",
                            color: gear === DRIVE ? "inherit" : "gray"
                        }}
                    >
                        D
                    </Box>
                </Stack>

                {(leftTurnOn || rightTurnOn || hazardReq) &&
                    <Stack direction="row" sx={{ height: 1, justifyContent: "center", alignItems: "center" }}>
                        <Box
                            sx={{
                                width: 36, height: 1,
                                display: "flex", justifyContent: "center", alignItems: "center"
                            }}
                        >
                            {(leftTurnOn || hazardReq) &&
                                <BlinkDiv>
                                    <Icon path={mdiArrowLeftBold} style={{ width: 32, height: 32 }} />
                                </BlinkDiv>
                            }
                        </Box>
                        <Box
                            sx={{
                                width: 36, height: 1,
                                display: "flex", justifyContent: "center", alignItems: "center"
                            }}
                        >
                            {(rightTurnOn || hazardReq) &&
                                <BlinkDiv>
                                    <Icon path={mdiArrowRightBold} style={{ width: 32, height: 32 }} />
                                </BlinkDiv>
                            }
                        </Box>
                    </Stack>
                }

                {clock &&
                    <Button sx={{ width: 128, height: 1, fontSize: 16, textTransform: "none" }}
                        onClick={() => setOpenCalendar(true)}
                    >
                        {getHours()}:{mins.toString().padStart(2, "0")}{hours < 12 ? " am" : " pm"}
                    </Button>
                }

                <Button sx={{ width: 128, height: 1, fontSize: 16 }}
                    onClick={() => setOpenWeather(true)}
                    startIcon={weatherIco}
                >
                    {tempearture}
                </Button>
                
                <Stack direction="row" sx={{ height: 1 }}>
                    <Box
                        sx={{
                            width: 48 * 2, height: 1,
                            display: "flex", justifyContent: "flex-end", alignItems: "center",
                            fontSize: 16, fontWeight: 700
                        }}
                    >
                        {energyValue}{energyUnit}
                    </Box>
                    <Box
                        sx={{
                            width: 48, height: 1,
                            display: "flex", justifyContent: "center", alignItems: "center"
                        }}
                    >
                        <Battery distanceToEmptyInKM={distanceToEmptyInKM} chargingOngoing={false} size={32} />
                    </Box>
                </Stack>
            </Stack>

            <Divider orientation="horizontal" sx={{ position: "absolute", top: 48, width: "95%" }} />

            {gear === DRIVE &&
                <Stack padding={1} paddingTop={0}
                    sx={{
                        position: "absolute", left: 8, top: 60,
                        bgcolor: "#000000", color: "#ffffff", opacity: 0.5
                    }}
                >
                    <Typography sx={{ height: 64, fontSize: 56, fontWeight: 500 }}>
                        {speedValue}
                    </Typography>
                    <Typography paddingLeft={1} sx={{ fontSize: 16, fontWeight: 700 }}>
                        {speedUnit}
                    </Typography>
                </Stack>
            }

            {weatherData && weatherData.weather &&
                <WeatherDialog
                    openWeather={openWeather} setOpenWeather={setOpenWeather}
                    weatherData={weatherData} setWeatherData={setWeatherData}
                />
            }

            <Dialog onClose={() => setOpenCalendar(false)} open={openCalendar} maxWidth="lg">
                <DialogContent>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DateCalendar/>
                    </LocalizationProvider>
                </DialogContent>
                <DialogActions>
                    <Button size="large" onClick={() => setOpenCalendar(false)} sx={{ width: 150, height: 48, fontSize: 20 }}
                        startIcon={<Close />}
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

const WeatherDialog = ({
    openWeather, setOpenWeather, weatherData, setWeatherData
}) => {

    useEffect(() => {
        if (openWeather) {
            getCurrentWeather(setWeatherData);
        }
    }, [openWeather, setWeatherData]);

    return (
        <Dialog onClose={() => setOpenWeather(false)} open={openWeather} maxWidth="lg">
            <DialogContent>
                <TableContainer>
                    <Table size="large">
                        <TableHead>
                            <TableRow>
                                <StyledTableCell colSpan={2}>
                                    <Stack direction="row" spacing={2} sx={{ justifyContent: "flex-start", alignItems: "center" }}>
                                        <img src={`./touchscreen/climate/weather/${weatherData.weather[0].icon}@2x.png`} style={{ width: 64, height: 64 }} alt=""/>
                                        <span>{weatherData.name}, {weatherData.sys.country}</span>
                                        <span>{weatherData.weather[0].description}</span>
                                    </Stack>
                                </StyledTableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            <TableRow>
                                <StyledTableCell sx={{ width: 100 }}>Temperature</StyledTableCell>
                                <StyledTableCell sx={{ width: 300 }}><b>{Number(weatherData.main.temp - 273.15).toFixed(1)}{"\u00B0C"}</b></StyledTableCell>
                            </TableRow>
                            <TableRow>
                                <StyledTableCell>Feels Like</StyledTableCell>
                                <StyledTableCell>{Number(weatherData.main.feels_like - 273.15).toFixed(1)}{"\u00B0C"}</StyledTableCell>
                            </TableRow>
                            <TableRow>
                                <StyledTableCell>Humidity</StyledTableCell>
                                <StyledTableCell>{weatherData.main.humidity}%</StyledTableCell>
                            </TableRow>
                            <TableRow>
                                <StyledTableCell>Pressure</StyledTableCell>
                                <StyledTableCell>{weatherData.main.pressure} hPa</StyledTableCell>
                            </TableRow>
                            <TableRow>
                                <StyledTableCell>Visibility</StyledTableCell>
                                <StyledTableCell>{Number(weatherData.visibility/1000).toFixed(1)} km</StyledTableCell>
                            </TableRow>
                            <TableRow>
                                <StyledTableCell>Wind</StyledTableCell>
                                <StyledTableCell>{weatherData.wind.speed} m/s, {weatherData.wind.deg}{"\u00B0"}</StyledTableCell>
                            </TableRow>
                            {weatherData.rain &&
                                <TableRow>
                                    <StyledTableCell>Rain</StyledTableCell>
                                    <StyledTableCell>{weatherData.rain['1h']} mm/h</StyledTableCell>
                                </TableRow>
                            }
                            {weatherData.snow &&
                                <TableRow>
                                    <StyledTableCell>Snow</StyledTableCell>
                                    <StyledTableCell>{weatherData.snow['1h']} mm/h</StyledTableCell>
                                </TableRow>
                            }
                            <TableRow>
                                <StyledTableCell>Clouds</StyledTableCell>
                                <StyledTableCell>{weatherData.clouds.all}%</StyledTableCell>
                            </TableRow>
                            <TableRow>
                                <StyledTableCell>Geo coords</StyledTableCell>
                                <StyledTableCell>[{weatherData.coord.lat}, {weatherData.coord.lon}]</StyledTableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
            </DialogContent>
            <DialogActions>
                <Button size="large" onClick={() => setOpenWeather(false)} sx={{ width: 150, height: 48, fontSize: 20 }}
                    startIcon={<Close />}
                >
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};

const BlinkDiv = styled.div`
  animation: blink 0.5s infinite;

  @keyframes blink {
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }
`;

export default StatusOverlay;