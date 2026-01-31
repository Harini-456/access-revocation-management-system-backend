const express = require("express")
const router = express.Router()
const auth = require("../middlewares/auth")

const Request = require("../models/requestsModel")
router.post('/create',auth, async (req,res) => {

        const title = req.body.title;
        const description = req.body.description
        const requestedTo = req.body.requestedTo

        if(!title || !description || !requestedTo){
            return res.json({"message":"Please send all details"})
        }

        const request = Request({
            title: title,
            description: description,
            status: "PENDING",
            requestedBy: req.user,
            requestedTo:requestedTo,
        });
        await request.save()
        return res.json({message: "Request created"})

    })

router.get('/revoke-request/myrequests',auth, async(req,res) => {
    const requests = await Request.find({requestedBy: req.user})
    res.json({"requests":requests})
})
router.get('/revoke-request/myPendingrequests', auth,async(req,res) => {
    const requests = await Request.find({requestedBy: req.user,status:"PENDING"})
})
module.exports = router