export const getDistance = (from, to) => {
    return window.google.maps.geometry.spherical.computeDistanceBetween(from, to);
};

export const getHeading = (from, to) => {
    return (360 + window.google.maps.geometry.spherical.computeHeading(from, to)) % 360;
};

export const getNewLocation = (from, distance, heading) => {
    const result = window.google.maps.geometry.spherical.computeOffset(from, distance, heading);
    return ({
        lat: result.lat(),
        lng: result.lng()
    });
};