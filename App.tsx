import "./index.css";
import { Demo } from "./Demo";
import { Inspector } from "./Inspector";
import { useWebsocket, type Status } from "./websocket";

const repo = "https://github.com/victoras24/websocket-from-scratch";
const clientRepo = "https://github.com/victoras24/websocket-client";
const source = `${repo}/blob/8661d21bd1bf4464d8f21b9d72a6a96f71ef9d14/websocket-server`;
const rfc = "https://datatracker.ietf.org/doc/html/rfc6455";

const statusText: Record<Status, string> = {
	connecting: "Connecting to the server…",
	open: "Connected to the live server",
	closed: "Disconnected, retrying…",
};

const steps = [
	{
		title: "Accept a TCP connection",
		text: "A TcpListener waits on the port. Each client that connects is handed to its own task, so one slow client never blocks the others.",
		file: "TcpLayer.cs",
		lines: "#L13-L27",
	},
	{
		title: "Read the HTTP request by hand",
		text: "The server reads raw bytes until the blank line that ends the headers, then splits out the method, path and each header. No HTTP library is involved.",
		file: "HttpHandler/HttpHandler.cs",
		lines: "#L12-L78",
	},
	{
		title: "Upgrade to WebSocket",
		text: "If the client asked to upgrade, the server proves it speaks WebSocket: it appends the RFC's fixed GUID to the client's key, hashes it with SHA-1, Base64-encodes it and replies 101 Switching Protocols.",
		file: "HttpHandler/HttpHandler.cs",
		lines: "#L80-L96",
	},
	{
		title: "Decode frames bit by bit",
		text: "From here on everything is binary. Bit masks and shifts pull out FIN, the opcode, the mask flag and the length, and the payload is unmasked by XOR-ing it with the 4-byte key.",
		file: "ConnectionHandler.cs",
		lines: "#L107-L163",
	},
	{
		title: "Broadcast to every client",
		text: "The server applies the update, encodes a new frame and writes it to every open connection. A lock per socket keeps two writes from interleaving their bytes.",
		file: "ConnectionHandler.cs",
		lines: "#L322-L350",
	},
];

const features = [
	{
		name: "Opening handshake",
		section: "4.2",
		text: "Hand-parsed HTTP upgrade request and a computed Sec-WebSocket-Accept.",
		file: "HttpHandler/HttpHandler.cs",
		lines: "#L80-L96",
	},
	{
		name: "Frame decoding",
		section: "5.2",
		text: "FIN, opcode, MASK and all three length forms: 7-bit, 16-bit and 64-bit.",
		file: "ConnectionHandler.cs",
		lines: "#L113-L152",
	},
	{
		name: "Payload unmasking",
		section: "5.3",
		text: "XOR of every payload byte with the client's 4-byte masking key.",
		file: "ConnectionHandler.cs",
		lines: "#L230-L234",
	},
	{
		name: "Fragmentation",
		section: "5.4",
		text: "Continuation frames are collected and reassembled into one message.",
		file: "ConnectionHandler.cs",
		lines: "#L172-L225",
	},
	{
		name: "Frame encoding",
		section: "5.2",
		text: "Server-to-client text frames, again with all three length forms.",
		file: "ConnectionHandler.cs",
		lines: "#L79-L105",
	},
	{
		name: "Close handshake",
		section: "5.5.1",
		text: "A Close frame from the client is echoed back before the socket closes.",
		file: "ConnectionHandler.cs",
		lines: "#L240-L260",
	},
	{
		name: "Ping keep-alive",
		section: "5.5.2",
		text: "The server pings every client every 20 seconds and accepts the Pong.",
		file: "ConnectionHandler.cs",
		lines: "#L271-L311",
	},
	{
		name: "Partial reads",
		section: "5.2",
		text: "TCP is a stream, so a frame that arrives in pieces is buffered until complete.",
		file: "ConnectionHandler.cs",
		lines: "#L52-L61",
	},
	{
		name: "Concurrency",
		section: null,
		text: "One task per connection, a ConcurrentDictionary of clients and a SemaphoreSlim guarding each socket's writes.",
		file: "ConnectionHandler.cs",
		lines: "#L18-L20",
	},
];

