const express = require('express');
const router = express.Router();
const sequelize = require('../config/database');

/**
 * @swagger
 * /api/raw/users-with-posts:
 *   get:
 *     summary: Get all users with their post count using raw SQL
 *     description: Retrieves a list of all users along with the count of their posts using a raw SQL query
 *     tags: [Raw SQL]
 *     responses:
 *       200:
 *         description: List of users with their post counts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: User ID
 *                   username:
 *                     type: string
 *                     description: Username
 *                   email:
 *                     type: string
 *                     description: User's email address
 *                   post_count:
 *                     type: integer
 *                     description: Number of posts by the user
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 */
router.get('/users-with-posts', async (req, res) => {
    try {
        // First, let's check what tables exist
        const [tables] = await sequelize.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        console.log('Available tables:', tables);

        // Let's check the actual data in both tables
        const [users] = await sequelize.query(`
            SELECT * FROM "Users"
        `);
        console.log('Users in database:', users);

        const [posts] = await sequelize.query(`
            SELECT * FROM "Posts"
        `);
        console.log('Posts in database:', posts);

        // Now let's try the count query with more detailed debugging
        const [results] = await sequelize.query(`
            SELECT 
                u.id,
                u.username,
                u.email,
                COUNT(p.id) as post_count,
                array_agg(p.id) as post_ids
            FROM "Users" u
            LEFT JOIN "Posts" p ON u.id = p.user_id
            GROUP BY u.id, u.username, u.email
            ORDER BY post_count DESC
        `);
        
        console.log('Query results:', results);
        res.json(results);
    } catch (error) {
        console.error('SQL Error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 