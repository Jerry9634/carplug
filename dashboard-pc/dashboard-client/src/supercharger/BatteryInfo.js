import styled from "styled-components";
import React, { useState } from "react";
const BatteryInfo = () => {
	const [current, setCurrent] = useState(200);

	return (
		<StyledDiv>
			<div className="supercharge-header">
				<h2>{"supercharge".toUpperCase()}</h2>
			</div>
			<div className="miles-header">
				<span className="miles-header-num">999</span> <span>km</span>
			</div>
			<div className="battery-info-footer">
				<div className="current">
					<p>charge current</p>

					<button className="current-btn">
						<span className="span-btn" 
							onClick={() => {
								let newCurrent = current - 10;
								if (newCurrent < 10) {
									newCurrent = 10;
								}
								setCurrent(newCurrent);
							}}
						>
							&#8722;
						</span>
						<span>{current}A</span>
						<span className="span-btn" 
							onClick={() => {
								let newCurrent = current + 10;
								if (newCurrent > 1000) {
									newCurrent = 1000;
								}
								setCurrent(newCurrent);
							}}
						>
							&#43;
						</span>
					</button>
				</div>
				<div className="schedule">
					<p>
						<img src="./images/location.png" alt="" />
						scheduled depature
					</p>

					<button className="schedule-btn">schedule</button>
				</div>
				<div className="payment">
					<p>supercharging</p>
					<span>$0.00</span>
				</div>
			</div>
		</StyledDiv>
	);
};

export default BatteryInfo;

const StyledDiv = styled.div`
	height: 700px;
	//width: 768px;
	position: relative;
	
	.supercharge-header {
		height: 33%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.miles-header {
		height: 33%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.2rem;
		.miles-header-num {
			font-size: 5rem;
		}
	}

	.battery-info-footer {
		height: 33%;
		width: 100%;
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 24px;
		font-size: 1.2rem;
		font-weight: 700;

		.current {
			width: 28%;
			margin-left: 16px;
			margin-right: 8px;
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			p {
				display: flex;
				align-items: center;
				text-transform: capitalize;
			}
			.current-btn {
				background-color: #6f6f6f;
				color: #ffffff;
				border-radius: 16px;
				border: 1px solid #6f6f6f;
		
				display: flex;
				align-items: center;
				justify-content: space-between;
				//gap: 32px;
				width: 160px;
				height: 40px;
				font-size: 1.3rem;
				font-weight: 500;
				padding: 8px;

				cursor: default;
				.span-btn {
					width: 20%;
					cursor: pointer;
				}
			}
		}

		.schedule {
			width: 44%;
			margin-left: 8px;
			margin-right: 8px;
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			p {
				display: flex;
				align-items: center;
				text-transform: capitalize;
			}
			img {
				width: 20px;
			}
			.schedule-btn {
				background-color: #6f6f6f;
				color: #ffffff;
				border-radius: 16px;
				border: 1px solid #6f6f6f;
				width: 160px;
				height: 40px;
				font-size: 1.3rem;
				font-weight: 500;
				padding: 8px;
				cursor: pointer;
			}
		}

		.payment {
			width: 28%;
			margin-left: 8px;
			margin-right: 16px;
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			p {
				display: flex;
				align-items: center;
				text-transform: capitalize;
			}
			span {
				padding: 8px;
			}
		}
	}
`;
