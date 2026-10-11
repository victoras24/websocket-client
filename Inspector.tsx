import * as React from "react";
import { frameSize, toHex } from "./frame";
import type { LogEntry } from "./websocket";

const maxPayloadBytes = 32;

const formatTime = (time: Date) =>
	time.toLocaleTimeString([], { hour12: false });

const prettyJson = (text: string) => {
	try {
		return JSON.stringify(JSON.parse(text), null, 2);
	} catch {
		return text;
	}
};

export const Inspector: React.FC<{ log: LogEntry[] }> = ({ log }) => {
	// null follows the newest frame until the visitor picks one.
	const [selectedId, setSelectedId] = React.useState<number | null>(null);
	const selected = log.find((entry) => entry.id === selectedId) ?? log[0];

	return (
		<div className="panel">
			<h3>On the wire</h3>
			<p className="panel--hint">
				Every WebSocket message travels as a binary frame. Pick one to see its
				bytes and how the server reads them.
			</p>

			{!selected && <p className="panel--empty">No frames yet.</p>}

			{selected && (
				<>
					<ul className="log">
						{log.map((entry) => (
							<li key={entry.id}>
								<button
									className={
										entry.id === selected.id ? "log--row selected" : "log--row"
									}
									onClick={() => setSelectedId(entry.id)}
								>
									<span className={`log--direction ${entry.direction}`}>
										{entry.direction === "sent" ? "↑ sent" : "↓ received"}
									</span>
									<span className="log--summary">{entry.summary}</span>
									<span className="log--meta">
										{frameSize(entry.fields)} B · {formatTime(entry.time)}
									</span>
								</button>
							</li>
						))}
					</ul>
					<Frame entry={selected} />
				</>
			)}
		</div>
	);
};

const Frame: React.FC<{ entry: LogEntry }> = ({ entry }) => {
	return (
		<div className="frame">
			<div className="frame--bytes" aria-hidden="true">
				{entry.fields.map((field) => {
					const hidden = Math.max(0, field.bytes.length - maxPayloadBytes);
					return (
						<React.Fragment key={field.name}>
							{Array.from(field.bytes.slice(0, maxPayloadBytes), (byte, i) => (
								<span className={`byte ${field.kind}`} key={i}>
									{toHex(byte)}
								</span>
							))}
							{hidden > 0 && (
								<span className="frame--more">+{hidden} more</span>
							)}
						</React.Fragment>
					);
				})}
			</div>

			<table className="frame--fields">
				<tbody>
					{entry.fields.map((field) => (
						<tr key={field.name}>
							<th scope="row">
								<span className={`swatch ${field.kind}`} />
								{field.name}
								<span className="frame--size">
									{field.bytes.length} byte{field.bytes.length === 1 ? "" : "s"}
								</span>
							</th>
							<td>
								{field.bits && <code>{field.bits}</code>}
								{field.notes.map((note) => (
									<div key={note}>{note}</div>
								))}
							</td>
						</tr>
					))}
				</tbody>
			</table>

			<p className="frame--label">Decoded payload</p>
			<pre className="code">{prettyJson(entry.text)}</pre>

			<p className="frame--note">
				{entry.direction === "sent"
					? "Browsers do not expose raw frames or the masking key they pick, so the key above is a stand-in. Every other byte is what the browser sends."
					: "Rebuilt from the payload. The server sends unmasked, single-frame text, so these are the bytes its encoder wrote."}
			</p>
		</div>
	);
};
