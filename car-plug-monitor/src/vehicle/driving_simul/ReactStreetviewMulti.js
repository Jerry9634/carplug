import React from 'react';
import PropTypes from 'prop-types';
import asyncLoading from 'react-async-loader';


class ReactStreetviewMulti extends React.Component {

    divRef = React.createRef(null);

    static svMap = new Map();

    constructor(props) {
        super();
        this.state = {
            position: props.streetViewPanoramaOptions.position,
            pov: props.streetViewPanoramaOptions.pov,
            zoom: props.streetViewPanoramaOptions.zoom
        };
    }

    initialize(canvas) {
        if (this.props.googleMaps && this.streetView == null) {
            this.streetView = new this.props.googleMaps.StreetViewPanorama(
                canvas,
                this.props.streetViewPanoramaOptions
            );

            this.streetView.setOptions({
                addressControl: false,
                addressControlOptions: {
                    position: window.google.maps.ControlPosition.TOP_RIGHT
                },
                linksControl: false,
                panControl: false,
                enableCloseButton: false,
                fullscreenControl: false,
                zoomControl: false
            });
            ReactStreetviewMulti.svMap.set(this.props.viewId, this.streetView);
        }
    }

    componentDidMount() {
        this.initialize(this.divRef.current);
    }

    componentDidUpdate() {
        this.initialize(this.divRef.current);
    }
    componentWillUnmount() {
        if (this.streetView) {
            this.props.googleMaps.event.clearInstanceListeners(this.streetView);
        }
    }

    static getDerivedStateFromProps(props, state) {
        const myStreetView = ReactStreetviewMulti.svMap.get(props.viewId);
        if (myStreetView) {
            const newPosition = props.streetViewPanoramaOptions.position;
            const oldPosition = state.position;
            const mapPOV = props.streetViewPanoramaOptions.pov;
            if (newPosition && oldPosition && mapPOV && mapPOV.heading != null) {
                const d = window.google.maps.geometry.spherical.computeDistanceBetween(newPosition, oldPosition);                
                const newHeading = mapPOV.heading;
                const oldHeading = state.pov.heading;
                if (d > 0 || (newHeading !== oldHeading)) {
                    myStreetView.setPosition(newPosition);
                    console.log(mapPOV);
                    const newPov = { heading: mapPOV.heading, pitch: mapPOV.pitch };
                    myStreetView.setPov(newPov);
                    myStreetView.setZoom(1);

                    return {
                        position: newPosition,
                        pov: newPov,
                        zoom: 1
                    };
                }
            }
        }
        return null; // No change to state
    }

    render() {
        return (
            <div
                ref={this.divRef}
                style={{
                    height: '100%'
                }}
            />
        );
    }
}

ReactStreetviewMulti.propTypes = {
    apiKey: PropTypes.string.isRequired,
    streetViewPanoramaOptions: PropTypes.object.isRequired,
    onPositionChanged: PropTypes.func,
    onPovChanged: PropTypes.func
};

ReactStreetviewMulti.defaultProps = {
    streetViewPanoramaOptions: {
        position: { lat: 46.9171876, lng: 17.8951832 },
        pov: { heading: 0, pitch: 0 },
        zoom: 1
    }
};

const mapScriptsToProps = (props) => {
    const googleMapsApiKey = props.apiKey;
    return {
        googleMaps: {
            globalPath: 'google.maps',
            url: 'https://maps.googleapis.com/maps/api/js?key=' + googleMapsApiKey,
            jsonp: true
        }
    };
};

export default asyncLoading(mapScriptsToProps)(ReactStreetviewMulti);