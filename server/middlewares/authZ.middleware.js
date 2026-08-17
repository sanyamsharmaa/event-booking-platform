import jwt, { decode } from 'jsonwebtoken'
// import { userModal } from '../modals/userModal'
// import { artistModal } from '../modals/artistModal'

export const authZmiddleware = async (req, res, next) => {
    try {
        console.log("REQQ-", req.path, req.method)
        const token = req.unique_jwt_key || req.cookies.token || req.headers.unique_jwt_key || ''
        if (!token) {
            if (req.path == '/signin' || req.path == '/register' || req.path=="/create-order" ||  req.path=='/verify-payment') { //payment route to be remove 
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
                console.log("decoded-", decoded)

                req.user = {
                    id: decoded.id,
                    name: decoded.name,
                    role: decoded.role
                }
                // req.user = decoded;
                console.log("path-", req.path)
                // if (req.path.includes[
                //     "/get-events"

                // ]) 
                 if (req.path=="/get-events")
                {  // decoded.role == "user" ||
                    next()
                    return
                }
                // else if (req.path.includes[
                //     "/add-event"
                // ])
                else if (req.path =="/add-event") {
                    if (decoded.role != "artist") {
                        res.status(401).json({ success: false, msg: "you don't have permssion to add event" })
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

                // console.log("userwa-", req.user)
                // if (!holder) {
                //     res.status(400).json({ success: false, msg: "no holder found" })
                // }


                // res.status(200).json({ success: true, msg: "aaj k liye itna hi" }).
                 next()
                    return

            })

            // console.log("verify-", verify)

        }

    }
    catch (err) {
        console.log("got some error in middlware-", err)
    }
}