
import mongoose from 'mongoose'

const schema = mongoose.Schema({
    title :{
        type : String,
        required : true
    },
    url :{
        type : String,
        required : true
    }
})

const  bannerModal = mongoose.model('banner', schema);
export default bannerModal;