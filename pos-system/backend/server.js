// server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const DEFAULT_PASSWORD = 'Ramsy4u&me';

app.get('/', (req, res) => {
  res.send('RamsyPOS Backend is running!');
});

// Create user with Username instead of Email
app.post('/api/create-user', async (req, res) => {
  const { username, full_name, role, category } = req.body;

  if (!username || !full_name || !role || !category) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Convert username to a fake email format for Supabase
    const fakeEmail = `${username.toLowerCase().replace(/\s+/g, '')}@ramsypos.app`;

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: fakeEmail,
      password: DEFAULT_PASSWORD,
      email_confirm: true,
      user_metadata: {
        full_name: full_name,
        role: role,
        category: category
      }
    });

    if (error) throw error;

    res.status(200).json({ 
      message: `User created! They can log in with username: ${username} and password: ${DEFAULT_PASSWORD}` 
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: error.message });
  }
});

// Manager Reset Password
app.post('/api/reset-password', async (req, res) => {
  const { user_id } = req.body;

  try {
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      user_id,
      { password: DEFAULT_PASSWORD }
    );

    if (error) throw error;

    res.status(200).json({ message: `Password reset to default (${DEFAULT_PASSWORD})` });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
