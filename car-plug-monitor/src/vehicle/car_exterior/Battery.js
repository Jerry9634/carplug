import { useMemo } from "react";

import Icon from "@mdi/react";
import {
    mdiBattery10, mdiBattery20, mdiBattery30, mdiBattery40, mdiBattery50,
    mdiBattery60, mdiBattery70, mdiBattery80, mdiBattery90,
    mdiBatteryOutline, mdiBattery,
    mdiBatteryChargingOutline,
    mdiBatteryCharging10, mdiBatteryCharging20, mdiBatteryCharging30, mdiBatteryCharging40, mdiBatteryCharging50,
    mdiBatteryCharging60, mdiBatteryCharging70, mdiBatteryCharging80, mdiBatteryCharging90, mdiBatteryCharging100,
} from "@mdi/js";


const BatteryIcons = [
    mdiBatteryOutline,
    mdiBattery10, mdiBattery20, mdiBattery30, mdiBattery40,
    mdiBattery50, mdiBattery60, mdiBattery70, mdiBattery80, mdiBattery90,
    mdiBattery,
];

const BatteryChargingIcons = [
    mdiBatteryChargingOutline,
    mdiBatteryCharging10, mdiBatteryCharging20, mdiBatteryCharging30, mdiBatteryCharging40, mdiBatteryCharging50,
    mdiBatteryCharging60, mdiBatteryCharging70, mdiBatteryCharging80, mdiBatteryCharging90, mdiBatteryCharging100
];


const Battery = ({
    distanceToEmptyInKM, chargingOngoing = false, size = 48
}) => {

    const percentage = useMemo(() => ((distanceToEmptyInKM * 100) / 1024), [distanceToEmptyInKM]);
    const index = useMemo(() => parseInt((percentage + 1) / 10), [percentage]);

    if (chargingOngoing) {
        return <Icon path={BatteryChargingIcons[index]} style={{ width: size, height: size }} />;
    }
    else {
        return <Icon path={BatteryIcons[index]} style={{ width: size, height: size }} />;
    }
};

export default Battery;