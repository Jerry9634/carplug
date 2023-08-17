import styled from "styled-components";
import React, { useEffect } from "react";

const WEATHER_API_KEY = process.env.REACT_APP_TOWN_WEATHER_API_KEY;

const weatherForecast = {
    times: [],
    values: []
};

const Weather = ({ weatherReq, setWeatherReq, setModalOpen, currentWeather }) => {
    useEffect(() => {
        if (weatherReq) {
            checkWeatherHere();
            setWeatherReq(false);
        }
    }, 
    // eslint-disable-next-line 
    [weatherReq]);

    function decodeWeatherInfo(cat, val) {
        if (val == null) {
            return "-";
        }
        var ret = val;
        switch (String(cat)) {
            case "T1H":
                ret = val + " ℃";
                break;
            case "RN1":
                if (val === "강수없음") {
                    val = "0";
                }
                ret = val + " mm";
                break;
            case "PTY":
                ret = "";
                // 강수상태코드 [없음(0), 비(1), 비/눈(2), 눈(3), 소나기(4)]
                if (val === "0") {
                    ret += "없음(" + val + ")";
                }
                else if (val === "1") {
                    ret += "비(" + val + ")";
                }
                else if (val === "2") {
                    ret += "비/눈(" + val + ")";
                }
                else if (val === "3") {
                    ret += "눈(" + val + ")";
                }
                else if (val === "4") {
                    ret += "소나기(" + val + ")";
                }
                break;
            case "REH":
                ret = val + " %";
                break;
            case "WSD":
                ret = val + " m/s";
                break;
            case "VEC": // 풍향
                ret = val + " deg";
                break;
            case "UUU": // 동서 바람 성분
                ret = val + " m/s";
                break;
            case "VVV": // 남북 바람 성분
                ret = val + " m/s";
                break;
            case "LGT": // 낙뢰
                ret = "";
                // 낙뢰(LGT) 초단기예보 코드: 확률없음(0), 낮음(1), 보통(2), 높음(3)
                if (val === "0") {
                    ret += "확률 없음(" + val + ")";
                }
                else if (val === "1") {
                    ret += "낮음(" + val + ")";
                }
                else if (val === "2") {
                    ret += "보통(" + val + ")";
                }
                else if (val === "3") {
                    ret += "높음(" + val + ")";
                }
                break;
            case "SKY": // 하늘 상태
                ret = "";
                // 하늘상태코드 [맑음(1), 구름조금(2), 구름많음(3), 흐림(4)]
                if (val === "1") {
                    ret += "맑음(" + val + ")";
                }
                else if (val === "2") {
                    ret += "구름 조금(" + val + ")";
                }
                else if (val === "3") {
                    ret += "구름 많음(" + val + ")";
                }
                else if (val === "4") {
                    ret += "흐림(" + val + ")";
                }
                break;
            case "baseTime":
            case "fcstTime":
                ret = val.substring(0, 2) + ":" + val.substring(2);
                break;
            default:
                break;
        }
        return ret;
    }
    
    function checkWeatherHere() {
        navigator.geolocation.getCurrentPosition((position) => {
            const { latitude, longitude } = position.coords;
            let needsUpdate = false;
            if (currentWeather.time !== "") {
                if (weatherForecast.values.length <= 1) {
                    needsUpdate = true;
                }
                else {
                    if (weatherForecast.times[0] !== currentWeather.time) {
                        needsUpdate = true;
                    }
                }
            }
            
            if (needsUpdate) {
                weatherForecast.times.length = 0;
                weatherForecast.values.length = 0;

                weatherForecast.times[0] = currentWeather.time;
                weatherForecast.values[0] = currentWeather.value;
                
                let hours = Number(currentWeather.time.substring(0, 2));                
                
                for (let i = 1; i < 7; i++) {
                    hours++;
                    if (hours === 24) {
                        hours = 0;
                    }

                    let fcstTime = hours * 100;
                    let fcstTimeStr = fcstTime.toString();
                    if (hours === 0) {
                        fcstTimeStr = "0000";
                    }
                    else if (hours < 10) {
                        fcstTimeStr = "0" + fcstTimeStr;
                    }
                    weatherForecast.times[i] = fcstTimeStr;
                    //weatherForecast.values[i] = {};
                }
                
                checkWeather(latitude, longitude, "getUltraSrtFcst", (items) => {
                    for (const item of items) {
                        let index = -1;
                        for (let i = 1; i < weatherForecast.times.length; i++) {
                            if (weatherForecast.times[i] === item.fcstTime) {
                                index = i;
                                break;
                            }
                        }
                        if (index === weatherForecast.values.length) {
                            weatherForecast.values[index] = {};
                        }
                        if (index > 0) {
                            (weatherForecast.values[index])[item.category] = item.fcstValue;
                        }
                    }
                });
            }
    
            setModalOpen(true);
        });
    }

    return (
        <StyledDiv>
        {weatherForecast.times.length > 0 ?
        <div className="content">
            <header className="header">
                <h2>목적지 날씨</h2>
            </header>

            <div className="center">
                <table className="w3-table-all">
                    <thead>
                        
                    </thead>
                    <tbody>
                        <tr>
                            <th>시간</th>
                            {weatherForecast.times.map((time, idx) =>
                            <th key={idx}>{decodeWeatherInfo("baseTime", time)}</th>
                            )}
                        </tr>
                        <tr>
                            <th>기온</th>
                            {weatherForecast.times.map((time, idx) =>
                            <td key={idx}>
                                {decodeWeatherInfo("T1H", (idx < weatherForecast.values.length ? (weatherForecast.values[idx])["T1H"] : null))}
                            </td>
                            )}
                        </tr>
                        <tr>
                            <th>습도</th>
                            {weatherForecast.times.map((time, idx) =>
                            <td key={idx}>
                                {decodeWeatherInfo("REH", (idx < weatherForecast.values.length ? (weatherForecast.values[idx])["REH"] : null))}
                            </td>
                            )}
                        </tr>
                        <tr>
                            <th>1시간 강수량</th>
                            {weatherForecast.times.map((time, idx) =>
                            <td key={idx}>
                                {decodeWeatherInfo("RN1", (idx < weatherForecast.values.length ? (weatherForecast.values[idx])["RN1"] : null))}
                            </td>
                            )}
                        </tr>
                        <tr>
                            <th>강수 형태</th>
                            {weatherForecast.times.map((time, idx) =>
                            <td key={idx}>
                                {decodeWeatherInfo("PTY", (idx < weatherForecast.values.length ? (weatherForecast.values[idx])["PTY"] : null))}
                            </td>
                            )}
                        </tr>
                        <tr>
                            <th>풍속</th>
                            {weatherForecast.times.map((time, idx) =>
                            <td key={idx}>
                                {decodeWeatherInfo("WSD", (idx < weatherForecast.values.length ? (weatherForecast.values[idx])["WSD"] : null))}
                            </td>
                            )}
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        : null }
        </StyledDiv>
    );
}

