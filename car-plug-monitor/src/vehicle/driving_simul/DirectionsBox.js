import { useCallback, useContext, useEffect, useMemo, useState } from "react";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";

import ForkLeft from "@mui/icons-material/ForkLeft";
import ForkRight from "@mui/icons-material/ForkRight";
import Merge from "@mui/icons-material/Merge";
import RampLeft from "@mui/icons-material/RampLeft";
import RampRight from "@mui/icons-material/RampRight";
import RoundaboutLeft from "@mui/icons-material/RoundaboutLeft";
import RoundaboutRight from "@mui/icons-material/RoundaboutRight";
import Straight from "@mui/icons-material/Straight";
import TurnLeft from "@mui/icons-material/TurnLeft";
import TurnRight from "@mui/icons-material/TurnRight";
import TurnSharpLeft from "@mui/icons-material/TurnSharpLeft";
import TurnSharpRight from "@mui/icons-material/TurnSharpRight";
import TurnSlightLeft from "@mui/icons-material/TurnSlightLeft";
import TurnSlightRight from "@mui/icons-material/TurnSlightRight";
import UTurnLeft from "@mui/icons-material/UTurnLeft";
import UTurnRight from "@mui/icons-material/UTurnRight";

import { VehicleContext } from "../VehicleContext";
import { drivingInterval, MIN_DELTA_DISTANCE } from "./SimulatedDriving";
import { getDistance, getHeading, getNewLocation } from './GeometryUtil';
import { MyTooltip } from "../car_interior/CarInterior";

import { saveData, removeData } from "../../persistency/PersistentMemory";
import vssApi from "../../signal_db/VssAPI.json";
import { setSignal, setSignals } from "../../signal_db/VssSocket";


const SelectedGearType = vssApi.Vehicle.Powertrain.Transmission.SelectedGear;
const DRIVE = SelectedGearType.allowed.Drive;
const PARK = SelectedGearType.allowed.Park;
const REVERSE = SelectedGearType.allowed.Reverse;

const SpeedType = vssApi.Vehicle.Speed;
const RangeType = vssApi.Vehicle.Powertrain.Range;
const OdometerType = vssApi.Vehicle.TraveledDistance;
const TripType = vssApi.Vehicle.TraveledDistanceSinceStart;

const directionsInterval = {
    handle: null,
    period: 1000
};


