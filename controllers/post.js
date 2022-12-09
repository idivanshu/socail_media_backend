
const Post = require('../models/Post');
const User = require('../models/User');
const mongoose = require('mongoose');
exports.createPost =async (req, res) => {
    try {
        const newPostData = {
            caption : req.body.caption,
            image : {
                public_id : "req.body.public_id",
                url : "req.body.url"
            },
            owner:req.user._id
        }
        
        //create a new post
        const newPost = await Post.create(newPostData);
        const user = await User.findById(req.user._id);//find the user by id
        user.posts.push(newPost._id);//push the new post id to the user's posts array
        await user.save();      //save the user
        

        res.status(201).json({
            success:true,
            post:newPost,
            user:user
        })
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message})
    }
  
    // ...
}



// like and unlike a post

exports.
likeandUnlikePost = async (req, res) => {

    try {
        console.log(mongoose.Types.ObjectId.isValid(req.params.id));
        const post = await Post.findById(req.params.id);//params.id is the post id, here params is the object that contains all the parameters in the url
        
        //check if the post exists or not
        if(!post){
            return res.status(404).json({
                success:false,
                error:"Post not found"
            })
        }

        //check if the post has already been liked
        if(post.likes.includes(req.user._id)){
            const index = post.likes.indexOf(req.user._id);//get the index of the user id in the likes array
            post.likes.splice(index,1);//remove the user id from the likes array
            await post.save();//save the post
            res.status(200).json({
                success:true,
                message:"Post unliked"
            });

        }else{
        post.likes.push(req.user._id);
        await post.save();
        res.status(200).json({
            success:true,
            message:"Post liked"
        });
        }
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message})
    }



}


//  delete a post

exports.deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if(!post){
            return res.status(404).json({
                success:false,
                error:"Post not found"
            })
        }
        //check if the user is the owner of the post
        if(post.owner.toString() !== req.user._id.toString()){
            return res.status(401).json({
                success:false,
                error:"You are not authorized to delete this post"
            })
        }
        //delete the post
        await post.remove();
        // delete the post from the user's posts array
        const user = await User.findById(req.user._id);

        const index = user.posts.indexOf(req.params.id);
        user.posts.splice(index,1);
        await user.save();


        res.status(200).json({
            success:true,
            message:"Post deleted"
        })
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message})

    }

}


// get all posts
exports.getAllPostsoffollowing = async (req, res) => {

    try {
        // const user = await User.findById(req.user._id)
        // .populate(   //populate the posts array with the posts data
        //     'following',
        //     'posts'
        // ); // before populating the posts array, the posts array contains only the post ids
        //    // after populating the posts array, the posts array contains the posts data


        const user = await User.findById(req.user._id)
        
        const posts = await Post.find({
            owner:{$in:user.following}
        })

        res.status(200).json({
            success:true,
            posts:posts
        })


        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message})

    }
}

// update caption of a post
exports.updateCaption = async (req, res) => {

    try {
       const user = await User.findById(req.user._id);
         const post = await Post.findById(req.params.id); 
        if(!post){
            return res.status(404).json({
                success:false,
                error:"Post not found"
            })
        }
        //check if the user is the owner of the post
        if(post.owner.toString() !== req.user._id.toString()){
            return res.status(401).json({
                success:false,
                error:"You are not authorized to update this post"
            })
        }
        post.caption = req.body.caption;
        await post.save();
        res.status(200).json({
            success:true,
            message:"Post updated"
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message})

    }
}


// create a commment on a post (update the comment if it already exists)
exports.createComment = async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
  
      if (!post) {
        return res.status(404).json({
          success: false,
          message: "Post not found",
        });
      }
  
      let commentIndex = -1;
  
      // Checking if comment already exists
  
      post.comments.forEach((item, index) => {
        if (item.user.toString() === req.user._id.toString()) {
          commentIndex = index;
        }
      });
  
      if (commentIndex !== -1) {
        post.comments[commentIndex].comment = req.body.comment;
  
        await post.save();
  
        return res.status(200).json({
          success: true,
          message: "Comment Updated",
        });
      } else {
        post.comments.push({
          user: req.user._id,
          comment: req.body.comment,
        });
  
        await post.save();
        return res.status(200).json({
          success: true,
          message: "Comment added",
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };


  // delete a comment
    exports.deleteComment = async (req, res) => {
        try {
            const post = await Post.findById(req.params.id);
            if(!post){
                return res.status(404).json({
                    success:false,
                    message:"Post not found"
                })
            }
          
    if (post.owner.toString() === req.user._id.toString()) {
        if (req.body.commentId === undefined) {
          return res.status(400).json({
            success: false,
            message: "Comment Id is required",
          });
        }
  
        post.comments.forEach((item, index) => {
          if (item._id.toString() === req.body.commentId.toString()) {
            return post.comments.splice(index, 1);
          }
        });
  
        await post.save();
  
        return res.status(200).json({
          success: true,
          message: "Selected Comment has deleted",
        });
      } else {
        post.comments.forEach((item, index) => {
          if (item.user.toString() === req.user._id.toString()) {
            return post.comments.splice(index, 1);
          }
        });
  
        await post.save();
        res.status(200).json({
            success: true,
            message: "Your Comment has deleted",
            });
        }  
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
                });
        }
    }