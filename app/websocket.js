
// creates a new websocket for each person entering the app
const ws = new WebSocket("ws://localhost:1711");

export default Object.freeze(ws);