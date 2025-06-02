import prisma from '../ConfigDatabase/db.js';

async function createDefaultBots() {
    const baseStrategies = [
        {
            baseName: 'BTC Grid',
            strategyDescription: 'Grid bot from BTC volatility',
            timeInterval: '1h',
            indicators: {
                Low:     { maS: 9,  maM: 21, maL: 55, rsi: 14, macdF: 12, macdS: 26, macdSig: 9 },
                Medium:  { maS: 7,  maM: 25, maL: 99, rsi: 14, macdF: 12, macdS: 26, macdSig: 9 },
                High:    { maS: 5,  maM: 15, maL: 45, rsi: 10, macdF: 8,  macdS: 21, macdSig: 5 }
            }
        },
        {
            baseName: 'ETH Momentum+Trailing',
            strategyDescription: 'Momentum bot with trailing stop for ETH trends',
            timeInterval: '1h',
            indicators: {
                Low:     { maS: 15, maM: 35, maL: 99, rsi: 14, macdF: 12, macdS: 26, macdSig: 9 },
                Medium:  { maS: 10, maM: 30, maL: 90, rsi: 14, macdF: 8,  macdS: 21, macdSig: 5 },
                High:    { maS: 5,  maM: 20, maL: 50, rsi: 10, macdF: 5,  macdS: 13, macdSig: 3 }
            }
        },
        {
            baseName: 'XRP Arbitrage',
            strategyDescription: 'Arbitrage bot looking for price gaps across exchanges',
            timeInterval: '15m',
            indicators: {
                Low:    { maS: 0, maM: 0, maL: 0, rsi: 0, macdF: 0, macdS: 0, macdSig: 0 },
                Medium: { maS: 0, maM: 0, maL: 0, rsi: 0, macdF: 0, macdS: 0, macdSig: 0 },
                High:   { maS: 0, maM: 0, maL: 0, rsi: 0, macdF: 0, macdS: 0, macdSig: 0 }
            }
        },
        {
            baseName: 'SOL Breakout',
            strategyDescription: 'Detects breakout from support/resistance levels in SOL',
            timeInterval: '30m',
            indicators: {
                Low:     { maS: 9,  maM: 21, maL: 55, rsi: 14, macdF: 12, macdS: 26, macdSig: 9 },
                Medium:  { maS: 5,  maM: 20, maL: 50, rsi: 10, macdF: 5,  macdS: 13, macdSig: 3 },
                High:    { maS: 3,  maM: 15, maL: 40, rsi: 7,  macdF: 4,  macdS: 10, macdSig: 2 }
            }
        },
        {
            baseName: 'BNB Mean Reversion',
            strategyDescription: 'Reversion to mean bot for BNB using MA & RSI',
            timeInterval: '1h',
            indicators: {
                Low:     { maS: 15, maM: 30, maL: 70, rsi: 14, macdF: 12, macdS: 26, macdSig: 9 },
                Medium:  { maS: 9,  maM: 21, maL: 55, rsi: 14, macdF: 10, macdS: 22, macdSig: 8 },
                High:    { maS: 5,  maM: 15, maL: 35, rsi: 10, macdF: 6,  macdS: 15, macdSig: 4 }
            }
        }
    ];

    const risks = ['Low', 'Medium', 'High'];

    for (const strategy of baseStrategies) {
        for (const risk of risks) {
            const strategyName = `${strategy.baseName} [${risk}]`;
            const exists = await prisma.bot.findFirst({ where: { strategyName } });

            if (!exists) {
                const i = strategy.indicators[risk];
                await prisma.bot.create({
                    data: {
                        strategyName,
                        strategyRisk: risk,
                        strategyDescription: strategy.strategyDescription,
                        timeInterval: strategy.timeInterval,
                        defaultMaShort: i.maS,
                        defaultMaMid: i.maM,
                        defaultMaLong: i.maL,
                        defaultRSIPeriod: i.rsi,
                        defaultMacdFast: i.macdF,
                        defaultMacdSlow: i.macdS,
                        defaultMacdSignal: i.macdSig
                    }
                });
                console.log(`Bot "${strategyName}" created.`);
            } else {
                console.log(`Bot "${strategyName}" already exists.`);
            }
        }
    }

    await prisma.$disconnect();
}

createDefaultBots().catch(err => {
    console.error('Error creating bots:', err);
    prisma.$disconnect();
});
