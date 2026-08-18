import bcrypt from 'bcrypt';
import { userModal } from '../modals/userModal.js';
import { artistModal } from '../modals/artistModal.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const signinController = async (req, res) => {
    try {
        const {
            cred,
            pass,
            role
        } = req?.body;

        if (!cred || !pass || !role) {
            return res.status(400).json({ success: false, msg: "All fields - cred, pass and role are required" });
        }

        if (role !== "user" && role !== "artist") {
            return res.status(400).json({ success: false, msg: "Invalid role. Role must be 'user' or 'artist'" });
        }

        const model = role === "user" ? userModal : artistModal;
        const holder = await model.findOne({
            $or: [{ mobile: cred }, { mail: cred }]
        });

        if (!holder) {
            return res.status(400).json({ success: false, msg: "No account found with these credentials" });
        }

        const isMatch = await bcrypt.compare(pass, holder.pass);

        if (!isMatch) {
            return res.status(400).json({ success: false, msg: "Password didn't match, try again!" });
        }

        const secretKey = process.env.JWT_SECRET_KEY;
        const payload = {
            id: holder._id,
            name: holder.name,
            role
        };

        const token = jwt.sign(payload, secretKey, {
            expiresIn: '7d'
        });

        res.cookie('token', token, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
            sameSite: 'lax'
        });

        return res.status(200).json({
            success: true,
            token,
            user: {
                id: holder._id,
                name: holder.name,
                role
            },
            msg: "User logged in successfully"
        });

    } catch (err) {
        console.error("Error in signinController:", err);
        return res.status(500).json({ success: false, msg: "Internal server error" });
    }
};