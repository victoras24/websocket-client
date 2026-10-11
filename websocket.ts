import * as React from "react";
import { buildTextFrame, type FrameField } from "./frame";

const url: string =
	import.meta.env.VITE_WS_URL ??
	"wss://websocketfromscratch-dbhde4c3dvcbarcb.westeurope-01.azurewebsites.net/ws";

const maxLogEntries = 40;

export type Status = "connecting" | "open" | "closed";

export interface BarData {
	label: string;
	score: number;
	color: string;
}

export interface ConnectionData {
	id: string;
}

export interface LogEntry {
	id: number;
	direction: "sent" | "received";
	time: Date;
	summary: string;
	text: string;
	fields: FrameField[];
}

export const useWebsocket = () => {
	const [status, setStatus] = React.useState<Status>("connecting");
	const [data, setData] = React.useState<BarData[]>([]);
	const [connectionData, setConnectionData] = React.useState<ConnectionData[]>(
		[]
	);
	const [log, setLog] = React.useState<LogEntry[]>([]);

	const wsRef = React.useRef<WebSocket | null>(null);
	const nextId = React.useRef(1);

	const addToLog = (entry: Omit<LogEntry, "id" | "time">) => {
		const full = { ...entry, id: nextId.current++, time: new Date() };
		setLog((log) => [full, ...log].slice(0, maxLogEntries));
	};

	React.useEffect(() => {
		let disposed = false;
		let attempt = 0;
		let retry: ReturnType<typeof setTimeout> | undefined;

		const connect = () => {
			setStatus("connecting");
			const ws = new WebSocket(url);
			wsRef.current = ws;

			ws.onopen = () => {
				attempt = 0;
				setStatus("open");
			};

			ws.onmessage = (e) => {
				if (typeof e.data !== "string") return;
				const message = JSON.parse(e.data);
				let summary = "Message";

				if (message.type === "players") {
					setData(message.data);
					summary = "Current items, sent on connect";
				} else if (message.type === "connections") {
					setConnectionData(message.data);
					summary = `Connected clients: ${message.data.length}`;
				} else if (Array.isArray(message)) {
					setData(message);
					summary = "Updated items, broadcast to everyone";
				}

				// The server sends unmasked, unfragmented text frames, so the
				// payload alone is enough to rebuild the bytes it wrote.
				addToLog({
					direction: "received",
					summary,
					text: e.data,
					fields: buildTextFrame(e.data),
				});
			};

			ws.onclose = () => {
				if (disposed) return;
				setStatus("closed");
				setConnectionData([]);
				retry = setTimeout(connect, Math.min(1000 * 2 ** attempt++, 15000));
			};
		};

		connect();

		return () => {
			disposed = true;
			clearTimeout(retry);
			wsRef.current?.close();
			wsRef.current = null;
		};
	}, []);

	const sendScore = (label: string, score: number) => {
		const ws = wsRef.current;
		if (!ws || ws.readyState !== WebSocket.OPEN) return;

		const text = JSON.stringify({ label, score });
		ws.send(text);

		// The browser picks the real masking key and never exposes it, so the
		// log shows a stand-in key of the same shape.
		addToLog({
			direction: "sent",
			summary: `Set ${label} to ${score}`,
			text,
			fields: buildTextFrame(text, crypto.getRandomValues(new Uint8Array(4))),
		});
	};

	return { status, data, connectionData, log, sendScore };
};
