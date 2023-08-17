import React from "react";
import styled from "styled-components";
import TabsSelector from "./components/TabsSelector";

const LightControl = () => {
	return (
		<StyledDiv>
			<p className="margin-big"><b>Exterior</b></p>
			<p className="margin-small">Headlights</p>
			<div className="margin-big">
				<TabsSelector tabClass={"tabs1"}>
					<li className="active">off</li>
					<li>parking</li>
					<li>on</li>
					<li>auto</li>
				</TabsSelector>
			</div>
			<button className="btn-deco margin-large">front fog</button>

			<p className="margin-big"><b>Interior</b></p>
			<p className="margin-small">Dome Lights</p>
			<div className="margin-big">
				<TabsSelector tabClass={"tabs2"}>
					<li>off</li>
					<li>on</li>
					<li className="active">auto</li>
				</TabsSelector>
			</div>
			<button className="btn-deco">ambient lights</button>
		</StyledDiv>
	);
};

export default LightControl;

const StyledDiv = styled.div`
	color: #6F6F6F;
	padding: 30px;
	padding-top: 50px;
	position: relative;

	.close-btn {
		background: none;
		border: 0;
		position: absolute;
		top: 12px;
		right: 10px;

		cursor: pointer;

		img {
			width: 25px;
		}
	}

	.btn-deco {
		border: 1px solid #6F6F6F;
		padding: 6px 24px;
		background: transparent;
		border-radius: 30px;
		color: #6F6F6F;
		text-transform: uppercase;
		font-size: 0.8rem;
	}

	.margin-small {
		margin-bottom: 12px;
	}

	.margin-big {
		margin-bottom: 20px;
	}

	.margin-large {
		margin-bottom: 75px;
	}
`;
