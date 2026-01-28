import { useState, useEffect } from "react";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import Pets from "@mui/icons-material/Pets";
import Schedule from "@mui/icons-material/Schedule";

import Icon from "@mdi/react";
import {
    mdiPower, mdiCampfire, mdiMenuLeft, mdiMenuRight, mdiAirFilter, mdiFan,
    mdiCarDefrostFront, mdiCarDefrostRear,
    mdiCarSeat, mdiCarSeatCooler, mdiCarSeatHeater
} from "@mdi/js";

import { getBoolean, getDataSafely, saveData } from "../../../persistency/PersistentMemory";
import vssApi from "../../../signal_db/VssAPI.json";
import { setSignal } from "../../../signal_db/VssSocket";


const HVAC_Type = vssApi.Vehicle.Cabin.HVAC;
const DriverSeatSwitchType = vssApi.Vehicle.Cabin.Seat.Row1.DriverSide.Switch;
const PassengerSeatSwitchType = vssApi.Vehicle.Cabin.Seat.Row1.PassengerSide.Switch;


const ClimateControl = ({
    APP_HEIGHT
}) => {

    return (
        <Stack
            spacing={1}
            sx={{
                position: "relative",
                zIndex: 2,
                width: "100%",
                height: APP_HEIGHT,
                backgroundColor: "transparent",
            }}
        >

            <ParkingControls />

            <Stack
                sx={{
                    width: "100%",
                    height: "100%",
                    backgroundColor: "#eeeeee",

                    backgroundImage: "url('./touchscreen/climate/ClimateControl2.png')",
                    backgroundRepeat: "space",
                    backgroundPosition: "center",
                    backgroundSize: "contain"
                }}
            >
                <FirstRow />

                <Divider orientation="horizontal" sx={{ width: "100%" }} />

                <Box sx={{ width: "100%", height: "100%" }} />

                <Divider orientation="horizontal" sx={{ width: "100%" }} />

                <BottomRow />
            </Stack>
        </Stack>
    );
};

