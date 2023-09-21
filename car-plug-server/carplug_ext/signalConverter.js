/*
 * File: signalConverter.js
 *
 * Code generated for vehicle signal conversion
 *
 * AutoWorks version              : 2023b
 * Javascript code generated on   : 21.09.2023 22:13:21
 */

import { 
    setSignal as setRawSignal, 
    getSignal as getRawSignal
} from '../carplug_core/signal_db.js';
import { 
    getSignal as getVssSignal, 
    setSignal as setVssSignal 
} from "./vss_db.js";



const converterList = [
    {
        vss_key: "Vehicle.ADAS.ABS.IsEngaged",
        can_sig: "ABS_ActvSta",
        vss_to_can: cnv_Vehicle_ADAS_ABS_IsEngaged_to_ABS_ActvSta,
        can_to_vss: cnv_ABS_ActvSta_to_Vehicle_ADAS_ABS_IsEngaged,
    },
    {
        vss_key: "Vehicle.ADAS.ABS.IsError",
        can_sig: "ABS_DfctvSta",
        vss_to_can: cnv_Vehicle_ADAS_ABS_IsError_to_ABS_DfctvSta,
        can_to_vss: cnv_ABS_DfctvSta_to_Vehicle_ADAS_ABS_IsError,
    },
    {
        vss_key: "Vehicle.ADAS.CruiseControl.IsActive",
        can_sig: "VCU_CrzOnLampSta",
        vss_to_can: cnv_Vehicle_ADAS_CruiseControl_IsActive_to_VCU_CrzOnLampSta,
        can_to_vss: cnv_VCU_CrzOnLampSta_to_Vehicle_ADAS_CruiseControl_IsActive,
    },
    {
        vss_key: "Vehicle.ADAS.CruiseControl.IsEnabled",
        can_sig: "VCU_CrzSetLampSta",
        vss_to_can: cnv_Vehicle_ADAS_CruiseControl_IsEnabled_to_VCU_CrzSetLampSta,
        can_to_vss: cnv_VCU_CrzSetLampSta_to_Vehicle_ADAS_CruiseControl_IsEnabled,
    },
    {
        vss_key: "Vehicle.ADAS.CruiseControl.SpeedSet",
        can_sig: "VCU_CrzSetSpdVal",
        vss_to_can: cnv_Vehicle_ADAS_CruiseControl_SpeedSet_to_VCU_CrzSetSpdVal,
        can_to_vss: cnv_VCU_CrzSetSpdVal_to_Vehicle_ADAS_CruiseControl_SpeedSet,
    },
    {
        vss_key: "Vehicle.Body.Lights.Hazard.IsSignaling",
        can_sig: "HazardCtrlReq",
        vss_to_can: cnv_Vehicle_Body_Lights_Hazard_IsSignaling_to_HazardCtrlReq,
        can_to_vss: cnv_HazardCtrlReq_to_Vehicle_Body_Lights_Hazard_IsSignaling,
    },
    {
        vss_key: "Vehicle.Cabin.HVAC.Station.Row1.Driver.Temperature",
        can_sig: "HU_DATC_DrTempSetC",
        vss_to_can: cnv_Vehicle_Cabin_HVAC_Station_Row1_Driver_Temperature_to_HU_DATC_DrTempSetC,
        can_to_vss: cnv_HU_DATC_DrTempSetC_to_Vehicle_Cabin_HVAC_Station_Row1_Driver_Temperature,
    },
    {
        vss_key: "Vehicle.Cabin.HVAC.Station.Row1.Passenger.Temperature",
        can_sig: "HU_DATC_PsTempSetC",
        vss_to_can: cnv_Vehicle_Cabin_HVAC_Station_Row1_Passenger_Temperature_to_HU_DATC_PsTempSetC,
        can_to_vss: cnv_HU_DATC_PsTempSetC_to_Vehicle_Cabin_HVAC_Station_Row1_Passenger_Temperature,
    },
    {
        vss_key: "Vehicle.Powertrain.Range",
        can_sig: "CLU_EVDTEDisp",
        vss_to_can: cnv_Vehicle_Powertrain_Range_to_CLU_EVDTEDisp,
        can_to_vss: cnv_CLU_EVDTEDisp_to_Vehicle_Powertrain_Range,
    },
    {
        vss_key: "Vehicle.Powertrain.Transmission.SelectedGear",
        can_sig: "VCU_GearPosSta",
        vss_to_can: cnv_Vehicle_Powertrain_Transmission_SelectedGear_to_VCU_GearPosSta,
        can_to_vss: cnv_VCU_GearPosSta_to_Vehicle_Powertrain_Transmission_SelectedGear,
    },
    {
        vss_key: "Vehicle.Speed",
        can_sig: "CLU_DisSpdVal",
        vss_to_can: cnv_Vehicle_Speed_to_CLU_DisSpdVal,
        can_to_vss: cnv_CLU_DisSpdVal_to_Vehicle_Speed,
    },
    {
        vss_key: "Vehicle.TraveledDistance",
        can_sig: "CLU_OdoVal",
        vss_to_can: cnv_Vehicle_TraveledDistance_to_CLU_OdoVal,
        can_to_vss: cnv_CLU_OdoVal_to_Vehicle_TraveledDistance,
    },
];

