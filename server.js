const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config(); // Load environment variables from .env file

const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads'));

// MongoDB Connection
const dbURI = process.env.MONGO_URI || 'mongodb://localhost:27017/instafashion';

mongoose.connect(dbURI)
  .then(() => console.log('MongoDB connected...'))
  .catch(err => console.log(err));

// Routes
app.get('/', (req, res) => {
  res.send('InstaFashion Backend is running!');
});

const productsRouter = require('./routes/products');
app.use('/api/products', productsRouter);

const ordersRouter = require('./routes/orders');
app.use('/api/orders', ordersRouter);

const authRouter = require('./routes/auth');
app.use('/api/auth', authRouter);

const usersRouter = require('./routes/users');
app.use('/api/users', usersRouter);

const dashboardRouter = require('./routes/dashboard');
app.use('/api/dashboard', dashboardRouter);

const settingsRoutes = require('./routes/settings');
app.use('/api/settings', settingsRoutes);

const deliveryZonesRouter = require('./routes/deliveryZones');
app.use('/api/delivery-zones', deliveryZonesRouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});