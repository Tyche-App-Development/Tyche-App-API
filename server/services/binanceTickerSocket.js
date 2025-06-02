import { WebSocketServer } from 'ws';
import { binance } from 'ccxt';
import { SMA, RSI, MACD } from 'technicalindicators';
import prisma from '../ConfigDatabase/db.js';

export function setupBinanceTickerSocket(server) {
    const wss = new WebSocketServer({ server });
    const exchange = new binance({ enableRateLimit: true });

    const symbols = ['BTC/USDT', 'ETH/USDT', 'XRP/USDT', 'SOL/USDT', 'BNB/USDT'];
    const currentCandles = {};
    const historicalCloses = {};
    const historicalVolumes = {};

    function broadcast(data) {
        wss.clients.forEach(client => {
            if (client.readyState === client.OPEN) {
                client.send(JSON.stringify(data));
            }
        });
    }

    async function initializeHistoricalData() {
        const twoYearsAgo = Date.now() - 2 * 365 * 24 * 60 * 60 * 1000;

        for (const symbol of symbols) {
            const ohlcv = await exchange.fetchOHLCV(symbol, '1d', twoYearsAgo);
            historicalCloses[symbol] = ohlcv.map(c => c[4]);
            historicalVolumes[symbol] = ohlcv.map(c => c[5]);
        }
    }

    wss.on('connection', ws => {
        console.log('WebSocket client connected');
        ws.on('message', async msg => {
            try {
                const data = JSON.parse(msg.toString());
                if (data.type === 'get_klines' && symbols.includes(data.symbol)) {
                    const twoYearsAgo = Date.now() - 2 * 365 * 24 * 60 * 60 * 1000;
                    const klines = await exchange.fetchOHLCV(data.symbol, '1d', twoYearsAgo);
                    ws.send(JSON.stringify({
                        type: 'klines',
                        symbol: data.symbol,
                        data: klines
                    }));
                    console.log(`Klines sent for ${data.symbol}`);
                }
            } catch (e) {
                console.error('Error processing WebSocket message:', e.message);
            }
        });
    });

    setInterval(async () => {
        const now = Date.now();

        for (const symbol of symbols) {
            try {
                const ticker = await exchange.fetchTicker(symbol);
                const price = ticker.last;
                const volume = ticker.info?.quoteVolume || 0;

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
                    price,
                    percent: ticker.percentage,
                    volume,
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

                historicalCloses[symbol].push(price);
                historicalVolumes[symbol].push(volume);
                if (historicalCloses[symbol].length > 100) {
                    historicalCloses[symbol].shift();
                    historicalVolumes[symbol].shift();
                }

                const ma7 = SMA.calculate({ period: 7, values: historicalCloses[symbol] }).slice(-1)[0] || 0;
                const ma25 = SMA.calculate({ period: 25, values: historicalCloses[symbol] }).slice(-1)[0] || 0;
                const ma99 = SMA.calculate({ period: 99, values: historicalCloses[symbol] }).slice(-1)[0] || 0;
                const rsi = RSI.calculate({ period: 14, values: historicalCloses[symbol] }).slice(-1)[0] || 0;
                const macd = MACD.calculate({
                    values: historicalCloses[symbol],
                    fastPeriod: 12,
                    slowPeriod: 26,
                    signalPeriod: 9,
                    SimpleMAOscillator: false,
                    SimpleMASignal: false
                }).slice(-1)[0] || { MACD: 0, signal: 0, histogram: 0 };

                await prisma.priceData.upsert({
                    where: { id_symbol: symbol },
                    update: {
                        timestamp: new Date(now),
                        price,
                        volume: parseFloat(volume),
                        ma_7: ma7,
                        ma_25: ma25,
                        ma_99: ma99,
                        rsi,
                        macd: macd.MACD,
                        dea: macd.signal,
                        diff: macd.histogram
                    },
                    create: {
                        id_symbol: symbol,
                        timestamp: new Date(now),
                        price,
                        volume: parseFloat(volume),
                        ma_7: ma7,
                        ma_25: ma25,
                        ma_99: ma99,
                        rsi,
                        macd: macd.MACD,
                        dea: macd.signal,
                        diff: macd.histogram
                    }
                });

            } catch (error) {
                console.error(`Error updating data for ${symbol}:`, error.message);
            }
        }
    }, 1000);

    initializeHistoricalData().then(() => {
        console.log('Historical data loaded for indicators.');
    });

    return wss;
}