export const vssToCanMap = new Map();
export const canToVssMap = new Map();

export function initConverterMap() {
    for (const cnv of converterList) {
        vssToCanMap.set(cnv.vss_key, cnv.vss_to_can);
        canToVssMap.set(cnv.can_sig, cnv.can_to_vss);
    }
}

/*
 * VSS Key: Vehicle.ADAS.ABS.IsEngaged
 *  @description: Indicates if ABS is currently regulating brake pressure. True = Engaged. False = Not Engaged.
 *  @type       : sensor
 *  @datatype   : boolean
 *
 * CAN Signal: ABS_ActvSta
 *  @description: ABS_ActiveStatus ##2G##ESC - TCS11 - ABS_ACT
 *  @value descriptions
 *     0 | ABS control inactive
 *     1 | ABS control active
 *     2 | Not used
 *     3 | Error Indicator
 *  @init value : 0
 *  @min        : 0
 *  @max        : 3
 *  @datatype   : uint8_t
 */
function cnv_Vehicle_ADAS_ABS_IsEngaged_to_ABS_ActvSta(value, from="Vehicle.ADAS.ABS.IsEngaged", to="ABS_ActvSta") {
    /*!!! USER CODE [cnv_Vehicle_ADAS_ABS_IsEngaged_to_ABS_ActvSta] : Do NOT modify this line !!!*/
    let result;
    if (value === "True") {
        result = 1;
    }
    else {
        result = 0;
    }
    setRawSignal(to, result);
    /*!!! END of USER CODE [cnv_Vehicle_ADAS_ABS_IsEngaged_to_ABS_ActvSta] : Do NOT modify this line !!!*/
}

function cnv_ABS_ActvSta_to_Vehicle_ADAS_ABS_IsEngaged(value, from="ABS_ActvSta", to="Vehicle.ADAS.ABS.IsEngaged") {
    /*!!! USER CODE [cnv_ABS_ActvSta_to_Vehicle_ADAS_ABS_IsEngaged] : Do NOT modify this line !!!*/
    let result;
    if (value === 1) {
        result = "True";
    }
    else {
        result = "False";
    }
    setVssSignal(to, result);
    /*!!! END of USER CODE [cnv_ABS_ActvSta_to_Vehicle_ADAS_ABS_IsEngaged] : Do NOT modify this line !!!*/
}

/*
 * VSS Key: Vehicle.ADAS.ABS.IsError
 *  @description: Indicates if ABS incurred an error condition. True = Error. False = No Error.
 *  @type       : sensor
 *  @datatype   : boolean
 *
 * CAN Signal: ABS_DfctvSta
 *  @description: ABS_DefectiveStatus ##2G##ESC - TCS11 - ABS_DEF
 *  @value descriptions
 *     0 | ABS is not defective
 *     1 | ABS is defective
 *     2 | Not used
 *     3 | Error Indicator
 *  @init value : 0
 *  @min        : 0
 *  @max        : 3
 *  @datatype   : uint8_t
 */
