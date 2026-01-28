import { useCallback, useContext, useEffect, useState } from "react";
import styled from "styled-components";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import Iframe from 'react-iframe';

import Box from "@mui/material/Box";
import LibraryMusic from "@mui/icons-material/LibraryMusic";
import VideoCameraBack from "@mui/icons-material/VideoCameraBack";
import { mdiCarSettings, mdiAirConditioner } from "@mdi/js";

import NavigationBarItem from "./NavigationBarItem";
import TemperatureControl from "../climate/TemperatureControl";
import VolumeControl from "../media/VolumeControl";
import { MyTooltip } from "../../car_interior/CarInterior";

import { AppContext } from '../../../AppContext';
import { VehicleContext } from "../../VehicleContext";
import CarControlTabs from "../car_control/CarControlTabs";
import MediaMain from "../media/MediaMain";
import Dashcam from "../camera/Dashcam";
import ClimateControl from "../climate/ClimateControl";

import { getDataSafely, saveData } from "../../../persistency/PersistentMemory"
import vssApi from "../../../signal_db/VssAPI.json";
import { subscribeChannel, unsubscribeChannel } from "../../../signal_db/VssSocket";


const MY_CHANNEL = "Touchscreen/NavigationBar";
const DriverTemperatureSetType = vssApi.Vehicle.Cabin.HVAC.Station.Row1.Driver.Temperature;
const PassengerTemperatureSetType = vssApi.Vehicle.Cabin.HVAC.Station.Row1.Passenger.Temperature;


