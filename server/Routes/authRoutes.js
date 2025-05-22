import express from 'express';
import {register, login, logout} from '../controllers/authController.js';
import {getProfile, updateProfile} from "../Controllers/userController.js";
import {getCoinDetails} from "../Controllers/coingeckoController.js";
import {getBinanceBalance, getBinanceProfitPNL} from "../Controllers/binanceController.js";
import {executeTestTrade} from "../Controllers/binanceTradeController.js";

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/logout', logout);

router.get('/coin/:id', getCoinDetails);
router.get('/balance', getBinanceBalance);

router.get('/profitpnl', getBinanceProfitPNL);
router.post('/binance/trade', executeTestTrade);




export default router;
