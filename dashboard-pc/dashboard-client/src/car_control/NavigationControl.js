import { useEffect, useState } from "react";
import styled from "styled-components";
//import Switch from "./components/Switch";
import TabsSelector from "./components/TabsSelector";
import HeadingDescription from "./components/HeadingDescription";

import { setValue, getValue } from "./CarControlSettings";

const NavigationControl = () => {
	const [mapType, setMapType] = useState(getValue("mapType") ? getValue("mapType") : "Custom");

	useEffect(() => {
		setValue("mapType", mapType);
	}, [mapType]);

	return (
		<StyledDiv>
			<HeadingDescription
				imgUrl={"./images/gps-navigation.png"}
				text={"Map Type"}
			/>
			<TabsSelector tabClass={"tabs1"} onClick={(e) => console.log(e)}>
				<li className={mapType === "Kakao" ? "active" : ""} onClick={() => setMapType("Kakao")}>Kakao</li>
				<li className={mapType === "Custom" ? "active" : ""} onClick={() => setMapType("Custom")}>Custom</li>
			</TabsSelector>
		</StyledDiv>
	);
};
export default NavigationControl;

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
