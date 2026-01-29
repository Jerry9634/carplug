import Stack from '@mui/material/Stack';
import Person from "@mui/icons-material/Person";

import Icon from '@mdi/react';
import { mdiSeatbelt } from '@mdi/js';


const Passengers = ({
    size,
    row1DriverSeatOccupied, row1PassengerSeatOccupied, row2DriverSeatOccupied, row2PassengerSeatOccupied,
    row1DriverSeatBelted, row1PassengerSeatBelted, row2DriverSeatBelted, row2PassengerSeatBelted
}) => {

    return (
        <Stack sx={{ width: (size*2)}}>
            <Stack direction="row">
                <Passenger size={size} occupied={row1DriverSeatOccupied} belted={row1DriverSeatBelted} />    
                <Passenger size={size} occupied={row1PassengerSeatOccupied} belted={row1PassengerSeatBelted} />
            </Stack>
            <Stack direction="row">
                <Passenger size={size} occupied={row2DriverSeatOccupied} belted={row2DriverSeatBelted} />
                <Passenger size={size} occupied={row2PassengerSeatOccupied} belted={row2PassengerSeatBelted} />
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