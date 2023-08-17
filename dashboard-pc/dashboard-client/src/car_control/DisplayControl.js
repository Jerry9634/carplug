import styled from "styled-components";
import TabsSelector from "./components/TabsSelector";
import BrightnessSlider from "./components/BrightnessSlider";

const DisplayControl = () => {
	return (
		<StyledDiv>
			<button className="gear-btn">
				<img src="./images/gear.png" alt="" />
			</button>

			<p className="margin-big"><b>Visibility</b></p>
			<p className="margin-small">Display Mode</p>
			<div className="margin-big">
				<TabsSelector tabClass={"tabs1"}>
					<li>day</li>
					<li>night</li>
					<li className="active">auto</li>
				</TabsSelector>
			</div>
			<p className="margin-small">Display Brightness</p>
			<div className="margin-small">
				<BrightnessSlider />
			</div>

			<p className="blur-info margin-large">
				reduce brightness to conserve energy
			</p>

			<p className="margin-big"><b>Units & Format</b></p>
			<p className="margin-small">Distance</p>

			<div className="margin-big">
				<TabsSelector tabClass={"tabs2"}>
					<li>kilometers</li>
					<li className="active">miles</li>
				</TabsSelector>
			</div>
			<p className="margin-small">Temperature</p>
			<TabsSelector tabClass={"tabs3"}>
				<li>&#8457;</li>
				<li className="active">&#8451;</li>
			</TabsSelector>
		</StyledDiv>
	);
};

export default DisplayControl;

const StyledDiv = styled.div`
	color: #6F6F6F;
	padding: 30px;
	padding-top: 50px;
	position: relative;

	text-transform: capitalize;
	
	.gear-btn {
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

	.blur-info {
		font-size: 0.7rem;
		opacity: 0.5;
	}

	.margin-small {
		margin-bottom: 12px;
	}

	.margin-big {
		margin-bottom: 20px;
	}

	.margin-large {
		margin-bottom: 40px;
	}
`;
