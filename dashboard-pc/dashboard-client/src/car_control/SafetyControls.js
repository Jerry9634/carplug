import styled from "styled-components";

const SafetyControls = () => {
	return (
		<StyledDiv>
			<button className="gear-btn">
				<img src="./images/gear.png" alt="" />
			</button>

			<p className="margin-big">parking brake</p>

			<div className="parking">
				<div className="modal-btn">
					<div>
						<img src="./images/parking-area.png" alt="mirror-btn" />
						<span>
							parking <br />
							brake
						</span>
					</div>
					brake is off
				</div>

				<p className="blur-info">
					Selecting PARK on the steering column will also set the
					parking brake
				</p>
			</div>

			<p className="margin-small">vehicle power</p>
			<button className="btn-deco margin-small">power off </button>
			<p className="blur-info">
				Pressing the brake pedal will turn the car on again
			</p>
			<div className="line"></div>
		</StyledDiv>
	);
};

export default SafetyControls;

const StyledDiv = styled.div`
	color: #6F6F6F;
	padding: 30px;
	padding-top: 50px;
	position: relative;

	text-transform: capitalize;
	
	.btn-deco {
		border: 1px solid #6F6F6F;
		padding: 6px 24px;
		background: transparent;
		border-radius: 30px;
		color: #6F6F6F;
		text-transform: uppercase;
		font-size: 0.8rem;
	}

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

	.parking {
		display: flex;
		gap: 10px;
		align-items: center;
		margin-bottom: 30px;
		img {
			width: 40px;
		}

		span {
			font-weight: 500;
		}
		p {
			width: 150px;
			font-size: 0.6rem;
			text-align: center;
		}
	}

	.modal-btn {
		width: 180px;
		height: 100px;
		border-radius: 16px;
		background: #eeeeee;
		border: 1px solid #6f6f6f;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 20px;
		cursor: pointer;
		color: #6f6f6f;
		text-transform: uppercase;

		& > div {
			display: flex;
			gap: 16px;
			align-items: center;
		}
	}

	.line {
		height: 1px;
		background: #6f6f6f;
		opacity: 0.8;
		width: 100%;
		margin: 18px 0;
	}
`;
