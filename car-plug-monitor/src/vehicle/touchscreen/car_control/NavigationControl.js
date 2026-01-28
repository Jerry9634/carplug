import { useEffect, useState, useContext } from "react";
import Box from "@mui/material/Box";
import ToggleButtons from "./components/ToggleButtons";
import SwitchControl from "./components/SwitchControl";
import PlusMinusButtons from "./components/PlusMinusButtons";

import { TouchscreenContext } from "../TouchscreenContext";
import { getDataSafely, saveData } from "../../../persistency/PersistentMemory";


const NavigationControl = () => {

    const {
        setMapProvider
    } = useContext(TouchscreenContext);

    const [mapType, setMapType] = useState(getDataSafely("Car.Navigation.MapProvider", "Google"));

    const [navigationVolume, setNavigationVolume] = useState(getDataSafely("Car.Navigation.NavigationVolume", 16));

    const [automaticNavigation, setAutomaticNavigation] = useState(getDataSafely("Car.Navigation.AutomaticNavigation", false));
    const [tripPlanner, setTripPlanner] = useState(getDataSafely("Car.Navigation.TripPlanner", true));
    const [onlineRouting, setOnlineRouting] = useState(getDataSafely("Car.Navigation.OnlineRouting", true));

    const [avoidFerries, setAvoidFerries] = useState(getDataSafely("Car.Navigation.AvoidFerries", false));
    const [avoidTolls, setAvoidTolls] = useState(getDataSafely("Car.Navigation.AvoidTolls", false));
    const [useHOVLanes, setUseHOVLanes] = useState(getDataSafely("Car.Navigation.UseHOVLanes", false));

    useEffect(() => {
        saveData("Car.Navigation.MapProvider", mapType);
        setMapProvider(mapType);

        saveData("Car.Navigation.NavigationVolume", navigationVolume);

        saveData("Car.Navigation.AutomaticNavigation", automaticNavigation);
        saveData("Car.Navigation.TripPlanner", tripPlanner);
        saveData("Car.Navigation.OnlineRouting", onlineRouting);

        saveData("Car.Navigation.AvoidFerries", avoidFerries);
        saveData("Car.Navigation.AvoidTolls", avoidTolls);
        saveData("Car.Navigation.UseHOVLanes", useHOVLanes);
    }, [
        mapType, navigationVolume,
        automaticNavigation, tripPlanner, onlineRouting,
        avoidFerries, avoidTolls, useHOVLanes, setMapProvider
    ]);

    return (
        <Box sx={{ width: 1, height: 1 }}>
            <ToggleButtons
                name="Map Type"
                labelList={["Google", "Kakao"]}
                value={mapType}
                setValue={setMapType}
                firstRow={true}
            />

            <PlusMinusButtons
                title="Navigation Volume"
                value={navigationVolume}
                decrement={() => {
                    if (navigationVolume > 0) {
                        setNavigationVolume(navigationVolume - 1);
                    }
                }}
                increment={() => {
                    if (navigationVolume < 100) {
                        setNavigationVolume(navigationVolume + 1);
                    }
                }}
                getValueString={(val) => (val)}
            />

            <SwitchControl
                name="Automatic Navigation"
                value={automaticNavigation}
                setValue={setAutomaticNavigation}
                desc={["Automatically route to Home, Work or next calendar event upon entry."]}
            />
            <SwitchControl
                name="Trip Planner"
                value={tripPlanner}
                setValue={setTripPlanner}
                desc={["Adds Supercharger stops if necessary."]}
            />
            <SwitchControl
                name="Online Routing"
                value={onlineRouting}
                setValue={setOnlineRouting}
                desc={["Finds optimal route based on traffic conditions."]}
            />

            <SwitchControl
                name="Avoid Ferries"
                value={avoidFerries}
                setValue={setAvoidFerries}
            />
            <SwitchControl
                name="Avoid Tolls"
                value={avoidTolls}
                setValue={setAvoidTolls}
            />
            <SwitchControl
                name="Use HOV Lanes"
                value={useHOVLanes}
                setValue={setUseHOVLanes}
            />
        </Box>
    );
};

export default NavigationControl;