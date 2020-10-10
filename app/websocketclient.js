const websocketclient = Object.create(null);

websocketclient.setup = function (wsName) {
    this.ws = new WebSocket(wsName);
    this.ws.onerror = ;
    this.ws.onopen = ;
    this.ws.onmessage = ;
    this.ws.onclose = function() {
        setTimeout(websocketclient.setup(wsName), 1000);
    };
};

export default Object.freeze(websocketclient);
