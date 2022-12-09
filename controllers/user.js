const User = require('../models/User');
const Post = require('../models/Post');
const mongoose = require('mongoose');
const {sendEmail} = require('../middleware/sendEmail');
const crypto = require('crypto');

exports.register = async(req, res) => {

    try {
        const { name, email, password } = req.body;// This is the data from the form

        // check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res
            .status(400)
            .json({
            success: false,
             message: "User already exists",
            });
        }
        user= await User.create({ 
            name, 
            email, 
            password, 
            avatar:{ 
                public_id: "sample",
                url: "sampleurl"
            } 
        });
        
        res.status(201).json({success: true, user});// This is the response from the server to the client

        
    } catch (error) {
        res.status(500).json({
            success: false,
             message: error.message,
        }); 
    }

}



// login

exports.login = async(req, res) => {
    try {
        const { email, password } = req.body;// This is the data from the form
        const user = await User.findOne({ email }).select('+password');// This is to select the password
        if (!user) {
            return res
            .status(400)
            .json({
            success: false,
             message: "User does not exist",
            });
        }
        const isPasswordMatched = await user.comparePassword(password);
        if (!isPasswordMatched) {
            return res// This is the response from the server to the client
            .status(400)
            .json({
            success: false,
             message: "Invalid password",
            });
        }
        const token = user.getJwtToken();
        const options = 
        {expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), httpOnly: true};
           
        res.status(200)
        .cookie('token', token, options)// This is to set the cookie
        .json({user , success: true, message: "Login successful", });
        
    } catch (error) {
        res.status(500).json({
            success: false,
             message: error.message,
        }); 

    }

}

// logout
exports.logout = async(req, res) => {

  try {
    res.status(200)
    .cookie('token', null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    })
    .json({success: true, message: "Logged out successfully"});
    
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }

}

// follow user 
exports.followUser = async (req, res) => {
    try {
        // console.log(mongoose.Types.ObjectId.isValid(req.params.id));
        
      const user1 = await User.findById(req.params.id);// This is to find the user which is to be followed

      const user2 = await User.findById(req.user._id);// This is to find the user which is following // req.user._id is the id of the user which is logged in
  
      if (!user1) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }
  
      if (user2.following.includes(user1._id)) {
        const indexfollowing = user2.following.indexOf(user1._id);
        const indexfollowers = user1.followers.indexOf(user2._id);
  
        user2.following.splice(indexfollowing, 1);
        user1.followers.splice(indexfollowers, 1);
  
        await user2.save();
        await user1.save();
  
        res.status(200).json({
          success: true,
          message: "User Unfollowed",
        });
      } else {
        user2.following.push(user1._id);
        user1.followers.push(user2._id);
  
        await user2.save();
        await user1.save();
  
        res.status(200).json({
          success: true,
          message: "User followed",
        });
      }
    } catch (error) {
        // console.log(error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };


  // profile routes 

  exports.updatePassword = async (req, res) => {

    
    try {
        const user = await User.findById(req.user._id).select('+password');

        // if (!user) {
        //     return res.status(404).json({
        //         success: false,
        //         message: "User not found",
        //     });
        // } // not needed as we are using protect middleware

        const { oldPassword, newPassword } = req.body;

        if(!oldPassword || !newPassword){
            return res.status(400).json({
                success: false,
                message: "Please enter all fields", 
            });
          }
        const isMatch = await user.comparePassword(oldPassword);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Old password is incorrect",
            });
        }
        user.password = newPassword;
        await user.save();
        res.status(200).json({
            success: true,
            message: "Password updated successfully",
        });

    }
     catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }

  }

  // update profile

  exports.updateProfile = async (req, res) => {
    try {
      const user = await User.findById(req.user._id);
      const { name, email } = req.body;
      if (name) user.name = name;
      if (email) user.email = email;
      await user.save();
      res.status(200).json({
        success: true,
        message: "Profile updated successfully",
      });
      
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }

  }

  // delete my profile
exports.deleteMyProfile = async (req, res) => {
  try {
      const user = await User.findById(req.user._id);
      //delete all the posts of the user
      await Post.deleteMany({owner:user._id});
      // remove the user from the followers and following array of other users
      await User.updateMany(
        { _id: { $in: user.followers } },
        { $pull: { following: user._id } }
      );
      await User.updateMany(
        { _id: { $in: user.following } },
        { $pull: { followers: user._id } }
      );
      

      //delete the user
      await user.remove();
      // logout the user
      res.status(200)
      .cookie('token', null, {
        expires: new Date(Date.now()),
        httpOnly: true,
      })

      res.status(200).json({
          success:true,
          message:"User deleted"
      })
      
  } catch (error) {
      res.status(500).json({
          success: false,
          error: error.message})

  }

}


exports.getMyProfile = async (req, res) => {
  


  try {
    const user= await User.findById(req.user._id).populate('posts');
  // we have populated the posts of the 
  //user so that we can show the posts of the user in the profile page

  res.status(200).json({  success: true, user });
    
  } catch (error) {

    res.status(500).json({
        success: false,
        error: error.message})

    
  }
}


// get other user profile

exports.getOtherUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('posts');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({ success: true, user });
    
  } catch (error) {
      res.status(500).json({
          success: false,
          error: error.message})

  }
}


// forgot password
exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const resetPasswordToken = user.getResetPasswordToken();

    await user.save();

    const resetUrl = `${req.protocol}://${req.get("host")}/api/sample/password/reset/${resetPasswordToken}`;

    const message = `Reset Your Password by clicking on the link below: \n\n ${resetUrl}`;

    try {
      await sendEmail({
        email: user.email,
        subject: "Reset Password",
        message,
      });

      res.status(200).json({
        success: true,
        message: `Email sent to ${user.email}`,
      });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();

      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// reset password
exports.resetPassword = async (req, res) => {
  try {
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Token is invalid or has expired",
      });
    }

    user.password = req.body.password;

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password Updated",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};