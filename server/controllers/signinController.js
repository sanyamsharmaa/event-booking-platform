import bcrypt from 'bcrypt'
import { userModal } from '../modals/user.js'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

export const signinController = async(req, res)=>{
    try{
        const {
            cred,
            pass
                } = req?.body
        // console.log('body', req.body)
        // if(cred.length)
        let Umobile = await userModal.find({mobile:cred})
        let Umail = await userModal.find({mail:cred})
        let resp, user;
        
        // console.log('cred', Umail, Umobile)
        
        if(!Umobile.length  && !Umail.length){
            res.status(400).json({status :false, msg:"No results found for these creadentails"})
        }
        user = Umobile.length>0 ? Umobile[0] : Umail[0]
        // console.log("user", user[0])
            resp = bcrypt.compareSync(pass, user.pass);
        // console.log("resp", resp)

        if(resp){
            
            
            const secretKey = process.env.JWT_SECRET_KEY
            const payload = {
                id: user.id,
                name : user.name
            }

            const token = jwt.sign(payload, secretKey, {
                expiresIn: '7d'
            })
            
            res.cookie('token', token, {
                httpOnly:true,
                maxAge:6.048e+8
            })
            
            res.status(200).json({status:true, msg:"user logged in successfully"})
            res.redirect('/home');

        }
        else{
            res.status(400).json({status :false, msg:"Password didn't matched, try again!"})
        }

    }
    catch(err){
            res.status(500).json({status :false, msg:`error is - ${err}`})
    }
}