export const App = () => {
	const { status, data, connectionData, log, sendScore } = useWebsocket();

	return (
		<main>
			<header className="hero">
				<p className="hero--eyebrow">C# · .NET 8 · RFC 6455</p>
				<h1>A WebSocket server, built from scratch</h1>
				<p className="hero--lead">
					I wrote this server directly on top of a TCP socket. There is no
					ASP.NET and no WebSocket library: the handshake, the binary frame
					parsing and the broadcasting are all my own code. This page is talking
					to it right now.
				</p>
				<div className="hero--row">
					<span className={`status ${status}`} role="status">
						<span className="status--dot" />
						{statusText[status]}
					</span>
					<a href={repo} target="_blank" rel="noreferrer">
						Server source
					</a>
					<a href={`${repo}/blob/main/README.md`} target="_blank" rel="noreferrer">
						Write-up
					</a>
					<a href={clientRepo} target="_blank" rel="noreferrer">
						This page's source
					</a>
				</div>
			</header>

			<section>
				<h2>Try it</h2>
				<div className="demo">
					<Demo
						status={status}
						data={data}
						connectionData={connectionData}
						sendScore={sendScore}
					/>
					<Inspector log={log} />
				</div>
			</section>

			<section>
				<h2>What happens when you click</h2>
				<ol className="steps">
					{steps.map((step) => (
						<li key={step.title}>
							<h3>{step.title}</h3>
							<p>{step.text}</p>
							<a
								href={`${source}/${step.file}${step.lines}`}
								target="_blank"
								rel="noreferrer"
							>
								{step.file}
							</a>
						</li>
					))}
				</ol>
			</section>

			<section>
				<h2>The handshake</h2>
				<p className="section--lead">
					A WebSocket starts life as an ordinary HTTP request. The server has to
					answer with a value derived from the client's key, which proves it
					understood the upgrade. Send the RFC's sample key to the live server
					and it returns exactly the value the RFC expects.
				</p>
				<div className="handshake">
					<div>
						<p className="frame--label">Client asks</p>
						<pre className="code">
							{`GET /ws HTTP/1.1
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Version: 13
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==`}
						</pre>
					</div>
					<div>
						<p className="frame--label">Server computes</p>
						<pre className="code">
							{`Base64(SHA-1(
  "dGhlIHNhbXBsZSBub25jZQ=="
  + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"
))`}
						</pre>
					</div>
					<div>
						<p className="frame--label">Server answers</p>
						<pre className="code">
							{`HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=`}
						</pre>
					</div>
				</div>
			</section>

			<section>
				<h2>What I implemented</h2>
				<ul className="features">
					{features.map((feature) => (
						<li key={feature.name}>
							<div className="features--head">
								<h3>{feature.name}</h3>
								{feature.section && (
									<a
										href={`${rfc}#section-${feature.section}`}
										target="_blank"
										rel="noreferrer"
									>
										RFC §{feature.section}
									</a>
								)}
							</div>
							<p>{feature.text}</p>
							<a
								href={`${source}/${feature.file}${feature.lines}`}
								target="_blank"
								rel="noreferrer"
							>
								View the code
							</a>
						</li>
					))}
				</ul>
				<p className="section--note">
					Not implemented yet: replying to pings sent by a client, and
					extensions such as permessage-deflate. TLS is handled by Azure in
					front of the server.
				</p>
			</section>

			<footer>
				Built by{" "}
				<a href="https://github.com/victoras24" target="_blank" rel="noreferrer">
					victoras24
				</a>{" "}
				with C#, React and{" "}
				<a href={rfc} target="_blank" rel="noreferrer">
					RFC 6455
				</a>
				.
			</footer>
		</main>
	);
};