function cnv_Vehicle_ADAS_ABS_IsError_to_ABS_DfctvSta(value, from="Vehicle.ADAS.ABS.IsError", to="ABS_DfctvSta") {
    /*!!! USER CODE [cnv_Vehicle_ADAS_ABS_IsError_to_ABS_DfctvSta] : Do NOT modify this line !!!*/
    let result;
    if (value === "True") {
        result = 1;
    }
    else {
        result = 0;
    }
    setRawSignal(to, result);
    /*!!! END of USER CODE [cnv_Vehicle_ADAS_ABS_IsError_to_ABS_DfctvSta] : Do NOT modify this line !!!*/
}

function cnv_ABS_DfctvSta_to_Vehicle_ADAS_ABS_IsError(value, from="ABS_DfctvSta", to="Vehicle.ADAS.ABS.IsError") {
    /*!!! USER CODE [cnv_ABS_DfctvSta_to_Vehicle_ADAS_ABS_IsError] : Do NOT modify this line !!!*/
    let result;
    if (value === 1) {
        result = "True";
    }
    else {
        result = "False";
    }
    setVssSignal(to, result);
    /*!!! END of USER CODE [cnv_ABS_DfctvSta_to_Vehicle_ADAS_ABS_IsError] : Do NOT modify this line !!!*/
}

/*
 * VSS Key: Vehicle.ADAS.CruiseControl.IsActive
 *  @description: Indicates if cruise control system is active (i.e. actively controls speed). True = Active. False = Inactive.
 *  @type       : actuator
 *  @datatype   : boolean
 *
 * CAN Signal: VCU_CrzOnLampSta
 *  @description: VCU_CruiseControlOnLampStatus ##2G##VCU - VCU5 - CF_Vcu_CruOnLamp
 *  @value descriptions
 *     0 | Lamp Off
 *     1 | Lamp On
 *     2 | Not used
 *     3 | Error Indicator
 *  @init value : 0
 *  @min        : 0
 *  @max        : 3
 *  @datatype   : uint8_t
 */
function cnv_Vehicle_ADAS_CruiseControl_IsActive_to_VCU_CrzOnLampSta(value, from="Vehicle.ADAS.CruiseControl.IsActive", to="VCU_CrzOnLampSta") {
    /*!!! USER CODE [cnv_Vehicle_ADAS_CruiseControl_IsActive_to_VCU_CrzOnLampSta] : Do NOT modify this line !!!*/
    let result;
    if (value === "True") {
        result = 1;
    }
    else {
        result = 0;
    }
    setRawSignal(to, result);
    /*!!! END of USER CODE [cnv_Vehicle_ADAS_CruiseControl_IsActive_to_VCU_CrzOnLampSta] : Do NOT modify this line !!!*/
}

function cnv_VCU_CrzOnLampSta_to_Vehicle_ADAS_CruiseControl_IsActive(value, from="VCU_CrzOnLampSta", to="Vehicle.ADAS.CruiseControl.IsActive") {
    /*!!! USER CODE [cnv_VCU_CrzOnLampSta_to_Vehicle_ADAS_CruiseControl_IsActive] : Do NOT modify this line !!!*/
    let result;
    if (value === 1) {
        result = "True";
    }
    else {
        result = "False";
    }
    setVssSignal(to, result);
    /*!!! END of USER CODE [cnv_VCU_CrzOnLampSta_to_Vehicle_ADAS_CruiseControl_IsActive] : Do NOT modify this line !!!*/
}

/*
 * VSS Key: Vehicle.ADAS.CruiseControl.IsEnabled
 *  @description: Indicates if cruise control system is enabled (e.g. ready to receive configurations and settings) True = Enabled. False = Disabled.
 *  @type       : actuator
 *  @datatype   : boolean
 *
 * CAN Signal: VCU_CrzSetLampSta
 *  @description: VCU_CruiseControlSetLampStatus ##2G##VCU - VCU5 - CF_Vcu_CruSetLamp
 *  @value descriptions
 *     0 | Lamp Off
 *     1 | Lamp On
 *     2 | Not used
 *     3 | Error Indicator
 *  @init value : 0
 *  @min        : 0
 *  @max        : 3
 *  @datatype   : uint8_t
 */
