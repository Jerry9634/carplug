import { useEffect } from "react";
import { 
	GoogleMap, 
	Marker,
	DirectionsRenderer, 
} from '@react-google-maps/api';

var centerUpdateTimer = null;

const MyGoogleMap = (
	{ 
		map, setMap, 
		mapMode,
		center, setCenter, 
		zoom, mapContainerStyle, mapType, 
		heading, tilt, directionsResponse,
		autopilotOn,
	}
) => {

	const icon1 = {
		/*
		url: "./map/top-car-view.png",
		scaledSize: new window.google.maps.Size(48, 48),
		// anchor: { x: 10, y: 10 },
		anchor: new window.google.maps.Point(24, 24),
		scale: 2,
		*/
		
		path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
        scale: 6,
        fillColor: "red",
        fillOpacity: 0.8,
        strokeWeight: 2,
		rotation: getRotation()
	};

	useEffect(() => {
		return () => {
			// Release timers
			if (centerUpdateTimer != null) {
				clearTimeout(centerUpdateTimer);
			}
		};
	}, 
	// eslint-disable-next-line
	[]);

	function updateCenter() {
		if (centerUpdateTimer != null) {
			clearTimeout(centerUpdateTimer);
		}

		centerUpdateTimer = setTimeout(() => {
			centerUpdateTimer = null;
			if (map != null && !autopilotOn) {
				const newCenter = map.getCenter();
				if (newCenter != null) {
					setCenter(newCenter);
				}
			}
		}, 500);
	}

	function getNearestHeading() {
		if (mapMode === "monitoring-mode") {
			return 0;
		}
		let nearestHeading;
		if (map != null && autopilotOn) {
			nearestHeading = Math.round(heading / 90) * 90;
			map.setHeading(nearestHeading);
			map.setTilt(45);
		}
		else {
			nearestHeading = 0;
		}
		return nearestHeading;
	}

	function getRotation() {
		if (mapMode === "monitoring-mode") {
			return heading;
		}
		let rotation;
		if (map != null && map.getHeading() !== 0 && autopilotOn) {
			const nearestHeading = Math.round(heading / 90) * 90;
			rotation = (heading - nearestHeading);
		}
		else {
			rotation = heading;
		}
		return rotation;
	}

	return (
	<>
		<GoogleMap
			center={center}
			zoom={zoom}
			mapContainerStyle={mapContainerStyle}
			options={{
				zoomControl: false,
				//zoomControlOptions: {
				//	position: window.google.maps.ControlPosition.RIGHT_BOTTOM,
				//	style: window.google.maps.ZoomControlStyle.SMALL,
				//},
				mapTypeId: mapType,
				mapTypeControl: false,
				//mapTypeControlOptions: {
				//	position: window.google.maps.ControlPosition.TOP_RIGHT,
				//	style: window.google.maps.MapTypeControlStyle.DROPDOWN_MENU,
				//},
				streetViewControl: true,
				fullscreenControl: false,
				heading: getNearestHeading(),
				tilt: tilt,
			}}
			onLoad={(map) => setMap(map)}
			onCenterChanged={() => updateCenter()}
		>
			<Marker icon={icon1} position={center} />
			{directionsResponse && (
				<DirectionsRenderer directions={directionsResponse} />
			)}
		</GoogleMap>
	</>
	);
};

export default MyGoogleMap;