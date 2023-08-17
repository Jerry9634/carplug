
const RadioStreamingList = ({
	channel,
	currentIndex,
	setCurrentStation,
	setStationUrl,
	carStatusView,
	mapView,
}) => {

	async function startPlay() {
		if (channel.url.length > 0) {
			setCurrentStation(currentIndex);
			setStationUrl(channel.url);
		}
	}

	return (
		<div style={ (carStatusView && mapView) ? styles.border : styles.borderHalf }>
			<div
				onClick={() => startPlay()}
				style={styles.button}
			>
				<div style={styles.col1}>
					<img
						src={channel.image}
						style={
							channel.name.includes("BBC") ?
								{ width: 180, height: 40 }
								:
								{ width: 208, height: 24 }
						}
						alt=""
					/>
				</div>
				<div style={styles.col2}>
					<div style={{ fontSize: 18, fontWeight: "700" }}>{channel.name}</div>
					<div style={{ fontSize: 14 }}>{channel.desc}</div>
				</div>
				<div style={styles.col3}>
					<span style={{ fontSize: 18 }}>{channel.url !== "" ? "v" : "?"}</span>
				</div>
			</div>
		</div>
	);
};

async function getInternetStations(cbkSetStations = null, cbkSetStationUrl = null) {
	for (const entry of internetRadioUrls.list) {
		if (entry.pls != null && entry.pls.length > 0) {
			let url = "http://localhost:5000/internet-radio/" + String(entry.pls);
			await fetch(url)
			.then((res) => res.text())
			.then((text) => {
				let lines = text.split('\n');
				for (let line = 0; line < lines.length; line++) {
					let index = lines[line].indexOf("File1=");
					if (index === 0) {
						entry.url = lines[line].substring(6);
					}
				}
			});
		}
	}

	if (cbkSetStations != null) {
		let stations = cbkSetStations();
		if (stations!= null && stations.length > 0 && cbkSetStationUrl != null) {
			cbkSetStationUrl(stations[0].url);
		}
	}

	let isAllOk = true;
	for (const entry of internetRadioUrls.list) {
		if (entry.url == null || entry.url.length === 0) {
			isAllOk = false;
		}
	}
	internetRadioUrls.allOK = isAllOk;
}