function cnv_Vehicle_ADAS_CruiseControl_IsEnabled_to_VCU_CrzSetLampSta(value, from="Vehicle.ADAS.CruiseControl.IsEnabled", to="VCU_CrzSetLampSta") {
    /*!!! USER CODE [cnv_Vehicle_ADAS_CruiseControl_IsEnabled_to_VCU_CrzSetLampSta] : Do NOT modify this line !!!*/
    let result;
    if (value === "True") {
        result = 1;
    }
    else {
        result = 0;
    }
    setRawSignal(to, result);
    /*!!! END of USER CODE [cnv_Vehicle_ADAS_CruiseControl_IsEnabled_to_VCU_CrzSetLampSta] : Do NOT modify this line !!!*/
}

function cnv_VCU_CrzSetLampSta_to_Vehicle_ADAS_CruiseControl_IsEnabled(value, from="VCU_CrzSetLampSta", to="Vehicle.ADAS.CruiseControl.IsEnabled") {
    /*!!! USER CODE [cnv_VCU_CrzSetLampSta_to_Vehicle_ADAS_CruiseControl_IsEnabled] : Do NOT modify this line !!!*/
    let result;
    if (value === 1) {
        result = "True";
    }
    else {
        result = "False";
    }
    setVssSignal(to, result);
    /*!!! END of USER CODE [cnv_VCU_CrzSetLampSta_to_Vehicle_ADAS_CruiseControl_IsEnabled] : Do NOT modify this line !!!*/
}

/*
 * VSS Key: Vehicle.ADAS.CruiseControl.SpeedSet
 *  @description: Set cruise control speed in kilometers per hour.
 *  @type       : actuator
 *  @datatype   : float
 *  @unit       : km/h
 *
 * CAN Signal: VCU_CrzSetSpdVal
 *  @description: VCU_CruiseControlSetSpeedValue
 *  @value descriptions
 *  @init value : 0
 *  @min        : 0
 *  @max        : 255
 *  @datatype   : uint8_t
 */
function cnv_Vehicle_ADAS_CruiseControl_SpeedSet_to_VCU_CrzSetSpdVal(value, from="Vehicle.ADAS.CruiseControl.SpeedSet", to="VCU_CrzSetSpdVal") {
    /*!!! USER CODE [cnv_Vehicle_ADAS_CruiseControl_SpeedSet_to_VCU_CrzSetSpdVal] : Do NOT modify this line !!!*/
    setRawSignal(to, Number(value));
    /*!!! END of USER CODE [cnv_Vehicle_ADAS_CruiseControl_SpeedSet_to_VCU_CrzSetSpdVal] : Do NOT modify this line !!!*/
}

function cnv_VCU_CrzSetSpdVal_to_Vehicle_ADAS_CruiseControl_SpeedSet(value, from="VCU_CrzSetSpdVal", to="Vehicle.ADAS.CruiseControl.SpeedSet") {
    /*!!! USER CODE [cnv_VCU_CrzSetSpdVal_to_Vehicle_ADAS_CruiseControl_SpeedSet] : Do NOT modify this line !!!*/
    setVssSignal(to, Number(value));
    /*!!! END of USER CODE [cnv_VCU_CrzSetSpdVal_to_Vehicle_ADAS_CruiseControl_SpeedSet] : Do NOT modify this line !!!*/
}

/*
 * VSS Key: Vehicle.Body.Lights.Hazard.IsSignaling
 *  @description: Indicates if light is signaling or off. True = signaling. False = Off.
 *  @type       : actuator
 *  @datatype   : boolean
 *
 * CAN Signal: HazardCtrlReq
 *  @description: This signal is request for controling Hazard lamp.
 *  @value descriptions
 *     0 | No Action(Default)
 *     1 | Hazard Off
 *     2 | Hazard On
 *     3 | Error Indicator
 *  @init value : 0
 *  @min        : 0
 *  @max        : 3
 *  @datatype   : uint8_t
 */
function cnv_Vehicle_Body_Lights_Hazard_IsSignaling_to_HazardCtrlReq(value, from="Vehicle.Body.Lights.Hazard.IsSignaling", to="HazardCtrlReq") {
    /*!!! USER CODE [cnv_Vehicle_Body_Lights_Hazard_IsSignaling_to_HazardCtrlReq] : Do NOT modify this line !!!*/
    let result;
    if (value === "True") {
        result = 2;
    }
    else {
        result = 1;
    }
    setRawSignal(to, result);
    /*!!! END of USER CODE [cnv_Vehicle_Body_Lights_Hazard_IsSignaling_to_HazardCtrlReq] : Do NOT modify this line !!!*/
}

