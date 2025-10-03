import bcrypt from "bcrypt"
import { userModal } from "../modals/user.js"


async function  encryptPass(pass){
    try{

        const salt = await bcrypt.genSalt(10);
        const res = await bcrypt.hash(pass, salt);
        return res;
    }
    catch(err){
        console.log("error in hashing-", err)
    }
}

export  const registerController = async(req, res) => {
    console.log("req body", req.body)
    try{

        const {
            name,
            mobile,
            mail,
            pass
    } = req?.body
    
    if(!name || !mobile || !mail || !pass){
        res.status(400).json({success : false, msg:"All fields required"})
    }
    const exist1 = await userModal.find({mobile:mobile});
    const exist2 = await userModal.find({mail:mail});
    // console.log("exist", exist)

    if(exist1.length){
        res.status(400).json({success:false, msg:"the mobile number is already used!"});
    }
    if(exist2.length){
        res.status(400).json({success:false, msg:"the mail  is already used!"});
    }
    const encPass = await encryptPass(pass)
    console.log("encPass", encPass)
    const obj = {
        name:name,
        mobile:mobile,
        mail:mail,
        pass:encPass
    }
    userModal.create(obj)

    res.status(200).json({msg:"user successfully created!"})
}
catch(err){
    res.status(500).json({msg:err})
    
}
}