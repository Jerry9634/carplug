import styled from "styled-components";
import "./bootstrap.min.css";
import { useRef, useState, useEffect } from "react";
import { Autocomplete } from '@react-google-maps/api';
import { getDistance, getHeading, getNewLocation } from './DrivingView';

const MAP_INTERVAL = 1000;
const STREET_VIEW_INTERVAL = (5 * 1000 / MAP_INTERVAL); // street view refresh every 5 seconds

const SearchBox = (
	{
		timeTicks,
		autopilotOn, setAutopilotOn, 
		setDirectionsResponse,
		speed, setSpeed,
		setSignal,
		carPosition, setCarPosition,
		mapType, setMapType,
		zoom, setZoom,
		heading, setHeading, setViewPoint, setPitch,
		setPano, setStreetViewPosition, imageShots,
		appLayout,
		currentPosition
	}
) => {

	const originRef = useRef();
	const destinationRef = useRef();

	const [travelMode, setTravelMode] = useState("");
	const [directions, setDirections] = useState([]);
	const [activeDirection, setActiveDirection] = useState(0);
	const [routes, setRoutes] = useState([]);
	const [step, setStep] = useState(0);

	async function calculateRoute(travelModeReq = "DRIVING") {
		startStop("stop");
		if (originRef.current.value === "" || destinationRef.current.value === "") {
			return;
		}
		const directionsService = new window.google.maps.DirectionsService();
		let mode;
		if (travelModeReq === "DRIVING") {
			if (originRef.current.value.includes("대한민국")) {
				// Driving/Bicycle/Walking mode NOT avilable in Korea
				// Only Transit supported
				mode = window.google.maps.TravelMode.TRANSIT;
			}
			else {
				mode = window.google.maps.TravelMode.DRIVING;
			}
		}
		else {
			mode = travelModeReq;
		}
		
		const results = await directionsService.route({
			origin: originRef.current.value,
			destination: destinationRef.current.value,
			travelMode: mode,  
		});
		setDirectionsResponse(results);
		setTravelMode(mode);

		if (results.routes.length > 0) {
			//console.log(results);
			const newRoutes = [];
			const legs = results.routes[0].legs;
			for (let i = 0; i < legs.length; i++) {
				const steps = legs[i].steps;
				for (let j = 0; j < steps.length; j++) {
					const nextSegment = steps[j].path;
					for (let k = 0; k < nextSegment.length; k++) {
						const coord = nextSegment[k];
						newRoutes.push(coord);
					}
				}
			}
			setRoutes(newRoutes);
			makeDirections(results);
		}
	}

	function clearRoute() {
		setDirectionsResponse(null);
		originRef.current.value = "";
		destinationRef.current.value = "";

		setDirections([]);
		startStop("stop");
	}

	function setDeparturePoint(routes) {
		if (routes.length > 2) {
			const zeroStepCenter = routes[0];
			const nextStepCenter = routes[1];
			const hdng = getHeading(zeroStepCenter, nextStepCenter);
			const newCenter = getNewLocation(zeroStepCenter, 1, (hdng + 90) % 360);
			setCarPosition(newCenter);
			setHeading(hdng);
			setStep(0);
			setActiveDirection(0);
			imageShots.length = 0;

			setPano(newCenter, 50, true, true, true);
		}
	}

	useEffect(() => {
		if (autopilotOn) {
			forward();
		}
	}, 
	// eslint-disable-next-line
	[timeTicks]);

	function forward() {
        let curStep = step;
        let oldStep = curStep;
        let newStep = curStep + 1;
		let curDirection = activeDirection;

        if (newStep < routes.length) {
            const intervalTicks = 1; // camera sample every second
            
            if ((timeTicks % intervalTicks) === 0) {
                const delta_d = (speed * 1000 / 3600) * (MAP_INTERVAL * intervalTicks / 1000); // delta distance
                let remaining = delta_d;
                let actionCenter = carPosition;

                let newCenter = carPosition;
                let hdng = heading;
                
                while (remaining > 0) {
                    let distanceToNextStep = getDistance(actionCenter, routes[newStep]);
                    if (remaining < distanceToNextStep) {
                        hdng = getHeading(actionCenter, routes[newStep]);
                        newCenter = getNewLocation(actionCenter, remaining, hdng);
                        remaining = 0;
                    }
                    else {
                        remaining -= distanceToNextStep;
                        actionCenter = routes[newStep];
                        newCenter = actionCenter;
                        
                        const newNewStep = newStep + 1;
                        if (newNewStep < routes.length) {
                            hdng = getHeading(routes[newStep], routes[newNewStep]);
                        }
                        else {
                            hdng = getHeading(routes[oldStep], routes[newStep]);
                        }
                        
                        curStep = newStep;
                        oldStep++;
                        newStep++;
                        if (newStep === routes.length) {
                            remaining = 0;
                        }

						if (curDirection < (directions.length - 1)) {
							const distanceToMilestone = getDistance(newCenter, directions[curDirection].end_location);
							if (distanceToMilestone < delta_d) {
								curDirection++;
								setActiveDirection(curDirection);
							}
						}
                    }
                }

				setCarPosition(newCenter);
                setHeading(hdng);

				const distanceToMilestone = getDistance(newCenter, directions[curDirection].end_location);
				currentPosition.distanceToDirection = distanceToMilestone;
				if (curDirection < (directions.length - 1)) {
					currentPosition.maneuver = directions[curDirection + 1].maneuver;
					currentPosition.direction = directions[curDirection + 1].html_instructions;
				}
				else {
					currentPosition.maneuver = "";
					currentPosition.direction = "도착";
				}


                const dev = getDistance(newCenter, routes[curStep]);
                let svReqPoint;
                if (dev < 10) {
                    svReqPoint = routes[curStep];
                }
                else {
                    svReqPoint = newCenter;
                }

                setPano(svReqPoint, delta_d, 
                    travelMode === window.google.maps.TravelMode.DRIVING ? true : false,
                    false, true);

                if ((timeTicks % STREET_VIEW_INTERVAL) === 0 || curStep === (routes.length - 1)) {
                    if (imageShots.length > 0) {
                        setStreetViewPosition(imageShots[imageShots.length - 1]);
                    }
                }
                setStep(curStep);
            }
        }
        else {
            setStep(0);
            startStop("stop");
        }
	}

	function startStop(mode) {
		if (mode === "start") {
			setAutopilotOn(true);
		}
		else {
			setAutopilotOn(false);
		}
	}

	useEffect(() => {
		setPitch(0);
		setViewPoint(0);
		if (autopilotOn) {
			if (routes.length > 0) {
				setDeparturePoint(routes);
				let newSpeed;
				if (travelMode === window.google.maps.TravelMode.WALKING) {
					newSpeed = 5;
				}
				else {
					newSpeed = 50;
					setSignal("CLU_DisSpdVal", newSpeed);
					setSignal("VCU_GearPosSta", 5); // Gear D
				}
				setSpeed(newSpeed);
			}
		}
		else {
			if (speed > 0) {
				const newSpeed = 0;
				setSpeed(newSpeed);
				setSignal("CLU_DisSpdVal", newSpeed);
				setSignal("VCU_GearPosSta", 0); // Gear P
			}
		}
	},
	// eslint-disable-next-line
	[autopilotOn]);

	function speedUp() {
		let newSpeed = speed;
		if (travelMode === window.google.maps.TravelMode.WALKING) {
			newSpeed += 5;
		}
		else {
			newSpeed += 10;
		}
		if (newSpeed >= 1000) {
			newSpeed = 999;
		}
		newSpeed = Math.floor(newSpeed / 5) * 5;
		setSignal("CLU_DisSpdVal", newSpeed);
		setSpeed(newSpeed);
	}

	function speedDown() {
		let newSpeed = speed;
		if (travelMode === window.google.maps.TravelMode.WALKING) {
			newSpeed -= 5;
		}
		else {
			newSpeed -= 10;
		}
		if (newSpeed < 0) {
			newSpeed = 0;
		}
		newSpeed = Math.floor(newSpeed / 5) * 5;
		setSignal("CLU_DisSpdVal", newSpeed);
		setSpeed(newSpeed);
	}

	function makeDirections(results) {
		if (results != null) {
			const routes = results.routes;
			if (routes != null && routes.length > 0) {
				const legs = routes[0].legs;
				if (legs != null && legs.length > 0) {
					const steps = legs[0].steps;
					if (steps != null && steps.length > 0) {
						setDirections(steps);
						setActiveDirection(0);

						if (steps.length >= 2) {
							currentPosition.distanceToDirection = steps[0].distance.value;
							currentPosition.maneuver = steps[1].maneuver;
							currentPosition.direction = steps[1].html_instructions;
						}
					}
				}
			}
		}
	}

	function getInstructionTextStyle(idx) {
		const instructionTxtStyle = {
			width: "100%", minHeight: "24px", padding: "4px", 
			background: (idx === activeDirection) ? "yellow" : "rgba(255,255,255,0.8)",
			fontSize: (idx === activeDirection) ? "16px" : "14px"
		};
		return instructionTxtStyle;
	}

	function getInstructionValueStyle(idx) {
		const instructionValueStyle = {
			width: "100%", minHeight: "12px", padding: "4px", 
			background: (idx === activeDirection) ? "yellow" : "rgba(255,255,255,0.8)",
			fontSize: (idx === activeDirection) ? "16px" : "14px"
		};
		return instructionValueStyle;
	}

	function showDirections() {
		return( 
		<>
			<div style={{ display: "flex", justifyContent: "center", alignItems: "center",
						  width: (appLayout.carSideWidth === 0) ? "204px" : "204px", height: "24px", borderRadius: "4px",
					 	  background: "rgba(135, 206, 235, 1.0)" }}>
				{ getRemainingDistanceTxt() } &nbsp; | &nbsp; { getRemainingTimeTxt() }
			</div>
			<div key="directions"
				style={{ width: (appLayout.carSideWidth === 0) ? "204px" : "204px", 
						 height: "100%", maxHeight: "300px", 
						 border: "1px solid darkgrey", borderRadius: "4px", 
						 overflowY: "scroll" }}>
			{directions.map((direction, idx) =>
				<div key={"direction" + idx} >
				{idx >= activeDirection &&
				<>
					<div style={{ display: "flex", width: "100%" }}>
						<div style={getInstructionTextStyle(idx)}
							 dangerouslySetInnerHTML={{__html: idx < (directions.length - 1) ? directions[idx + 1].instructions : direction.instructions }}>
						</div>
						<div style={{ background: "rgba(0,0,0,0.7)" }}>
							{idx < (directions.length - 1) &&
								getDirectionImage(directions[idx + 1]) 
							}
						</div>
					</div>
					<div style={getInstructionValueStyle(idx)}>
						{ getRemainingStepDistance(idx) } &nbsp; { getRemainingStepTime(idx) } &nbsp; {idx < (directions.length - 1) && directions[idx + 1].maneuver }
					</div>
				</>}
				</div>
			)}
			</div>
		</>
		);
	}

	function getDirectionImage(direction) {
		let img = null;
		const maneuver = direction.maneuver;
		if (maneuver != null) {
			if (maneuver === "turn-left") {
				img = "./images/turn_left.svg";
			}
			else if (maneuver === "turn-right") {
				img = "./images/turn_right.svg";
			}
		}
		return (
			<>
			{img != null && 
				<img src={img} alt="" style={{ width: "32px", height: "32px" }}>
				</img>	
			}
			</>
		);
	}

	function getRemainingDistance() {
		let d = 0;
		if (directions.length > 0) {
			for (let i = activeDirection + 1; i < directions.length; i++) {
				d += directions[i].distance.value;
			}
			
			let currentLoc;
			if (autopilotOn) {
				currentLoc = carPosition;
			}
			else {
				if (activeDirection === (directions.length - 1)) {
					currentLoc = directions[activeDirection].end_location;
				}
				else {
					currentLoc = directions[activeDirection].start_location;
				}
			}
			d += getDistance(currentLoc, directions[activeDirection].end_location);
		}

		return d;
	}

	function getRemainingDistanceTxt(d = 0) {
		if (d === 0) {
			d = getRemainingDistance();
		}
		if (d >= 1000) {
			return Number(d/1000).toFixed(1) + " km";
		}
		else {
			return Number(d).toFixed(0)  + " m";
		}
	}

	function getRemainingTime() {
		let t = 0;
		if (directions.length > 0) {
			for (let i = activeDirection + 1; i < directions.length; i++) {
				t += directions[i].duration.value;
			}

			let currentLoc;
			if (autopilotOn) {
				currentLoc = carPosition;
			}
			else {
				if (activeDirection === (directions.length - 1)) {
					currentLoc = directions[activeDirection].end_location;
				}
				else {
					currentLoc = directions[activeDirection].start_location;
				}
			}

			if (directions[activeDirection].distance != null && directions[activeDirection].distance.value !== 0) {
				let d = getDistance(currentLoc, directions[activeDirection].end_location);
				t += (d * directions[activeDirection].duration.value) / directions[activeDirection].distance.value;
			}
		}
		
		return t;
	}

	function getRemainingTimeTxt(t = 0) {
		if (t === 0) {
			t = getRemainingTime();
		}
		if (t >= 60) {
			return Number(t/60).toFixed(0) + " min";
		}
		else {
			return Number(t).toFixed(0) + " sec";
		}
	}

	function getRemainingStepDistance(idx) {
		let d_meter;
		if (idx === activeDirection) {
			if (autopilotOn) {
				d_meter = getDistance(carPosition, directions[idx].end_location);
			}
			else {
				if (idx === 0) {
					d_meter = Number(directions[0].distance.value);
				}
				else {
					d_meter = 0;
				}
			}
		}
		else {
			d_meter = Number(directions[idx].distance.value);
		}
		
		return getRemainingDistanceTxt(d_meter);
	}

	function getRemainingStepTime(idx) {
		let time_sec;
		if (idx === activeDirection) {
			if (autopilotOn) {
				const d = getDistance(carPosition, directions[idx].end_location);
				time_sec = d * directions[idx].duration.value / directions[idx].distance.value;
			}
			else {
				if (idx === 0) {
					time_sec = Number(directions[0].duration.value);
				}
				else {
					time_sec = 0;
				}
			}
		}
		else {
			time_sec = Number(directions[idx].duration.value);
		}
		
		return getRemainingTimeTxt(time_sec);
	}

	function changeMapType() {
		if (mapType === "terrain") {
			setMapType("hybrid");
		}
		else {
			setMapType("terrain");
		}
	}

	function zoomIn() {
		let newZoom = zoom + 1;
		if (newZoom > 21) {
			newZoom = 21;
		}
		setZoom(newZoom);
	}

	function zoomOut() {
		let newZoom = zoom - 1;
		if (newZoom < 1) {
			newZoom = 1;
		}
		setZoom(newZoom);
	}

	return (
    <StyledDiv appLayout={appLayout} >
		<div className="searchbox">
			<div className="btn-row">
				{<Autocomplete onPlaceChanged={() => { }}>
					<input
						type="text"
						name="Origin"
						className="form-control"
						placeholder="Origin"
						ref={originRef}
					/>
				</Autocomplete>}
				{<Autocomplete>
					<input
						type="text"
						name="Destication"
						className="form-control"
						placeholder="Destication"
						ref={destinationRef}
					/>
				</Autocomplete>}
				<div>
					<button
						type="submit" name="submit" className="btn btn-primary"
						onClick={() => calculateRoute()} >
						Search
					</button>
					<button
						type="submit" name="clear" className="btn btn-danger"
						style={{ marginLeft: "4px" }}
						onClick={clearRoute} >
						Clear
					</button>
				</div>
				{directions.length > 0 &&
					<>
						{showDirections()}
						<div>
							<button className="btn btn-secondary"
								onClick={() => startStop(!autopilotOn ? "start" : "stop")} >
								{!autopilotOn ? "Start" : "Stop"}
							</button>
							<button className="btn btn-secondary"
								style={{ width: "48px", marginLeft: "4px" }}
								onClick={speedUp} >
								&uarr;
							</button>
							<button className="btn btn-secondary"
								style={{ width: "48px", marginLeft: "4px" }}
								onClick={speedDown} >
								&darr;
							</button>
						</div>
					</>
				}
				<div>
					<button
						className="btn btn-info"
						onClick={changeMapType} >
						{mapType === "terrain" ? "Roadmap" : "Satellite"}
					</button>
					<button className="btn btn-info"
						style={{ width: "48px", marginLeft: "4px" }}
						onClick={zoomIn} >
						+
					</button>
					<button className="btn btn-info"
						style={{ width: "48px", marginLeft: "4px" }}
						onClick={zoomOut} >
						&minus;
					</button>
				</div>
			</div>
		</div>
    </StyledDiv>
	);
};

export default SearchBox;

const StyledDiv = styled.div`
    .searchbox {
        background-color: transparent;
        position: absolute;
        left: 4px;
        top: 28px;
        z-index: 1;
        padding: 4px;

        .form-control {
            width: ${props => (props.appLayout.carSideWidth === 0 ? "204" : "204")}px;
            height: 30px;
            border-radius: 20px;
            font-size: 14px;
        }

        .btn-row {
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            align-items: start;
            width: 250px;
            gap: 8px;
            padding: 4px;
        }
    
        .btn {
            width: 100px;
            height: 24px;
            padding: 0;
            border-radius: 8px;
            font-size: 14px;
        }
    }
`;
