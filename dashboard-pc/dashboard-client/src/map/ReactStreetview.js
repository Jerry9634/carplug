import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import asyncLoading from 'react-async-loader';

var myStreetView = null;
var positionChanged = false;

class ReactStreetview extends React.Component {

	constructor(props) {
		super();
		this.state = {
			position : props.streetViewPanoramaOptions.position,
			pov: props.streetViewPanoramaOptions.pov, 
			zoom: props.streetViewPanoramaOptions.zoom, 
		};
	}

	initialize (canvas) {
		if (this.props.googleMaps && this.streetView == null) {
			this.streetView = new this.props.googleMaps.StreetViewPanorama(
				canvas,
				this.props.streetViewPanoramaOptions
			);

			this.streetView.addListener('position_changed',() => {
				if (this.props.onPositionChanged) {
					this.props.onPositionChanged(this.streetView.getPosition());
					positionChanged = true;
				}
			});

			this.streetView.addListener('pov_changed',() => {
				if (this.props.onPovChanged) {
					this.props.onPovChanged(this.streetView.getPov());
				}
			});

			myStreetView = this.streetView;
			myStreetView.setOptions({
				addressControl: false,
				addressControlOptions: {
					position: window.google.maps.ControlPosition.TOP_RIGHT
				},
				linksControl: true,
				panControl: true,
				enableCloseButton: false,
				fullscreenControl: false,
				zoomControl: false,
			});
		}
	}

	componentDidMount () {
		this.initialize(ReactDOM.findDOMNode(this));
	}

	componentDidUpdate () {
		this.initialize(ReactDOM.findDOMNode(this));
	}
	componentWillUnmount () {
		if (this.streetView) {
			this.props.googleMaps.event.clearInstanceListeners(this.streetView);
		}
	}

	static getDerivedStateFromProps(props, state) {
		if (myStreetView != null) {
			if (positionChanged) {
				const newPosition = myStreetView.getPosition();
				if (state.position != null && newPosition != null) {
					const d = window.google.maps.geometry.spherical.computeDistanceBetween(newPosition, state.position);
					if (d > 0) {
						return {
							position: newPosition,
							pov: myStreetView.getPov(),
							zoom: myStreetView.getZoom(),
						};
					}
				}
				positionChanged = false;
			}
			else {
				const mapPosition = props.streetViewPanoramaOptions.position;
				const viewPosition = state.position;
				if (mapPosition != null && viewPosition != null) {
					const d = window.google.maps.geometry.spherical.computeDistanceBetween(mapPosition, viewPosition);
					if (d > 0) {
						//console.log("distance: " + d);
						myStreetView.setPosition(mapPosition);
						const mapPOV = props.streetViewPanoramaOptions.pov;
						let newPov = myStreetView.getPov();
						newPov = { heading: mapPOV.heading, pitch: newPov.pitch }
						myStreetView.setPov(newPov);
						return {
							position: mapPosition,
							pov: newPov,
							zoom: myStreetView.getZoom(),
						};
					}
				}
			}
		}
		return null; // No change to state
    }

	render () {
		return <div
			style = {{
				height: '100%'
			}}
		></div>;
	}
}

ReactStreetview.propTypes = {
	apiKey: PropTypes.string.isRequired,
	streetViewPanoramaOptions: PropTypes.object.isRequired,
	onPositionChanged: PropTypes.func,
	onPovChanged: PropTypes.func
};

ReactStreetview.defaultProps = {
	streetViewPanoramaOptions : {
		position: {lat: 46.9171876, lng: 17.8951832},
		pov: {heading: 0, pitch: 0},
		zoom: 1,
	}
};

function mapScriptsToProps (props) {
	const googleMapsApiKey = props.apiKey;
	return {
		googleMaps: {
			globalPath: 'google.maps',
			url: 'https://maps.googleapis.com/maps/api/js?key=' + googleMapsApiKey,
			jsonp: true
		}
	};
}

export default asyncLoading(mapScriptsToProps)(ReactStreetview);