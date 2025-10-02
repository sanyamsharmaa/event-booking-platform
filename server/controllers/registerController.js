import { userModal } from "../modals/user.js"

export const registerController = (req, res) => {
    const {
        name,
        mobile,
        number,
        email,
        pass
    } = req.body

    userModal.create({
        name,
        mobile,
        number,
        email,
        pass
    })

    res.status(200).json({msg:"badhiya yrr"})
}