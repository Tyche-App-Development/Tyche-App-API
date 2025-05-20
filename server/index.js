import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
import authRoutes from './routes/authRoutes.js';
import { setupBinanceTickerSocket } from './services/binanceTickerSocket.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);


setupBinanceTickerSocket(server);

// Start server
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

server.listen(PORT, () => {
    console.log(`API and WebSocket server running at http://${HOST}:${PORT}`);
});
