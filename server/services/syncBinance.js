import { decrypt } from '../utils/cryptoUtils.js';
import prisma from '../ConfigDatabase/db.js';
import axios from 'axios';
import { Spot } from '@binance/connector';

const SPOT_REST_API_TESTNET_URL = 'https://testnet.binance.vision';
const ALLOWED_ASSETS = ['XRP', 'BTC', 'SOL', 'BNB', 'ETH'];

export async function syncAllUsersBinanceData() {
    const users = await prisma.user.findMany();

    for (const user of users) {
        try {
            const apiKey = decrypt(user.apiKey);
            const apiSecret = decrypt(user.apiSecret);
            const client = new Spot(apiKey, apiSecret, { baseURL: SPOT_REST_API_TESTNET_URL });

            // --- BALANCE ---
            const result = await client.account();
            const balances = result.data.balances;
            let totalBalanceUSD = 0;
            const detailedBalances = [];

            for (const asset of balances) {
                if (!ALLOWED_ASSETS.includes(asset.asset)) continue;

                const total = parseFloat(asset.free) + parseFloat(asset.locked);
                if (total <= 0) continue;

                const pair = `${asset.asset}USDT`;
                try {
                    const response = await axios.get(`https://testnet.binance.vision/api/v3/ticker/price?symbol=${pair}`);
                    const priceUSD = parseFloat(response.data.price);
                    const valueUSD = total * priceUSD;
                    totalBalanceUSD += valueUSD;

                    detailedBalances.push({
                        asset: asset.asset,
                        amount: total,
                        priceUSD: parseFloat(priceUSD.toFixed(4)),
                        valueUSD: parseFloat(valueUSD.toFixed(2))
                    });
                } catch (err) {
                    console.warn(`Erro ao obter preço de ${pair}:`, err.message);
                }
            }

            await prisma.user.update({
                where: { id: user.id },
                data: {
                    balance: totalBalanceUSD,
                    balanceDetails: detailedBalances
                }
            });

            // --- TRADES & GAIN/LOSS ---
            for (const symbol of ['BTCUSDT', 'ETHUSDT', 'XRPUSDT', 'SOLUSDT', 'BNBUSDT']) {
                try {
                    const tradesRes = await client.myTrades(symbol);
                    const trades = tradesRes.data;
                    if (!trades || trades.length === 0) continue;

                    const currentPriceRes = await client.tickerPrice(symbol);
                    const currentPrice = parseFloat(currentPriceRes.data.price);

                    for (const trade of trades) {
                        const qty = parseFloat(trade.qty);
                        const price = parseFloat(trade.price);
                        const quoteQty = parseFloat(trade.quoteQty);
                        const isBuyer = trade.isBuyer;
                        const gainLoss = (currentPrice - price) * qty * (isBuyer ? 1 : -1);

                        const existing = await prisma.historyTrade.findUnique({
                            where: { tradeId: trade.id }
                        });

                        if (existing) {
                            await prisma.historyTrade.update({
                                where: { tradeId: trade.id },
                                data: {
                                    gain_loss: parseFloat(gainLoss.toFixed(4))
                                }
                            });
                        } else {
                            await prisma.historyTrade.create({
                                data: {
                                    tradeId: trade.id,
                                    id_user: user.id,
                                    symbol,
                                    price,
                                    amount: qty,
                                    quoteQuantity: quoteQty,
                                    gain_loss: parseFloat(gainLoss.toFixed(4)),
                                    isBuyer,
                                    timestamp: new Date(trade.time)
                                }
                            });
                        }
                    }
                } catch (err) {
                    console.warn(`Erro ao sincronizar trades de ${symbol} para o user ${user.id}:`, err.message);
                }
            }

            // --- PROFIT & PNL ---
            let totalProfit = 0;
            let totalEffectiveCost = 0;

            for (const asset of detailedBalances) {
                const symbol = asset.asset + 'USDT';
                let allTrades = [];
                let fromId = null;
                let hasMore = true;

                try {
                    await client.exchangeInfo({ symbol });

                    while (hasMore) {
                        const params = { symbol, limit: 500 };
                        if (fromId) params.fromId = fromId;

                        const tradeRes = await client.myTrades(symbol, params);
                        const trades = tradeRes.data;
                        allTrades = allTrades.concat(trades);

                        if (trades.length < 500) {
                            hasMore = false;
                        } else {
                            fromId = trades[trades.length - 1].id + 1;
                        }
                    }
                } catch (err) {
                    console.warn(`❌ Erro ao obter trades para ${symbol}:`, err.message);
                    continue;
                }

                let totalBought = 0;
                let costBought = 0;
                let totalSold = 0;

                for (const trade of allTrades) {
                    const qty = parseFloat(trade.qty);
                    const price = parseFloat(trade.price);
                    const commission = (trade.commissionAsset === 'USDT') ? parseFloat(trade.commission) : 0;

                    if (trade.isBuyer) {
                        totalBought += qty;
                        costBought += qty * price + commission;
                    } else {
                        totalSold += qty;
                    }
                }

                const amountStillHeld = totalBought - totalSold;
                if (amountStillHeld <= 0) continue;

                const currentAmount = asset.amount;
                const averageBuyPrice = costBought / totalBought;
                const effectiveCost = averageBuyPrice * amountStillHeld;
                const profit = (asset.priceUSD - averageBuyPrice) * currentAmount;

                totalProfit += profit;
                totalEffectiveCost += effectiveCost;
            }

            const globalPNL = totalEffectiveCost > 0 ? (totalProfit / totalEffectiveCost) * 100 : 0;

            await prisma.user.update({
                where: { id: user.id },
                data: {
                    profit: parseFloat(totalProfit.toFixed(2)),
                    pnl: parseFloat(globalPNL.toFixed(2))
                }
            });

        } catch (err) {
            console.warn(`❌ Falha ao sincronizar utilizador ${user.id}:`, err.message);
        }
    }

    console.log(`[SYNC] ✅ Finalizada sincronização de saldo, trades e PNL às ${new Date().toISOString()}`);
}
