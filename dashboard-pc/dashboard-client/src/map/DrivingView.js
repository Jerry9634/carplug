import React, { useState, useEffect } from 'react';
import ReactStreetview from './ReactStreetview';

const MAP_API_KEY = process.env.REACT_APP_GOOGLE_API_KEY;

//class DrivingView extends React.Component {
const DrivingView = ({
	width,
	position,
	//center,
	setCenter,
	heading,
	setHeading,
	viewPoint, 
	setViewPoint,
	pitch,
	setPitch,
	autopilotOn,
	reqFromSV,
	setReqFromSV,
	mapMode
}) => {

	// see https://developers.google.com/maps/documentation/javascript
	const googleMapsApiKey = MAP_API_KEY;

	// see https://developers.google.com/maps/documentation/javascript/3.exp/reference#StreetViewPanoramaOptions
	const [streetViewPanoramaOptions, setStreetViewPanoramaOptions] = useState(null);

	const [reqFromMap, setReqFromMap] = useState(false);

	useEffect(() => {
		if (position != null) {
			let positionObj;
			if (typeof position.lat === "number") {
				positionObj = new window.google.maps.LatLng(position.lat, position.lng);
			}
			else {
				positionObj = new window.google.maps.LatLng(position.lat(), position.lng());
			}
			//console.log("Center Update From Map: " + positionObj.lat() + ", " + positionObj.lng());
			let userHeading = 0;
			let userPitch = 0;
			if (autopilotOn || mapMode !== "monitoring-mode") {
				userHeading = heading + viewPoint;
				userHeading = (userHeading + 360) % 360;
				userPitch = pitch;
			}
			 else {
				userHeading = heading;
				userPitch = pitch;
			}
			
			setStreetViewPanoramaOptions({
				position: positionObj,
				pov: { heading: userHeading, pitch: userPitch },
				zoom: 1
			});

			setReqFromMap(true);
			setTimeout(() => {
				// release
				setReqFromMap(false);
			}, 1000);
		}
	}, 
	[position, heading, viewPoint, pitch, autopilotOn, mapMode]);

	return (
		<div style={{
			width: width, //'768px',
			height: "100%", //'728px',
			backgroundColor: '#eeeeee'
		}}>
			{streetViewPanoramaOptions != null && 
			<ReactStreetview
				apiKey={googleMapsApiKey}
				streetViewPanoramaOptions={streetViewPanoramaOptions}
				onPositionChanged={newPos => {
					if (position != null && newPos != null && !autopilotOn) {
						const d = getDistance(position, newPos);
						if (d > 0) {
							//console.log("distance: " + d);
							if (!reqFromMap) {
								setCenter(newPos);
								setReqFromSV(true);
								setTimeout(() => {
									// release
									setReqFromSV(false);
								}, 1000);
							}
						}
					}
				}}
				onPovChanged={newPOV => {
					if (mapMode === "monitoring-mode") {
						setViewPoint(0);
						return;
					}
					if (newPOV != null) {
						if (autopilotOn) {
							const delta_raw = newPOV.heading - heading;
							const delta_abs = Math.abs(delta_raw);
							let delta = Number(Number(delta_abs/10).toFixed(0)) * 10;
							if (delta_raw < 0 && delta_abs !== 0) {
								delta = -delta;
							}
							const newViewPoint = (360 + delta) % 360;
							if (newViewPoint !== viewPoint) {
								//console.log("newViewPoint: " + newViewPoint);
								setViewPoint(newViewPoint);
							}
						}
						else {
							let newViewPoint = Number(Number(newPOV.heading/10).toFixed(0)) * 10;
							newViewPoint = (360 + newViewPoint) % 360;
							if (newViewPoint !== viewPoint) {
								//console.log("newHeading: " + newViewPoint);
								setViewPoint(newViewPoint);
							}
							setHeading(newPOV.heading);
						}

						let pitch_raw = (90 + newPOV.pitch) % 180 - 90;
						const pitch_abs = Math.abs(pitch_raw);
						let newPitch = Number(Number(pitch_abs / 10).toFixed(0)) * 10;
						if (pitch_raw < 0 && pitch_abs !== 0) {
							newPitch = -newPitch;
						}

						if (newPitch !== pitch) {
							//console.log("newPitch: " + newPitch);
							setPitch(newPitch);
						}
					}
				}}
			/>}
		</div>
	);
};

export default DrivingView;

export function getDistance(from, to) {
	return window.google.maps.geometry.spherical.computeDistanceBetween(from, to);
}

export function getHeading(from, to) {
	return (360 + window.google.maps.geometry.spherical.computeHeading(from, to)) % 360;
}

export function getNewLocation(from, distance, heading) {
	return window.google.maps.geometry.spherical.computeOffset(from, distance, heading);
}


