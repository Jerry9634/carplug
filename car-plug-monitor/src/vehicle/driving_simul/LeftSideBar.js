import { useContext, useCallback, useState } from "react";

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Step from '@mui/material/Step';
import StepContent from '@mui/material/StepContent';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import Typography from '@mui/material/Typography';

import { Icon } from "@mdi/react";
import { mdiSteering } from "@mdi/js";

import { VehicleContext } from "../VehicleContext";
import GooglePalcesAutocomplete from "./NewPlace";

import { saveData, removeData } from "../../persistency/PersistentMemory";
import vssApi from "../../signal_db/VssAPI.json";


const EXAMPLE_ORIGIN = "Fisherman's Bastion";
const EXAMPLE_DESTINATION = "Schönbrunn Palace";

const SelectedGearType = vssApi.Vehicle.Powertrain.Transmission.SelectedGear;
const DRIVE = SelectedGearType.allowed.Drive;
const REVERSE = SelectedGearType.allowed.Reverse;


const LeftSideBar = ({
    originRef, destinationRef,
    setCurrentLocation
}) => {

    const {
        map, isLoaded,
        destination, setDestination,
        setAutopilotOn,
        speed,
        gear,
        setTouchscreenOpen,
        setDepartureReady
    } = useContext(VehicleContext);

    const [activeStep, setActiveStep] = useState(0);

    const [originInputValue, setOriginInputValue] = useState('');
    const [originValue, setOriginValue] = useState(null);

    const [destinationInputValue, setDestinationInputValue] = useState('');
    const [destinationValue, setDestinationValue] = useState(null);

    const setExampleOrigin = useCallback(() => {
        setOriginInputValue(EXAMPLE_ORIGIN);
        setOriginValue(EXAMPLE_ORIGIN);
    }, []);

    const setExampleDestination = useCallback(() => {
        setDestinationInputValue(EXAMPLE_DESTINATION);
        setDestinationValue(EXAMPLE_DESTINATION);
    }, []);

    const startAutopilot = useCallback(() => {
        if (destination && destination.length >= 3) {
            setAutopilotOn(true);
        }
    }, [destination, setAutopilotOn]);

    const openDriverDoor = useCallback(() => {
        if (speed === 0 && gear !== DRIVE && gear !== REVERSE) {
            setDepartureReady(false);
        }
    }, [gear, setDepartureReady, speed]);
    
    const teleport = useCallback((addr) => {
        if (addr && addr.length >= 3) {
            const service = new window.google.maps.places.PlacesService(map);
            const request = {
                query: addr,
                fields: ['name', 'geometry'],
            };
            service.findPlaceFromQuery(request, (results, status) => {
                if (status === window.google.maps.places.PlacesServiceStatus.OK) {
                    const loc = results[0].geometry.location;
                    if (loc) {
                        setCurrentLocation(loc.lat(), loc.lng(), 0);
                    }
                }
            });
        }
    }, [map, setCurrentLocation]);

    const startAutopilotAtOnce = useCallback(() => {
        setTouchscreenOpen(true);
        teleport(EXAMPLE_ORIGIN);
        setDestination(null);
        removeData("Map.Destination");
        setActiveStep(1);

        setTimeout(() => {
            setTouchscreenOpen(true);
            setDestination(EXAMPLE_DESTINATION);
            saveData("Map.Destination", EXAMPLE_DESTINATION);
            setActiveStep(2);
        }, 5000);

        setTimeout(() => {
            setTouchscreenOpen(false);
            setAutopilotOn(true);
            setActiveStep(3);
        }, 10000);
    }, [setAutopilotOn, setDestination, setTouchscreenOpen, teleport]);

    const handleNext = useCallback(() => {
        if (activeStep === 0) {
            setTouchscreenOpen(true);
            setTimeout(() => {
                if (originInputValue && originInputValue.length > 3) {
                    teleport(originInputValue);
                    setActiveStep((prevActiveStep) => prevActiveStep + 1);
                }
            }, 5000);
            setTimeout(() => {
                setTouchscreenOpen(false);
            }, 10000);
        }
        else if (activeStep === 1) {
            setTouchscreenOpen(true);
            setTimeout(() => {
                if (destinationInputValue && destinationInputValue.length > 3) {
                    setDestination(destinationInputValue);
                    saveData("Map.Destination", destinationInputValue);
                    setActiveStep((prevActiveStep) => prevActiveStep + 1);
                }
            }, 5000);
            setTimeout(() => {
                setTouchscreenOpen(false);
            }, 10000);
        }
        else if (activeStep === 2) {
            startAutopilot();
            setActiveStep((prevActiveStep) => prevActiveStep + 1);
        }
    }, [activeStep, destinationInputValue, originInputValue, setDestination, setTouchscreenOpen, startAutopilot, teleport]);

    const handleBack = useCallback(() => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    }, []);

    const handleReset = useCallback(() => {
        setDestination(null);
        setActiveStep(0);
    }, [setDestination]);

    return (
        <Stack spacing={1} sx={{ height: "100%", width: "100%" }}>
            <Stack sx={{ justifyContent: "flex-start", alignItems: "flex-start" }}>
                <Button
                    onClick={startAutopilotAtOnce}
                    startIcon={
                        <Icon path={mdiSteering} size={1} />
                    }
                >
                    <b>Autopilot Instructions:</b>
                </Button>
                <Stack paddingLeft={2} >
                    <Stepper activeStep={activeStep} orientation="vertical">
                        <Step>
                            <StepLabel>
                                {"Set Current Location: e.g., "}
                                <Link href="#" onClick={setExampleOrigin}>
                                    {EXAMPLE_ORIGIN}
                                </Link>
                            </StepLabel>
                            <StepContent>
                                <GooglePalcesAutocomplete
                                    loaded={isLoaded}
                                    inputRef={originRef}
                                    inputValue={originInputValue} setInputValue={setOriginInputValue}
                                    value={originValue} setValue={setOriginValue} />
                                <Box sx={{ mb: 0 }}>
                                    <Button size="small"
                                        variant="contained"
                                        onClick={handleNext}
                                        sx={{ mt: 1, mr: 1 }}
                                    >
                                        Continue
                                    </Button>
                                    <Button size="small"
                                        disabled={true}
                                        onClick={handleBack}
                                        sx={{ mt: 1, mr: 1 }}
                                    >
                                        Back
                                    </Button>
                                </Box>
                            </StepContent>
                        </Step>
                        <Step>
                            <StepLabel>
                                {"Set Destination on Touchscreen: e.g., "}
                                <Link href="#" onClick={setExampleDestination}>
                                    {EXAMPLE_DESTINATION}
                                </Link>
                            </StepLabel>
                            <StepContent>
                                <GooglePalcesAutocomplete
                                    loaded={isLoaded}
                                    inputRef={destinationRef}
                                    inputValue={destinationInputValue} setInputValue={setDestinationInputValue}
                                    value={destinationValue} setValue={setDestinationValue} />
                                <Box sx={{ mb: 0 }}>
                                    <Button size="small"
                                        variant="contained"
                                        onClick={handleNext}
                                        sx={{ mt: 1, mr: 1 }}
                                    >
                                        Continue
                                    </Button>
                                    <Button size="small"
                                        disabled={false}
                                        onClick={handleBack}
                                        sx={{ mt: 1, mr: 1 }}
                                    >
                                        Back
                                    </Button>
                                </Box>
                            </StepContent>
                        </Step>
                        <Step>
                            <StepLabel
                                optional={<Typography variant="caption">Last step</Typography>}
                            >
                                {"Start Autopilot"}
                            </StepLabel>
                            <StepContent>
                                <Box sx={{ mb: 0 }}>
                                    <Button size="small"
                                        variant="contained"
                                        onClick={handleNext}
                                        sx={{ mt: 1, mr: 1 }}
                                    >
                                        {'Finish'}
                                    </Button>
                                    <Button size="small"
                                        disabled={false}
                                        onClick={handleBack}
                                        sx={{ mt: 1, mr: 1 }}
                                    >
                                        Back
                                    </Button>
                                </Box>
                            </StepContent>
                        </Step>
                    </Stepper>
                    {activeStep === 3 && (
                        <Paper square elevation={0} sx={{ p: 3 }}>
                            <Typography>All steps completed - you&apos;re finished</Typography>
                            <Button  size="small"
                                onClick={handleReset} sx={{ mt: 1, mr: 1 }}
                            >
                                Reset
                            </Button>
                        </Paper>
                    )}
                </Stack>
            </Stack>

            <Stack direction="row" sx={{ justifyContent: "flex-start", alignItems: "center" }}>
                <Button onClick={openDriverDoor} sx={{ width: 110 }} >
                    <Stack direction="row" spacing={1}>
                        <img src="./tesla/tesla-door-left.webp" style={{ width: 16, height: 24 }} alt="" />
                        <b>To Exit:</b>
                    </Stack>
                </Button>
                <Typography variant="body1" paddingLeft={0}>
                    {"Click "}
                    <Link href="#" onClick={openDriverDoor}>
                        {"Driver Door Switch"}
                    </Link>
                    {" if the Car is standstill"}
                </Typography>
            </Stack>
        </Stack>
    );
};

export default LeftSideBar;