const express = require('express')
const User = require('../models/M_user')
const auth = require('../middleware/auth')
const router = new express.Router()
const formaidable  = require("formidable")
const path = require("path")
const fs  = require("fs-extra")

uploadImage = async (files, doc) => {
  if (files.imageURL != null) {
    var fileExtention = files.imageURL.name.split(".")[1];
    doc.imageURL = `${doc._id}.${fileExtention}`;
    var newpath =
      path.resolve("./uploaded/images/") + "/" + doc.imageURL;

    if (fs.exists(newpath)) {
      await fs.remove(newpath);
    }
    await fs.moveSync(files.imageURL.path, newpath);

    // Update database
    let result = User.findOneAndUpdate({ _id: doc._id }, {imageURL: doc.imageURL});
    return result;
  }
};


uploadResume = async (files, doc) => {
  if (files.resumeURL != null) {
    var fileExtention = files.resumeURL.name.split(".")[1];
    doc.resumeURL = `${doc._id}.${fileExtention}`;
    var newpath =
      path.resolve("./uploaded/resume/") + "/" + doc.resumeURL;

    if (fs.exists(newpath)) {
      await fs.remove(newpath);
    }

    await fs.moveSync(files.resumeURL.path, newpath);

    // Update database
    let result = User.findOneAndUpdate({ _id: doc._id }, {resumeURL: doc.resumeURL});
    return result;
  }
};



router.post('/users', (req, res) => {
    try{
      const form = new formaidable.IncomingForm()
      form.parse(req, async (error,fields,files) =>
      {   
          const user  = new User(fields)
          const user_file  = files ; 

          User.find({email : user.email}, async function (err, docs) 
          {

            if (docs.length == 1) {
                 res.json({ result: false, message: JSON.stringify(error) });
            }else{                
                  let result =  await user.save();
                  await  uploadImage(user_file,result)
                  await  uploadResume(user_file,result)
                  //const token = await user.generateAuthToken()
                  res.json({result: true , message: JSON.stringify(result)})
            }

          });
      }
    )
    }catch(error){
       res.json({ result: false, message: JSON.stringify(error) });
    }
})




  
router.post('/users/login', async (req, res) => {
  try {

      const user = await User.findByCredentials(req.body.email, req.body.password)
      const token = await user.generateAuthToken()
      res.send({result:true,user,token })
    } catch (e) {
      res.send({result:false})
      console.log("fail")
  }

})




router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})




router.get('/users/profile', auth, async (req, res) => {
    let profile  = req.user;
    res.send({profile})
})




router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})



// router.patch('/users/me', auth, async (req, res) => {
//     const updates = Object.keys(req.body)
//     const allowedUpdates = ['name', 'email', 'password', 'age']
//     const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

//     if (!isValidOperation) {
//         return res.status(400).send({ error: 'Invalid updates!' })
//     }

//     try {
//         updates.forEach((update) => req.user[update] = req.body[update])
//         await req.user.save()
//         res.send(req.user)
//     } catch (e) {
//         res.status(400).send(e)
//     }
// })


// router.delete('/users/me', auth, async (req, res) => {
//     try {
//         await req.user.remove()
//         res.send(req.user)
//     } catch (e) {
//         res.status(500).send()
//     }
// })





module.exports = router