const FirstRow = () => {

    const [climatePower, setClimatePower] = useState(getBoolean("Car.Climate.ClimatePower"));
    const [climateAuto, setClimateAuto] = useState(getBoolean("Car.Climate.ClimateAuto"));
    const [airCon, setAirCon] = useState(getBoolean("Car.Climate.AirCon"));
    const [ventDirection, setVentDirection] = useState(getDataSafely("Car.Climate.VentDirection", "up"));

    const [rowSelection, setRowSelection] = useState(getDataSafely("Car.Climate.RowSelection", "front"));

    const [scheduled, setScheduled] = useState(getBoolean("Car.Climate.Scheduled"));

    useEffect(() => {
        saveData("Car.Climate.ClimatePower", climatePower);
        saveData("Car.Climate.ClimateAuto", climateAuto);
        saveData("Car.Climate.AirCon", airCon);
        saveData("Car.Climate.VentDirection", ventDirection);

        saveData("Car.Climate.RowSelection", rowSelection);

        saveData("Car.Climate.Scheduled", scheduled);
    }, [climatePower, climateAuto, airCon, ventDirection, rowSelection, scheduled]);

    return (
        <Stack direction="row" spacing={6} padding={1} paddingLeft={2} paddingRight={2}
            sx={{ width: "100%", backgroundColor: "#eeeeee" }}
        >
            <Stack direction="row" spacing={2} sx={{ width: "40%" }}>
                <Button
                    onClick={() => {
                        setClimatePower(!climatePower);
                    }}
                    sx={{ width: 64, height: 64, color: climatePower ? "#2196f3" : "#9e9e9e" }}
                >
                    <Icon path={mdiPower} style={{ width: 32, height: 32 }} />
                </Button>
                <Button
                    onClick={() => {
                        setClimateAuto(!climateAuto);
                    }}
                    sx={{
                        width: 64, height: 64, textTransform: "none", color: climateAuto ? "#2196f3" : "#9e9e9e",
                        fontSize: 16, fontWeight: 900
                    }}
                >
                    Auto
                </Button>
                <Button
                    onClick={() => {
                        setAirCon(!airCon);
                        if (airCon) {
                            setSignal(HVAC_Type.IsAirConditioningActive.name, "False");
                        }
                        else {
                            setSignal(HVAC_Type.IsAirConditioningActive.name, "True");
                        }
                    }}
                    sx={{
                        width: 64, height: 64, textTransform: "none", color: airCon ? "#2196f3" : "#9e9e9e",
                        fontSize: 16, fontWeight: 900
                    }}
                >
                    A/C
                </Button>

                <Button
                    onClick={() => {
                        setVentDirection("up");
                        setSignal(HVAC_Type.Station.Row1.Driver.AirDistribution.name, HVAC_Type.Station.Row1.Driver.AirDistribution.allowed.UP);
                    }}
                    sx={{ width: 64, height: 64 }}
                >
                    <img
                        src={ventDirection === "up" ? "./touchscreen/climate/vent-up-active.png" : "./touchscreen/climate/vent-up.png"}
                        style={{ width: 56, height: 56 }}
                        alt=""
                    />
                </Button>
                <Button
                    onClick={() => {
                        setVentDirection("middle");
                        setSignal(HVAC_Type.Station.Row1.Driver.AirDistribution.name, HVAC_Type.Station.Row1.Driver.AirDistribution.allowed.MIDDLE);
                    }}
                    sx={{ width: 64, height: 64 }}
                >
                    <img
                        src={ventDirection === "middle" ? "./touchscreen/climate/vent-middle-active.png" : "./touchscreen/climate/vent-middle.png"}
                        style={{ width: 56, height: 56 }}
                        alt=""
                    />
                </Button>
                <Button
                    onClick={() => {
                        setVentDirection("down");
                        setSignal(HVAC_Type.Station.Row1.Driver.AirDistribution.name, HVAC_Type.Station.Row1.Driver.AirDistribution.allowed.DOWN);
                    }}
                    sx={{ width: 64, height: 64 }}
                >
                    <img
                        src={ventDirection === "down" ? "./touchscreen/climate/vent-down-active.png" : "./touchscreen/climate/vent-down.png"}
                        style={{ width: 56, height: 56 }}
                        alt=""
                    />
                </Button>
            </Stack>

            <Stack direction="row" sx={{ width: "20%", justifyContent: "center" }}>
                <Button
                    onClick={() => setRowSelection("front")}
                    sx={{
                        width: 96, height: 64, textTransform: "none",
                        color: rowSelection === "front" ? "#2196f3" : "#9e9e9e",
                        fontSize: 16, fontWeight: 900
                    }}
                >
                    Front
                </Button>
                <Button
                    onClick={() => setRowSelection("rear")}
                    sx={{
                        width: 96, height: 64, textTransform: "none",
                        color: rowSelection === "rear" ? "#2196f3" : "#9e9e9e",
                        fontSize: 16, fontWeight: 900
                    }}
                >
                    Rear
                </Button>
            </Stack>

            <Stack direction="row" spacing={2} sx={{ width: "40%", justifyContent: "flex-end" }}>
                <Button
                    sx={{
                        height: 64, textTransform: "none", color: scheduled ? "#2196f3" : "#9e9e9e",
                        fontSize: 16, fontWeight: 900
                    }}
                    onClick={() => setScheduled(!scheduled)}
                    endIcon={
                        <Schedule sx={{ width: 32, height: 32 }} />
                    }
                >
                    Schedule
                </Button>
            </Stack>
        </Stack>
    );
};

