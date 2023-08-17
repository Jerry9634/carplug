import styled from "styled-components";
// eslint-disable-next-line 
import React, { useState, useEffect } from "react";
import TabsSelector from "./components/TabsSelector";

// eslint-disable-next-line 
const WiperControls = ({signalMap}) => {
	return (
		<StyledDiv>
			<div className="option-3">
				<div className="option-3-blue">
					<img src="./images/windshield.png" alt="" />
					<span>OFF</span>
				</div>
				<div className="option-3-tabs">
					<img
						src="./images/windshield_gray.png" alt=""
						className="windshield"
					/>
					<TabsSelector>
						<li>I</li>
						<li>II</li>
						<li>III</li>
						<li>IIII</li>
						<li className="active">Auto</li>
					</TabsSelector>
				</div>
			</div>
		</StyledDiv>
	);
};
export default WiperControls;

const StyledDiv = styled.div`
	background: #eeeeee;
	//border: 1px solid #cccccc;
	height: 250px;
	position: relative;
	z-index: 2;
	display: flex;

	.option-3 {
		display: flex;
		gap: 32px;
		flex-direction: column;

		width: 100%;
		align-items: center;
		padding: 48px;

		.option-3-blue {
			background: #0080ff;
			width: max-content;
			padding: 12px 20px;
			border-radius: 100%;
			display: flex;
			flex-direction: column;
			margin: 0 auto;
			align-items: center;
			justify-content: center;
			color: white;
			font-size: 0.8rem;
			img {
				width: 32px;
			}
		}

		.option-3-tabs {
			display: flex;
			align-items: center;
			justify-content: end;
			padding: 0 8px;
			gap: 12px;
			img {
				width: 32px;
				padding-bottom: 8px;
			}
		}

		.windshield-tabs {
			justify-self: flex-end;
		}

		li {
			width: 80px;
			text-align: center;
		}
	}
`;
