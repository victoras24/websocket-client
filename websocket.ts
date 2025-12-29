import type { BarData, ConnectionData } from "./Chart";

export class websocket {
	websocket: WebSocket;
	url: string =
		"wss://websocketfromscratch-dbhde4c3dvcbarcb.westeurope-01.azurewebsites.net/ws";

	constructor() {
		this.websocket = new WebSocket(this.url);
	}

	loadData = (
		setBarData: React.Dispatch<React.SetStateAction<BarData[]>>,
		setConnectionData: React.Dispatch<React.SetStateAction<ConnectionData[]>>
	) => {
		this.websocket.onmessage = (e) => {
			if (JSON.parse(e.data).type === "players") {
				setBarData(JSON.parse(e.data).data);
			} else if (JSON.parse(e.data).type === "connections") {
				setConnectionData(JSON.parse(e.data).data);
			} else {
				setBarData(JSON.parse(e.data));
			}
		};
	};

	sendData = (data: any) => {
		this.websocket.send(data);
	};
}
