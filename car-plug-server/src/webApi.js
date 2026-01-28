
export const sendHttpRequest = async (query) => {
    let data;
    try {
        const res = await fetch(query, { method: 'GET' });
        data = await res.text();
    }
    catch (e) {
        //
    }
    return data;
};

export const getOpenWeather = async (apiKey, latitude, longitude, city) => {
    let url;
    if (latitude != null && longitude != null) {
        url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}`;
    }
    else if (city) {
        url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;
    }

    let data;
    if (url) {
        try {
            const res = await fetch(url, { method: 'GET' });
            data = await res.json();
        }
        catch (e) {
            //
        }
    }
    return data;
};

export const getRadioStreamingURLs = async (stationList) => {
    try {
        for (const station of stationList) {
            const url = "http://serpent0.duckdns.org:8088/" + station.pls;
            const res = await fetch(url, { method: 'GET' });
            const txt = await res.text();
            const lines = txt.split('\n');
            for (const line of lines) {
                const index = line.indexOf("File1=");
                if (index === 0) {
                    station.url = line.substring(6);
                }
            }
        }
    }
    catch (e) {
        //
    }
    return stationList;
};
