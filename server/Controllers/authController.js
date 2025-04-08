import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../ConfigDatabase/db.js';

export const register = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const passwordHash = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: { username, password: passwordHash, apiKey: crypto.randomUUID() },
        });

        res.status(201).json({ message: 'User successfully created', user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error creating user' });
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
