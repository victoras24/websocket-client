import * as React from "react";
import "./index.css";
import { websocket } from "./websocket";

interface BarData {
	label: string;
	value: number;
	color: string;
}

export const mockBarData: BarData[] = [
	{ label: "Player 1", value: 75, color: "#4caf50" },
	{ label: "Player 2", value: 50, color: "#2196f3" },
	{ label: "Player 3", value: 90, color: "#ff9800" },
	{ label: "Player 4", value: 30, color: "#f44336" },
	{ label: "Player 5", value: 60, color: "#9c27b0" },
];

export const Chart: React.FC = () => {
	new websocket();
	return (
		<div>
			<form>
				<div className="chart-option">
					<label htmlFor="option-select">Select</label>
					<select name="options" id="option-select">
						<option value="">Select player</option>
						{mockBarData.map((data, index) => (
							<option key={index} value={data.label}>
								{data.label}
							</option>
						))}
					</select>
				</div>
				<div className="chart-option">
					<label htmlFor="input">Input</label>
					<input id="input" />
				</div>
				<button type="submit">Submit</button>
			</form>
			{mockBarData.map(
				(data, index) =>
					data.color && (
						<BarChart
							key={index}
							color={data.color}
							label={data.label}
							value={data.value}
						/>
					)
			)}
		</div>
	);
};

const BarChart: React.FC<BarData> = ({ color, label, value }) => {
	return (
		<div className="bar-chart" style={{ backgroundColor: color, width: value }}>
			<p className="bar-chart--title">{label}</p>
			<p>{value}</p>
		</div>
	);
};
