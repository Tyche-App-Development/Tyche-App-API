import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../ConfigDatabase/db.js';
import { encrypt } from '../utils/cryptoUtils.js';
import crypto from 'crypto';


export const register = async (req, res) => {
    const {
        username,
        password,
        name,
        email,
        balance,
        nif,
        age = 0,
        imageProfile = null,
        apiKey,
        apiSecret
    } = req.body;

    try {

        if (!apiKey || !apiSecret) {
            return res.status(400).json({ message: 'Binance API Key and Secret are required' });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const encryptedApiKey = encrypt(apiKey);
        const encryptedApiSecret = encrypt(apiSecret);

        const user = await prisma.user.create({
            data: {
                username,
                name,
                email,
                password: passwordHash,
                age,
                balance,
                nif,
                imageProfile,
                apiKey: encryptedApiKey,
                apiSecret: encryptedApiSecret,
            },
        });

        res.status(201).json({
            message: 'User successfully created',
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error creating user', error: err.message });
    }
};


export const login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await prisma.user.findUnique({ where: { username } });
        if (!user) return res.status(400).json({ message: 'User not found' });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ message: 'Incorrect password' });

        const token = jwt.sign(
            { id: user.id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '2h' }
        );

        res.json({ message: 'Login successful', token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error logging in' });
    }
};



export const logout = (req, res) => {

    res.status(200).json({ message: 'Logout successful' });
};
