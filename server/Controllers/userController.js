import { verifyToken } from '../Config/jwtConfig.js';
import jwt from 'jsonwebtoken';
import prisma from '../ConfigDatabase/db.js';
import { decrypt } from '../utils/cryptoUtils.js';
import bcrypt from 'bcrypt';

export const getProfile = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Token not provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                username: true,
                name: true,
                email: true,
                nif: true,
                age: true,
                imageProfile: true,
                apiKey: true,
                apiSecret: true,
                balance: true
            },
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }


        const decryptedApiKey = decrypt(user.apiKey);
        const decryptedApiSecret = decrypt(user.apiSecret);

        res.json({
            user: {
                ...user,
                apiKey: decryptedApiKey,
                apiSecret: decryptedApiSecret,
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error retrieving profile', error: err.message });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'Token not provided' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        const {
            fullName,
            email,
            username,
            imageProfile,
            age,
            currentPassword,
            newPassword,
            confirmPassword
        } = req.body;

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return res.status(404).json({ message: 'User not found' });

        let updatedData = {
            fullName,
            email,
            username,
            imageProfile,
            age,
            updatedAt: new Date(),
        };

        if (currentPassword && newPassword && confirmPassword) {
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Current password is incorrect' });
            }

            if (newPassword !== confirmPassword) {
                return res.status(400).json({ message: 'New passwords do not match' });
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);
            updatedData.password = hashedPassword;
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updatedData,
        });

        res.json({ message: 'Profile updated successfully', user: updatedUser });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error updating profile', error: err.message });
    }
};