const BottomRow = () => {

    const [leftSeatClimate, setLeftSeatClimate] = useState(getDataSafely("Car.Climate.LeftSeatClimate", "off"));
    const [rightSeatClimate, setRightSeatClimate] = useState(getDataSafely("Car.Climate.RightSeatClimate", "off"));

    const [steeringWheelHeater, setSteeringWheelHeater] = useState(getBoolean("Car.Climate.SteeringWheelHeater"));
    const [windshieldWiperHeater, setWindshieldWiperHeater] = useState(getBoolean("Car.Climate.WindshieldWiperHeater"));

    const [frontDefogDefroster, setFrontDefogDefroster] = useState(getDataSafely("Car.Climate.FrontDefogDefroster", "off"));
    const [rearDefroster, setRearDefroster] = useState(getBoolean("Car.Climate.RearDefroster"));

    const [fanSpeed, setFanSpeed] = useState(getDataSafely("Car.Climate.FanSpeed", 5));
    const [recirculation, setRecirculation] = useState(getBoolean("Car.Climate.Recirculation"));
    const [hepaFilter, setHapaFilter] = useState(getBoolean("Car.Climate.HepaFilter"));

    useEffect(() => {
        saveData("Car.Climate.LeftSeatClimate", leftSeatClimate);
        saveData("Car.Climate.RightSeatClimate", rightSeatClimate);

        saveData("Car.Climate.SteeringWheelHeater", steeringWheelHeater);
        saveData("Car.Climate.WindshieldWiperHeater", windshieldWiperHeater);

        saveData("Car.Climate.FrontDefogDefroster", frontDefogDefroster);
        saveData("Car.Climate.RearDefroster", rearDefroster);

        saveData("Car.Climate.FanSpeed", fanSpeed);
        saveData("Car.Climate.Recirculation", recirculation);
        saveData("Car.Climate.HepaFilter", hepaFilter);
    }, [
        leftSeatClimate, rightSeatClimate,
        steeringWheelHeater, windshieldWiperHeater,
        frontDefogDefroster, rearDefroster,
        fanSpeed, recirculation, hepaFilter
    ]);

    return (
        <Stack direction="row" padding={1} sx={{ width: "100%", justifyContent: "center", backgroundColor: "#bdbdbd" }}>
            <Stack direction="row" spacing={2} paddingLeft={2}
                sx={{ width: "33%", justifyContent: "flex-start", alignItems: "flex-end" }}
            >
                <Stack direction="column" sx={{ position: "relative", zIndex: 0, justifyContent: "flex-start", alignItems: "center" }}>
                    <Button sx={{ width: 64, height: 64 }}
                        onClick={() => {
                            let newVal;
                            if (leftSeatClimate === "off") {
                                newVal = "heater-low";
                            }
                            else if (leftSeatClimate === "heater-low") {
                                newVal = "cooler-low";
                            }
                            else if (leftSeatClimate === "cooler-low") {
                                newVal = "auto";
                            }
                            else {
                                newVal = "off";
                            }
                            setLeftSeatClimate(newVal);

                            if (newVal === "off") {
                                setSignal(DriverSeatSwitchType.IsWarmerEngaged.name, "False");
                            }
                            else {
                                setSignal(DriverSeatSwitchType.IsWarmerEngaged.name, "True");
                            }
                        }}
                    >
                        {leftSeatClimate === "heater-low" &&
                            <Icon path={mdiCarSeatHeater} style={{ width: 32, height: 32, color: "red" }} />
                        }
                        {leftSeatClimate === "cooler-low" &&
                            <Icon path={mdiCarSeatCooler} style={{ width: 32, height: 32, color: "blue" }} />
                        }
                        {leftSeatClimate === "auto" &&
                            <Icon path={mdiCarSeat} style={{ width: 32, height: 32, color: "#2196f3" }} />
                        }
                        {leftSeatClimate === "off" &&
                            <Icon path={mdiCarSeat} style={{ width: 32, height: 32, color: "#9e9e9e" }} />
                        }
                    </Button>
                    {leftSeatClimate === "auto" &&
                        <Typography
                            sx={{
                                position: "absolute", zIndex: -1,
                                color: "#2196f3",
                                fontSize: 12, fontWeight: 900
                            }}
                        >
                            Auto
                        </Typography>
                    }
                </Stack>

                <Button
                    onClick={() => {
                        setSteeringWheelHeater(!steeringWheelHeater);
                    }}
                    sx={{ width: 64, height: 64 }}
                >
                    <img
                        src={steeringWheelHeater ? "./touchscreen/climate/steering_wheel_heated_active.png" : "./touchscreen/climate/steering_wheel_heated.png"}
                        style={{ width: 28, height: 28 }}
                        alt=""
                    />
                </Button>
                <Button
                    onClick={() => {
                        setWindshieldWiperHeater(!windshieldWiperHeater);
                    }}
                    sx={{ width: 64, height: 64 }}
                >
                    <img
                        src={windshieldWiperHeater ? "./touchscreen/climate/wiper-defroster-active.png" : "./touchscreen/climate/wiper-defroster.png"}
                        style={{ width: 56, height: 56 }}
                        alt=""
                    />
                </Button>
                <Button
                    onClick={() => {
                        let newVal;
                        if (frontDefogDefroster === "off") {
                            newVal = "defog";
                        }
                        else if (frontDefogDefroster === "defog") {
                            newVal = "defroster";
                        }
                        else {
                            newVal = "off";
                        }
                        setFrontDefogDefroster(newVal);

                        if (newVal === "off") {
                            setSignal(HVAC_Type.IsFrontDefrosterActive.name, "False");
                        }
                        else {
                            setSignal(HVAC_Type.IsFrontDefrosterActive.name, "True");
                        }
                    }}
                    sx={{ width: 64, height: 64, color: frontDefogDefroster !== "off" ? (frontDefogDefroster === "defog" ? "blue" : "red") : "#9e9e9e" }}
                >
                    <Icon path={mdiCarDefrostFront} style={{ width: 28, height: 28 }} />
                </Button>
                <Button
                    onClick={() => {
                        setRearDefroster(!rearDefroster);
                        if (rearDefroster) {
                            setSignal(HVAC_Type.IsRearDefrosterActive.name, "False");
                        }
                        else {
                            setSignal(HVAC_Type.IsRearDefrosterActive.name, "True");
                        }
                    }}
                    sx={{ width: 64, height: 64, color: rearDefroster ? "red" : "#9e9e9e" }}
                >
                    <Icon path={mdiCarDefrostRear} style={{ width: 28, height: 28 }} />
                </Button>
            </Stack>


            <Stack direction="row" spacing={2}
                sx={{ width: "34%", justifyContent: "center", alignItems: "flex-end" }}
            >
                <Button sx={{ width: 64, height: 64, color: "#424242" }}
                    onClick={() => {
                        if (fanSpeed > 0) {
                            setFanSpeed(fanSpeed - 1);
                        }
                    }}
                >
                    <Icon path={mdiMenuLeft} style={{ width: 32, height: 32 }} />
                </Button>

                <Stack direction="row">
                    <Box sx={{ width: 64, height: 64, display: "flex", justifyContent: "center", alignItems: "center", color: "#424242" }}>
                        <Icon path={mdiFan} style={{ width: 32, height: 32 }} />
                    </Box>

                    <Box sx={{ width: 64, height: 64, display: "flex", justifyContent: "center", alignItems: "center", color: "#424242" }}>
                        <Typography sx={{ fontSize: 20, fontWeight: 900 }}>
                            {fanSpeed}
                        </Typography>
                    </Box>
                </Stack>

                <Button sx={{ width: 64, height: 64, color: "#424242" }}
                    onClick={() => {
                        if (fanSpeed < 10) {
                            setFanSpeed(fanSpeed + 1);
                        }
                    }}
                >
                    <Icon path={mdiMenuRight} style={{ width: 32, height: 32 }} />
                </Button>

                <Button
                    onClick={() => {
                        setRecirculation(!recirculation);
                        if (recirculation) {
                            setSignal(HVAC_Type.IsRecirculationActive.name, "False");
                        }
                        else {
                            setSignal(HVAC_Type.IsRecirculationActive.name, "True");
                        }
                    }}
                    sx={{ width: 64, height: 64 }}
                >
                    <img
                        src={recirculation ? "./touchscreen/climate/air-recirculation.png" : "./touchscreen/climate/air-intake.png"}
                        style={{ width: 56, height: 56 }}
                        alt=""
                    />
                </Button>

                <Button
                    sx={{ width: 64, height: 64, color: hepaFilter ? "#2196f3" : "#9e9e9e" }}
                    onClick={() => setHapaFilter(!hepaFilter)}
                >
                    <Icon path={mdiAirFilter} style={{ width: 32, height: 32 }} />
                </Button>
            </Stack>

            <Stack direction="row" spacing={2} paddingRight={2}
                sx={{ width: "33%", justifyContent: "flex-end", alignItems: "flex-end" }}
            >
                <Stack direction="column" sx={{ position: "relative", zIndex: 0, justifyContent: "flex-start", alignItems: "center" }}>
                    <Button sx={{ width: 64, height: 64 }}
                        onClick={() => {
                            let newVal;
                            if (rightSeatClimate === "off") {
                                newVal = "heater-low";
                            }
                            else if (rightSeatClimate === "heater-low") {
                                newVal = "cooler-low";
                            }
                            else if (rightSeatClimate === "cooler-low") {
                                newVal = "auto";
                            }
                            else {
                                newVal = "off";
                            }
                            setRightSeatClimate(newVal);

                            if (newVal === "off") {
                                setSignal(PassengerSeatSwitchType.IsWarmerEngaged.name, "False");
                            }
                            else {
                                setSignal(PassengerSeatSwitchType.IsWarmerEngaged.name, "True");
                            }
                        }}
                    >
                        {rightSeatClimate === "heater-low" &&
                            <Icon path={mdiCarSeatHeater} style={{ width: 32, height: 32, color: "red", transform: "scaleX(-1)" }} />
                        }
                        {rightSeatClimate === "cooler-low" &&
                            <Icon path={mdiCarSeatCooler} style={{ width: 32, height: 32, color: "blue", transform: "scaleX(-1)" }} />
                        }
                        {rightSeatClimate === "auto" &&
                            <Icon path={mdiCarSeat} style={{ width: 32, height: 32, color: "#2196f3", transform: "scaleX(-1)" }} />
                        }
                        {rightSeatClimate === "off" &&
                            <Icon path={mdiCarSeat} style={{ width: 32, height: 32, color: "#9e9e9e", transform: "scaleX(-1)" }} />
                        }
                    </Button>
                    {rightSeatClimate === "auto" &&
                        <Typography
                            sx={{
                                position: "absolute", zIndex: -1,
                                color: "#2196f3",
                                fontSize: 12, fontWeight: 900
                            }}
                        >
                            Auto
                        </Typography>
                    }
                </Stack>
            </Stack>
        </Stack>
    )
};

