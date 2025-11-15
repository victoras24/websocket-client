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
	const [connectiondata, setConnectionData] = React.useState<ConnectionData[]>(
		[]
	);

	const wsRef = React.useRef<websocket | null>(null);
	const [selectedPlayer, setSelectedPlayer] = React.useState<string>();
	const [score, setScore] = React.useState<number>();

	React.useEffect(() => {
		if (!wsRef.current) {
			wsRef.current = new websocket();
			wsRef.current.loadData(setData, setConnectionData);
		}

		return () => {
			if (wsRef.current) {
				wsRef.current.websocket.close();
				wsRef.current = null;
			}
		};
	}, []);

	return (
		<div>
			<div>
				<h1>Showcasing websocket from scratch with C#</h1>
				<p>
					Just select an item and insert the amount you want to "bit". Open more
					than one tab with the browser and notice that the count of clients
					connected is increasing. What actually happens is that after the TCP
					handshake is finalized and the websocket handshake is completed, a
					guid is generated for each connection and stored in a
					ConcurrentDictionary to avoid race conditions.
				</p>
				<p>
					If you would like more detailed explanation on how I handle the
					websocket connection, visit the read me file in{" "}
					<a
						href="https://github.com/victoras24/websocket-from-scratch/blob/main/README.md"
						target="_blank"
					>
						github
					</a>
					.
				</p>
			</div>
			<div>
				<h1>
					In total {connectiondata.length} client
					{connectiondata.length > 1 ? "s" : ""} are connected
				</h1>
				{connectiondata.map((connection, index) => {
					return (
						<p key={connection.id}>{`Client ${index + 1}: ${connection.id}`}</p>
					);
				})}
			</div>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					const d = {
						label: selectedPlayer,
						score: score,
					};
					if (wsRef.current) {
						wsRef.current.sendData(JSON.stringify(d));
					}
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
			{data.map((data, index) => {
				return (
					<BarChart
						key={index}
						color={data.color}
						label={data.label}
						score={data.score}
					/>
				);
			})}
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
