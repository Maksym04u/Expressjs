const router = require('express').Router();
const Post = require('../models/Post');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { validate, validateQuery } = require('../middleware/validate');
const { createPostSchema, updatePostSchema, querySchema } = require('../validators/posts');
const { Op } = require('sequelize');

/**
 * @swagger
 * components:
 *   schemas:
 *     Post:
 *       type: object
 *       properties:
 *         id: { type: integer }
 *         title: { type: string }
 *         content: { type: string }
 *         user_id: { type: integer }
 *         author: 
 *           type: object
 *           properties:
 *             username: { type: string }
 */

/**
 * @swagger
 * /api/posts:
 *   post:
 *     summary: Create a new post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               content: { type: string }
 *     responses:
 *       201: { description: Post created successfully }
 *       401: { description: Not authorized }
 *       500: { description: Server error }
 */
router.post('/', auth, validate(createPostSchema), async (req, res) => {
  try {
    const { title, content } = req.body;
    const post = await Post.create({
      title,
      content,
      user_id: req.user.id
    });

    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: 'Error creating post', error: error.message });
  }
});

/**
 * @swagger
 * /api/posts:
 *   get:
 *     summary: Get all posts with pagination
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 5 }
 *     responses:
 *       200: { description: List of posts }
 *       500: { description: Server error }
 */
router.get('/', validateQuery(querySchema), async (req, res) => {
  try {
    const { page, limit } = req.query;
    const offset = (page - 1) * limit;

    const totalPosts = await Post.count();
    const totalPages = Math.ceil(totalPosts / limit);

    const posts = await Post.findAll({
      include: [{
        model: User,
        as: 'author',
        attributes: ['username']
      }],
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      posts,
      pagination: {
        currentPage: page,
        totalPages,
        totalPosts,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching posts', error: error.message });
  }
});

/**
 * @swagger
 * /api/posts/{id}:
 *   get:
 *     summary: Get a post by ID
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Post found }
 *       404: { description: Post not found }
 */
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id, {
      include: [{
        model: User,
        as: 'author',
        attributes: ['username']
      }]
    });
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching post', error: error.message });
  }
});

/**
 * @swagger
 * /api/posts/{id}:
 *   put:
 *     summary: Update a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               content: { type: string }
 *     responses:
 *       200: { description: Post updated }
 *       401: { description: Not authorized }
 *       403: { description: Not authorized to update }
 *       404: { description: Post not found }
 */
router.put('/:id', auth, validate(updatePostSchema), async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this post' });
    }

    const updatedPost = await post.update(req.body);
    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: 'Error updating post', error: error.message });
  }
});

/**
 * @swagger
 * /api/posts/{id}:
 *   delete:
 *     summary: Delete a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Post deleted }
 *       401: { description: Not authorized }
 *       403: { description: Not authorized to delete }
 *       404: { description: Post not found }
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    await post.destroy();
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting post', error: error.message });
  }
});

/**
 * @swagger
 * /api/posts/{id}/delete:
 *   get:
 *     summary: Delete a post using GET request
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *       - in: query
 *         name: confirm
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Post deleted successfully }
 *       401: { description: Not authorized }
 *       403: { description: Not authorized to delete }
 *       404: { description: Post not found }
 */
router.get('/:id/delete', auth, async (req, res) => {
  try {
    // Check if confirm parameter is present
    if (!req.query.confirm) {
      return res.status(400).json({ message: 'Please provide confirm parameter' });
    }

    const post = await Post.findByPk(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    await post.destroy();
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting post', error: error.message });
  }
});

module.exports = router; 