import styled from "styled-components";

const YouTubeVideoList = ({
	video,
	currentIndex,
	setCurrentVideo,
	setVideoId,
}) => {
	return (
		<StyledDiv
			onClick={() => {
				setCurrentVideo(currentIndex);
				setVideoId(video.id);
			}}
			tabIndex={currentIndex}
		>
			<img src={getThumbnailURL(video.snippet.thumbnails)} alt="" ></img>
			<div>
				<b>{getTrimmedTitle(video.snippet.title)}</b><br/>
				<span>{getTrimmedTitle(video.snippet.channelTitle)}</span>
			</div>
		</StyledDiv>
	);
};

function getThumbnailURL(thumbnails) {
	if (thumbnails != null) {
		if (thumbnails.medium != null) {
			//return thumbnails.medium.url;
			return thumbnails.medium.url;
		}
		//console.log(thumbnails);
	}
	return null;
}

function getTrimmedTitle(title) {
	let newTitle = String(title).replace(/&quot;/g, "\"");
	newTitle = newTitle.replace(/&#39;/g, "`");
	return newTitle;
}

async function getVideoList(setList) {
	/*
	if (videoList.length > 0) {
		if (videoId === "" && videoList.length > 0) {
			setCurrentVideo(0);
			setVideoId(videoList[0].id);
		}
		return;
	}
	*/
	const list = [];
	//*
	const myKey = process.env.REACT_APP_GOOGLE_API_KEY;
	const playlists = [
		"PLHeA953TlPxfVgNpPJR-Tr3p88_2RuB4G", // Jerry's favorite
		"PLHFeMk_LSwG5WMlOMrny0r3SQyFYx7W2M", // Beyonce "The Hits in HD"
	];
	for (const playlist of playlists) {
		const playlistReq = "https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=" 
							+ playlist + "&maxResults=100&key=" + myKey;
		await fetch(playlistReq)
		.then((res) => res.json())
		.then((data) => {
			if (data.items != null && data.items.length > 0) {
				for (const item of data.items) {
					if (item.snippet.title !== "Private video") {
						list.push({id: item.snippet.resourceId.videoId, snippet: item.snippet});
					}
					//console.log(item.snippet);
				}
			}
		});
	}

	const channels = [
		"UCAAvO0ehWox1bbym3rXKBZw", // @gyeomsonisnothing
		"UCxvU6bRtYhNLvZleAIGa-FQ", // @BUNKER1MEMBERSHIP
		"UCu1FzjrHosuKGvgIx8oBi8w", // @saenal
	];
	for (const channel of channels) {
		const latestVideoReq = "https://www.googleapis.com/youtube/v3/search?part=snippet&channelId="
								+ channel + "&maxResults=5&order=date&type=video&key=" + myKey;
		await fetch(latestVideoReq)
		.then((res) => res.json())
		.then((data) => {
			if (data.items != null && data.items.length > 0) {
				for (const item of data.items) {
					list.push({id: item.id.videoId, snippet: item.snippet});
					//console.log(item.snippet);
				}
			}
		});
	}
	//*/
	if (list.length === 0) {
		list[0] = { 
			id: "ik2XaTmKukw", 
			snippet:  {
				title: "오페라의 유령 25주년 기념 라이브 공연",
				channelTitle: "Jerry's Favorite",
				thumbnails: {
					medium: {
						url: "./youtube_vids/phantom.jpg"
					}
				}
			}
		};
		list[1] = { 
			id: "7WjUuk3CGUw",
			snippet:  {
				title: "Frozen",
				channelTitle: "Jerry's Favorite",
				thumbnails: {
					medium: {
						url: "./youtube_vids/frozen1.jpg"
					}
				}
			}
		};
		list[2] = { 
			id: "Bm0Lvhx7OUE",
			snippet:  {
				title: "겨울왕국 2 (더빙판)",
				channelTitle: "Jerry's Favorite",
				thumbnails: {
					medium: {
						url: "./youtube_vids/frozen2.jpg"
					}
				}
			}
		};
	}
	
	setList(list);
}

export { YouTubeVideoList, getVideoList, getTrimmedTitle };

const StyledDiv = styled.div`
	color: #6f6f6f;
	padding: 8px;
	border-radius: 12px;
	cursor: pointer;

	float: left;
	font-size: 0.9rem;
	width: 100%;
	height: 240px;

	&:hover {
		background-color: white;
		color: black;
	}

	img {
		width: 100%;
		height: auto;
		border-radius: 8px;
	}

	div {
		padding-top: 8px;
	}
`;
