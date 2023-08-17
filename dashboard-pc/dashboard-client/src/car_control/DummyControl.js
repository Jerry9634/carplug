import styled from "styled-components";
import Switch from "./components/Switch";

const DummyControl = () => {
	return (
		<StyledDiv>
			<div className="switch-control">
				<Switch switchState={true} />
				<span>Dummy true init</span>
			</div>
			<div className="switch-control">
				<Switch />
				<span>Dummy false init</span>
			</div>
		</StyledDiv>
	);
};
export default DummyControl;

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

	.switch-control {
		display: flex;
		gap: 16px;
		margin-bottom: 24px;
		align-items: center;

		span {
			text-transform: capitalize;
			color: #6F6F6F;
		}
	}
`;
