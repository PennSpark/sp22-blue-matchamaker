var cloudinary = require('cloudinary').v2

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.API_KEY, 
    api_secret: process.env.API_SECRET 
})

module.exports = cloudinary