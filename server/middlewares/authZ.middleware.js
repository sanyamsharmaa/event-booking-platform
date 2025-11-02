import jwt, { decode } from 'jsonwebtoken'
import { userModal } from '../modals/userModal'
import { artistModal } from '../modals/artistModal'

export const authZmiddleware = async (req, res, next) => {
    try {
        console.log("REQQ-", req)
        const token = req.unique_jwt_key || req.cookies.token || req.headers.unique_jwt_key || ''
        if (!token) {
            if (req.path == '/signin' || req.path == '/register') {
                next()
                return;
            }
            else {
                res.status(400).json({ success: false, msg: "no token provided" })
            }
        }
        else {
            const verify = jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
                if (err) {
                    res.status(400).json({ success: false, msg: `verification error - ${err}` })
                    return
                }

                console.log("yr user-", decoded)
                // req.user = decoded;
                if (req.path.includes[
                    "/get-events"

                ]) {  // decoded.role == "user" ||
                    next()
                    return
                }
                else if (req.path.includes[
                    "add-event"
                ]) {
                    if( decoded.role != "artist"){
                        res.status(401).json({success:false, msg:"you don't have permssion to add event"})
                    }
                    next()
                    return
                }
                // const holder = await userModal.findbyId(decoded.id)
                // const role = 'user'
                // if(!holder){
                //     holder = await artistModal.findById(decoded.id)
                //     role = 'artist'
                // }

                req.user = {
                    id: decoded.id,
                    name: account.name,
                    role: role
                }
                console.log("userwa-", req.user)
                if (!holder) {
                    res.status(400).json({ success: false, msg: "no holder found" })
                }


                res.status(200).json({ success: true, msg: "aaj k liye itna hi" })

            })

            // console.log("verify-", verify)

        }

    }
    catch (err) {
        console.log("got some error in middlware-", err)
    }
}