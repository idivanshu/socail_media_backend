const User = require('../models/User');
const jwt = require('jsonwebtoken');


exports.isAuth = async (req, res, next) => {

   

    try {
        const {token} = req.cookies;
        if(!token){
            return res.status(400).json({success: false, message: 'Please login to continue'});
        }
    
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
        req.user = await User.findById(decoded._id);
    
        next();
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message})

    }

}
