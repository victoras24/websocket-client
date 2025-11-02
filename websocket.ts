import type { BarData } from "./Chart";

export class websocket {
	websocket: WebSocket;
	url: string = "ws://localhost:8080";

	constructor() {
		this.websocket = new WebSocket(this.url);
	}

	loadData = (setData: React.Dispatch<React.SetStateAction<BarData[]>>) => {
		this.websocket.onmessage = (e) => {
			console.log(e.data);
			setData(JSON.parse(e.data));
		};
	};

	sendData = (data: any) => {
		this.websocket.send(data);
	};
}