const DirectionsBox = ({
    originRef, destinationRef,
    panoUpdateTimer, setPanoUpdateTimer,
    directionsResponse, setDirectionsResponse,
    carPosition, heading, setCurrentLocation,
    traveledDistance, setTraveledDistance,
    traveledDistanceSinceStart, setTraveledDistanceSinceStart,
    distanceToEmpty
}) => {

    const {
        destination, setDestination,
        autopilotOn, setAutopilotOn,
        speed, gear
    } = useContext(VehicleContext);

    const maneuverIconMap = useMemo(fillIcons, []);

    const [mainTicks, setMainTicks] = useState(0);
    const [directionsTicks, setDirectionsTicks] = useState(0);
    const [directions, setDirections] = useState([]);
    const [activeDirection, setActiveDirection] = useState(0);

    const [currentDiection, setCurrentDirection] = useState(null);
    const [remainingDistance, setRemainingDistance] = useState(0);
    const [remainingTime, setRemainingTime] = useState(0);

    const [routes, setRoutes] = useState([]);
    const [step, setStep] = useState(0);

    const [autopilotDriving, setAutopoilotDriving] = useState(false);

    const manualForward = useCallback(() => {
        if (speed > 0 && distanceToEmpty > 0) {
            const DELTA_D = speed * drivingInterval.period / 3600;
            let newLoc;
            if (gear === DRIVE) {
                newLoc = getNewLocation(carPosition, DELTA_D, heading);
            }
            else if (gear === REVERSE) {
                newLoc = getNewLocation(carPosition, DELTA_D, (heading + 180));
            }
            setCurrentLocation(newLoc.lat, newLoc.lng, heading);

            if (distanceToEmpty > DELTA_D) {
                setSignal(RangeType.name, Math.floor(distanceToEmpty - DELTA_D));
            }
            else {
                setAutopilotOn(false);
                setSignals({
                    signals: [
                        { name: SpeedType.name, value: 0 },
                        { name: SelectedGearType.name, value: PARK },
                        { name: RangeType.name, value: 0 },
                    ]
                });
            }

            const DELTA_D_KM = DELTA_D / 1000;
            setTraveledDistance(traveledDistance + DELTA_D_KM);
            setTraveledDistanceSinceStart(traveledDistanceSinceStart + DELTA_D_KM);
            setSignals({
                signals: [
                    { name: OdometerType.name, value: (traveledDistance + DELTA_D_KM) },
                    { name: TripType.name, value: (traveledDistanceSinceStart + DELTA_D_KM) }
                ]
            });
        }
    }, [
        carPosition, distanceToEmpty, gear, heading, setAutopilotOn,
        setCurrentLocation, setTraveledDistance, setTraveledDistanceSinceStart,
        speed, traveledDistance, traveledDistanceSinceStart
    ]);

    const calculateRoute = useCallback(async () => {
        const directionsService = new window.google.maps.DirectionsService();

        try {
            const results = await directionsService.route({
                origin: carPosition,
                destination: destination,
                travelMode: window.google.maps.TravelMode.DRIVING,
            });
            setDirectionsResponse(results);
        }
        catch (e) {
            console.error(e);
        }
    }, [carPosition, destination, setDirectionsResponse]);

    const clearRoute = useCallback(() => {
        setDestination(null);
        removeData("Map.Destination");
        setDirectionsResponse(null);
        setDirections([]);
        setRoutes([]);
        setStep(0);

        if (originRef.current) {
            originRef.current.value = "";
        }
        if (destinationRef.current) {
            destinationRef.current.value = "";
        }
    }, [destinationRef, originRef, setDestination, setDirectionsResponse]);

    const makeDirections = useCallback(() => {
        if (directionsResponse) {
            const routes = directionsResponse.routes;
            if (routes && routes.length > 0) {
                const newRoutes = [];
                const legs = routes[0].legs;
                for (let i = 0; i < legs.length; i++) {
                    const steps = legs[i].steps;
                    for (let j = 0; j < steps.length; j++) {
                        const nextSegment = steps[j].path;
                        for (let k = 0; k < nextSegment.length; k++) {
                            const coord = nextSegment[k];
                            newRoutes.push(coord);
                        }
                    }
                }
                setRoutes(newRoutes);

                if (legs && legs.length > 0) {
                    const steps = legs[0].steps;
                    if (steps && steps.length > 0) {
                        setDirections(steps);
                        setActiveDirection(0);
                        setStep(0);

                        const startPoint = steps[0].start_location;
                        const nextStepPoint = steps[0].end_location;
                        const hdng = getHeading(startPoint, nextStepPoint);
                        setCurrentLocation(startPoint.lat(), startPoint.lng(), hdng);
                    }
                }
            }
        }
    }, [directionsResponse, setCurrentLocation]);

    const autoForward = useCallback(() => {
        let delta_d = 0;
        if (speed > 0 && routes.length > 0 && distanceToEmpty > 0) {
            const DELTA_D = speed * drivingInterval.period / 3600; // delta distance

            let d = drivingInterval.deltaDistance;
            d += DELTA_D;
            if (d > MIN_DELTA_DISTANCE) {
                delta_d = d;
                d = 0;
            }
            drivingInterval.deltaDistance = d;
        }

        if (delta_d === 0)
            return;

        let curStep = step;
        let oldStep = curStep;
        let newStep = curStep + 1;
        let curDirection = activeDirection;

        if (newStep < routes.length) {
            let remaining = delta_d;
            let actionCenter = carPosition;

            let newCenter = carPosition;
            let hdng = heading;

            if (distanceToEmpty > delta_d) {
                setSignal(RangeType.name, Math.floor(distanceToEmpty - delta_d));
            }
            else {
                setAutopilotOn(false);
                setSignals({
                    signals: [
                        { name: SpeedType.name, value: 0 },
                        { name: SelectedGearType.name, value: PARK },
                        { name: RangeType.name, value: 0 }
                    ]
                });
            }

            const DELTA_D_KM = delta_d / 1000;
            setTraveledDistance(traveledDistance + DELTA_D_KM);
            setTraveledDistanceSinceStart(traveledDistanceSinceStart + DELTA_D_KM);
            setSignals({
                signals: [
                    { name: OdometerType.name, value: (traveledDistance + DELTA_D_KM) },
                    { name: TripType.name, value: (traveledDistanceSinceStart + DELTA_D_KM) }
                ]
            });

            while (remaining > 0) {
                let distanceToNextStep = getDistance(actionCenter, routes[newStep]);
                if (remaining < distanceToNextStep) {
                    hdng = getHeading(actionCenter, routes[newStep]);
                    newCenter = getNewLocation(actionCenter, remaining, hdng);
                    remaining = 0;
                }
                else {
                    remaining -= distanceToNextStep;
                    actionCenter = routes[newStep];
                    newCenter = {
                        lat: actionCenter.lat(),
                        lng: actionCenter.lng()
                    };

                    const newNewStep = newStep + 1;
                    if (newNewStep < routes.length) {
                        hdng = getHeading(routes[newStep], routes[newNewStep]);
                    }
                    else {
                        hdng = getHeading(routes[oldStep], routes[newStep]);
                    }

                    curStep = newStep;
                    oldStep++;
                    newStep++;
                    if (newStep === routes.length) {
                        remaining = 0;
                    }

                    if (curDirection < (directions.length - 1)) {
                        const distanceToMilestone = getDistance(newCenter, directions[curDirection].end_location);
                        if (distanceToMilestone < delta_d) {
                            curDirection++;
                            setActiveDirection(curDirection);
                        }
                    }
                }
            }

            setStep(curStep);
            setCurrentLocation(newCenter.lat, newCenter.lng, hdng);
        }
        else {
            clearRoute();
            setAutopilotOn(false);
        }
    }, [
        activeDirection, carPosition, clearRoute, directions, speed, distanceToEmpty, heading, routes,
        setAutopilotOn, setCurrentLocation, setTraveledDistance, setTraveledDistanceSinceStart,
        step, traveledDistance, traveledDistanceSinceStart]
    );

    const getProperDirection = useCallback((idx) => {
        if (idx < directions.length) {
            const direction = directions[idx];
            if (idx === activeDirection && idx < (directions.length - 1)) {
                const maneuver = directions[idx + 1].maneuver;
                if (maneuver) {
                    if (maneuver === "turn-left" || maneuver === "turn-slight-left" || maneuver === "turn-sharp-left"
                        || maneuver === "turn-right" || maneuver === "turn-slight-right" || maneuver === "turn-sharp-right"
                        || maneuver === "u-turn-left" || maneuver === "u-turn-right"
                        || maneuver === "ramp-left" || maneuver === "ramp-right"
                        || maneuver === "roundabout-left" || maneuver === "roundabout-right"
                        || maneuver === "fork-left" || maneuver === "fork-right"
                        || maneuver === "merge"
                    ) {
                        const d = getDistance(carPosition, direction.end_location);
                        if (d < 100) {
                            return null;
                        }
                        else {
                            const total_d = Number(direction.distance.value);
                            const ratio = d / total_d;
                            if (ratio < 0.25) {
                                return null;
                            }
                        }
                    }
                }
            }
            return direction;
        }
        return null;
    }, [activeDirection, carPosition, directions]);

    const isActiveDirection = useCallback((idx) => {
        if (idx === activeDirection) {
            return true;
        }
        else if (idx === (activeDirection + 1)) {
            if (!getProperDirection(activeDirection)) {
                return true;
            }
        }
        return false;
    }, [activeDirection, getProperDirection]);

    const getManeuverImageURL = useCallback((maneuver) => {
        if (maneuverIconMap.has(maneuver))
            return maneuverIconMap.get(maneuver);
        else
            return maneuverIconMap.get("straight");
    }, [maneuverIconMap]);

    const getDirectionImageURL = useCallback((idx) => {
        const maneuver = directions[idx].maneuver;
        if (idx !== activeDirection) {
            return getManeuverImageURL(maneuver);
        }
        else {
            if (maneuver === "straight"
                || maneuver === "ramp-left" || maneuver === "ramp-right"
                || maneuver === "roundabout-left" || maneuver === "roundabout-right") {
                return getManeuverImageURL(maneuver);
            }
        }
        return maneuverIconMap.get("straight");
    }, [activeDirection, directions, getManeuverImageURL, maneuverIconMap]);

    const getDirectionManeuver = useCallback((idx) => {
        const direction = directions[idx];
        if (idx === activeDirection) {
            const maneuver = direction.maneuver;
            if (maneuver) {
                if (maneuver === "turn-left" || maneuver === "turn-slight-left" || maneuver === "turn-sharp-left"
                    || maneuver === "turn-right" || maneuver === "turn-slight-right" || maneuver === "turn-sharp-right"
                    || maneuver === "u-turn-left" || maneuver === "u-turn-right"
                    || maneuver === "fork-left" || maneuver === "fork-right" || maneuver === "merge") {
                    return null;
                }
            }
        }
        return direction.maneuver;
    }, [activeDirection, directions]);

    const getRemainingDistance = useCallback(() => {
        let d = 0;
        if (directions.length > 0) {
            for (let i = activeDirection + 1; i < directions.length; i++) {
                d += directions[i].distance.value;
            }

            if (step !== 0) {
                d += getDistance(carPosition, directions[activeDirection].end_location);
            }
            else {
                d += directions[0].distance.value;
            }
        }

        return d;
    }, [activeDirection, carPosition, directions, step]);

    const getRemainingDistanceTxt = useCallback((d = 0) => {
        if (d === 0) {
            d = getRemainingDistance();
        }
        if (d >= 1000) {
            return Number(d / 1000).toFixed(1) + " km";
        }
        else {
            return Number(d).toFixed(0) + " m";
        }
    }, [getRemainingDistance]);

    const getRemainingTime = useCallback(() => {
        let t = 0;
        if (directions.length > 0) {
            for (let i = activeDirection + 1; i < directions.length; i++) {
                t += directions[i].duration.value;
            }

            if (step !== 0) {
                if (directions[activeDirection].distance != null && directions[activeDirection].distance.value !== 0) {
                    let d = getDistance(carPosition, directions[activeDirection].end_location);
                    t += (d * directions[activeDirection].duration.value) / directions[activeDirection].distance.value;
                }
            }
            else {
                t += directions[0].duration.value;
            }
        }

        return t;
    }, [activeDirection, carPosition, directions, step]);

    const getRemainingTimeTxt = useCallback((t = 0) => {
        if (t === 0) {
            t = getRemainingTime();
        }
        if (t >= 60) {
            return Number(t / 60).toFixed(0) + " min";
        }
        else {
            return Number(t).toFixed(0) + " sec";
        }
    }, [getRemainingTime]);

    const getRemainingStepDistance = useCallback((idx, isActiveDirection) => {
        let d_meter;
        if (isActiveDirection) {
            d_meter = getDistance(carPosition, directions[activeDirection].end_location);
        }
        else {
            d_meter = Number(directions[idx].distance.value);
        }
        return getRemainingDistanceTxt(d_meter);
    }, [activeDirection, carPosition, directions, getRemainingDistanceTxt]);

    useEffect(() => {
        return () => {
            if (drivingInterval.handle) {
                clearInterval(drivingInterval.handle);
                drivingInterval.handle = null;
            }
            if (directionsInterval.handle) {
                clearInterval(directionsInterval.handle);
                directionsInterval.handle = null;
            }
        };
    }, []);

    useEffect(() => {
        if (destination) {
            if (directions.length > 0) {
                if (!directionsInterval.handle) {
                    directionsInterval.handle = setInterval(() => {
                        setDirectionsTicks(directionsTicks => directionsTicks + 1);
                    }, directionsInterval.period);
                }
            }
            else {
                if (!directionsResponse) {
                    calculateRoute();
                }
                else {
                    const routes = directionsResponse.routes;
                    if (routes && routes.length > 0) {
                        const newRoutes = [];
                        const legs = routes[0].legs;
                        for (let i = 0; i < legs.length; i++) {
                            const steps = legs[i].steps;
                            for (let j = 0; j < steps.length; j++) {
                                const nextSegment = steps[j].path;
                                for (let k = 0; k < nextSegment.length; k++) {
                                    const coord = nextSegment[k];
                                    newRoutes.push(coord);
                                }
                            }
                        }
                        setRoutes(newRoutes);
                        makeDirections();
                    }
                }
            }
        }
        else {
            if (directionsResponse || directions.length > 0) {
                clearRoute();
                setAutopilotOn(false);
            }
            if (directionsInterval.handle) {
                clearInterval(directionsInterval.handle);
                directionsInterval.handle = null;
            }
        }
    }, [ destination, directionsResponse, directions, calculateRoute, clearRoute, makeDirections, setAutopilotOn ]);

    useEffect(() => {
        saveData("Car.Drive.Autopilot", autopilotOn);

        if (autopilotOn && !autopilotDriving) {
            if (routes.length > 0 && speed === 0) {
                setAutopoilotDriving(true);
                setSignals({
                    signals: [
                        { name: SpeedType.name, value: 50 },
                        { name: SelectedGearType.name, value: DRIVE }
                    ]
                });
            }
        }
        else if (!autopilotOn && autopilotDriving) {
            setAutopoilotDriving(false);
            setSignals({
                signals: [
                    { name: SpeedType.name, value: 0 },
                    { name: SelectedGearType.name, value: PARK }
                ]
            });
            if (panoUpdateTimer) {
                setPanoUpdateTimer(null);
            }
        }
    }, [ autopilotOn, autopilotDriving, routes, speed, panoUpdateTimer, setPanoUpdateTimer ]);

    useEffect(() => {
        if (speed > 0 && distanceToEmpty > 0) {
            if (!drivingInterval.handle) {
                drivingInterval.handle = setInterval(() => {
                    setMainTicks((mainTicks) => mainTicks + 1);
                }, drivingInterval.period);
            }
        }
        else {
            if (drivingInterval.handle) {
                clearInterval(drivingInterval.handle);
                drivingInterval.handle = null;
            }
        }
    }, [ speed, distanceToEmpty ]);

    useEffect(() => {
        if (drivingInterval.mainTicks !== mainTicks) {
            drivingInterval.mainTicks = mainTicks;
            if (autopilotOn) {
                autoForward();
            }
            else {
                manualForward();
            }
        }
    }, [mainTicks, autopilotOn, autoForward, manualForward]);

    useEffect(() => {
        if (directions.length > 0) {
            for (let idx = activeDirection; idx < (activeDirection + 2); idx++) {
                if (getProperDirection(idx)) {
                    const isActive = isActiveDirection(idx);
                    setCurrentDirection({
                        isActiveDirection: isActive,
                        remainingStepDistance: getRemainingStepDistance(idx, isActive),
                        imageURL: getDirectionImageURL(idx),
                        maneuver: getDirectionManeuver(idx),
                        instructions: directions[idx].instructions
                    });
                    break;
                }
            }

            setRemainingDistance(getRemainingDistance());
            setRemainingTime(getRemainingTime());
        }
    }, [
        directionsTicks, activeDirection, directions,
        getDirectionImageURL, getDirectionManeuver, getProperDirection,
        getRemainingDistance, getRemainingStepDistance, getRemainingTime, isActiveDirection
    ]);

    return (
        <>
            {autopilotOn && directions.length > 0 &&
                <Stack direction="row" padding={1} spacing={1}
                    sx={{
                        position: "absolute", bottom: "50%", left: "25%", zIndex: 1,
                        backgroundColor: "#000000", color: "#ffffff", opacity: 0.5,
                        border: "1px solid #ffffff", borderRadius: "4px"
                    }}
                >
                    <Stack>
                        <Box
                            sx={{
                                width: 96, height: 48,
                                display: "flex", justifyContent: "center", alignItems: "center",
                                fontSize: 12,
                            }}
                        >
                            {currentDiection.imageURL ? currentDiection.imageURL : currentDiection.maneuver}
                        </Box>
                        <Box
                            sx={{
                                width: 96, height: 32,
                                display: "flex", justifyContent: "center", alignItems: "center",
                                fontSize: 18
                            }}
                        >
                            {currentDiection.remainingStepDistance}
                        </Box>
                    </Stack>

                    <Divider orientation="vertical" sx={{ height: 80, bgcolor: "#ffffff" }} />

                    <Box
                        sx={{
                            minWidth: 360,
                            height: 80, padding: "4px", fontSize: 16
                        }}
                        dangerouslySetInnerHTML={{ __html: currentDiection.instructions }}
                    />

                    <Divider orientation="vertical" sx={{ height: 80, bgcolor: "#ffffff" }} />

                    <Stack direction="column">
                        <Box
                            sx={{
                                height: 32,
                                display: "flex", justifyContent: "flex-start", alignItems: "center",
                                fontSize: 16, fontWeight: 700
                            }}
                        >
                            {destination}
                        </Box>
                        <Box
                            sx={{
                                height: 24,
                                display: "flex", justifyContent: "flex-start", alignItems: "center",
                                fontSize: 16, fontWeight: 700
                            }}
                        >
                            {getRemainingDistanceTxt(remainingDistance)}
                        </Box>
                        <Stack direction="row" spacing={4}>

                            <Box
                                sx={{
                                    width: "100%",
                                    height: 24,
                                    display: "flex", justifyContent: "flex-start", alignItems: "center",
                                    fontSize: 16, fontWeight: 700
                                }}
                            >
                                {getRemainingTimeTxt(remainingTime)}
                            </Box>
                            <Box
                                sx={{
                                    height: "100%",
                                    display: "flex", justifyContent: "flex-end", alignItems: "flex-end"
                                }}
                            >
                                <Button variant="contained" id="cancel-journey"
                                    sx={{ width: 100, height: 24 }}
                                    onClick={() => {
                                        clearRoute();
                                        setAutopilotOn(false);
                                    }}
                                >
                                    Cancel
                                </Button>
                            </Box>
                        </Stack>
                    </Stack>
                </Stack>
            }

            <MyTooltip id="cancel-journey" label="Stop Navigation" />
        </>
    );
};

