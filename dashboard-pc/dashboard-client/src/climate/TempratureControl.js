import React, { useEffect, useState } from "react";
import styled from "styled-components";

import { setSignal } from "../vplug/WsReq";

var longPressValue;
var longPressOn = false;

const TempratureControl = ({ signalName, temperature }) => {
	
	const [longPressInterval, setLongPressInterval] = useState(null);
	
	useEffect(() => {
		setTimeout(() => {
			setSignal(signalName, 25);
		}, 500);

		return () => {
			// Release timers
			if (longPressInterval != null) {
				clearInterval(longPressInterval);
			}
		};
	}, 
	// eslint-disable-next-line
	[]);

	function getTempLabel() {
		if (temperature >= 15 && temperature <= 32) {
			return Number(temperature).toFixed(1).substring(0, 2);
		}
		else if (temperature === 14.5) {
			return "LO";
		}
		else if (temperature === 141) {
			return "HI";
		}
		else {
			return "--";
		}
	}

	function getTempFraction() {
		if (temperature >= 15 && temperature <= 32) {
			return Number(temperature).toFixed(1).substring(2);
		}
		return null;
	}

	function getNewValue(oldValue, direction) {
		let newValue;
		if (direction === "up") {
			if (oldValue === 14.5) {
				newValue = 15; // LO to 15
			}
			else if (oldValue === 141) {
				newValue = 141; // HI to HI
			}
			else if (oldValue >= 15 && oldValue <= 31.5) {
				newValue = oldValue + 0.5; // up
			}
			else if (oldValue === 32) {
				newValue = 141; // 32 to HI
			}
			else {
				newValue = 25;
			}
		}
		else {
			if (oldValue === 14.5) {
				newValue = 14.5; // LO to LO
			}
			else if (oldValue === 141) {
				newValue = 32; // HI to 32
			}
			else if (oldValue >= 15.5 && oldValue <= 32) {
				newValue = oldValue - 0.5; // down
			}
			else if (oldValue === 15) {
				newValue = 14.5; // 15 to LO
			}
			else {
				newValue = 25;
			}
		}
		return newValue;
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
		
		let newVal = getNewValue(temperature, "down");
		setSignal(signalName, newVal);
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
		
		let newVal = getNewValue(temperature, "up");
		setSignal(signalName, newVal);
	}

	function handleDecrementMouseDown() {
		longPressOn = false;
		longPressValue = temperature;
		const interval = setInterval(() => {
			longPressOn = true;
			longPressValue = getNewValue(longPressValue, "down");	
			setSignal(signalName, longPressValue);
		}, 250);
		setLongPressInterval(interval);
	}

	function handleIncrementMouseDown() {
		longPressOn = false;
		longPressValue = temperature;
		const interval = setInterval(() => {
			longPressOn = true;
			longPressValue = getNewValue(longPressValue, "up");			
			setSignal(signalName, longPressValue);
		}, 250);
		setLongPressInterval(interval);
	}

	return (
		<StyledDiv count={temperature}>
			<button
				onClick={handleDecrement}
				onMouseDown={handleDecrementMouseDown}
				className="decrease"
			></button>

			<div className="counter" id={signalName}>
				<span className="value">{getTempLabel()}</span>
				<span className="fraction">{getTempFraction()}</span>
				{/*(temperature >= 15 && temperature <= 32) ?
				<span className="degree">&deg;</span>
				: null */}
			</div>
			
			<button
				onClick={handleIncrement}
				onMouseDown={handleIncrementMouseDown}
				className="increase"
			></button>
		</StyledDiv>
	);
};

export default TempratureControl;

const StyledDiv = styled.div`
	color: #ffffff;
	display: flex;
	justify-content: space-between;
	//gap: 12px;
	flex-direction: row;
	align-items: center;
	width: 176px;

	.counter {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 80px;
		height: 60px;
		.value {
			font-size: 36px;
			font-weight: 500;
		}
		.fraction {
			font-size: 28px;
			font-weight: 500;
		}
		.degree {
			font-size: 36px;
			font-weight: 300;
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
