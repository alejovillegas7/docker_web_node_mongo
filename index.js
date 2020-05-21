var express = require('express');
var app = express();

var mongoose = require('mongoose');

var passport = require('passport');
var bodyParser = require('body-parser');
var LocalStrategy = require('passport-local');
var passportLocalMongoose = require('passport-local-mongoose');
var User = require('./models/user');
var methodOverride = require('method-override');
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
// Extended: https://swagger.io/specification/#infoObject
const swaggerOptions = {
    swaggerDefinition: {
        info: {
            title: "Docker Web Alejandro Villegas",
            description: "nodejs app using mongo and docker",
            contact: {
                name: "alejovillegas7"
            },
            servers: ["http://localhost:8082"]
        }
    },
    apis: ["index.js"]
};
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use(require('express-session')({
    secret: 'secret',
    resave: false,
    saveUninitialized: false
}));
//const db_link = "mongodb://127.0.0.1:27017/secret";
const db_link = "mongodb://mongo:27017/secret";
const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true
};
mongoose.connect(db_link, options).then(function() {
        console.log('MongoDB is connected');
    })
    .catch(function(err) {
        console.log(err);
    });


app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride("_method"));

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

/**
 * @swagger
 * /:
 *  get:
 *      description: Home page
 *      responses:
 *          '200':
 *              description: A successful response
 */
app.get("/", (req, res) => {
    res.render("home");
});

/**
 * @swagger
 * /secret:
 *  get:
 *      description: Secret page when the user is succesfuly logged in
 *      responses:
 *          '200':
 *              description: A successful login
 */
app.get("/secret", isLoggedIn, (req, res) => {
    res.render("secret");
});

//auth routes
/**
 * @swagger
 * /register:
 *  get:
 *      description: route that shows the form to be registered in the app
 *      responses:
 *          '200':
 *              description: A successful login
 */
app.get("/register", (req, res) => {
    res.render("register");
});

/**
 * @swagger
 * /register:
 *   post:
 *       tags:
 *           - User
 *       description: Creates a new user
 *       produces:
 *           - application/json
 *       parameters:
 *           - name: user
 *             description: User Object
 *             in: body
 *             required: true
 *             schema:
 *               $ref: 'User'
 *       responses:
 *           200:
 *           description: User successfully created
 */
app.post("/register", (req, res) => {
    User.register(new User({ username: req.body.username }), req.body.password, (err, user) => {
        if (err) {
            console.log(err);
            return res.render("register");
        } else {
            passport.authenticate("local")(req, res, () => {
                res.redirect("/secret");
            });
        }
    });
});

//login routes
/**
 * @swagger
 * /login:
 *  get:
 *      description: route that shows the form to be logged in the app
 *      responses:
 *          '200':
 *              description: A successful login
 */
app.get("/login", (req, res) => {
    res.render("login");
});

/**
 * @swagger
 * /login:
 *   post:
 *       tags:
 *           - User
 *       description: Creates a new user
 *       produces:
 *           - application/json
 *       parameters:
 *           - name: user
 *             description: User Object
 *             in: body
 *             required: true
 *             schema:
 *               $ref: 'User'
 *       responses:
 *           200:
 *           description: User successfully created
 */
app.post("/login", passport.authenticate("local", {
    successRedirect: "/secret",
    failureRedirect: "/login"

}), (req, res) => {
    res.render("login");
});

/**
 * @swagger
 * /logout:
 *  get:
 *      description: route that kick off the user of the app
 *      responses:
 *          '200':
 *              description: A successful login
 */
app.get("/logout", (req, res) => {
    req.logOut();
    res.redirect("/");
});

/**
 * @swagger
 * /delete:
 *  delete:
 *      tags:
 *          - User
 *      description: Delete current user
 *      produces: 
 *          - application/json
 *      responses:
 *          200:
 *              description: user succesfully deleted
 */
app.delete("/delete", isLoggedIn, (req, res) => {
    User.findByIdAndDelete(req.user._id, (err) => {
        if (err) {
            console.log(err);
        } else {
            res.redirect("/");
        }
    })
})

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}
app.listen(8080, () => {
    console.log("App runnin at port 8081 when 'docker-compose up' is executed");
});