import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./pages/Layout";
import Overview from "./pages/Overview";
import ECUs from "./pages/ECUs";
import PDUs from "./pages/PDUs";
import Signals from "./pages/Signals";
import SignalTree from './pages/SignalTree';
import TargetECU from "./pages/TargetECU";
import NoPage from "./pages/NoPage";
import signalDBFile from "./SignalDB.json";


function App() {
	const signalDB = signalDBFile;
	
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Layout />}>
				<Route index element={<Overview signalDB={signalDB} />} />
				<Route path="pdus" element={<PDUs signalDB={signalDB} />} />
				<Route path="signals" element={<Signals signalDB={signalDB} />} />
				<Route path="signaltree" element={<SignalTree signalDB={signalDB} />} />
				<Route path="ecus" element={<ECUs signalDB={signalDB} />} />
				<Route path="targetECU" element={<TargetECU signalDB={signalDB} />} />
				<Route path="*" element={<NoPage />} />
				</Route>
			</Routes>
		</BrowserRouter>
	);
}

export default App;