const urlList = [
	{
		name: "MBC FM4U", 
		desc: "대중 음악",
		pls: "mbcfm.pls",
		url: "",
		image: "./kor_radios/mbc_fm4u.png"
	},
	{
		name: "MBC 표준 FM", 
		desc: "종합 방송 : 뉴스, 시사, 교양, 대중 음악",
		pls: "mbcsfm.pls",
		url: "",
		image: "./kor_radios/mbc_sfm.png"
	},
	{
		name: "TBS FM", 
		desc: "수도권 교통, 생활정보 채널",
		pls: "tbsfm.pls",
		url: "",
		image: "./kor_radios/tbs_fm.png"
	},
	{
		name: "EBS FM", 
		desc: "교육 방송 FM",
		pls: "ebsfm.pls",
		url: "",
		image: "./kor_radios/ebs_fm.png"
	},
	{ 
		name: "KBS 1 Radio", 
		desc: "뉴스, 시사, 교양",
		pls: "kbs1radio.pls",
		url: "",
		image: "./kor_radios/kbs_1radio.png"
	},
	{
		name: "KBS 해피 FM", 
		desc: "중장년층 대상 대중 음악",
		pls: "kbs2radio.pls",
		url: "",
		image: "./kor_radios/kbs_happy_fm.png"
	},	
	{
		name: "KBS 클래식 FM", 
		desc: "서양 고전 음악 및 한국 국악",
		pls: "kbsfm.pls",
		url: "",
		image: "./kor_radios/kbs_classic_fm.png"
	},
	{
		name: "KBS 쿨 FM", 
		desc: "젊은층 대상 대중 음악",
		pls: "kbs2fm.pls",
		url: "",
		image: "./kor_radios/kbs_cool_fm.png"
	},	
	{ 
		name: "SBS 파워 FM", 
		desc: "대중 음악",
		pls: "sbsfm.pls",
		url: "",
		image: "./kor_radios/sbs_power_fm.png"
	},
	{ 
		name: "SBS 러브 FM",
		desc: "종합 방송 : 뉴스, 시사, 교양, 대중 음악",
		pls: "sbs2fm.pls",
		url: "",
		image: "./kor_radios/sbs_love_fm.png"
	},
	{
		name: "BBC Radio 1",
		desc: "Contemporary Hit Radio",
		url: "http://a.files.bbci.co.uk/media/live/manifesto/audio/simulcast/hls/nonuk/sbr_low/ak/bbc_radio_one.m3u8",
		image: "./bbc_radios/bbc_radio1.png"
	},
	{
		name: "BBC Radio 1 Extra",
		desc: "Urban contemporary, electronica, hip hop, R&B, soul",
		url: "http://a.files.bbci.co.uk/media/live/manifesto/audio/simulcast/hls/nonuk/sbr_low/ak/bbc_1xtra.m3u8",
		image: "./bbc_radios/bbc_radio1_extra.png"
	},
	{
		name: "BBC Radio 1 Dance",
		desc: "Electronic dance music",
		url: "http://a.files.bbci.co.uk/media/live/manifesto/audio/simulcast/hls/nonuk/sbr_low/ak/bbc_radio_one_dance.m3u8",
		image: "./bbc_radios/bbc_radio1_dance.png"
	},
	{
		name: "BBC Radio 1 Relax",
		desc: "Chill-out, well-being, relaxation, meditation",
		url: "http://a.files.bbci.co.uk/media/live/manifesto/audio/simulcast/hls/nonuk/sbr_low/ak/bbc_radio_one_relax.m3u8",
		image: "./bbc_radios/bbc_radio1_relax.png"
	},
	{
		name: "BBC Radio 2",
		desc: "Adult Contemporary",
		url: "http://a.files.bbci.co.uk/media/live/manifesto/audio/simulcast/hls/nonuk/sbr_low/ak/bbc_radio_two.m3u8",
		image: "./bbc_radios/bbc_radio2.png"
	},
	{
		name: "BBC Radio 3",
		desc: "Classical, jazz, world music, drama, culture, arts",
		url: "http://a.files.bbci.co.uk/media/live/manifesto/audio/simulcast/hls/nonuk/sbr_low/ak/bbc_radio_three.m3u8",
		image: "./bbc_radios/bbc_radio3.png"
	},
	{
		name: "BBC Radio 4",
		desc: "News, talk, comedy and drama",
		url: "http://a.files.bbci.co.uk/media/live/manifesto/audio/simulcast/hls/nonuk/sbr_low/ak/bbc_radio_fourfm.m3u8",
		image: "./bbc_radios/bbc_radio4.png"
	},
	{
		name: "BBC Radio 4 Extra",
		desc: "Comedy, drama, entertainment",
		url: "http://a.files.bbci.co.uk/media/live/manifesto/audio/simulcast/hls/nonuk/sbr_low/ak/bbc_radio_four_extra.m3u8",
		image: "./bbc_radios/bbc_radio4_extra.png"
	},
	{
		name: "BBC Radio 5 Live",
		desc: "News and sports",
		url: "http://a.files.bbci.co.uk/media/live/manifesto/audio/simulcast/hls/nonuk/sbr_low/ak/bbc_radio_five_live.m3u8",
		image: "./bbc_radios/bbc_radio5_live.png"
	},
	{
		name: "BBC Radio 6 Music",
		desc: "Alternative, Indie",
		url: "http://a.files.bbci.co.uk/media/live/manifesto/audio/simulcast/hls/nonuk/sbr_low/ak/bbc_6music.m3u8",
		image: "./bbc_radios/bbc_radio6.png"
	},
	{
		name: "BBC Asian Network",
		desc: "Indian music, news, and entertainment",
		url: "http://a.files.bbci.co.uk/media/live/manifesto/audio/simulcast/hls/nonuk/sbr_low/ak/bbc_asian_network.m3u8",
		image: "./bbc_radios/bbc_asian_network.png"
	},
	{
		name: "BBC World Service",
		desc: "News, speech, discussions",
		url: "http://a.files.bbci.co.uk/media/live/manifesto/audio/simulcast/hls/nonuk/sbr_low/ak/bbc_world_service.m3u8",
		image: "./bbc_radios/bbc_world_service.png"
	},
];

const internetRadioUrls = {
	list: urlList,
	allOK: false,
};

export { RadioStreamingList, getInternetStations, internetRadioUrls };

const styles = {
	border: {
		height: 64,
		//paddingHorizontal: 8,
		//paddingVertical: 4,
		width: "100%",
		padding: "4px 8px"
	},
	borderHalf: {
		height: 64,
		//paddingHorizontal: 8,
		//paddingVertical: 4,
		width: "50%",
		padding: "4px 8px"
	},

	button: {
		height: 56,
		display: "flex",
		flexDirection: "row",
		justifyContent: "flex-start",
		alignItems: "center",
		borderRadius: 12,
		backgroundColor: "#f0f0f0",
		cursor: "pointer"
	},

	col1: {
		width: "34%",
		//paddingHorizontal: 16,
		padding: "0px 16px"
	},
	col2: {
		width: "60%",
		//paddingHorizontal: 16,
		padding: "0px 16px"
	},
	col3: {
		width: "6%",
		justifyContent: "center",
		alignItems: "center",
	}
};