function cnv_HazardCtrlReq_to_Vehicle_Body_Lights_Hazard_IsSignaling(value, from="HazardCtrlReq", to="Vehicle.Body.Lights.Hazard.IsSignaling") {
    /*!!! USER CODE [cnv_HazardCtrlReq_to_Vehicle_Body_Lights_Hazard_IsSignaling] : Do NOT modify this line !!!*/
    let result;
    if (value === 2) {
        result = "True";
    }
    else {
        result = "False";
    }
    setVssSignal(to, result);
    /*!!! END of USER CODE [cnv_HazardCtrlReq_to_Vehicle_Body_Lights_Hazard_IsSignaling] : Do NOT modify this line !!!*/
}

/*
 * VSS Key: Vehicle.Cabin.HVAC.Station.Row1.Driver.Temperature
 *  @description: Temperature
 *  @type       : actuator
 *  @datatype   : int8
 *  @unit       : celsius
 *
 * CAN Signal: HU_DATC_DrTempSetC
 *  @description: In single type DATC, set temperature of front side directly(Centigrade)..In dual type DATC, set temperature of front left side directly(Centigrade).
 *  @value descriptions
 *     0 | Blank
 *     1 | LO
 *     2 | PHY=HEX*0.5 + 14
 *     3 | PHY=HEX*0.5 + 14
 *     4 | PHY=HEX*0.5 + 14
 *     5 | PHY=HEX*0.5 + 14
 *     6 | PHY=HEX*0.5 + 14
 *     7 | PHY=HEX*0.5 + 14
 *     8 | PHY=HEX*0.5 + 14
 *     9 | PHY=HEX*0.5 + 14
 *     10 | PHY=HEX*0.5 + 14
 *     11 | PHY=HEX*0.5 + 14
 *     12 | PHY=HEX*0.5 + 14
 *     13 | PHY=HEX*0.5 + 14
 *     14 | PHY=HEX*0.5 + 14
 *     15 | PHY=HEX*0.5 + 14
 *     16 | PHY=HEX*0.5 + 14
 *     17 | PHY=HEX*0.5 + 14
 *     18 | PHY=HEX*0.5 + 14
 *     19 | PHY=HEX*0.5 + 14
 *     20 | PHY=HEX*0.5 + 14
 *     21 | PHY=HEX*0.5 + 14
 *     22 | PHY=HEX*0.5 + 14
 *     23 | PHY=HEX*0.5 + 14
 *     24 | PHY=HEX*0.5 + 14
 *     25 | PHY=HEX*0.5 + 14
 *     26 | PHY=HEX*0.5 + 14
 *     27 | PHY=HEX*0.5 + 14
 *     28 | PHY=HEX*0.5 + 14
 *     29 | PHY=HEX*0.5 + 14
 *     30 | PHY=HEX*0.5 + 14
 *     31 | PHY=HEX*0.5 + 14
 *     32 | PHY=HEX*0.5 + 14
 *     33 | PHY=HEX*0.5 + 14
 *     34 | PHY=HEX*0.5 + 14
 *     35 | PHY=HEX*0.5 + 14
 *     36 | PHY=HEX*0.5 + 14
 *     37 | 0x25~0xFD:Reserved
 *     253 | 0x25~0xFD:Reserved
 *     254 | HI
 *     255 | Invalid
 *  @init value : 141.5 (255)
 *  @min        : 15 (2)
 *  @max        : 32 (36)
 *  @datatype   : float
 */
function cnv_Vehicle_Cabin_HVAC_Station_Row1_Driver_Temperature_to_HU_DATC_DrTempSetC(value, from="Vehicle.Cabin.HVAC.Station.Row1.Driver.Temperature", to="HU_DATC_DrTempSetC") {
    /*!!! USER CODE [cnv_Vehicle_Cabin_HVAC_Station_Row1_Driver_Temperature_to_HU_DATC_DrTempSetC] : Do NOT modify this line !!!*/
    setRawSignal(to, Number(value));
    /*!!! END of USER CODE [cnv_Vehicle_Cabin_HVAC_Station_Row1_Driver_Temperature_to_HU_DATC_DrTempSetC] : Do NOT modify this line !!!*/
}

