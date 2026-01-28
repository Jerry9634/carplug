import React from 'react';
import PropTypes from 'prop-types';
import asyncLoading from 'react-async-loader';

let myStreetView = null;
let positionChanged = false;
let povChanged = false;


class ReactStreetview extends React.Component {

    divRef = React.createRef(null);

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

            this.streetView.addListener('position_changed', () => {
                if (this.props.onPositionChanged) {
                    this.props.onPositionChanged(this.streetView.getPosition());
                    positionChanged = true;
                }
            });

            this.streetView.addListener('pov_changed', () => {
                if (this.props.onPovChanged) {
                    this.props.onPovChanged(this.streetView.getPov());
                    povChanged = true;
                }
            });

            myStreetView = this.streetView;
            myStreetView.setOptions({
                addressControl: false,
                addressControlOptions: {
                    position: window.google.maps.ControlPosition.TOP_RIGHT
                },
                linksControl: this.props.showControls,
                panControl: this.props.showControls,
                enableCloseButton: false,
                fullscreenControl: this.props.showControls,
                zoomControl: false
            });
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
        if (myStreetView) {
            if (positionChanged || povChanged) {
                const newPosition = myStreetView.getPosition();
                if (state.position && newPosition) {
                    return {
                        position: newPosition,
                        pov: myStreetView.getPov(),
                        zoom: myStreetView.getZoom()
                    };
                }
                positionChanged = false;
                povChanged = false;
            }
            else {
                const newPosition = props.streetViewPanoramaOptions.position;
                const oldPosition = state.position;
                const mapPOV = props.streetViewPanoramaOptions.pov;
                if (newPosition && oldPosition && mapPOV && mapPOV.heading != null) {
                    const d = window.google.maps.geometry.spherical.computeDistanceBetween(newPosition, oldPosition);
                    const newHeading = mapPOV.heading;
                    const oldHeading = state.pov.heading;
                    if (d > 0 || Math.abs(newHeading - oldHeading) > 0) {
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

ReactStreetview.propTypes = {
    apiKey: PropTypes.string.isRequired,
    streetViewPanoramaOptions: PropTypes.object.isRequired,
    onPositionChanged: PropTypes.func,
    onPovChanged: PropTypes.func
};

ReactStreetview.defaultProps = {
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

export default asyncLoading(mapScriptsToProps)(ReactStreetview);