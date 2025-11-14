import * as React from "react";
import "./index.css";
import { websocket } from "./websocket";

export interface BarData {
	label: string;
	score: number;
	color: string;
}

export interface ConnectionData {
	id: string;
}

export const Chart: React.FC = () => {
	const [data, setData] = React.useState<BarData[]>([]);
	console.log(data);
	const [connectiondata, setConnectionData] = React.useState<ConnectionData[]>(
		[]
	);
	const [ws] = React.useState(() => new websocket());
	const [selectedPlayer, setSelectedPlayer] = React.useState<string>();
	const [score, setScore] = React.useState<number>();

	React.useEffect(() => {
		ws.loadData(setData, setConnectionData);
	}, [ws]);

	return (
		<div>
			<div>
				<h1>In total {connectiondata.length} clients are connected</h1>
				{connectiondata.map((connection) => {
					return <p>Client with id: {connection.id}</p>;
				})}
			</div>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					const d = {
						label: selectedPlayer,
						score: score,
					};
					ws.sendData(JSON.stringify(d));
				}}
			>
				<div className="chart-option">
					<label htmlFor="option-select">Select item</label>
					<select
						onChange={(e) => setSelectedPlayer(e.target.value)}
						name="options"
						id="option-select"
					>
						<option>Select item</option>
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
					<label htmlFor="input">Price</label>
					<input
						id="input"
						onChange={(e) => setScore(Number(e.target.value))}
					/>
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
		<div
			className="bar-chart"
			style={{ backgroundColor: color, width: `${score}px` }}
		>
			<p className="bar-chart--title">{label}</p>
			<p>{score}</p>
		</div>
	);
};
