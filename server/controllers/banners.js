
import bannerModal from '../modals/bannerModal.js';

export const Addbanners = async (req, res) => {
    try {
        const { title, imageUrl } = req.body || {};
        if (!title || !imageUrl) {
            return res.status(400).json({ success: false, msg: "Title and imageUrl are required" });
        }

        const banner = await bannerModal.create({ title, url: imageUrl });
        return res.status(201).json({ success: true, msg: "Banner added successfully", data: banner });
    } catch (err) {
        console.error("Error in Addbanners:", err);
        return res.status(500).json({ success: false, msg: "Internal Server Error" });
    }
};

export const Getbanners = async (req, res) => {
    try {
        const banners = await bannerModal.find();
        return res.status(200).json({ success: true, data: banners });
    } catch (err) {
        console.error("Error in Getbanners:", err);
        return res.status(500).json({ success: false, msg: "Internal Server Error" });
    }
};


