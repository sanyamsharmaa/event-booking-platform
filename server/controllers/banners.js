
import bannerModal from '../modals/bannerModal.js'

export const Addbanners = async(req,res)=>{
    try{
        const {title, imageUrl} = req.body;
        await bannerModal.create({title, url: imageUrl});
        res.status(200).json({success: true, msg:"Banner added succesfully"})
    }
    catch(err){
        console.log("err-",err)
        return res.status(500).json({success:false, msg:"Internal Server Error"})
    }
}

export const Getbanners = async(req, res) =>{
    try{
        const ban = await bannerModal.find();
        return res.status(200).json({success : true, data: ban})
        
    }
    catch(err){
        console.log("err-", err)
        return res.status(500).json({success : false, msg: "Internal Server Error"})
    }
}

