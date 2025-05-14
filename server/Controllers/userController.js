import { verifyToken } from '../Config/jwtConfig.js';

import jwt from 'jsonwebtoken';
import prisma from '../ConfigDatabase/db.js';

export const getProfile = async (req, res) => {
    try {

        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Token not provider' });
        }


        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                username: true,
                fullName: true,
                email: true,
                nif: true,
                age: true,
                imageProfile: true,
                apiKey: true,
                amount: true,
                createdAt: true,
                updatedAt: true
            }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found!' });
        }

        res.json({ user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error', error: err.message });
    }
};


export const updateProfile = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1]; // Bearer token

        if (!token) {
            return res.status(401).json({ message: 'Erro no Token' });
        }

        const decoded = verifyToken(token);

        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(404).json({ message: 'User não encontrado' });
        }

        const {first_name, last_name, email, username,image_profile ,credit_card } = req.body;

        user.first_name = first_name;
        user.last_name = last_name;
        user.email = email;
        user.username = username;
        user.image_profile = image_profile;
        user.credit_card = credit_card;

        await user.save();

        res.json({ message: 'Perfil atualizado com sucesso', user });
    } catch (err) {
        res.status(500).json({ message: 'Erro ao atualizar o perfil', error: err.message });
    }
}
