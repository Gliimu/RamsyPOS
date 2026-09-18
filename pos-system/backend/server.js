// server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
app.use(cors()); // Allow your frontend to talk to this backend
app.use(express.json());

// Initialize Supabase Admin Client (Using the SECRET service_role key)
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Health check route
app.get('/', (req, res) => {
  res.send('RamsyPOS Backend is running!');
});

// Route to invite a team member
app.post('/api/invite', async (req, res) => {
  const { email, full_name, role, category } = req.body;

  if (!email || !full_name || !role || !category) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // 1. Send the invitation email using Supabase Admin Auth
    const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: {
        full_name: full_name,
        role: role,
        category: category
      }
    });

    if (error) throw error;

    res.status(200).json({ message: `Invitation sent to ${email}` });
  } catch (error) {
    console.error('Error inviting user:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
