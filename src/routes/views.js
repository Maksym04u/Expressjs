const router = require('express').Router();
const auth = require('../middleware/auth');
const Post = require('../models/Post');
const User = require('../models/User');

// Debug route
router.get('/debug', (req, res) => {
    res.json({
        message: 'Views router is working',
        path: req.path,
        baseUrl: req.baseUrl,
        originalUrl: req.originalUrl
    });
});

// Home page
router.get('/', async (req, res) => {
    try {
        const posts = await Post.findAll({
            include: [{
                model: User,
                as: 'author',
                attributes: ['username']
            }],
            order: [['createdAt', 'DESC']],
            limit: 10
        });
        res.render('home', { 
            title: 'Home',
            posts,
            user: req.user || null
        });
    } catch (error) {
        console.error('Error in home route:', error);
        res.status(500).render('error', { 
            message: 'Error loading posts',
            error: process.env.NODE_ENV === 'development' ? error : {}
        });
    }
});

// Login page
router.get('/login', (req, res) => {
    console.log('Login route hit');
    if (req.user) {
        return res.redirect('/');
    }
    res.render('login', { 
        title: 'Login',
        error: null
    });
});

// Register page
router.get('/register', (req, res) => {
    console.log('Register route hit');
    if (req.user) {
        return res.redirect('/');
    }
    res.render('register', { 
        title: 'Register',
        error: null
    });
});

// Profile page (protected)
router.get('/profile', auth, async (req, res) => {
    try {
        const userPosts = await Post.findAll({
            where: { user_id: req.user.id },
            order: [['createdAt', 'DESC']]
        });
        res.render('profile', { 
            title: 'Profile',
            user: req.user,
            posts: userPosts
        });
    } catch (error) {
        console.error('Error in profile route:', error);
        res.status(500).render('error', { 
            message: 'Error loading profile',
            error: process.env.NODE_ENV === 'development' ? error : {}
        });
    }
});

module.exports = router;