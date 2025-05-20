import { WebSocketServer } from 'ws';
import { binance } from 'ccxt';

export function setupBinanceTickerSocket(server) {
    const wss = new WebSocketServer({ server });

    const exchange = new binance({ enableRateLimit: true });

    function broadcast(data) {
        wss.clients.forEach(client => {
            if (client.readyState === 1) {
                client.send(JSON.stringify(data));
            }
        });
    }

    setInterval(async () => {
        const symbols = ['BTC/EUR', 'ETH/EUR', 'XRP/EUR', 'SOL/EUR', 'BNB/EUR'];

        for (const symbol of symbols) {
            try {
                const ticker = await exchange.fetchTicker(symbol);
                const payload = {
                    symbol: ticker.symbol,
                    price: ticker.last,
                    percent: ticker.percentage,
                    volume: ticker.info.quoteVolume,
                    time: new Date().toISOString(),
                };
                broadcast(payload);
            } catch (error) {
                console.error(`Error fetching ticker for ${symbol}:`, error.message);
            }
        }
    }, 1000);

    wss.on('connection', ws => {
        console.log('WebSocket client connected');
        ws.send(JSON.stringify({ message: 'Connected to BTC/USDC price feed' }));
    });

    return wss;
}
