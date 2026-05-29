const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.post('/api/generate', async (req, res) => {
  try {
    const { blueprint } = req.body;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are a brand strategist. You ONLY respond with raw valid JSON. No markdown. No explanation. No code blocks. Just pure JSON.'
          },
          {
            role: 'user',
            content: `Create a brand kit for: ${blueprint}. Return ONLY this JSON: {"businessName":"Name","industry":"Industry","targetAudience":"Audience","valueProposition":"Value","logos":[{"name":"Primary Logo","description":"Desc","usage":"Main use","style":"Modern"}],"colorPalette":{"primary":{"hex":"#6366F1","name":"Color","usage":"Usage"},"secondary":{"hex":"#8B5CF6","name":"Color","usage":"Usage"},"accent":{"hex":"#EC4899","name":"Color","usage":"Usage"},"neutral":[{"hex":"#1F2937","name":"Dark"},{"hex":"#6B7280","name":"Gray"}]},"typography":{"heading":{"font":"Inter","weights":["700"],"usage":"Headlines"},"body":{"font":"Inter","weights":["400"],"usage":"Body text"}},"brandVoice":{"personality":["Trait1","Trait2"],"tone":"Tone","tagline":"Tagline","elevatorPitch":"Pitch","keyMessages":["Msg1","Msg2"]},"socialAssets":[{"type":"Profile","description":"Desc","dimensions":"1080x1080px"}],"contentThemes":["Theme1","Theme2"]}`
          }
        ],
        temperature: 0.3
      })
    });

    const apiData = await response.json();

    if (!response.ok) {
      return res.status(500).json({ success: false, error: `Groq Error: ${JSON.stringify(apiData)}` });
    }

    let content = apiData.choices[0].message.content;
    content = content.trim().replace(/```json/gi, '').replace(/```/gi, '').trim();
    const firstBrace = content.indexOf('{');
    const lastBrace = content.lastIndexOf('}');
    content = content.substring(firstBrace, lastBrace + 1);
    const brandKit = JSON.parse(content);

    res.json({ success: true, brandKit });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => console.log(`Running on http://localhost:${PORT}`));
