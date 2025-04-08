import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'dsajkhdjsakhdjashdjkashdjashdjashdjashdjkashdjkahsdjkahsdjashdjksahdkjhajkdhsa';


const generateToken = (user) => {
    const payload = {
        id: user._id,
        username: user.username
    };

    return jwt.sign(payload, SECRET_KEY, { expiresIn: '1h' });
};

export const verifyToken = (token) => {
    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        console.log("Decoded Token:", decoded);
        return decoded;
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            throw new Error('Token expirado');
        }
        console.error("Token verification failed:", err.message);
        throw new Error('Token inválido');
    }
};


export { generateToken };