const fillIcons = () => {
    const iconMap = new Map();
    const iconStyle = { width: 48, height: 48 };

    // fork-left, fork-right
    // merge
    // ramp-left, ramp-right
    // roundabout-left, roundabout-right
    // straight
    // turn-left, turn-right
    // turn-sharp-left, turn-sharp-right
    // turn-slight-left, turn-slight-right
    // u-turn-left, u-turn-right
    iconMap.set("fork-left", <ForkLeft sx={iconStyle} />);
    iconMap.set("fork-right", <ForkRight sx={iconStyle} />);
    iconMap.set("merge", <Merge sx={iconStyle} />);
    iconMap.set("ramp-left", <RampLeft sx={iconStyle} />);
    iconMap.set("ramp-right", <RampRight sx={iconStyle} />);
    iconMap.set("roundabout-left", <RoundaboutLeft sx={iconStyle} />);
    iconMap.set("roundabout-right", <RoundaboutRight sx={iconStyle} />);
    iconMap.set("straight", <Straight sx={iconStyle} />);
    iconMap.set("turn-left", <TurnLeft sx={iconStyle} />);
    iconMap.set("turn-right", <TurnRight sx={iconStyle} />);
    iconMap.set("turn-sharp-left", <TurnSharpLeft sx={iconStyle} />);
    iconMap.set("turn-sharp-right", <TurnSharpRight sx={iconStyle} />);
    iconMap.set("turn-slight-left", <TurnSlightLeft sx={iconStyle} />);
    iconMap.set("turn-slight-right", <TurnSlightRight sx={iconStyle} />);
    iconMap.set("u-turn-left", <UTurnLeft sx={iconStyle} />);
    iconMap.set("u-turn-right", <UTurnRight sx={iconStyle} />);

    return iconMap;
};

export default DirectionsBox;