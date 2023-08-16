/**
 * 
 */
import { Outlet, NavLink } from "react-router-dom";

const Layout = () => {
	return (
		<>
			<div className="w3-bar w3-border w3-light-grey">
				<NavLink to="/" 
						className={({ isActive }) => {
							return isActive ? "w3-bar-item w3-button w3-light-green w3-xlarge" : "w3-bar-item w3-button w3-xlarge";
						}} 
				>Overview</NavLink>
				<NavLink to="/ecus" 
						className={({ isActive }) => {
							return isActive ? "w3-bar-item w3-button w3-light-green w3-xlarge" : "w3-bar-item w3-button w3-xlarge";
						}}
				>ECUs</NavLink>
				<NavLink to="/pdus" 
						className={({ isActive }) => {
							return isActive ? "w3-bar-item w3-button w3-light-green w3-xlarge" : "w3-bar-item w3-button w3-xlarge";
						}}
				>PDUs</NavLink>
				<NavLink to="/signals" 
						className={({ isActive }) => {
							return isActive ? "w3-bar-item w3-button w3-light-green w3-xlarge" : "w3-bar-item w3-button w3-xlarge";
						}}
				>Signals</NavLink>
				<NavLink to="/signaltree" 
						className={({ isActive }) => {
							return isActive ? "w3-bar-item w3-button w3-light-green w3-xlarge" : "w3-bar-item w3-button w3-xlarge";
						}}
				>Vehicle API</NavLink>
				<NavLink to="/targetECU" 
						className={({ isActive }) => {
							return isActive ? "w3-bar-item w3-button w3-light-green w3-xlarge" : "w3-bar-item w3-button w3-xlarge";
						}}
				>Target</NavLink>
			</div>	
			<div>
				<Outlet />
			</div>
		</>
	);
}

export default Layout;