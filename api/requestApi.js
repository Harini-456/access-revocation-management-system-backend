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
    res.json({"requests":requests})
})

router.get('/manager/requests', auth, async(req,res) => {
    try {
        const requests = await Request.find();
        res.status(200).json(requests);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
})

router.get('/manager/myPendingRequests', auth, async(req,res) => {
     if (req.role !== "MANAGER" || req.role !== "ADMIN") {
        return res.status(403).json({ message: "Access denied" });
    }

    const requests = await Request.find({
        requestedTo: req.user,
        status: "PENDING"
    });

    res.json({ requests });
})
module.exports = router