require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');

const app = express();
connectDB();

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/auth',      require('./routes/auth'));
app.use('/api/bookings',  require('./routes/bookings'));
app.use('/api/services',  require('./routes/services'));
app.use('/api/users',     require('./routes/users'));
app.use('/api/inventory', require('./routes/inventory'));

app.get('/api/health', (_, res) => res.json({ success: true, message: '🌸 Salon Abeela API running' }));
app.use((_, res) => res.status(404).json({ success: false, message: 'Route not found' }));
app.use((err, _, res, __) => res.status(500).json({ success: false, message: err.message }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🌸 Server running on port ${PORT}`));
