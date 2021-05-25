const express = require("express");
const router = new express.Router();
const nodemailer = require("nodemailer");
const app = express();
var admintoken;

let adminLogin = true;
let userLogin = false;

app.use(function (req, res, next) {
    res.locals.loggedIn = userLogin;
    next()
})

const User = require("../models/User");  //User schema is called here
const Volunteer = require("../models/Volunteer"); //Volunteer Schema is called here  
const Contact = require("../models/contactUs"); //Contact Us Schema is called here
const Announce = require("../models/announ");//Announcement Schema


//Initiating mailing Service 
const transporter = nodemailer.createTransport({
    service: 'gmail',
    tls: {
        rejectUnauthorized: false
    },
    auth: {
        user: 'krpalashish842@gmail.com',
        pass: 'axleblaze842'
    }
})

// Website routes
router.get("/", (req, res) => {
    res.render("index", failed = '');
});

router.get("/newsfeed", async (req, res) => {
    try {
        const anno = await Announce.find({}).sort({ _id: -1 }).limit(1);
        res.render("newsfeed", { data: anno });
    } catch (e) {
        console.log("Error!!");
    }
});

router.get("/about", (req, res) => {
    res.render("about")
});

router.get("/contact", (req, res) => {
    res.render("contact")
});

router.get("/mission", (req, res) => {
    res.render("mission")
});

router.get("/gallery", (req, res) => {
    res.render("imageGallery")
});

// routes for admin panel
router.get("/admin-login", (req, res) => {
    if (adminLogin) {
        res.render("./admin/dashboard")
    }
    else
        res.render("./admin/adminLogin")
});

router.get("/dashboard", (req, res) => {

    if (adminLogin)
        res.render("./admin/dashboard")
    else
        res.render("./admin/adminLogin")
});


router.get("/admin-users", async (req, res) => {
    try {
        const usern =  await User.find({}).sort({ _id: -1 }).limit(3);
        res.render("./admin/users",{us1:usern})
    } catch (error) {
        console.log(error);
    } 

router.get("/admin-newsfeed", async (req, res) => {
    if (adminLogin) {
        try {
            const anno = await Announce.find({}).sort({ _id: -1 }).limit(3);
            res.render("./admin/newsfeed", { d: anno });
        } catch (e) {
            console.log("Error!!");
        }
    }
    else
        res.render("./admin/adminLogin")

});

//Function for loading all announcements
router.get("/allannounce", async (req, res) => {
    try {
        const allann = await Announce.find({});
        res.render("./admin/newsfeed", { d: allann });
    } catch (e) {
        console.log(e);
    }
})

router.get("/admin-contact", async (req, res) => {
    const names = await Contact.find({}).sort({ _id: -1 }).limit(3);
    res.render("./admin/contact",{nam:names})
});


router.get('/allmsg',async (req,res) => {
    const allmsg = await Contact.find({});
    res.render("./admin/contact",{nam:allmsg});
});

router.get("*", (req, res) => {
    res.render("404")
});

//This function will register user/volunteer in our website and store their data in database.
router.post("/register", async (req, res) => {
    try {
        User.findOne({ email: req.body.email }, function (err, user) {
            if (err) {
                console.log(err);//handle error here
            }
            //if a user was found, that means the user's email matches the entered email
            if (user) {
                res.json("Email already exists as user");
            } else {
                Volunteer.findOne({ email: req.body.email }, function (err, usere) {
                    if (err) {
                        console.log(err);
                    }
                    if (usere) {
                        res.json("Email already exists as volunteer");
                    } else {
                        //code if no user with entered email was found
                        if (req.body.optradio == 'user') {
                            const newUser = new User({
                                name: req.body.name,
                                phone: req.body.phone,
                                email: req.body.email,
                                password: req.body.password
                            });
                            const StoreUser = newUser.save();
                            console.log(newUser);
                            res.render("index");


                            //Sending email to registered emailId
                            transporter.sendMail({
                                from: 'krpalashish842@gmail.com',
                                to: req.body.email,
                                subject: 'Test Mail',
                                text: 'Welcome to Banda Roti Bank Revolution'
                            }, (error, response) => {
                                if (error)
                                    console.log('Error', error);
                                else
                                    console.log('Mail sent, ', response);
                            })


                        } else if (req.body.optradio == 'volunteer') {
                            const newVolunteer = new Volunteer({
                                name: req.body.name,
                                phone: req.body.phone,
                                email: req.body.email,
                                password: req.body.password
                            });
                            const StoreVolunteer = newVolunteer.save();
                            console.log(newVolunteer);
                            res.render("index");

                            //Sending email to registered emailId
                            transporter.sendMail({
                                from: 'krpalashish842@gmail.com',
                                to: req.body.email,
                                subject: 'Test Mail',
                                text: 'Welcome to Banda Roti Bank Revolution'
                            }, (error, response) => {
                                if (error)
                                    console.log('Error', error);
                                else
                                    console.log('Mail sent, ', response);
                            })

                        } else {
                            res.status(400).send("Bad request");
                        }

                    }
                })
            }

        })
    } catch (e) {
        res.status(400).send(e);
    }
});

router.post('/login', async (req, res) => {
    try {

        console.log(req.body);
        const uemail = await User.findOne({ email: req.body.email });
        if (!uemail) {
            const vemail = await Volunteer.findOne({ email: req.body.email });
            if (req.body.password === vemail.password) {
                res.send("http://localhost:3000/newsfeed");
            } else {
                res.send("invalid");
            }
        } else {
            if (req.body.password === uemail.password) {
                res.send("http://localhost:3000/newsfeed");
            } else {
                res.send("invalid");
            }
        }
    } catch (e) {
        res.send("invalid");
    }
});

//This route is for storing the contact us form info to database.
router.post("/contactUs", async (req, res) => {
    try {
        const newContact = new Contact({
            name: req.body.senderName,
            email: req.body.senderEmail,
            phone: req.body.senderContact,
            message: req.body.message
        });
        const saveContact = await newContact.save();
        res.send("saved");
        console.log(newContact);
    } catch (e) {
        console.log(e);
    }
});

//Storing the announcement from admin portal to database 
router.post('/anno', async (req, res) => {
    try {
        const newAnn = new Announce({
            announce: req.body.announ
        });
        const saveAnnoun = await newAnn.save();
        res.send("added");
    } catch (e) {
        console.log(e);
    }
});

//this function is for admin login page validation
router.post("/admin", async (req, res) => {

    try {
        if (req.body.username === "axle" && req.body.password === "abc") {
            adminLogin = true;
            console.log("hello")
            res.render('./admin/dashboard')
        } else {
            res.send("invalid");
        }
    } catch (e) {
        console.log("invalid");
    }
})

module.exports = router;