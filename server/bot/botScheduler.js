import cron from 'node-cron';
import { runBotForUser } from './btc_bot.js';
import prisma from '../ConfigDatabase/db.js';

export async function runAllBots() {
    try {
        const strategies = await prisma.userStrategy.findMany({
            where: { status: true },
            include: { bot: true }
        });

        for (const strategy of strategies) {
            const userId = strategy.id_user;
            const risk = strategy.bot.strategyRisk;
            await runBotForUser(userId, risk);
        }
    } catch (err) {
        console.error('Error running all bots:', err.message);
    }
}


runAllBots();

cron.schedule('*/15 * * * *', () => {
    console.log(`[BOT] Running all strategies at ${new Date().toLocaleTimeString()}`);
    runAllBots();
});
