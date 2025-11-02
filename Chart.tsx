import * as React from "react";
import "./index.css";
import { websocket } from "./websocket";

export interface BarData {
	label: string;
	score: number;
	color: string;
}

export const Chart: React.FC = () => {
	const [data, setData] = React.useState<BarData[]>([]);
	const [ws] = React.useState(() => new websocket());

	React.useEffect(() => {
		ws.loadData(setData);
	}, [ws]);

	return (
		<div>
			<form>
				<div className="chart-option">
					<label htmlFor="option-select">Select</label>
					<select name="options" id="option-select">
						<option>Select player</option>
						{data.map((data, index) => {
							return (
								<option key={index} value={data.label}>
									{data.label}
								</option>
							);
						})}
					</select>
				</div>
				<div className="chart-option">
					<label htmlFor="input">Input</label>
					<input id="input" />
				</div>
				<button type="submit">Submit</button>
			</form>
			{data.map((data, index) => (
				<BarChart
					key={index}
					color={data.color}
					label={data.label}
					score={data.score}
				/>
			))}
		</div>
	);
};

const BarChart: React.FC<BarData> = ({ color, label, score }) => {
	return (
		<div className="bar-chart" style={{ backgroundColor: color, width: score }}>
			<p className="bar-chart--title">{label}</p>
			<p>{score}</p>
		</div>
	);
};
