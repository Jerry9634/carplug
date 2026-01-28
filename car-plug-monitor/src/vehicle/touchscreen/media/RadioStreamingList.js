import { useCallback } from "react";

import { sendToServer } from "../../../signal_db/VssSocket";

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';


const RadioStreamingList = ({
    stations,
    setCurrentStation,
    setCurrentPlaying,
    setIsPlaying,
    isDarkTheme
}) => {

    const startPlay = useCallback((station, index) => {
        if (station.url.length > 0) {
            setCurrentStation(index);
            setCurrentPlaying(station);
            setIsPlaying(true);
        }
    }, [setCurrentPlaying, setCurrentStation, setIsPlaying]);

    const getStationImg = useCallback((channel) => {
        if (isDarkTheme) {
            if (channel.darkImage) {
                return channel.darkImage;
            }
        }
        return channel.image;
    }, [isDarkTheme]);

    return (
        <>
            {stations.map((station, idx) =>
                <Box sx={styledView} key={idx}>
                    <Card sx={styledView.innerBorder}>
                        <CardActionArea sx={{ width: 1, height: 1 }}
                            onClick={() => startPlay(station, idx)}
                        >
                            <CardContent sx={{ width: 1, height: 1 }}>
                                <Stack sx={{ width: 1, height: 1, justifyContent: "flex-start", alignItems: "flex-start" }}>
                                    <Box sx={{ width: 1, height: "40%", justifyContent: "center", alignItems: "flex-start" }}>
                                        <img
                                            src={getStationImg(station)}
                                            style={
                                                station.name.includes("BBC") ?
                                                    { width: 180, height: 40 }
                                                    :
                                                    { width: 208, height: 24 }
                                            }
                                            alt=""
                                        />
                                    </Box>
                                    <Stack sx={{ height: "60%" }}>
                                        <Typography gutterBottom variant="h6" component="div">
                                            {station.name}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                            {station.desc}
                                        </Typography>
                                    </Stack>
                                </Stack>
                            </CardContent>
                        </CardActionArea>
                    </Card>
                </Box>
            )}
        </>
    );
};

const allStations = {
    korStations : [],
    bbcStations: [],
    timeoutHandle: null,
    init: false
};

const getInternetStations = () => {
    if (allStations.korStations.length === 0 || allStations.bbcStations.length === 0) {
        allStations.bbcStations = bbcList;
        allStations.korStations = korList;
    }

    for (const entry of allStations.korStations) {
        if (!entry.url || entry.url.length === 0) {
            allStations.init = false;
            allStations.timeoutHandle = null;
            break;
        }
    }

    if (!allStations.init && !allStations.timeoutHandle) {
        allStations.timeoutHandle = setTimeout(() => {
            const korList1 = [];
            for (const station of allStations.korStations) {
                korList1.push({
                    pls: station.pls
                });
            }
            sendToServer("internet-radios", korList1, (msg) => {
                if (msg && korList1.length === msg.length) {
                    for (let i = 0; i < msg.length; i++) {
                        const url = msg[i].url;
                        if (url) {
                            allStations.korStations[i].url = url;
                        }
                    }
                    allStations.init = true;
                }
            });
            allStations.timeoutHandle = null;
        }, 0);
    }

    return allStations;
};

const korList = [
    {
        "name": "MBC FM4U",
        "desc": "대중 음악",
        "pls": "mbcfm.pls",
        "url": "",
        "image": "./touchscreen/kor_radios/mbc_fm4u.png"
    },
    {
        "name": "MBC 표준 FM",
        "desc": "종합 방송 : 뉴스, 시사, 교양, 대중 음악",
        "pls": "mbcsfm.pls",
        "url": "",
        "image": "./touchscreen/kor_radios/mbc_sfm.png"
    },
    {
        "name": "TBS FM",
        "desc": "수도권 교통, 생활정보 채널",
        "pls": "tbsfm.pls",
        "url": "",
        "image": "./touchscreen/kor_radios/tbs_fm.png"
    },
    {
        "name": "EBS FM",
        "desc": "교육 방송 FM",
        "pls": "ebsfm.pls",
        "url": "",
        "image": "./touchscreen/kor_radios/ebs_fm.png"
    },
    {
        "name": "KBS 1 Radio",
        "desc": "뉴스, 시사, 교양",
        "pls": "kbs1radio.pls",
        "url": "",
        "image": "./touchscreen/kor_radios/kbs_1radio.png"
    },
    {
        "name": "KBS 해피 FM",
        "desc": "중장년층 대상 대중 음악",
        "pls": "kbs2radio.pls",
        "url": "",
        "image": "./touchscreen/kor_radios/kbs_happy_fm.png"
    },
    {
        "name": "KBS 클래식 FM",
        "desc": "서양 고전 음악 및 한국 국악",
        "pls": "kbsfm.pls",
        "url": "",
        "image": "./touchscreen/kor_radios/kbs_classic_fm.png"
    },
    {
        "name": "KBS 쿨 FM",
        "desc": "젊은층 대상 대중 음악",
        "pls": "kbs2fm.pls",
        "url": "",
        "image": "./touchscreen/kor_radios/kbs_cool_fm.png"
    },
    {
        "name": "SBS 파워 FM",
        "desc": "대중 음악",
        "pls": "sbsfm.pls",
        "url": "",
        "image": "./touchscreen/kor_radios/sbs_power_fm.png"
    },
    {
        "name": "SBS 러브 FM",
        "desc": "종합 방송 : 뉴스, 시사, 교양, 대중 음악",
        "pls": "sbs2fm.pls",
        "url": "",
        "image": "./touchscreen/kor_radios/sbs_love_fm.png"
    }
];

