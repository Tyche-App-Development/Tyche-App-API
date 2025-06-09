import express from 'express';
import {register, login, logout} from '../controllers/authController.js';
import {getProfile, updateProfile} from "../Controllers/userController.js";
import {getCoinDetails} from "../Controllers/coingeckoController.js";
import {
    getBinanceBalance,
    getBinanceProfitPNL,
    getBinanceTradeHistory,
    getUserUSDTBalanceEndpoint
} from "../Controllers/binanceController.js";
import {executeTestTrade} from "../Controllers/binanceTradeController.js";
import {createUserStrategy} from "../Controllers/strategyController.js";

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
router.get('/historytrade', getBinanceTradeHistory)

router.post('/user-strategy', createUserStrategy);


router.get('/balanceusdt', getUserUSDTBalanceEndpoint);




export default router;
