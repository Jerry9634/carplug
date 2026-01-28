import { useEffect, useState } from "react";
import 'react-tooltip/dist/react-tooltip.css';
import { useJsApiLoader } from '@react-google-maps/api';

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";

import { VehicleContext } from "./VehicleContext";
import CarExterior from "./car_exterior/CarExterior";
import CarInterior from "./car_interior/CarInterior";
import CenterScreen from "./driving_simul/CenterScreen";
import Touchscreen from "./touchscreen/Touchscreen";
import { getData, getDataSafely, saveData } from "../persistency/PersistentMemory";
import vssApi from "../signal_db/VssAPI.json";
import { subscribeChannel, unsubscribeChannel, initBoolFromVSS, initEnumFromVSS } from "../signal_db/VssSocket";


const MAP_API_KEY = process.env.REACT_APP_GOOGLE_MAP_API_KEY;
const libraries = ["geometry", "drawing", "places"];


const MY_CHANNEL = "Vehicle";

const TrunkFrontType = vssApi.Vehicle.Body.Trunk.Front;
const TrunkRearType = vssApi.Vehicle.Body.Trunk.Rear;
const ChargePortStatusType = vssApi.Vehicle.Powertrain.TractionBattery.Charging.ChargingPort;

const Row1DriverSideDoorType = vssApi.Vehicle.Cabin.Door.Row1.DriverSide;
const Row1DriverSideSeatType = vssApi.Vehicle.Cabin.Seat.Row1.DriverSide;
const Row1PassengerSideDoorType = vssApi.Vehicle.Cabin.Door.Row1.PassengerSide;
const Row1PassengerSideSeatType = vssApi.Vehicle.Cabin.Seat.Row1.PassengerSide;
const Row2DriverSideDoorType = vssApi.Vehicle.Cabin.Door.Row2.DriverSide;
const Row2DriverSideSeatType = vssApi.Vehicle.Cabin.Seat.Row2.DriverSide;
const Row2PassengerSideDoorType = vssApi.Vehicle.Cabin.Door.Row2.PassengerSide;
const Row2PassengerSideSeatType = vssApi.Vehicle.Cabin.Seat.Row2.PassengerSide;

const SelectedGearType = vssApi.Vehicle.Powertrain.Transmission.SelectedGear;
const SpeedType = vssApi.Vehicle.Speed;
const TractionBatteryType = vssApi.Vehicle.Powertrain.TractionBattery;

const CurrentLocationType = vssApi.Vehicle.CurrentLocation;

const ExteriorType = vssApi.Vehicle.Exterior;
const RainIntensityType = vssApi.Vehicle.Body.Raindetection.Intensity;


