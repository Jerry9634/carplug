import { useCallback, useEffect } from "react";

import IconButton from "@mui/material/IconButton";
import Lock from "@mui/icons-material/Lock";
import LockOpen from "@mui/icons-material/LockOpen";

import { saveData } from "../../persistency/PersistentMemory";
import vssApi from "../../signal_db/VssAPI.json";
import { setSignal, setSignals } from "../../signal_db/VssSocket";


const Row1DriverSideDoorType = vssApi.Vehicle.Cabin.Door.Row1.DriverSide;
const Row1PassengerSideDoorType = vssApi.Vehicle.Cabin.Door.Row1.PassengerSide;
const Row2DriverSideDoorType = vssApi.Vehicle.Cabin.Door.Row2.DriverSide;
const Row2PassengerSideDoorType = vssApi.Vehicle.Cabin.Door.Row2.PassengerSide;

const TrunkFrontType = vssApi.Vehicle.Body.Trunk.Front;
const TrunkRearType = vssApi.Vehicle.Body.Trunk.Rear;


const LockStatus = ({
    size, isAnyDoorOpen, speed,
    carLocked, setCarLocked,
    row1DriverDoorLocked,
    row1PassengerDoorLocked,
    row2DriverDoorLocked,
    row2PassengerDoorLocked,
    frunkLocked,
    trunkLocked,
}) => {

    const handleLock = useCallback(() => {
        const newVal = !carLocked && !isAnyDoorOpen;
        const vssVal = newVal ? "True" : "False";
        setSignals({
            signals: [
                { name: Row1DriverSideDoorType.IsLocked.name, value: vssVal },
                { name: Row2DriverSideDoorType.IsLocked.name, value: vssVal },
            ]
        });
        setSignals({
            signals: [
                { name: Row1PassengerSideDoorType.IsLocked.name, value: vssVal },
                { name: Row2PassengerSideDoorType.IsLocked.name, value: vssVal },
            ]
        });
        setSignal(TrunkFrontType.IsLocked.name, vssVal);
        setSignal(TrunkRearType.IsLocked.name, vssVal);
    }, [carLocked, isAnyDoorOpen]);

    useEffect(() => {
        let locked;
        if (row1DriverDoorLocked && row1PassengerDoorLocked
            && row2DriverDoorLocked && row2PassengerDoorLocked
            && frunkLocked && trunkLocked) {
            locked = true;
        }
        else {
            locked = false;
        }

        setCarLocked(locked);
        saveData("Car.Door.CarLocked", locked);
    }, [row1DriverDoorLocked, row1PassengerDoorLocked, row2DriverDoorLocked, row2PassengerDoorLocked, frunkLocked, trunkLocked, setCarLocked]);

    useEffect(() => {
        if (!carLocked && speed >= 20) {
            handleLock();
        }
    }, [carLocked, speed, handleLock]);

    return (
        <IconButton color="primary" onClick={handleLock}>
            {carLocked ?
                <Lock sx={{ width: size, height: size }} />
                :
                <LockOpen sx={{ width: size, height: size }} />
            }
        </IconButton>
    );
};

export default LockStatus;