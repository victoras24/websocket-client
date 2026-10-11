# websocket-client

Showcase page for [websocket-from-scratch](https://github.com/victoras24/websocket-from-scratch), a WebSocket server written in C# on a raw TCP socket.

The page connects to the live server, lets visitors change shared state, and shows each frame's bytes next to an explanation of how the server reads them.

## Run

```
npm install
npm run dev
```

To point the page at a server running locally, set `VITE_WS_URL`:

```
VITE_WS_URL=ws://localhost:8080/ws npm run dev
```

`npm run build` writes the static site to `dist/`.