function cnv_HU_DATC_DrTempSetC_to_Vehicle_Cabin_HVAC_Station_Row1_Driver_Temperature(value, from="HU_DATC_DrTempSetC", to="Vehicle.Cabin.HVAC.Station.Row1.Driver.Temperature") {
    /*!!! USER CODE [cnv_HU_DATC_DrTempSetC_to_Vehicle_Cabin_HVAC_Station_Row1_Driver_Temperature] : Do NOT modify this line !!!*/
    setVssSignal(to, Number(value));
    /*!!! END of USER CODE [cnv_HU_DATC_DrTempSetC_to_Vehicle_Cabin_HVAC_Station_Row1_Driver_Temperature] : Do NOT modify this line !!!*/
}

/*
 * VSS Key: Vehicle.Cabin.HVAC.Station.Row1.Passenger.Temperature
 *  @description: Temperature
 *  @type       : actuator
 *  @datatype   : int8
 *  @unit       : celsius
 *
 * CAN Signal: HU_DATC_PsTempSetC
 *  @description: In 2-zone or more than 2-zone type climate, set temperature of front right side directly(Centigrade)
 *  @value descriptions
 *     0 | Blank
 *     1 | LO
 *     2 | PHY=HEX*0.5 + 14
 *     3 | PHY=HEX*0.5 + 14
 *     4 | PHY=HEX*0.5 + 14
 *     5 | PHY=HEX*0.5 + 14
 *     6 | PHY=HEX*0.5 + 14
 *     7 | PHY=HEX*0.5 + 14
 *     8 | PHY=HEX*0.5 + 14
 *     9 | PHY=HEX*0.5 + 14
 *     10 | PHY=HEX*0.5 + 14
 *     11 | PHY=HEX*0.5 + 14
 *     12 | PHY=HEX*0.5 + 14
 *     13 | PHY=HEX*0.5 + 14
 *     14 | PHY=HEX*0.5 + 14
 *     15 | PHY=HEX*0.5 + 14
 *     16 | PHY=HEX*0.5 + 14
 *     17 | PHY=HEX*0.5 + 14
 *     18 | PHY=HEX*0.5 + 14
 *     19 | PHY=HEX*0.5 + 14
 *     20 | PHY=HEX*0.5 + 14
 *     21 | PHY=HEX*0.5 + 14
 *     22 | PHY=HEX*0.5 + 14
 *     23 | PHY=HEX*0.5 + 14
 *     24 | PHY=HEX*0.5 + 14
 *     25 | PHY=HEX*0.5 + 14
 *     26 | PHY=HEX*0.5 + 14
 *     27 | PHY=HEX*0.5 + 14
 *     28 | PHY=HEX*0.5 + 14
 *     29 | PHY=HEX*0.5 + 14
 *     30 | PHY=HEX*0.5 + 14
 *     31 | PHY=HEX*0.5 + 14
 *     32 | PHY=HEX*0.5 + 14
 *     33 | PHY=HEX*0.5 + 14
 *     34 | PHY=HEX*0.5 + 14
 *     35 | PHY=HEX*0.5 + 14
 *     36 | PHY=HEX*0.5 + 14
 *     37 | 0x25~0xFD:Reserved
 *     253 | 0x25~0xFD:Reserved
 *     254 | HI
 *     255 | Invalid
 *  @init value : 141.5 (255)
 *  @min        : 15 (2)
 *  @max        : 32 (36)
 *  @datatype   : float
 */
function cnv_Vehicle_Cabin_HVAC_Station_Row1_Passenger_Temperature_to_HU_DATC_PsTempSetC(value, from="Vehicle.Cabin.HVAC.Station.Row1.Passenger.Temperature", to="HU_DATC_PsTempSetC") {
    /*!!! USER CODE [cnv_Vehicle_Cabin_HVAC_Station_Row1_Passenger_Temperature_to_HU_DATC_PsTempSetC] : Do NOT modify this line !!!*/
    setRawSignal(to, Number(value));
    /*!!! END of USER CODE [cnv_Vehicle_Cabin_HVAC_Station_Row1_Passenger_Temperature_to_HU_DATC_PsTempSetC] : Do NOT modify this line !!!*/
}