const Vehicle = () => {

    const [map, setMap] = useState(null);
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: MAP_API_KEY,
        libraries,
    });
    // see https://developers.google.com/maps/documentation/javascript/3.exp/reference#StreetViewPanoramaOptions
    const [streetViewPanoramaOptions, setStreetViewPanoramaOptions] = useState(null);

    const [departureReady, setDepartureReady] = useState(false);
    const [touchscreenOpen, setTouchscreenOpen] = useState(false);

    const [autopilotOn, setAutopilotOn] = useState(false);
    const [destination, setDestination] = useState(getData("Map.Destination"));

    const [gear, setGear] = useState(initEnumFromVSS(SelectedGearType));
    const [speed, setSpeed] = useState(0);

    const [airTemperature, setAirTemperature] = useState(getDataSafely(ExteriorType.AirTemperature.name, 25));
    const [humidity, setHumidity] = useState(getDataSafely(ExteriorType.Humidity.name, 50));
    const [lightIntensity, setLightIntensity] = useState(getDataSafely(ExteriorType.LightIntensity.name, 100));
    const [rainIntensity, setRainIntensity] = useState(getDataSafely(RainIntensityType.name, 0));

    const [row1DriverDoorLocked, setRow1DriverDoorLocked] = useState(initBoolFromVSS(Row1DriverSideDoorType.IsLocked));
    const [row1PassengerDoorLocked, setRow1PassengerDoorLocked] = useState(initBoolFromVSS(Row1PassengerSideDoorType.IsLocked));
    const [row2DriverDoorLocked, setRow2DriverDoorLocked] = useState(initBoolFromVSS(Row2DriverSideDoorType.IsLocked));
    const [row2PassengerDoorLocked, setRow2PassengerDoorLocked] = useState(initBoolFromVSS(Row2PassengerSideDoorType.IsLocked));
    const [frunkLocked, setFrunkLocked] = useState(initBoolFromVSS(TrunkFrontType.IsLocked));
    const [trunkLocked, setTrunkLocked] = useState(initBoolFromVSS(TrunkRearType.IsLocked));

    const [frunkOpen, setFrunkOpen] = useState(initBoolFromVSS(TrunkFrontType.IsOpen));
    const [trunkOpen, setTrunkOpen] = useState(initBoolFromVSS(TrunkRearType.IsOpen));
    const [chargePortOpen, setChargePortOpen] = useState(initBoolFromVSS(ChargePortStatusType.AnyPosition.IsFlapOpen));

    const [row1DriverDoorOpen, setRow1DriverDoorOpen] = useState(initBoolFromVSS(Row1DriverSideDoorType.IsOpen));
    const [row1PassengerDoorOpen, setRow1PassengerDoorOpen] = useState(initBoolFromVSS(Row1PassengerSideDoorType.IsOpen));
    const [row2DriverDoorOpen, setRow2DriverDoorOpen] = useState(initBoolFromVSS(Row2DriverSideDoorType.IsOpen));
    const [row2PassengerDoorOpen, setRow2PassengerDoorOpen] = useState(initBoolFromVSS(Row2PassengerSideDoorType.IsOpen));

    const [row1DriverSeatOccupied, setRow1DriverSeatOccupied] = useState(initBoolFromVSS(Row1DriverSideSeatType.IsOccupied));
    const [row1DriverSeatBelted, setRow1DriverSeatBelted] = useState(initBoolFromVSS(Row1DriverSideSeatType.IsBelted));
    const [row1PassengerSeatOccupied, setRow1PassengerSeatOccupied] = useState(initBoolFromVSS(Row1PassengerSideSeatType.IsOccupied));
    const [row1PassengerSeatBelted, setRow1PassengerSeatBelted] = useState(initBoolFromVSS(Row1PassengerSideSeatType.IsBelted));
    const [row2DriverSeatOccupied, setRow2DriverSeatOccupied] = useState(initBoolFromVSS(Row2DriverSideSeatType.IsOccupied));
    const [row2DriverSeatBelted, setRow2DriverSeatBelted] = useState(initBoolFromVSS(Row2DriverSideSeatType.IsBelted));
    const [row2PassengerSeatOccupied, setRow2PassengerSeatOccupied] = useState(initBoolFromVSS(Row2PassengerSideSeatType.IsOccupied));
    const [row2PassengerSeatBelted, setRow2PassengerSeatBelted] = useState(initBoolFromVSS(Row2PassengerSideSeatType.IsBelted));

    const [startStopCharging, setStartStopCharging] = useState(initEnumFromVSS(TractionBatteryType.Charging.StartStopCharging));

    useEffect(() => {
        const lat = getData(CurrentLocationType.Latitude.name);
        const lng = getData(CurrentLocationType.Longitude.name);
        if (lat == null || lng == null) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    saveData(CurrentLocationType.Latitude.name, position.coords.latitude);
                    saveData(CurrentLocationType.Longitude.name, position.coords.longitude);
                },
                (error) => {
                    // AirPlug
                    saveData(CurrentLocationType.Latitude.name, 37.486592);
                    saveData(CurrentLocationType.Longitude.name, 127.1136256);
                }
            );
        }

        subscribeChannel(MY_CHANNEL, [
            { signal: vssApi.Vehicle.Exterior.AirTemperature, setter: setAirTemperature },
            { signal: vssApi.Vehicle.Exterior.Humidity, setter: setHumidity },
            { signal: vssApi.Vehicle.Exterior.LightIntensity, setter: setLightIntensity },
            { signal: vssApi.Vehicle.Body.Raindetection.Intensity, setter: setRainIntensity },
            { signal: TrunkFrontType.IsOpen, setter: setFrunkOpen },
            { signal: TrunkFrontType.IsLocked, setter: setFrunkLocked },
            { signal: TrunkRearType.IsOpen, setter: setTrunkOpen },
            { signal: TrunkRearType.IsLocked, setter: setTrunkLocked },
            { signal: ChargePortStatusType.AnyPosition.IsFlapOpen, setter: setChargePortOpen },
            { signal: Row1DriverSideDoorType.IsOpen, setter: setRow1DriverDoorOpen },
            { signal: Row1DriverSideDoorType.IsLocked, setter: setRow1DriverDoorLocked },
            { signal: Row1PassengerSideDoorType.IsOpen, setter: setRow1PassengerDoorOpen },
            { signal: Row1PassengerSideDoorType.IsLocked, setter: setRow1PassengerDoorLocked },
            { signal: Row2DriverSideDoorType.IsOpen, setter: setRow2DriverDoorOpen },
            { signal: Row2DriverSideDoorType.IsLocked, setter: setRow2DriverDoorLocked },
            { signal: Row2PassengerSideDoorType.IsOpen, setter: setRow2PassengerDoorOpen },
            { signal: Row2PassengerSideDoorType.IsLocked, setter: setRow2PassengerDoorLocked },
            { signal: Row1DriverSideSeatType.IsOccupied, setter: setRow1DriverSeatOccupied },
            { signal: Row1DriverSideSeatType.IsBelted, setter: setRow1DriverSeatBelted },
            { signal: Row1PassengerSideSeatType.IsOccupied, setter: setRow1PassengerSeatOccupied },
            { signal: Row1PassengerSideSeatType.IsBelted, setter: setRow1PassengerSeatBelted },
            { signal: Row2DriverSideSeatType.IsOccupied, setter: setRow2DriverSeatOccupied },
            { signal: Row2DriverSideSeatType.IsBelted, setter: setRow2DriverSeatBelted },
            { signal: Row2PassengerSideSeatType.IsOccupied, setter: setRow2PassengerSeatOccupied },
            { signal: Row2PassengerSideSeatType.IsBelted, setter: setRow2PassengerSeatBelted },
            { signal: TractionBatteryType.Charging.StartStopCharging, setter: setStartStopCharging },
            { signal: SelectedGearType, setter: setGear },
            { signal: SpeedType, setter: setSpeed },
        ]);

        return () => {
            unsubscribeChannel(MY_CHANNEL);
        };
    }, []);

    return (
        <VehicleContext.Provider
            value={{
                MAP_API_KEY, map, setMap, isLoaded,
                streetViewPanoramaOptions, setStreetViewPanoramaOptions,
                departureReady, setDepartureReady,
                touchscreenOpen, setTouchscreenOpen,
                autopilotOn, setAutopilotOn,
                destination, setDestination,
                gear, speed,
                // Exterior, Interior common
                airTemperature, humidity, lightIntensity, rainIntensity,
                row1DriverDoorOpen, row1PassengerDoorOpen, row2DriverDoorOpen, row2PassengerDoorOpen,
                frunkOpen, trunkOpen, chargePortOpen,
                row1DriverDoorLocked, row1PassengerDoorLocked, row2DriverDoorLocked, row2PassengerDoorLocked,
                frunkLocked, trunkLocked,
                row1DriverSeatOccupied, row1DriverSeatBelted,
                row1PassengerSeatOccupied, row1PassengerSeatBelted,
                row2DriverSeatOccupied, row2DriverSeatBelted,
                row2PassengerSeatOccupied, row2PassengerSeatBelted,
                startStopCharging
            }}
        >
            <Box sx={{ width: "100%", height: "100vh" }} >
                {departureReady ?
                    <Stack sx={{ width: "100%", height: "100%" }}>
                        <Box sx={{ width: "100%", height: "50%" }}>
                            <CenterScreen
                                streetViewPanoramaOptions={touchscreenOpen ? null : streetViewPanoramaOptions}
                            />
                        </Box>
                        <Box sx={{ width: "100%", height: "50%" }}>
                            <CarInterior
                                streetViewPanoramaOptions={touchscreenOpen ? null : streetViewPanoramaOptions}
                            />
                        </Box>
                        <Touchscreen />
                        {touchscreenOpen && // background blurring
                            <Box
                                sx={{
                                    position: "absolute", zIndex: 99, width: "100%", height: "100%", bgcolor: "#ffffff", opacity: 0.75
                                }}
                            />
                        }
                    </Stack>
                    :
                    <CarExterior />
                }
            </Box>
        </VehicleContext.Provider>
    );
};

export default Vehicle;