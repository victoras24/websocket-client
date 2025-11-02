const ws = new WebSocket("ws:localhost:8080");

const button = document.getElementById("button");
const input = document.getElementById("input");
const output = document.querySelector("#output");

function send(input) {
	ws.send(input.value);
	DisplayToThePage(input.value);
	input.value = "";
}

button.addEventListener("click", () => {
	send(input);
});

ws.addEventListener("message", (e) => {
	console.log(e.data);
});

onmessage = (e) => {
	output.insertAdjacentHTML("afterbegin", `<p>SERVER: ${e.data}</p>`);
};

ws.addEventListener("open", () => {
	ws.send("Hello from the client.");
});

switch (ws.readyState) {
	case 0:
		console.log("Socket has been created. The connection is not yet open.");
		break;
	case 1:
		console.log("The connection is open and ready to communicate.");
		break;
	case 2:
		console.log("The connection is in the process of closing.");
		break;
	case 3:
		console.log("The connection is closed or couldn't be opened.");
		break;
}

onerror = (e) => {
	console.log("error", e);
};

function DisplayToThePage(message) {
	output.insertAdjacentHTML("afterbegin", `<p>CLIENT: ${message}</p>`);
}
