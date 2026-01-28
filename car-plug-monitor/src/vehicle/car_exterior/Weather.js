import { sendToServer } from "../../signal_db/VssSocket";
import { getData, saveData } from "../../persistency/PersistentMemory";
import vssApi from "../../signal_db/VssAPI.json";


const CurrentLocationType = vssApi.Vehicle.CurrentLocation;
const ExteriorType = vssApi.Vehicle.Exterior;

const OPEN_WEATHER_API_KEY = "da3bc6da125e18b23374ab6e9d11092a";


export const getCurrentWeather = (setWeatherData = null) => {
    const lat = getData(CurrentLocationType.Latitude.name);
    const lon = getData(CurrentLocationType.Longitude.name);
    if (lat != null && lon != null) {
        sendToServer("openweathermap", {
            apiKey: OPEN_WEATHER_API_KEY,
            latitude: lat,
            longitude: lon
        }, (data) => {
            //console.log(data);
            if (data) {
                if (data.main) {
                    saveData(ExteriorType.AirTemperature.name, Math.round(data.main.temp - 273.15));
                    saveData(ExteriorType.Humidity.name, data.main.humidity);
                }
                saveData("Car.Status.Weather", data);
                if (setWeatherData) {
                    setWeatherData(data);
                }
            }
        });
    }
};

/*
const example =
{
    "coord": { "lon": 126.9778, "lat": 37.5683 },
    "weather": [
        { "id": 501, "main": "Rain", "description": "moderate rain", "icon": "10n" }
    ],
    "base": "stations",
    "main": {
        "temp": 286.91,
        "feels_like": 286.95,
        "temp_min": 286.91,
        "temp_max": 286.91,
        "pressure": 1012,
        "humidity": 100,
        "sea_level": 1012,
        "grnd_level": 1002
    },
    "visibility": 10000,
    "wind": { "speed": 2.57, "deg": 110 },
    "rain": { "1h": 2.11 },
    "clouds": { "all": 100 },
    "dt": 1748024039,
    "sys": {
        "type": 1,
        "id": 8105,
        "country": "KR",
        "sunrise": 1748031399,
        "sunset": 1748083289
    },
    "timezone": 32400,
    "id": 1835848,
    "name": "Seoul",
    "cod": 200
};
*/