import styled from "styled-components";
import TabsSelector from "./components/TabsSelector";

const DrivingControl = () => {
	return (
		<StyledDiv>
			<button className="gear-btn">
				<img src="./images/gear.png" alt="" />
			</button>

			<p className="margin-small">Steering Mode</p>
			<div className="margin-big">
				<TabsSelector tabClass={"tabs1"}>
					<li>comfort</li>
					<li>standard</li>
					<li className="active">sport</li>
				</TabsSelector>
			</div>
			<p className="margin-small">Regenerative Breaking</p>
			<div className="margin-small">
				<TabsSelector tabClass={"tabs2"}>
					<li>standard</li>
					<li className="active">low</li>
				</TabsSelector>
			</div>
			<p className="blur-info">
				STANDARD increases range and extends battery life
			</p>
			<div className="line"></div>

			<p className="margin-small">Traction Control</p>
			<button className="margin-small btn-deco">slip start</button>
			<p className="blur-info">
				Used to help free vehicle stuck in sand, snow or mud
			</p>

			<div className="line"></div>

			<button className="margin-small btn-deco">creep</button>
			<p className="blur-info">
				Slowly move forward when brake pedal is released
			</p>
		</StyledDiv>
	);
};

export default DrivingControl;

const StyledDiv = styled.div`
	color: #6F6F6F;
	padding: 30px;
	padding-top: 50px;
	position: relative;

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

	.margin-small {
		margin-bottom: 12px;
	}

	.margin-big {
		margin-bottom: 20px;
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

	.blur-info {
		font-size: 0.7rem;
		opacity: 0.5;
	}
	.line {
		height: 1px;
		background: #6f6f6f;
		opacity: 0.8;
		width: 100%;
		margin: 18px 0;
	}
`;