const bbcList = [
    {
        "name": "BBC Radio 1",
        "desc": "Contemporary Hit Radio",
        "url": "http://as-hls-ww-live.akamaized.net/pool_01505109/live/ww/bbc_radio_one/bbc_radio_one.isml/bbc_radio_one-audio%3d96000.norewind.m3u8",
        "image": "./touchscreen/bbc_radios/bbc_radio1.png",
        "darkImage": "./touchscreen/bbc_radios/bbc_radio1_dark.png"
    },
    {
        "name": "BBC Radio 1 Extra",
        "desc": "Urban contemporary, electronica, hip hop, R&B, soul",
        "url": "http://as-hls-ww-live.akamaized.net/pool_92079267/live/ww/bbc_1xtra/bbc_1xtra.isml/bbc_1xtra-audio%3d96000.norewind.m3u8",
        "image": "./touchscreen/bbc_radios/bbc_radio1_extra.png",
        "darkImage": "./touchscreen/bbc_radios/bbc_radio1_extra_dark.png"
    },
    {
        "name": "BBC Radio 1 Dance",
        "desc": "Electronic dance music",
        "url": "http://as-hls-ww-live.akamaized.net/pool_62063831/live/ww/bbc_radio_one_dance/bbc_radio_one_dance.isml/bbc_radio_one_dance-audio%3d96000.norewind.m3u8",
        "image": "./touchscreen/bbc_radios/bbc_radio1_dance.png",
        "darkImage": "./touchscreen/bbc_radios/bbc_radio1_dance_dark.png"
    },
    {
        "name": "BBC Radio 2",
        "desc": "Adult Contemporary",
        "url": "http://as-hls-ww-live.akamaized.net/pool_74208725/live/ww/bbc_radio_two/bbc_radio_two.isml/bbc_radio_two-audio%3d96000.norewind.m3u8",
        "image": "./touchscreen/bbc_radios/bbc_radio2.png",
        "darkImage": "./touchscreen/bbc_radios/bbc_radio2_dark.png"
    },
    {
        "name": "BBC Radio 3",
        "desc": "Classical, jazz, world music, drama, culture, arts",
        "url": "http://as-hls-ww-live.akamaized.net/pool_23461179/live/ww/bbc_radio_three/bbc_radio_three.isml/bbc_radio_three-audio%3d96000.norewind.m3u8",
        "image": "./touchscreen/bbc_radios/bbc_radio3.png",
        "darkImage": "./touchscreen/bbc_radios/bbc_radio3_dark.png"
    },
    {
        "name": "BBC Radio 4",
        "desc": "News, talk, comedy and drama",
        "url": "http://as-hls-ww-live.akamaized.net/pool_55057080/live/ww/bbc_radio_fourfm/bbc_radio_fourfm.isml/bbc_radio_fourfm-audio%3d96000.norewind.m3u8",
        "image": "./touchscreen/bbc_radios/bbc_radio4.png",
        "darkImage": "./touchscreen/bbc_radios/bbc_radio4_dark.png"
    },
    {
        "name": "BBC Radio 5 Live",
        "desc": "News and sports",
        "url": "http://as-hls-ww-live.akamaized.net/pool_89021708/live/ww/bbc_radio_five_live/bbc_radio_five_live.isml/bbc_radio_five_live-audio%3d96000.norewind.m3u8",
        "image": "./touchscreen/bbc_radios/bbc_radio5_live.png",
        "darkImage": "./touchscreen/bbc_radios/bbc_radio5_live_dark.png"
    },
    {
        "name": "BBC Radio 6 Music",
        "desc": "Alternative, Indie",
        "url": "http://as-hls-ww-live.akamaized.net/pool_81827798/live/ww/bbc_6music/bbc_6music.isml/bbc_6music-audio%3d96000.norewind.m3u8",
        "image": "./touchscreen/bbc_radios/bbc_radio6.png",
        "darkImage": "./touchscreen/bbc_radios/bbc_radio6_dark.png"
    },
    {
        "name": "BBC World Service",
        "desc": "News, speech, discussions",
        "url": "http://a.files.bbci.co.uk/ms6/live/3441A116-B12E-4D2F-ACA8-C1984642FA4B/audio/simulcast/hls/nonuk/pc_hd_abr_v2/ak/bbc_world_service.m3u8",
        "image": "./touchscreen/bbc_radios/bbc_world_service.png",
        "darkImage": "./touchscreen/bbc_radios/bbc_world_service_dark.png"
    }
];

const styledView = {
    width: 1 / 3,
    height: 172,
    padding: "8px",
    innerBorder: {
        borderRadius: "8px",
        width: 1,
        height: 1,
        fontSize: "1.2rem"
    }
};

export { RadioStreamingList, getInternetStations };