const NavigationBar = ({
    APP_LEFT, APP_HEIGHT,
    tabIndex, setTabIndex
}) => {

    const { isDarkTheme } = useContext(AppContext);

    const { touchscreenOpen } = useContext(VehicleContext);

    const [volumeRefresh, setVolumeRefresh] = useState(false);

    const [driverTemperature, setDriverTemperature] = useState(getDataSafely("Car.Climate.DriverTemperature", 25.0));
    const [passengerTemperature, setPassengerTemperature] = useState(getDataSafely("Car.Climate.PassengerTemperature", 25.0));

    const [currentApp, setCurrentApp] = useState({ name: "none" });
    const [fullScreenApp, setFullScreenApp] = useState(false);

    const handleSelect = useCallback((index) => {
        if (index === APP_TYPES.MEDIA) {
            if (index !== tabIndex) {
                setTabIndex(index);
            }
            else {
                // clicks agian
                if (fullScreenApp) {
                    setFullScreenApp(false);
                }
                if (currentApp.name !== "none") {
                    setCurrentApp({ name: "none" });
                }
                else {
                    setTabIndex(-1);
                }
            }
        }
        else {
            if (tabIndex === APP_TYPES.MEDIA) {
                setFullScreenApp(false);
            }
            setTabIndex(index !== tabIndex ? index : -1);
        }
    }, [currentApp.name, fullScreenApp, setTabIndex, tabIndex]);

    useEffect(() => {
        subscribeChannel(MY_CHANNEL, [
            { signal: DriverTemperatureSetType, setter: setDriverTemperature },
            { signal: PassengerTemperatureSetType, setter: setPassengerTemperature }
        ]);

        return () => {
            unsubscribeChannel(MY_CHANNEL);
        };
    }, []);

    useEffect(() => {
        saveData("Car.Climate.DriverTemperature", driverTemperature);
        saveData("Car.Climate.PassengerTemperature", passengerTemperature);
    }, [driverTemperature, passengerTemperature]);

    return (
        <StyledDiv $APP_LEFT={APP_LEFT} $APP_HEIGHT={APP_HEIGHT} $tabIndex={tabIndex}
            style={{ backgroundColor: isDarkTheme ? "#000000" : "#ffffff" }}
        >
            <Tabs
                selectedIndex={tabIndex}
                onSelect={handleSelect}
                forceRenderTabPanel={true}
            >
                <TabList className="nav-bar-tab-list">
                    <Tab>
                        {touchscreenOpen &&
                            <NavigationBarItem
                                id="car-control"
                                itemIndex={APP_TYPES.CAR_CONTROL}
                                tabIndex={tabIndex}
                                iconPath={mdiCarSettings}
                            />
                        }
                    </Tab>
                    <Tab>
                        {touchscreenOpen &&
                            <NavigationBarItem
                                id="media"
                                itemIndex={APP_TYPES.MEDIA}
                                tabIndex={tabIndex}
                                Icon={LibraryMusic}
                            />
                        }
                    </Tab>
                    <Tab>
                        {touchscreenOpen &&
                            <NavigationBarItem
                                id="camera"
                                itemIndex={APP_TYPES.DASHCAM}
                                tabIndex={tabIndex}
                                Icon={VideoCameraBack}
                            />
                        }
                    </Tab>

                    {touchscreenOpen &&
                        <Box id="left-temp">
                            <TemperatureControl
                                index={0}
                                temperature={driverTemperature}
                                signalName={DriverTemperatureSetType.name}
                            />
                        </Box>
                    }
                    <Tab>
                        {touchscreenOpen &&
                            <NavigationBarItem
                                id="climate"
                                itemIndex={APP_TYPES.CLIMATE}
                                tabIndex={tabIndex}
                                iconPath={mdiAirConditioner}
                            />
                        }
                    </Tab>
                    {touchscreenOpen &&
                        <Box id="right-temp">
                            <TemperatureControl
                                index={1}
                                temperature={passengerTemperature}
                                signalName={PassengerTemperatureSetType.name}
                            />
                        </Box>
                    }

                    {touchscreenOpen &&
                        <Box id="volume-control">
                            <VolumeControl
                                refresh={volumeRefresh} setRefresh={setVolumeRefresh}
                                id="volume-control"
                            />
                        </Box>
                    }

                    <MyTooltip id="car-control" label="Car Controls" />
                    <MyTooltip id="media" label="Media Apps" />
                    <MyTooltip id="camera" label="Camera" />
                    <MyTooltip id="left-temp" label="Driver-side Temperature" />
                    <MyTooltip id="climate" label="Climate" />
                    <MyTooltip id="right-temp" label="Passenger-side Temperature" />
                    <MyTooltip id="volume-control" label="Volume Control" />
                </TabList>

                <div className="nav-bar-tab-panels">
                    <TabPanel>
                        <div
                            style={{
                                maxHeight: tabIndex === APP_TYPES.CAR_CONTROL ? APP_HEIGHT + "px" : "0vh",
                                transition: "all 0.3s ease",
                            }}
                        >
                            {touchscreenOpen && tabIndex === APP_TYPES.CAR_CONTROL &&
                                <CarControlTabs
                                    APP_HEIGHT={APP_HEIGHT}
                                />
                            }
                        </div>
                    </TabPanel>
                    <TabPanel>
                        <div
                            style={{
                                maxHeight: tabIndex === APP_TYPES.MEDIA ? APP_HEIGHT + "px" : "0vh",
                                transition: "all 0.3s ease",
                            }}
                        >
                            <MediaMain
                                APP_HEIGHT={APP_HEIGHT}
                                setVolumeRefresh={setVolumeRefresh}
                                currentApp={currentApp}
                                setCurrentApp={setCurrentApp}
                                fullScreenApp={fullScreenApp}
                                setFullScreenApp={setFullScreenApp}
                            />
                        </div>
                    </TabPanel>
                    <TabPanel>
                        <div
                            style={{
                                maxHeight: tabIndex === APP_TYPES.DASHCAM ? APP_HEIGHT + "px" : "0vh",
                                transition: "all 0.3s ease",
                            }}
                        >
                            {touchscreenOpen && tabIndex === APP_TYPES.DASHCAM &&
                                <Dashcam
                                    APP_HEIGHT={APP_HEIGHT}
                                />
                            }
                        </div>
                    </TabPanel>
                    <TabPanel>
                        <div
                            style={{
                                maxHeight: tabIndex === APP_TYPES.CLIMATE ? APP_HEIGHT * 7 / 10 + "px" : "0vh",
                                transition: "all 0.3s ease",
                            }}
                        >
                            {touchscreenOpen && tabIndex === APP_TYPES.CLIMATE &&
                                <ClimateControl
                                    APP_HEIGHT={APP_HEIGHT * 7 / 10}
                                />
                            }
                        </div>
                    </TabPanel>
                </div>
            </Tabs>

            {fullScreenApp && currentApp.name !== "none" &&
                // Chrome extension: 'ignore-x-frame-options' plays here!
                <Box
                    sx={{
                        left: 0, top: 0,
                        width: "100%", height: APP_HEIGHT, position: "absolute", zIndex: 200,
                        backgroundColor: isDarkTheme ? "#000000" : "#ffffff"
                    }}
                >
                    <Iframe url={"http://" + currentApp.url}
                        width={"100%"}
                        height={"100%"}
                        id={currentApp.name}
                        className={currentApp.name}
                        display="block"
                        position="relative"
                        frameBorder={0}
                    />
                </Box>
            }
        </StyledDiv>
    );
};

export default NavigationBar;

export const APP_TYPES = {
    CAR_CONTROL: 0,
    MEDIA: 1,
    DASHCAM: 2,
    CLIMATE: 3
};

const StyledDiv = styled.div`
	border-bottom-left-radius: 8px;
	border-bottom-right-radius: 8px;
	padding-top: 16px;
	padding-bottom: 16px;
	z-index: 10;
	height: 92px;

	.nav-bar-tab-list {
		margin: 0;
		list-style-type: none;
		padding: 0;
		padding-left: 96px;
		padding-right: 96px;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.nav-bar-tab-panels {
		position: absolute;
		bottom: 80px;
		right: 0px;
		left: ${(props) => ((props.$tabIndex === APP_TYPES.CAR_CONTROL || props.$tabIndex === APP_TYPES.MEDIA) ? props.$APP_LEFT : 0)}px;
		overflow: hidden;
	}
	.react-tabs {
		position: relative;
	}
	.react-tabs__tab-panel {
		max-height: 0;
		overflow: hidden;
	}
	.react-tabs__tab-panel.react-tabs__tab-panel--selected {
		max-height: ${(props) => (props.$APP_HEIGHT)}px;
	}
`;
