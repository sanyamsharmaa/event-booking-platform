import bcrypt from 'bcrypt'
import { userModal } from '../modals/userModal.js'
import {artistModal} from '../modals/artistModal.js'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

export const signinController = async (req, res) => {
    try {
        const {
            cred,
            pass,
            role
        } = req?.body
        // console.log('body', req.body)
        // if(cred.length)

        if (!cred || !pass || !role) {
            res.status(400).json({ status: false, msg: "All fields - cred, pass and role are required" })
        }

        let resp, holder;

        if (role == "user") {
            let Umobile = await userModal.find({ mobile: cred })
            let Umail = await userModal.find({ mail: cred })
            if (!Umobile.length && !Umail.length) {
                res.status(400).json({ status: false, msg: "No results found for these creadentails" })
            }
            holder = Umobile.length > 0 ? Umobile[0] : Umail[0]
            // console.log("user", user[0])
            // console.log("resp", resp)

        }
        else if (role == "artist") {
            let Amobile = await artistModal.find({ mobile: cred })
            let Amail = await artistModal.find({ mail: cred })
            if (!Amobile.length && !Amail.length) {
                res.status(400).json({ status: false, msg: "No results found for these creadentails" })
            }
            holder = Amobile.length > 0 ? Amobile[0] : Amail[0]
        }
        // console.log('cred', Umail, Umobile)

        
        resp = bcrypt.compareSync(pass, holder.pass);
        
        if (resp) {

            const secretKey = process.env.JWT_SECRET_KEY
            const payload = {
                id: user.id,
                name: user.name,
                role,
                
            }

            const token = jwt.sign(payload, secretKey, {
                expiresIn: '7d'
            })

            res.cookie('token', token, {
                httpOnly: true,
                maxAge: 6.048e+8
            })

            res.status(200).json({ status: true, msg: "user logged in successfully" })
            res.redirect('/home');

        }
        else {
            res.status(400).json({ status: false, msg: "Password didn't matched, try again!" })
        }

    }
    catch (err) {
        res.status(500).json({ status: false, msg: `error is - ${err}` })
    }
}