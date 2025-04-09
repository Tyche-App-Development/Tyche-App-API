import express from 'express';
import {register, login, logout} from '../controllers/authController.js';
import {getProfile} from "../Controllers/userController.js";

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', getProfile);
router.post('/logout', logout);


export default router;