const ParkingControls = () => {

    const [parkingMode, setParkingMode] = useState(getDataSafely("Car.Climate.ParkingMode", "off"));

    useEffect(() => {
        saveData("Car.Climate.ParkingMode", parkingMode);
    }, [parkingMode]);

    return (
        <Stack direction="row"
            sx={{
                width: "100%",
                justifyContent: "center", alignItems: "center",
                backgroundColor: "transparent"
            }}
        >
            <Stack direction="row" spacing={2} padding={1} sx={{ backgroundColor: "#eeeeee", borderRadius: 1 }}>
                <Button
                    sx={{
                        width: 96, height: 64, textTransform: "none",
                        color: parkingMode === "off" ? "#424242" : "#9e9e9e",
                        fontSize: 16, fontWeight: 900
                    }}
                    onClick={() => setParkingMode("off")}
                >
                    Off
                </Button>
                <Button
                    sx={{
                        width: 96, height: 64, textTransform: "none",
                        color: parkingMode === "keep" ? "#2196f3" : "#9e9e9e",
                        fontSize: 16, fontWeight: 900
                    }}
                    onClick={() => setParkingMode("keep")}
                    startIcon={
                        <img src={parkingMode === "keep" ? "./touchscreen/climate/keep-climate-active.png" : "./touchscreen/climate/keep-climate.png"}
                            style={{ width: 48, height: 48 }} alt=""
                        />
                    }
                >
                    Keep
                </Button>
                <Button
                    sx={{
                        width: 96, height: 64, textTransform: "none",
                        color: parkingMode === "dog" ? "#2196f3" : "#9e9e9e",
                        fontSize: 16, fontWeight: 900
                    }}
                    onClick={() => setParkingMode("dog")}
                    startIcon={<Pets sx={{ width: 32, height: 32 }} />}
                >
                    Dog
                </Button>
                <Button
                    sx={{
                        width: 96, height: 64, textTransform: "none",
                        color: parkingMode === "camp" ? "#2196f3" : "#9e9e9e",
                        fontSize: 16, fontWeight: 900
                    }}
                    onClick={() => setParkingMode("camp")}
                    startIcon={<Icon path={mdiCampfire} style={{ width: 32, height: 32 }} />}
                >
                    Camp
                </Button>
            </Stack>
        </Stack>
    );
};

export default ClimateControl;