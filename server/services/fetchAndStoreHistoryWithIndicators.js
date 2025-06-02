import { binance } from 'ccxt';
import { SMA, RSI, MACD } from 'technicalindicators';
import prisma from '../ConfigDatabase/db.js';

const exchange = new binance({ enableRateLimit: true });
const symbols = ['BTC/USDT', 'ETH/USDT', 'XRP/USDT', 'SOL/USDT', 'BNB/USDT'];
const twoYearsAgo = Date.now() - 2 * 365 * 24 * 60 * 60 * 1000;

export async function fetchAndStoreHistoryWithIndicators() {
    for (const symbol of symbols) {
        try {
            const ohlcv = await exchange.fetchOHLCV(symbol, '1d', twoYearsAgo);
            const closes = ohlcv.map(c => c[4]);
            const volumes = ohlcv.map(c => c[5]);

            const ma7 = SMA.calculate({ period: 7, values: closes });
            const ma25 = SMA.calculate({ period: 25, values: closes });
            const ma99 = SMA.calculate({ period: 99, values: closes });
            const rsi = RSI.calculate({ period: 14, values: closes });
            const macd = MACD.calculate({
                values: closes,
                fastPeriod: 12,
                slowPeriod: 26,
                signalPeriod: 9,
                SimpleMAOscillator: false,
                SimpleMASignal: false
            });

            for (let i = 0; i < ohlcv.length; i++) {
                const [timestamp, , , , close, volume] = ohlcv[i];
                await prisma.priceData.create({
                    data: {
                        id_symbol: symbol,
                        timestamp: new Date(timestamp),
                        price: close,
                        volume: volume,
                        ma_7: ma7[i - (ohlcv.length - ma7.length)] ?? 0,
                        ma_25: ma25[i - (ohlcv.length - ma25.length)] ?? 0,
                        ma_99: ma99[i - (ohlcv.length - ma99.length)] ?? 0,
                        rsi: rsi[i - (ohlcv.length - rsi.length)] ?? 0,
                        macd: macd[i - (ohlcv.length - macd.length)]?.MACD ?? 0,
                        dea: macd[i - (ohlcv.length - macd.length)]?.signal ?? 0,
                        diff: macd[i - (ohlcv.length - macd.length)]?.histogram ?? 0,
                    }
                });
            }

            console.log(`${symbol} — Historical data with indicators successfully stored.`);

        } catch (e) {
            console.error(`Error storing data for ${symbol}:`, e.message);
        }
    }
}
