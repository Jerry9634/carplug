import { LEFT_TASKBAR_WIDTH } from "./LeftTaskBar";

const CAR_STATUS_OVERLAY_WIDTH = 300;

const CarStatusOverlay = ( 
	{ 
		carStatusView, mapView, appLayout,
		gear, speed, distanceToEmpty
	} 
) => {

	const styledCarStatusOverlay = {
		container: {
			width: CAR_STATUS_OVERLAY_WIDTH,
			position: "absolute",
			top: 0,
			left: (carStatusView && mapView) ?
					(appLayout.screenWidth * 0.6 - LEFT_TASKBAR_WIDTH - CAR_STATUS_OVERLAY_WIDTH) / 2
					:
					(appLayout.screenWidth - LEFT_TASKBAR_WIDTH - CAR_STATUS_OVERLAY_WIDTH) / 2,
			backgroundColor: "white",
			opacity: 0.8,
			borderBottomLeftRadius: 8,
			borderBottomRightRadius: 8,
		},
	}

    return (
        <div style={styledCarStatusOverlay.container}>
            <div style={styledAlertSignals.container}>
                <div style={styledAlertSignals.turnSignals}>
                    {gear === "d" &&
                        <>
                            <img src={"./tesla/icons/turn-left.png"} style={styledAlertSignals.turnSignals.image} alt=""/>
                            <img src={"./tesla/icons/turn-right.png"} style={styledAlertSignals.turnSignals.image}  alt=""/>
                        </>
                    }
                </div>

                <div style={styledAlertSignals.distanceToEmpty}>
                    <div style={styledAlertSignals.distanceToEmpty.label}>
                        {distanceToEmpty} km
                    </div>
                    <img src={"./images/battery.png"} style={styledAlertSignals.distanceToEmpty.image}  alt=""/>
                </div>
            </div>
            {gear === "d" &&
                <div style={styledSpeedMeter.container}>
                    <div style={{ width: "50%", height: "100%", display: "flex", flexDirection: "row" }}>
                        <div style={{ width: "65%", height: "100%", justifyContent: "flex-end", alignItems: "center" }}>
							<div style={styledSpeedMeter.speed}>{speed}</div>
						</div>
                        <div style={{ width: "35%", height: "100%", display: "flex", justifyContent: "center", alignItems: "flex-end", paddingBottom: 16 }}>
							<div style={styledSpeedMeter.speedUnit}>km/h</div>
						</div>
                    </div>
                    <div style={{
                        width: "50%", height: "100%", display: "flex",
                        justifyContent: "flex-end", alignItems: "center", padding: 8
                    }}>
                        <img src={"./images/speed-limit.png"} style={styledSpeedMeter.image}  alt=""/>
                    </div>
                </div>
            }
        </div>
    );
};

export default CarStatusOverlay;

const styledAlertSignals = {
	container: {
		display: "flex",
		flexDirection: "row",
		justifyContent: "space-between",
		marginHorizontal: 8,
	},
	turnSignals: {
		display: "flex",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 32,

		image: {
			width: 32,
			height: 32,
		}
	},
	distanceToEmpty: {
		display: "flex",
		flexDirection: "row",
		alignItems: "center",
		gap: 8,

		label: {
			color: "#707070",
			fontSize: 16,
			fontWeight: "700",
		},

		image: {
			width: 32,
			height: 32,
		}
	},
};

const styledSpeedMeter = {
	container: {
		width: "100%",
		height: 64,
		display: "flex",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 8,
	},
	speed: {
		fontSize: 48,
		fontWeight: "700",
		textAlign: "right",
		color: "#000000",
	},
	speedUnit: {
		fontSize: 16,
		fontWeight: "700",
		textAlign: "left",
	},
	image: {
		width: 32,
		height: 32
	}
}