function cnv_HU_DATC_PsTempSetC_to_Vehicle_Cabin_HVAC_Station_Row1_Passenger_Temperature(value, from="HU_DATC_PsTempSetC", to="Vehicle.Cabin.HVAC.Station.Row1.Passenger.Temperature") {
    /*!!! USER CODE [cnv_HU_DATC_PsTempSetC_to_Vehicle_Cabin_HVAC_Station_Row1_Passenger_Temperature] : Do NOT modify this line !!!*/
    setVssSignal(to, Number(value));
    /*!!! END of USER CODE [cnv_HU_DATC_PsTempSetC_to_Vehicle_Cabin_HVAC_Station_Row1_Passenger_Temperature] : Do NOT modify this line !!!*/
}

/*
 * VSS Key: Vehicle.Powertrain.Range
 *  @description: Remaining range in meters using all energy sources available in the vehicle.
 *  @type       : sensor
 *  @datatype   : uint32
 *  @unit       : m
 *
 * CAN Signal: CLU_EVDTEDisp
 *  @description: 2nd General ? MM-CAN(LS):CF_Clu_EVDTEDisp
 *  @value descriptions
 *     0 | Valid DTE 0
 *     1 | 0x01~0x3FE:Valid DTE(1~1022)
 *     1022 | 0x01~0x3FE:Valid DTE(1~1022)
 *     1023 | Invalid
 *  @init value : 511
 *  @min        : 0
 *  @max        : 1023
 *  @datatype   : uint16_t
 */
function cnv_Vehicle_Powertrain_Range_to_CLU_EVDTEDisp(value, from="Vehicle.Powertrain.Range", to="CLU_EVDTEDisp") {
    /*!!! USER CODE [cnv_Vehicle_Powertrain_Range_to_CLU_EVDTEDisp] : Do NOT modify this line !!!*/
    setRawSignal(to, Number(value) / 1000);
    /*!!! END of USER CODE [cnv_Vehicle_Powertrain_Range_to_CLU_EVDTEDisp] : Do NOT modify this line !!!*/
}

function cnv_CLU_EVDTEDisp_to_Vehicle_Powertrain_Range(value, from="CLU_EVDTEDisp", to="Vehicle.Powertrain.Range") {
    /*!!! USER CODE [cnv_CLU_EVDTEDisp_to_Vehicle_Powertrain_Range] : Do NOT modify this line !!!*/
    setVssSignal(to, Number(value) * 1000);
    /*!!! END of USER CODE [cnv_CLU_EVDTEDisp_to_Vehicle_Powertrain_Range] : Do NOT modify this line !!!*/
}

/*
 * VSS Key: Vehicle.Powertrain.Transmission.SelectedGear
 *  @description: The selected gear. 0=Neutral, 1/2/..=Forward, -1/-2/..=Reverse, 126=Park, 127=Drive.
 *  @type       : actuator
 *  @datatype   : int8
 *
 * CAN Signal: VCU_GearPosSta
 *  @description: VCU_GearPositionStatus ##2G##VCU - VCU1 - CF_Vcu_GarSelDisp
 *  @value descriptions
 *     0 | P
 *     1 | B
 *     2 | Not Used
 *     3 | Not Used
 *     4 | Not Used
 *     5 | D
 *     6 | N
 *     7 | R
 *     8 | Not Used
 *     9 | Not Display at Cluster
 *     10 | Reserved
 *     11 | Reserved
 *     12 | Reserved
 *     13 | Reserved
 *     14 | Intermediate Position
 *     15 | Fault
 *  @init value : 9
 *  @min        : 0
 *  @max        : 15
 *  @datatype   : uint8_t
 */
function cnv_Vehicle_Powertrain_Transmission_SelectedGear_to_VCU_GearPosSta(value, from="Vehicle.Powertrain.Transmission.SelectedGear", to="VCU_GearPosSta") {
    /*!!! USER CODE [cnv_Vehicle_Powertrain_Transmission_SelectedGear_to_VCU_GearPosSta] : Do NOT modify this line !!!*/
    let result;
    const gearPos = Number(value);
    if (gearPos === 0) {
        result = 6; // N
    }
    else if (gearPos < 0) {
        result = 7; // R
    }
    else if (gearPos === 127) {
        result = 5; // D
    }
    else {
        result = 0; // P
    }
    setRawSignal(to, result);
    /*!!! END of USER CODE [cnv_Vehicle_Powertrain_Transmission_SelectedGear_to_VCU_GearPosSta] : Do NOT modify this line !!!*/
}

