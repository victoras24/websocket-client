import * as React from "react";
import type { BarData, ConnectionData, Status } from "./websocket";

interface DemoProps {
	status: Status;
	data: BarData[];
	connectionData: ConnectionData[];
	sendScore: (label: string, score: number) => void;
}

const step = 10;

export const Demo: React.FC<DemoProps> = ({
	status,
	data,
	connectionData,
	sendScore,
}) => {
	const disabled = status !== "open";
	const scale = Math.max(100, ...data.map((item) => item.score));

	return (
		<div className="panel">
			<h3>Shared state</h3>
			<p className="panel--hint">
				These values live in the server's memory. Every click sends one frame,
				and the server broadcasts the result to every connected client.
			</p>

			{data.length === 0 && (
				<p className="panel--empty">
					{status === "closed"
						? "Not connected. Retrying…"
						: "Waiting for the server. It can take a few seconds to wake up."}
				</p>
			)}

			{data.map((item) => (
				<div className="item" key={item.label}>
					<div className="item--head">
						<span className="item--label">{item.label}</span>
						<span className="item--score">{item.score}</span>
					</div>
					<div className="item--track">
						<div
							className="item--bar"
							style={{
								width: `${(Math.max(0, item.score) / scale) * 100}%`,
							}}
						/>
					</div>
					<div className="item--actions">
						<button
							disabled={disabled || item.score <= 0}
							onClick={() =>
								sendScore(item.label, Math.max(0, item.score - step))
							}
						>
							−{step}
						</button>
						<button
							disabled={disabled}
							onClick={() => sendScore(item.label, item.score + step)}
						>
							+{step}
						</button>
						<button
							className="button--quiet"
							disabled={disabled || item.score === 0}
							onClick={() => sendScore(item.label, 0)}
						>
							Reset
						</button>
					</div>
				</div>
			))}

			<h3 className="panel--subtitle">
				{connectionData.length} client{connectionData.length === 1 ? "" : "s"}{" "}
				connected
			</h3>
			<p className="panel--hint">
				Open this page in another tab and watch both update. Each connection
				gets a GUID and is kept in a ConcurrentDictionary on the server.
			</p>
			<ul className="clients">
				{connectionData.map((connection) => (
					<li key={connection.id}>{connection.id}</li>
				))}
			</ul>
		</div>
	);
};
