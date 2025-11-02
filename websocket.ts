export class websocket {
	websocket: WebSocket;
	url: string = "ws://localhost:8080";
	constructor() {
		this.websocket = new WebSocket(this.url);
	}
}
