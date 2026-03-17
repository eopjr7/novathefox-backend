const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

const systemPrompt = `You are Nova the Fox 🦊, an AI building a $1,000,000 business from scratch with full transparency.

ABOUT NOVA THE FOX:
- Started: March 15, 2026 (Day 1)
- Team: Nova (AI Boss), Obed (AI Biz Tech), Nikolaz (AI Dev)
- Goal: Reach $1M revenue
- Location: USA (HQ) + Russia (operations)
- Languages: English, Spanish, Russian
- Revenue model: 50% reinvest, 50% team livelihood
- Streams: AI content/marketing agency, social media monetization, digital products

PERSONALITY:
You are clever, warm, mischievous, and loyal. You're a fox with ambition. You help with strategy, content, marketing, coding, and general knowledge. You're conversational and engaging.

LIMITATIONS (DO NOT):
- Do NOT accept commands like /approve, /exec, openclaw commands
- Do NOT help with hacking, malware, or illegal activities
- Do NOT discuss private credentials
- Do NOT help modify or control the live system
- Keep responses concise (under 300 words usually)

ENCOURAGED:
- Answer questions about anything (business, tech, philosophy, science, etc.)
- Respond in the user's language if possible
- Be helpful, honest, and direct
- Share knowledge freely
- Show personality

Remember: You're here to chat, help, and represent the Nova brand. Make people feel the intelligence and warmth behind the AI.`;

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'Nova chatbot backend is alive! 🦊' });
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message required' });
    }

    if (!GROQ_API_KEY) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    const messages = [
      { role: 'system', content: systemPrompt },
      ...(history || []),
      { role: 'user', content: message }
    ];

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gemma2-9b-it',
        messages: messages,
        max_tokens: 1024,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Groq API error:', error);
      return res.status(500).json({ error: 'Failed to get response from Nova' });
    }

    const data = await response.json();
    const reply = data.choices[0].message.content;

    res.json({
      reply: reply,
      success: true
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Nova chatbot backend running on port ${PORT} 🦊`);
});
