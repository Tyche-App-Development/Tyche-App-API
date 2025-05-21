import { WebSocketServer } from 'ws';
import { binance } from 'ccxt';

export function setupBinanceTickerSocket(server) {
    const wss = new WebSocketServer({ server });
    const exchange = new binance({ enableRateLimit: true });

    const symbols = ['BTC/EUR', 'ETH/EUR', 'XRP/EUR', 'SOL/EUR', 'BNB/EUR'];
    const oneYearAgo = Date.now() - 365 * 24 * 60 * 60 * 1000;

    const currentCandles = {};

    function broadcast(data) {
        wss.clients.forEach(client => {
            if (client.readyState === client.OPEN) {
                client.send(JSON.stringify(data));
            }
        });
    }

    wss.on('connection', async ws => {
        console.log('WebSocket client connected');

        ws.on('message', async (msg) => {
            try {
                const data = JSON.parse(msg.toString());
                if (data.type === 'get_klines' && symbols.includes(data.symbol)) {
                    const klines = await exchange.fetchOHLCV(data.symbol, '1d', oneYearAgo);
                    ws.send(JSON.stringify({
                        type: 'klines',
                        symbol: data.symbol,
                        data: klines
                    }));
                    console.log(`Enviados klines manuais para ${data.symbol}`);
                }
            } catch (e) {
                console.error('Erro ao processar mensagem WebSocket:', e.message);
            }
        });
    });

    setInterval(async () => {
        const now = Date.now();

        for (const symbol of symbols) {
            try {
                const ticker = await exchange.fetchTicker(symbol);
                const price = ticker.last;


                if (!currentCandles[symbol]) {
                    currentCandles[symbol] = {
                        time: now,
                        open: price,
                        high: price,
                        low: price,
                        close: price
                    };
                } else {
                    const candle = currentCandles[symbol];
                    candle.close = price;
                    if (price > candle.high) candle.high = price;
                    if (price < candle.low) candle.low = price;
                }

                const candle = currentCandles[symbol];

                broadcast({
                    type: 'ticker',
                    symbol: ticker.symbol,
                    price: price,
                    percent: ticker.percentage,
                    volume: ticker.info?.quoteVolume || 0,
                    time: new Date().toISOString()
                });

                broadcast({
                    type: 'candle_update',
                    symbol: ticker.symbol,
                    candle: [
                        candle.time,
                        candle.open,
                        candle.high,
                        candle.low,
                        candle.close
                    ]
                });

            } catch (error) {
                console.error(`Error fetching ticker for ${symbol}:`, error.message);
            }
        }
    }, 1000);

    return wss;
}
