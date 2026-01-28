import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import ButtonArrayControl from "./components/ButtonArrayControl";
import PlusMinusButtons from "./components/PlusMinusButtons";

import { getDataSafely, saveData } from "../../../persistency/PersistentMemory";


const ChargingControl = () => {

    const [chargeCurrent, setChargeCurrent] = useState(getDataSafely("Car.Charging.ChargeCurrent", 16));
    const [scheduledChargeStart, setScheduledChargeStart] = useState(getDataSafely("Car.Charging.ScheduledChargeStart", 5));

    useEffect(() => {
        saveData("Car.Charging.ChargeCurrent", chargeCurrent);
        saveData("Car.Charging.ScheduledChargeStart", scheduledChargeStart);
    }, [chargeCurrent, scheduledChargeStart]);

    return (
        <Box sx={{ width: 1, height: 1 }}>
            <ButtonArrayControl labelList={["Open Charge Port"]} firstRow={true} />

            <PlusMinusButtons
                title="Charge Current at this location"
                value={chargeCurrent}
                decrement={() => {
                    if (chargeCurrent > 1) {
                        setChargeCurrent(chargeCurrent - 1);
                    }
                }}
                increment={() => {
                    if (chargeCurrent < 30) {
                        setChargeCurrent(chargeCurrent + 1);
                    }
                }}
                getValueString={(val) => (val + " A")}
            />

            <PlusMinusButtons
                title="Scheduled Charge Start at this location"
                value={scheduledChargeStart}
                decrement={() => {
                    if (scheduledChargeStart > 0) {
                        setScheduledChargeStart(scheduledChargeStart - 1);
                    }
                }}
                increment={() => {
                    if (scheduledChargeStart < 24) {
                        setScheduledChargeStart(scheduledChargeStart + 1);
                    }
                }}
                getValueString={(val) => (scheduledChargeStart + ":00")}
            />
        </Box>
    );
};

export default ChargingControl;