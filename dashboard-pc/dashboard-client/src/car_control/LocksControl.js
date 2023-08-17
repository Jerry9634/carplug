import styled from "styled-components";
import Switch from "./components/Switch";

const LocksControl = () => {
	return (
		<StyledDiv>
			<div className="switch-control">
				<Switch switchState={true} />
				<span>walk up unlock</span>
			</div>
			<div className="switch-control">
				<Switch />
				<span>walk away lock</span>
			</div>
			<div className="switch-control">
				<Switch />
				<span>child protection lock</span>
			</div>
			<div className="switch-control">
				<Switch switchState={true} />
				<span>unlock on park</span>
			</div>

			<div className="glove-box">
				<div>
					<img
						src="./images/wallet.png"
						alt=""
						className="wallet"
					/>
					<img
						src="./images/down-gray.png"
						alt=""
						className="expand"
					/>
				</div>
				<span>GloveBox</span>
			</div>
		</StyledDiv>
	);
};
export default LocksControl;

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

	.glove-box {
		width: 200px;
		border: 1px solid;
		padding: 8px;
		border-radius: 24px;
		margin: 0 10%;
		margin-top: 50px;
		text-align: center;
		display: flex;
		align-items: center;

		font-weight: 500;
		text-transform: uppercase;
		color: #6f6f6f;

		div {
			display: flex;
			align-items: center;
			flex-direction: column;
			margin: 0 16px;
			.wallet {
				width: 18px;
			}
			.expand {
				width: 12px;
			}
		}

		span {
			align-self: center;
			margin-left: 16px;
		}
	}
`;