function cnv_VCU_GearPosSta_to_Vehicle_Powertrain_Transmission_SelectedGear(value, from="VCU_GearPosSta", to="Vehicle.Powertrain.Transmission.SelectedGear") {
    /*!!! USER CODE [cnv_VCU_GearPosSta_to_Vehicle_Powertrain_Transmission_SelectedGear] : Do NOT modify this line !!!*/
    let result;
    const gearPos = Number(value);
    if (gearPos === 6) {
        result = 0; // N
    }
    else if (gearPos === 7) {
        result = -1; // R
    }
    else if (gearPos === 5) {
        result = 127; // D
    }
    else {
        result = 126; // P
    }
    setVssSignal(to, result);
    /*!!! END of USER CODE [cnv_VCU_GearPosSta_to_Vehicle_Powertrain_Transmission_SelectedGear] : Do NOT modify this line !!!*/
}

/*
 * VSS Key: Vehicle.Speed
 *  @description: Vehicle speed.
 *  @type       : sensor
 *  @datatype   : float
 *  @unit       : km/h
 *
 * CAN Signal: CLU_DisSpdVal
 *  @description: CLU_DisplaySpeedValue
 *  @value descriptions
 *     1023 | Error
 *  @init value : 0
 *  @min        : 0
 *  @max        : 511.5 (1023)
 *  @datatype   : float
 */
function cnv_Vehicle_Speed_to_CLU_DisSpdVal(value, from="Vehicle.Speed", to="CLU_DisSpdVal") {
    /*!!! USER CODE [cnv_Vehicle_Speed_to_CLU_DisSpdVal] : Do NOT modify this line !!!*/
    setRawSignal(to, Number(value));
    /*!!! END of USER CODE [cnv_Vehicle_Speed_to_CLU_DisSpdVal] : Do NOT modify this line !!!*/
}

function cnv_CLU_DisSpdVal_to_Vehicle_Speed(value, from="CLU_DisSpdVal", to="Vehicle.Speed") {
    /*!!! USER CODE [cnv_CLU_DisSpdVal_to_Vehicle_Speed] : Do NOT modify this line !!!*/
    setVssSignal(to, Number(value));
    /*!!! END of USER CODE [cnv_CLU_DisSpdVal_to_Vehicle_Speed] : Do NOT modify this line !!!*/
}

/*
 * VSS Key: Vehicle.TraveledDistance
 *  @description: Odometer reading, total distance traveled during the lifetime of the vehicle.
 *  @type       : sensor
 *  @datatype   : float
 *  @unit       : km
 *
 * CAN Signal: CLU_OdoVal
 *  @description: CLU_OdometerValue
 *  @value descriptions
 *     16777215 | Error
 *  @init value : 0
 *  @min        : 0
 *  @max        : 1677721.5 (16777215)
 *  @datatype   : float
 */
function cnv_Vehicle_TraveledDistance_to_CLU_OdoVal(value, from="Vehicle.TraveledDistance", to="CLU_OdoVal") {
    /*!!! USER CODE [cnv_Vehicle_TraveledDistance_to_CLU_OdoVal] : Do NOT modify this line !!!*/
    setRawSignal(to, Number(value));
    /*!!! END of USER CODE [cnv_Vehicle_TraveledDistance_to_CLU_OdoVal] : Do NOT modify this line !!!*/
}

function cnv_CLU_OdoVal_to_Vehicle_TraveledDistance(value, from="CLU_OdoVal", to="Vehicle.TraveledDistance") {
    /*!!! USER CODE [cnv_CLU_OdoVal_to_Vehicle_TraveledDistance] : Do NOT modify this line !!!*/
    setVssSignal(to, Number(value));
    /*!!! END of USER CODE [cnv_CLU_OdoVal_to_Vehicle_TraveledDistance] : Do NOT modify this line !!!*/
}


/*
 * File trailer for generated code.
 *
 * [EOF]
 */
