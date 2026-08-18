import bcrypt from "bcrypt";
import { userModal } from "../modals/userModal.js";
import { artistModal } from "../modals/artistModal.js";

async function encryptPass(pass) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(pass, salt);
}

export const registerController = async (req, res) => {
    try {
        const {
            name,
            mobile,
            mail,
            pass,
            role,
            interestArr,
            headline,
        } = req?.body;

        if (!name || !mobile || !mail || !pass || !role) {
            return res.status(400).json({ success: false, msg: "All fields - name, mobile, mail, pass, and role are required" });
        }

        if (role !== 'user' && role !== 'artist') {
            return res.status(400).json({ success: false, msg: "Invalid role. Role must be 'user' or 'artist'" });
        }

        const model = role === 'user' ? userModal : artistModal;

        const existingAccount = await model.findOne({
            $or: [{ mobile }, { mail }]
        });

        if (existingAccount) {
            if (existingAccount.mobile === mobile) {
                return res.status(400).json({ success: false, msg: "The mobile number is already in use!" });
            }
            if (existingAccount.mail === mail) {
                return res.status(400).json({ success: false, msg: "The email is already in use!" });
            }
        }

        const encPass = await encryptPass(pass);

        if (role === 'user') {
            if (!interestArr || !Array.isArray(interestArr)) {
                return res.status(400).json({ success: false, msg: "Interest array is required for users" });
            }

            const newUser = await userModal.create({
                name,
                mobile,
                mail,
                pass: encPass,
                interest: interestArr
            });

            return res.status(201).json({
                success: true,
                msg: "User account successfully created!",
                user: { id: newUser._id, name: newUser.name, mail: newUser.mail, role: 'user' }
            });

        } else if (role === 'artist') {
            if (!headline) {
                return res.status(400).json({ success: false, msg: "Headline is required for artists" });
            }

            const newArtist = await artistModal.create({
                name,
                mobile,
                mail,
                pass: encPass,
                headline
            });

            return res.status(201).json({
                success: true,
                msg: "Artist account successfully created!",
                artist: { id: newArtist._id, name: newArtist.name, mail: newArtist.mail, role: 'artist' }
            });
        }

    } catch (err) {
        console.error("Error in registerController:", err);
        return res.status(500).json({ success: false, msg: "Internal server error" });
    }
};