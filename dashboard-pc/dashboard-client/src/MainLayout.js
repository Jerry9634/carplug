import React from "react";
import styled from "styled-components";

const MainLayout = ({ children, gridLayout }) => {
	const [leftTaskBar, mainScreen, navigation] = children;
	return (
		<StyledMain gridLayout={gridLayout}>
			<div className="left">{leftTaskBar}</div>
			<div className="right">{mainScreen}</div>
			<div className="footer">{navigation}</div>
		</StyledMain>
	);
};
export default MainLayout;

// 1280 x 800 -> 1480 * 862
// screen size
const StyledMain = styled.main`
	display: grid;
	grid-template-areas:
		"left right"
		"footer footer";
	min-width: 1528px;
	width: 1528px;
	margin: 0 auto;
	grid-template-columns: ${(props) => (props.gridLayout.left + "px " + props.gridLayout.right + "px")};
	grid-template-rows: ${(props) => (props.gridLayout.up + "px " + props.gridLayout.bottom + "px")};
	border: 24px solid #0e0e0e;
	border-radius: 16px;
	background-color: #0e0e0e;

	.left {
		grid-area: left;
	}
	.right {
		grid-area: right;
	}
	.footer {
		grid-area: footer;
	}

	@media (max-width: 1200px) {
		margin: 16px 0;
		position: absolute;
		top: 2%;
		left: 5%;
	}
`;
