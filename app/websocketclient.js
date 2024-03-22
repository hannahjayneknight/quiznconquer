const websocketclient = Object.create(null);

websocketclient.setup = function (wsName) {
    this.ws = new WebSocket(wsName);
    this.ws.onerror = function(event) {
        console.error("WebSocket error:", event);
        // You could implement error handling logic here, such as retrying the connection
    };
    this.ws.onopen = function() {
        console.log("WebSocket connection established");
        // You could perform initialization tasks here, such as sending authentication information
    };
    this.ws.onmessage = function(event) {
        console.log("Message received:", event.data);
        // You could handle incoming messages here, such as updating the UI
        // Example: document.getElementById('messages').innerText = event.data;
    };
    this.ws.onclose = function(event) {
        console.log("WebSocket connection closed. Reconnecting...");
        // Reconnect after a delay
        setTimeout(function() {
            websocketclient.setup(wsName);
        }, 1000);
    };
};


export default Object.freeze(websocketclient);
