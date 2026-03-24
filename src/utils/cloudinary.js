import { v2 } from "cloudinary"
import fs from "fs"

cloudinary.config({
    cloud_name: 'root',
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        //file has been uploaded to the server/cloud
        console.log("file is uploaded on cloudinary ", response.url);
        return response;

    } catch (error) {
        fs.unlinkSync(localFilePath)
        //remove the locally saved temporary file as upload operation
        //got failed
        return null;

    }
}

export { uploadOnCloudinary }