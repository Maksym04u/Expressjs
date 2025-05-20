const app = require('./app');
const sequelize = require('./config/database');
require('dotenv').config();

// Import models
require('./models');

// Database Connection and Sync
sequelize.authenticate()
  .then(() => {
    console.log('Connected to PostgreSQL database');
    return sequelize.sync({ alter: true });
  })
  .then(() => {
    console.log('Database synchronized');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Swagger documentation available at http://localhost:${PORT}/api-docs`);
}); 