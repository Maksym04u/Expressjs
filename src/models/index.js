const User = require('./User');
const Post = require('./Post');

// Define relationships with consistent aliases
Post.belongsTo(User, { as: 'author', foreignKey: 'user_id' });
User.hasMany(Post, { as: 'posts', foreignKey: 'user_id' });

module.exports = {
  User,
  Post
}; 