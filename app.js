const axios = require('axios');
const express = require('express');
const path = require('path')
const app = express();
require("dotenv").config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const session = require("express-session")
const flash = require('connect-flash');


const connectDB = require('./db/connectDB');
const user = require('./models/user');
const post = require('./models/post')
const book = require('./models/book')
const getUser = require('./controllers/getUser')


app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', './views');



connectDB();



app.get('/', isLoggedIn, async(req, res) => {
    const existingUser = await getUser(req.user.userId);
    
    res.render('Index', {}, (err, html) => {
        if (err) {
            return res.status(500).send(err.message);
        }
        res.render('layout', { title: 'Home', activePage: 'Index', user: existingUser, body: html });
    });
});
app.get('/login-page', (req, res) => {
    res.render('login', {}, (err, html) => {
        if (err) {
            return res.status(500).send(err.message);
        }
        res.render('layout', { title: 'Login', activePage: 'login', user, body: html });
    });
});
app.post('/login', async (req, res) => {
    try {
        const { userEmail, userPassword } = req.body;
        const existingUser = await user.findOne({
            userEmail
        });
        if (!existingUser) {
            res.render('error', { message: 'User does not exist'}, (err, html) => {
                if (err) {
                    return res.status(500).send(err.message);
                }
                res.render('layout', { title: 'Error', activePage: 'error', user, body: html });
            });
        }
        else{
            const passwordMatch = await bcrypt.compare(userPassword, existingUser.userPassword);
            if (!passwordMatch) {
                res.render('error', { message: 'Invalid password'}, (err, html) => {
                    if (err) {
                        return res.status(500).send(err.message);
                    }
                    res.render('layout', { title: 'Error', activePage: 'error', user, body: html });
                });
            }
            else{
                try {
                    const token = jwt.sign({ userEmail, userId: existingUser._id }, process.env.JWT_SECRET);
                    res.cookie('token', token);
                    res.render('Index', {}, (err, html) => {    
                        if (err) {
                            return res.status(500).send(err.message);
                        }
                        res.render('layout', { title: 'Home', activePage: 'Index', user:existingUser, body: html });
                    });
                } catch (error) {
                    console.error(error);
                    res.render('error', { message: `${error.message} /n Error generating token`}, (err, html) => {
                        if (err) {
                            return res.status(500).send(err.message);
                        }
                        res.render('layout', { title: 'Error', activePage: 'error', user, body: html });
                    });
                }
            }
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while logging in.');
    }
});
app.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/');
});
app.get('/register', (req, res) => {
    res.render('register', {}, (err, html) => {
        if (err) {
            return res.status(500).send(err.message);
        }
        res.render('layout', { title: 'Sign Up', activePage: 'register', user, body: html });
    });
});
app.post('/register', async (req, res) => {
    try {
        const { userName, userfullName, userEmail, userPassword } = req.body;
        const existingUser = await user.findOne({
            userEmail
        }); 
        if(existingUser) {
            // res.status(400).send('User already exists');
            res.render('error', { message: 'User already exists'}, (err, html) => {
                if (err) {
                    return res.status(500).send(err.message);
                }
                res.render('layout', { title: 'Error', activePage: 'error', user, body: html });
            });
        }
        else{

            bcrypt.genSalt(10, (err, salt) => {
                if (err) {
                    res.render('error', {message: "Error generating salt"}, (err, html) => {
                        if (err) {
                            return res.status(500).send(err.message);
                        }
                        res.render('layout', { title: 'Error', activePage: 'error', user, body: html });
                    });
                }
                else{
                    bcrypt.hash(userPassword, salt, async (err, hash) => {
                        if (err) {
                            return res.status(500).send('An error occurred while hashing the password.');
                        }
                        const newUser = new user({
                            userName,
                            userfullName,
                            userEmail,
                            userPassword: hash
                        });
                        await newUser.save();
                        try {
                        const token = jwt.sign({ userEmail, userId: newUser._id }, process.env.JWT_SECRET);
                        res.cookie('token', token);
                        } catch (error) {
                            console.error(error);
                            res.render('error', { message: `${error.message} /n Error generating token`}, (err, html) => {
                                if (err) {
                                    return res.status(500).send(err.message);
                                }
                                res.render('layout', { title: 'Error', activePage: 'error', user, body: html });
                            });
                        }
                        
                        res.render('login', {}, (err, html) => {
                            if (err) {
                                return res.status(500).send(err.message);
                            }
                            res.render('layout', { title: 'Login', activePage: 'login', user, body: html });
                        });
                    });
                }
            });
        }

        
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while creating a new user.');

    }
});
app.get('/about', (req, res) => {
    res.render('about', {}, (err, html) => {
        if (err) {
            return res.status(500).send(err.message);
        }
        res.render('layout', { title: 'About', activePage: 'about', user, body: html });
    });
});
app.get('/contact', (req, res) => {
    res.render('contact', {}, (err, html) => {
        if (err) {
            return res.status(500).send(err.message);
        }
        res.render('layout', { title: 'Contact', activePage: 'contact', user, body: html });
    });
});
app.get('/posts', async (req, res) => {
   
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 12;
        const response = await axios.get('https://dummyjson.com/posts');
        const allPosts = response.data.posts;
        const totalPosts = allPosts.length;
        const totalPages = Math.ceil(totalPosts / limit);
        
        // Calculate start and end index for current page
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const data = allPosts.slice(startIndex, endIndex);

        const token = req.cookies.token;
        if(token){
            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            req.user =decoded;
            const existingUser = await getUser(req.user.userId);
            res.render('posts', { 
                data,
                currentPage: page,
                totalPages,
                hasNextPage: endIndex < totalPosts,
                hasPrevPage: page > 1
            }, (err, html) => {
                if (err) {
                    return res.status(500).send(err.message);
                }
                res.render('layout', { 
                    title: 'All Posts', 
                    activePage: 'posts', 
                    user : existingUser, 
                    body: html 
                });
            });
        } else{
            res.render('posts', { 
                data,
                currentPage: page,
                totalPages,
                hasNextPage: endIndex < totalPosts,
                hasPrevPage: page > 1
            }, (err, html) => {
                if (err) {
                    return res.status(500).send(err.message);
                }
                res.render('layout', { 
                    title: 'All Posts', 
                    activePage: 'posts', 
                    user, 
                    body: html 
                });
            });
        }
        
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while fetching posts.');
    }
});
app.get("/error", (req, res) => {
    res.render('error', {}, (err, html) => {
        if (err) {
            return res.status(500).send(err.message);
        }
        res.render('layout', { title: 'Error', activePage: 'error', user, body: html });
    });
});
app.get("/profile", isLoggedIn, async (req, res)=> {
    const existingUser = await getUser(req.user.userId);
    res.render("profile", { user: existingUser}, (err, html)=>{
        if(err){
            res.render("error", {message: err.message})
        }
        res.render("layout", {title: "User Profile", activePage: "profile", user : existingUser, body: html})
    })
})
app.get("/profile2", isLoggedIn, async (req, res)=> {
    const existingUser = await getUser(req.user.userId);
    res.render("profile2", { user: existingUser}, (err, html)=>{
        if(err){
            res.render("error", {message: err.message})
        }
        res.render("layout", {title: "User Profile", activePage: "profile", user : existingUser, body: html})
    })
})
app.get("/profile3", isLoggedIn, async (req, res)=> {
    const existingUser = await getUser(req.user.userId);
    res.render("profile3", { user: existingUser}, (err, html)=>{
        if(err){
            res.render("error", {message: err.message})
        }
        res.render("layout", {title: "User Profile", activePage: "profile", user : existingUser, body: html})
    })
})
app.get("/editor", isLoggedIn, async (req, res)=> {
    const existingUser = await getUser(req.user.userId);
    res.render("editor", { user: existingUser}, (err, html)=>{
        if(err){
            res.render("error", {message: err.message})
        }
        res.render("layout", {title: "Create Post", activePage: "create post", user : existingUser, body: html})
    })
})
app.post('/submit', async(req, res) => {
    // const editorContent = req.body.content; // Froala editor content
    const { content, title, featureImageUrl} = req.body
    console.log(req.body)
    const data = await post.create({titleContent: title, body: content, featureImageUrl:featureImageUrl})
    console.log('Received content:', data);
    // Send a response or save the data to the database
    res.json({ message: 'Content received', content: data });
});
// app.get("/digital-library", isLoggedIn, async (req, res)=> {
//     const existingUser = await getUser(req.user.userId);
//     res.render("digitalLibrary", { user: existingUser}, (err, html)=>{
//         if(err){
//             res.render("error", {message: err.message})
//         }
//         res.render("layout", {title: "Create Post", activePage: "digital library", user : existingUser, body: html})
//     })
// });
app.get("/addBook", isLoggedIn, async (req, res)=> {
    const existingUser = await getUser(req.user.userId);
    res.render("addBook", { user: existingUser}, (err, html)=>{
        if(err){
            res.render("error", {message: err.message})
        }
        res.render("layout", {title: "Add Book", activePage: "Add Book", user : existingUser, body: html})
    })
});
app.post('/addBook', async(req, res) => {
    // const editorContent = req.body.content; // Froala editor content
    const { bookName, authorName, researcherName, publisherName, description, imageUrl, totalPages, category, pdfUrl    } = req.body
    console.log(req.body)
    const bookData = await book.create({bookName, authorName, researcherName, publisherName, description, imageUrl, totalPages, category, pdfUrl});
    console.log('Received Book:', bookData);
    // Send a response or save the data to the database
    res.redirect('/digital-library')
    // res.render('digitalLibrary', (err, html) => {
    //     if (err) {
    //         return res.status(500).send(err.message);
    //     }
    //     res.render('layout', { title: 'Digital Library', activePage: 'digital-library', user, body: html });
    // });
});
app.get("/digital-library", isLoggedIn, async (req, res)=> {
    const existingUser = await getUser(req.user.userId);
    const categories = {
        "تفسیر": 101,
        "تہذیب": 102,
        "تبلیغ": 103,
        "اصلاح": 104,
        "حدیث": 105,
        "تاریخ": 106,
        "سائنس": 107,
        "فقہ": 108,
        "منطق": 109,
        "عبادات": 110,
        "عقائد": 111,
        "تقابل ادیان": 112,
        "تصوف": 113,
        "زبان و ادب": 114,
      };
    const allBooks = await book.find();
    res.render("digitalLibrary", { user: existingUser, books: allBooks, categories: categories }, (err, html)=>{
        if(err){
            res.render("error", {message: err.message})
        }
        res.render("layout", {title: "Create Post", activePage: "digital library", user : existingUser, body: html})
    })
});
app.get("/read", isLoggedIn, async (req, res)=> {
    const existingUser = await getUser(req.user.userId);
    const totalPages = 20;
    const currentPage = 1; // Example value, replace with actual logic
    const nextPage = 2; // Example value, replace with actual logic
    res.render("read", { user: existingUser, currentPage, nextPage, totalPages}, (err, html)=>{
        if(err){
            res.render("error", {message: err.message})
        }
        res.render("layout", {title: "Read Book", activePage: "Read Book", user : existingUser, body: html})
    })
});

app.get("./addBookData", async (req, res) => {
    const bookData = await book.create({
        bookName: "Quran",
        authorName: "Allah",
        researcherName: "Allah",
        publisherName: "Allah",
        description: "The Quran, also romanized Qur'an or Koran, is the central religious text of Islam, believed by Muslims to be a revelation from God. It is widely regarded as the finest work in classical Arabic literature.",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/6/61/Black_flag.jpg",
        totalPages: 604,
        category: "تفسیر",
        pdfUrl: "https://www.pdfdrive.com/download.pdf?id=6195686&h=1d0b7b3e5d3d5d2a0c"})
    });




function isLoggedIn(req, res, next) {
    try {
        const token = req.cookies.token;
        if (!token) {
            res.redirect('/login-page');
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        // console.log(req.user)
        next();
    } catch (error) {
        console.error(error);
        res.render('error', { message: `${error.message} /n Error verifying token`}, (err, html) => {
            if (err) {
                return res.status(500).send(err.message);
            }
            res.render('layout', { title: 'Error', activePage: 'error', user, body: html });
        });
    }
}

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port http://localhost:${process.env.PORT}`);
});