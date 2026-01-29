import { useCallback } from 'react';
import useSound from 'use-sound';
import seatbeltSound from './sounds/seatbelt-102265.mp3';

import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Person from "@mui/icons-material/Person";

import Icon from '@mdi/react';
import { mdiSeatbelt } from '@mdi/js';

import vssApi from "../../signal_db/VssAPI.json";
import { setSignals } from "../../signal_db/VssSocket";


const Row1DriverSideSeatType = vssApi.Vehicle.Cabin.Seat.Row1.DriverSide;
const Row1PassengerSideSeatType = vssApi.Vehicle.Cabin.Seat.Row1.PassengerSide;
const Row2DriverSideSeatType = vssApi.Vehicle.Cabin.Seat.Row2.DriverSide;
const Row2PassengerSideSeatType = vssApi.Vehicle.Cabin.Seat.Row2.PassengerSide;


const Passengers = ({
    size,
    row1DriverSeatOccupied, row1PassengerSeatOccupied, row2DriverSeatOccupied, row2PassengerSeatOccupied,
    row1DriverSeatBelted, row1PassengerSeatBelted, row2DriverSeatBelted, row2PassengerSeatBelted,
    departureReady
}) => {

    const [playSeatbelt] = useSound(seatbeltSound, { interrupt: true });

    const handleGetIn = useCallback((pos) => {
        let name;
        let value;
        const jsonData = {
            signals: []
        };
        if (departureReady) {
            if (pos === "front-left") {
                if (row1DriverSeatOccupied) {
                    name = Row1DriverSideSeatType.IsBelted.name;
                    value = !row1DriverSeatBelted;
                }
            }
            else if (pos === "front-right") {
                if (row1PassengerSeatOccupied) {
                    name = Row1PassengerSideSeatType.IsBelted.name;
                    value = !row1PassengerSeatBelted;
                }
            }
            else if (pos === "rear-left") {
                if (row2DriverSeatOccupied) {
                    name = Row2DriverSideSeatType.IsBelted.name;
                    value = !row2DriverSeatBelted;
                }
            }
            else if (pos === "rear-right") {
                if (row2PassengerSeatOccupied) {
                    name = Row2PassengerSideSeatType.IsBelted.name;
                    value = !row2PassengerSeatBelted;
                }
            }

            if (name) {
                playSeatbelt();
            }
        }
        else {
            if (pos === "front-left") {
                name = Row1DriverSideSeatType.IsOccupied.name;
                value = !row1DriverSeatOccupied;
                if (row1DriverSeatBelted) {
                    jsonData.signals.push({ name: Row1DriverSideSeatType.IsBelted.name, value: "False" });
                }
            }
            else if (pos === "front-right") {
                name = Row1PassengerSideSeatType.IsOccupied.name;
                value = !row1PassengerSeatOccupied;
                if (row1PassengerSeatBelted) {
                    jsonData.signals.push({ name: Row1PassengerSideSeatType.IsBelted.name, value: "False" });
                }
            }
            else if (pos === "rear-left") {
                name = Row2DriverSideSeatType.IsOccupied.name;
                value = !row2DriverSeatOccupied;
                if (row2DriverSeatBelted) {
                    jsonData.signals.push({ name: Row2DriverSideSeatType.IsBelted.name, value: "False" });
                }
            }
            else if (pos === "rear-right") {
                name = Row2PassengerSideSeatType.IsOccupied.name;
                value = !row2PassengerSeatOccupied;
                if (row2PassengerSeatBelted) {
                    jsonData.signals.push({ name: Row2PassengerSideSeatType.IsBelted.name, value: "False" });
                }
            }
        }

        if (name) {
            jsonData.signals.push({ name: name, value: value ? "True" : "False" });
        }
        setSignals(jsonData);
    }, [
        row1DriverSeatBelted, row1DriverSeatOccupied, row1PassengerSeatBelted, row1PassengerSeatOccupied,
        row2DriverSeatBelted, row2DriverSeatOccupied, row2PassengerSeatBelted, row2PassengerSeatOccupied,
        departureReady, playSeatbelt
    ]);

    return (
        <Stack sx={{ width: (size*2)}}>
            <Stack direction="row">
                <IconButton color="primary" sx={{ padding: 0 }}
                    onClick={() => handleGetIn("front-left")}
                >
                    <Passenger size={size} occupied={row1DriverSeatOccupied} belted={row1DriverSeatBelted} />
                </IconButton>
                <IconButton color="primary" sx={{ padding: 0 }}
                    onClick={() => handleGetIn("front-right")}
                >
                    <Passenger size={size} occupied={row1PassengerSeatOccupied} belted={row1PassengerSeatBelted} />
                </IconButton>
            </Stack>
            <Stack direction="row">
                <IconButton color="primary" sx={{ padding: 0 }}
                    onClick={() => handleGetIn("rear-left")}
                >
                    <Passenger size={size} occupied={row2DriverSeatOccupied} belted={row2DriverSeatBelted} />
                </IconButton>
                <IconButton color="primary" sx={{ padding: 0 }}
                    onClick={() => handleGetIn("rear-right")}
                >
                    <Passenger size={size} occupied={row2PassengerSeatOccupied} belted={row2PassengerSeatBelted} />
                </IconButton>
            </Stack>
        </Stack>
    );
};

const Passenger = ({ size, occupied, belted }) => {
    if (occupied) {
        if (belted) {
            return <Icon path={mdiSeatbelt} style={{ width: size, height: size }} />;
        }
        else {
            return <Person sx={{ width: size, height: size }} />;
        }
    }
    else {
        return <Person sx={{ width: size, height: size, color: "#929292" }} />;
    }
};

export default Passengers;