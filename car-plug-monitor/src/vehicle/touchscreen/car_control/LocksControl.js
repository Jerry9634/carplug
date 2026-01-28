import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import ToggleButtons from "./components/ToggleButtons";
import SwitchControl from "./components/SwitchControl";
import ButtonArrayControl from "./components/ButtonArrayControl";

import { getDataSafely, saveData } from "../../../persistency/PersistentMemory";


const LocksControl = () => {

    const [walkwayDoorLock, setWalkwayDoorLock] = useState(getDataSafely("Car.Locks.WalkwayDoorLock", true));
    const [driverDoorUnlockMode, setDriverDoorUnlockMode] = useState(getDataSafely("Car.Locks.DriverDoorUnlockMode", false));
    const [unlockOnPark, setUnlockOnPark] = useState(getDataSafely("Car.Locks.UnlockOnPark", true));

    const [carLeftOpenNotifications, setCarLeftOpenNotifications] = useState(getDataSafely("Car.Locks.CarLeftOpenNotifications", "Doors & Windows"));

    const [lockConfirmationSound, setLockConfirmationSound] = useState(getDataSafely("Car.Locks.LockConfirmationSound", true));
    const [closeWindowsOnLock, setCloseWindowsOnLock] = useState(getDataSafely("Car.Locks.CloseWindowsOnLock", true));

    useEffect(() => {
        saveData("Car.Locks.WalkwayDoorLock", walkwayDoorLock);
        saveData("Car.Locks.DriverDoorUnlockMode", driverDoorUnlockMode);
        saveData("Car.Locks.UnlockOnPark", unlockOnPark);
        saveData("Car.Locks.CarLeftOpenNotifications", carLeftOpenNotifications);
        saveData("Car.Locks.LockConfirmationSound", lockConfirmationSound);
        saveData("Car.Locks.CloseWindowsOnLock", closeWindowsOnLock);
    }, [
        walkwayDoorLock, driverDoorUnlockMode, unlockOnPark,
        carLeftOpenNotifications, lockConfirmationSound, closeWindowsOnLock
    ]);

    return (
        <Box sx={{ width: 1, height: 1 }}>
            <ButtonArrayControl labelList={["Window Lock", "Child Lock"]} firstRow={true} />

            <SwitchControl
                name="Walk-Away Door Lock"
                value={walkwayDoorLock}
                setValue={setWalkwayDoorLock}
                additionalCheck={"Exclude Home"}
                desc={[
                    "Automatically lock doors and trunks when leaving with a phone or key fob",
                    "Walk-Away Door Lock is disabled at this location"
                ]}
            />
            <SwitchControl
                name="Driver Door Unlock Mode"
                value={driverDoorUnlockMode}
                setValue={setDriverDoorUnlockMode}
                desc={["Only unlock the driver door when first unlocking the vehicle"]}
            />
            <SwitchControl
                name="Unlock on Park"
                value={unlockOnPark}
                setValue={setUnlockOnPark}
            />

            <ToggleButtons
                name="Car Left Open Notifications"
                labelList={["Off", "Doors", "Doors & Windows"]}
                value={carLeftOpenNotifications}
                setValue={setCarLeftOpenNotifications}
                additionalCheck={"Exclude Home"}
                desc={[
                    "",
                    "You will be notified if any trunk or door is left open",
                    "You will be notified if any trunk, door or window is left open"
                ]}
            />

            <SwitchControl
                name="Lock Confirmation Sound"
                value={lockConfirmationSound}
                setValue={setLockConfirmationSound}
            />
            <SwitchControl
                name="Close Windows On Lock"
                value={closeWindowsOnLock}
                setValue={setCloseWindowsOnLock}
            />
        </Box>
    );
};

export default LocksControl;