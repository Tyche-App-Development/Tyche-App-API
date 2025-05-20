import express from 'express';
import {register, login, logout} from '../controllers/authController.js';
import {getProfile, updateProfile} from "../Controllers/userController.js";

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/logout', logout);


export default router;
