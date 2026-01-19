const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const User = require('./models/User');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/analytics', require('./routes/analytics'));

const createAdminAccount = async () => {
    try {
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (!adminEmail || !adminPassword) {
            console.log('Admin credentials not found in .env');
            return;
        }

        const adminExists = await User.findOne({ email: adminEmail });

        if (!adminExists) {
            const adminUser = await User.create({
                name: 'Admin',
                email: adminEmail,
                password: adminPassword,
                role: 'admin',
            });
            console.log('Admin account created successfully');
        } else {
            console.log('Admin account already exists');
        }
    } catch (error) {
        console.error('Error creating admin account:', error);
    }
};

// Connect to DB then start server
connectDB().then(() => {
    createAdminAccount();
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch(err => {
    console.error('Failed to connect to DB', err);
});