export function checkWeather(lat, lng, reqType, callback) {
    var xy = dfs_xy_conv("toXY", lat, lng);

    var date = new Date();
    var dateString = String(date.getFullYear());
    var month = date.getMonth() + 1;
    var monthString = String(month);
    if (month < 10) {
        monthString = "0" + monthString;
    }
    dateString = dateString.concat(monthString);
    var day = date.getDate();
    var dayString = String(day);
    if (day < 10) {
        dayString = "0" + dayString;
    }
    dateString = dateString.concat(dayString);
    //console.log(dateString);
    var hour = date.getHours();
    var hourString = String(hour);
    if (hour < 10) {
        hourString = "0" + hour;
    }
    var min = date.getMinutes();
    var minString = String(min);
    if (min < 10) {
        minString = "0" + min;
    }
    var timeString = hourString + minString;
    //console.log(timeString);

    // T1H(기온 ℃), RN1(1시간 강수량 mm), UUU(동서바람성분 m/s), VVV(남북바람성분 m/s), 
    // REH(습도 %), PTY(강수형태), VEC(풍향 deg), WSD(풍속 m/s)
    var url = "http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/" + reqType; /*URL*/
    var queryParams = '?' + encodeURIComponent('serviceKey') + '=' + WEATHER_API_KEY; /*Service Key*/
    queryParams += '&' + encodeURIComponent('pageNo') + '=' + encodeURIComponent('1'); /**/
    queryParams += '&' + encodeURIComponent('numOfRows') + '=' + encodeURIComponent('1000'); /**/
    queryParams += '&' + encodeURIComponent('dataType') + '=' + encodeURIComponent('JSON'); /**/
    queryParams += '&' + encodeURIComponent('base_date') + '=' + encodeURIComponent(dateString); /**/
    queryParams += '&' + encodeURIComponent('base_time') + '=' + encodeURIComponent(timeString); /**/
    queryParams += '&' + encodeURIComponent('nx') + '=' + encodeURIComponent(xy.x); /**/
    queryParams += '&' + encodeURIComponent('ny') + '=' + encodeURIComponent(xy.y); /**/

    fetch(url + queryParams)
    .then((res) => res.json())
    .then((json) => {
        if (json.response.header.resultCode === "00") {
            callback(json.response.body.items.item);
        }
        else {
            //console.log(url + queryParams);
            //console.log(json);
        }
    });
}

