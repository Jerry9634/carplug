import styled from "styled-components";

const ServiceControl = () => {
	return (
		<StyledDiv>
			<button className="btn-deco">
				<img src="./images/windshield_gray.png" alt="beam" />
				wiper service mode
			</button>

			<div className="modal-btn">
				<img src="./images/beam.png" alt="beam" />
				adjust headlights
			</div>

			<div className="modal-btn">
				<img src="./images/beam.png" alt="beam" />
				headlight reset
			</div>
		</StyledDiv>
	);
};

export default ServiceControl;

const StyledDiv = styled.div`
	color: #6F6F6F;
	padding: 30px;
	padding-top: 60px;
	position: relative;

	text-transform: capitalize;
	img {
		width: 25px;
	}
	.close-btn {
		background: none;
		border: 0;
		position: absolute;
		top: 12px;
		right: 10px;

		cursor: pointer;
	}

	.btn-deco {
		border: 1px solid #6F6F6F;
		padding: 6px 24px;
		background: transparent;
		border-radius: 30px;
		color: #6F6F6F;
		text-transform: uppercase;
		font-size: 0.8rem;
		display: flex;
		align-items: center;
		gap: 20px;
		margin-bottom: 35px;
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
		margin-bottom: 16px;
	}
`;
