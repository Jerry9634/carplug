import React, { useState, useEffect } from "react";
import styled from "styled-components";

var longPressValue;
var longPressOn = false;

const VolumeControl = () => {
	const [count, setCount] = useState(100);
	const [volumeTimer, setVolumeTimer] = useState(0);
	const [volumeTimerHandle, setVolumeTimerHandle] = useState(null);
	const [longPressInterval, setLongPressInterval] = useState(null);

	useEffect(() => {
		return () => {
			// Release timers
			if (volumeTimerHandle != null) {
				clearInterval(volumeTimerHandle);
			}
			if (longPressInterval != null) {
				clearInterval(longPressInterval);
			}
		};
	}, 
	// eslint-disable-next-line
	[]);

	useEffect(() => {
		globalVolume = count;
	}, [count]);

	useEffect(() => {
		if (volumeTimer > 0) {
			if (volumeTimerHandle != null) {
				clearTimeout(volumeTimerHandle);
			}
			const handle = setTimeout(() => {
				if (!longPressOn) {
					setVolumeTimer(0);
					setVolumeTimerHandle(null);
				}
			}, volumeTimer);
			setVolumeTimerHandle(handle);
		}
	}, 
	// eslint-disable-next-line
	[volumeTimer]);

	function getNewValue(oldValue, direction) {
		let newValue;
		if (direction === "up") {
			newValue = oldValue + 5;
			if (newValue > 100) {
				newValue = 100;
			}
		}
		else {
			newValue = oldValue - 5;
			if (newValue < 0) {
				newValue = 0;
			}
		}
		return newValue;
	}

	function setVolume(volume) {
		let player = document.getElementById("youtube-player");
		if (player != null) {
			let iframe = player.contentWindow;
			setCount(volume);
			iframe.postMessage('{"event":"command","func":"setVolume","args":[' + volume + ']}', "*");
			if (volumeTimer > 0) {
				setVolumeTimer(volumeTimer + 1);
			}
			else {
				setVolumeTimer(1500);
			}
		}
		else {
			let div = document.getElementById("myRadio");
			if (div != null) {
				let video = div.getElementsByTagName("video")[0];
				if (video != null) {
					setCount(volume);
					video.volume = volume / 100;
					if (volumeTimer > 0) {
						setVolumeTimer(volumeTimer + 1);
					}
					else {
						setVolumeTimer(1500);
					}
				}
			}
		}
	}

	function handleDecrement() {
		if (longPressInterval != null) {
			clearInterval(longPressInterval);
			setLongPressInterval(null);
			if (longPressOn) {
				longPressOn = false;
				return;
			}
		}
		
		const newVal = getNewValue(count, "down");
		setVolume(newVal);
	}

	function handleIncrement() {
		if (longPressInterval != null) {
			clearInterval(longPressInterval);
			setLongPressInterval(null);
			if (longPressOn) {
				longPressOn = false;
				return;
			}
		}
		
		const newVal = getNewValue(count, "up");
		setVolume(newVal);
	}

	function handleDecrementMouseDown() {
		longPressOn = false;
		longPressValue = count;
		const interval = setInterval(() => {
			longPressOn = true;
			longPressValue = getNewValue(longPressValue, "down");	
			setVolume(longPressValue);
		}, 100);
		setLongPressInterval(interval);
	}

	function handleIncrementMouseDown() {
		longPressOn = false;
		longPressValue = count;
		const interval = setInterval(() => {
			longPressOn = true;
			longPressValue = getNewValue(longPressValue, "up");			
			setVolume(longPressValue);
		}, 100);
		setLongPressInterval(interval);
	}

	return (
		<StyledDiv>
			<button
				onClick={handleDecrement}
				onMouseDown={handleDecrementMouseDown}
				className="decrease"
			></button>

			<div className="counter">
			{
			volumeTimer === 0 ?
			<img src="./images/volume-up.png" alt="volume" />
			:
			<span>{count}</span>
			}
			</div>
			
			<button
				onClick={handleIncrement}
				onMouseDown={handleIncrementMouseDown}
				className="increase"
			></button>
		</StyledDiv>
	);
};

export default VolumeControl;

var globalVolume = 100;

export function muteMediaVolume(timeout) {
	let player = document.getElementById("youtube-player");
	if (player != null) {
		let iframe = player.contentWindow;
		iframe.postMessage('{"event":"command","func":"setVolume","args":[' + 0 + ']}', "*");
		setTimeout(() => {
			iframe.postMessage('{"event":"command","func":"setVolume","args":[' + globalVolume + ']}', "*");
		}, timeout);
	}
	else {
		let div = document.getElementById("myRadio");
		if (div != null) {
			let video = div.getElementsByTagName("video")[0];
			if (video != null) {
				video.volume = 0;
				setTimeout(() => {
					video.volume = globalVolume / 100;
				}, timeout);
			}
		}
	}
	return true;
}

const StyledDiv = styled.div`
	color: #ffffff;
	font-size: 32px;
	font-weight: 500;
	
	display: flex;
	justify-content: space-between;
	//gap: 12px;
	flex-direction: row;
	align-items: center;
	width: 156px;

	.counter {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 60px;
		height: 60px;
		img {
			width: 36px;
			height: 36px;
		}
	}

	button {
		border: 0;
		width: 48px;
		height: 60px;
		background-position: center;
		background-repeat: no-repeat;
		position: center;
		background-repeat: no-repeat;
		cursor: pointer;
	}

	button.increase {
		background: url("./images/right-white.png");
		background-position: center;
		background-repeat: no-repeat;
		background-size: 24px 24px;
	}

	button.decrease {
		background: url("./images/left-white.png");
		background-position: center;
		background-repeat: no-repeat;
		background-size: 24px 24px;
	}
`;
