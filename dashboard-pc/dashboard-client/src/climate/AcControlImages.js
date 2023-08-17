import { useEffect, useState } from "react";

const AcControlImages = ({activeImage, inactiveImage, onOff=false, callback=null}) => {
	const [active, setActive] = useState(false);

	useEffect(() => {
		if (callback != null) {
			callback(active);
		}
	}, 
	// eslint-disable-next-line
	[active]);

	useEffect(() => {
		if (onOff) {
			setActive(true);
		}
		else {
			setActive(false);
		}
	}, [onOff]);

	return (
		<span className={active ? "img-circle active" : "img-circle"} onClick={()=> setActive(!active)}>
			<img src={active ? activeImage : inactiveImage} alt="" />
		</span>
	);
};

export default AcControlImages;
