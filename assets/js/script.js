document.getElementById("generate").addEventListener("click", async () => {
    const status = document.getElementById("status");
    status.textContent = "Loading...";

    try {
        const response = await fetch("https://api.quotable.io/random");
        const data = await response.json();
        document.getElementById("post").value = data.content;
        status.textContent = "Success";
    } catch (e) {
        status.textContent = "Error while fetching data";
        console.error("Error while fetching data:", e.message);
    }
});


document.getElementById("save").addEventListener("click", async () => {
    const postContent = document.getElementById("post").value;
    const status = document.getElementById("status");

    if (!postContent.trim()) {
        status.textContent = "No post to save!";
        return;
    }

    status.textContent = "Saving post...";

    try {
        await new Promise(resolve => setTimeout(resolve, 1500));
        document.getElementById("post").value = "";
        status.textContent = "Post saved!";
    } catch (e) {
        status.textContent = "Unable to save post";
        console.error("Unable to save post:", e.message);
    }
});

let socket;

function connect() {
   socket = new WebSocket("wss://api.whitebit.com/ws");

    document.getElementById("currency_status").textContent = "Connecting...";
    document.getElementById("currency_status").className = "connecting";
    socket.onopen = () => {
        console.log("Connected to API");

        document.getElementById("currency_status").textContent = "Connected!";
        document.getElementById("currency_status").className = "connected";

        const message = {
            "id": 1,
            "method": "depth_subscribe",
            "params": ["BTC_USDT", 1, "0"]
        };

        socket.send(JSON.stringify(message));
    };

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log(data);

        if(data.method === "depth_update") {
            const price = data.params?.[1]?.bids?.[0][0];

            if(price){
                const priceDiff = parseFloat(document.getElementById("price").textContent.substring(1)) - price;

                const trend = priceDiff > 0 ? "↑" : "↓";
                const trendStyle = priceDiff > 0 ? "connected" : "disconnected";

                document.getElementById("trend").textContent = trend;
                document.getElementById("trend").className = trendStyle;

                document.getElementById("price").textContent = `$${price}`;
            }

        }
    }
    socket.onclose = (event) => {
        console.log("Disconnected from API", event);
        document.getElementById("currency_status").textContent = "Disconnected!";
        document.getElementById("currency_status").className = "disconnected";

        setTimeout(() => connect(), 3000);
    }

    socket.onerror = (error) => {
        console.error("WebSocket error:", error);
        document.getElementById("currency_status").textContent = "Disconnected";
        document.getElementById("currency_status").className = "disconnected";
    }
}

connect();