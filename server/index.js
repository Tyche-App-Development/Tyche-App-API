import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
import { WebSocketServer } from 'ws';
import { binance } from 'ccxt';
import authRoutes from './routes/authRoutes.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);

// WebSocket: Binance ticker logic
const exchange = new binance();

function broadcast(data) {
    wss.clients.forEach(client => {
        if (client.readyState === 1) { // WebSocket.OPEN === 1
            client.send(JSON.stringify(data));
        }
    });
}

// Fetch and broadcast ticker data every second
setInterval(async () => {
    try {
        const ticker = await exchange.fetchTicker('BTC/USDC');
        console.log('Ticker received:', ticker);
        const payload = {
            symbol: ticker.symbol,
            price: ticker.last,
            time: new Date().toISOString()
        };
        broadcast(payload);
    } catch (error) {
        console.error('Error fetching ticker:', error);
    }
}, 1000);

// WebSocket client connection
wss.on('connection', ws => {
    console.log('WebSocket client connected');
    ws.send(JSON.stringify({ message: 'Connected to BTC/USDC price feed' }));
});

// Start server
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

server.listen(PORT, () => {
    console.log(`API and WebSocket server running at http://${HOST}:${PORT}`);
});