//
// LCC DFS 좌표변환을 위한 기초 자료
//
const RE = 6371.00877; // 지구 반경(km)
const GRID = 5.0; // 격자 간격(km)
const SLAT1 = 30.0; // 투영 위도1(degree)
const SLAT2 = 60.0; // 투영 위도2(degree)
const OLON = 126.0; // 기준점 경도(degree)
const OLAT = 38.0; // 기준점 위도(degree)
const XO = 43; // 기준점 X좌표(GRID)
const YO = 136; // 기1준점 Y좌표(GRID)
//
// LCC DFS 좌표변환 ( code : "toXY"(위경도->좌표, v1:위도, v2:경도), "toLL"(좌표->위경도,v1:x, v2:y) )
//
function dfs_xy_conv(code, v1, v2) {
    var DEGRAD = Math.PI / 180.0;
    var RADDEG = 180.0 / Math.PI;

    var re = RE / GRID;
    var slat1 = SLAT1 * DEGRAD;
    var slat2 = SLAT2 * DEGRAD;
    var olon = OLON * DEGRAD;
    var olat = OLAT * DEGRAD;

    var sn = Math.tan(Math.PI * 0.25 + slat2 * 0.5) / Math.tan(Math.PI * 0.25 + slat1 * 0.5);
    sn = Math.log(Math.cos(slat1) / Math.cos(slat2)) / Math.log(sn);
    var sf = Math.tan(Math.PI * 0.25 + slat1 * 0.5);
    sf = Math.pow(sf, sn) * Math.cos(slat1) / sn;
    var ro = Math.tan(Math.PI * 0.25 + olat * 0.5);
    ro = re * sf / Math.pow(ro, sn);
    var rs = {};
    if (code === "toXY") {
        rs['lat'] = v1;
        rs['lng'] = v2;
        var ra = Math.tan(Math.PI * 0.25 + (v1) * DEGRAD * 0.5);
        ra = re * sf / Math.pow(ra, sn);
        var theta = v2 * DEGRAD - olon;
        if (theta > Math.PI) theta -= 2.0 * Math.PI;
        if (theta < -Math.PI) theta += 2.0 * Math.PI;
        theta *= sn;
        rs['x'] = Math.floor(ra * Math.sin(theta) + XO + 0.5);
        rs['y'] = Math.floor(ro - ra * Math.cos(theta) + YO + 0.5);
    }
    else {
        rs['x'] = v1;
        rs['y'] = v2;
        var xn = v1 - XO;
        var yn = ro - v2 + YO;
        ra = Math.sqrt(xn * xn + yn * yn);
        if (sn < 0.0) {
            ra = - ra;
        }
        var alat = Math.pow((re * sf / ra), (1.0 / sn));
        alat = 2.0 * Math.atan(alat) - Math.PI * 0.5;

        if (Math.abs(xn) <= 0.0) {
            theta = 0.0;
        }
        else {
            if (Math.abs(yn) <= 0.0) {
                theta = Math.PI * 0.5;
                if (xn < 0.0) {
                    theta = - theta;
                }
            }
            else {
                theta = Math.atan2(xn, yn);
            }
        }
        var alon = theta / sn + olon;
        rs['lat'] = alat * RADDEG;
        rs['lng'] = alon * RADDEG;
    }
    return rs;
}

export default Weather;

const StyledDiv = styled.div`
    .content{
	    margin: auto;
	    position: relative;
	    padding: 16px;
	    outline: 0;
        padding-top: 16px;

	    display: flex;
	    flex-direction: column;
    }
	.header {
		padding: 8px;
		text-align: center;
		height: 64px;
	}
	.center {
		padding: 16px;
	}
	.footer {
		padding: 16px;
		text-align: center;
		height: 50px;
		.title {
			padding: 8px 8px;
			width: 100%;
		}
	}

	.w3-table,.w3-table-all{border-collapse:collapse;border-spacing:0;width:100%;display:table}.w3-table-all{border:1px solid #ccc}
	.w3-bordered tr,.w3-table-all tr{border-bottom:1px solid #ddd}.w3-striped tbody tr:nth-child(even){background-color:#f1f1f1}
	.w3-table-all tr:nth-child(odd){background-color:#fff}.w3-table-all tr:nth-child(even){background-color:#f1f1f1}
	.w3-hoverable tbody tr:hover,.w3-ul.w3-hoverable li:hover{background-color:#ccc}.w3-centered tr th,.w3-centered tr td{text-align:center}
	.w3-table td,.w3-table th,.w3-table-all td,.w3-table-all th{padding:8px 8px;display:table-cell;text-align:left;vertical-align:top}
	.w3-table th:first-child,.w3-table td:first-child,.w3-table-all th:first-child,.w3-table-all td:first-child{padding-left:16px}
`;