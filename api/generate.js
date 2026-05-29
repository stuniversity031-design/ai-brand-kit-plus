export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { blueprint } = req.body;

    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.XAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'grok-2',
        messages: [{
          role: 'user',
          content: `Create a brand kit for: ${blueprint}. Return ONLY valid JSON with this structure: {"businessName":"Name","industry":"Industry","targetAudience":"Audience","valueProposition":"Value","logos":[{"name":"Primary","description":"Desc","usage":"Usage","style":"Style"}],"colorPalette":{"primary":{"hex":"#6366F1","name":"Color","usage":"Usage"},"secondary":{"hex":"#8B5CF6","name":"Color","usage":"Usage"},"accent":{"hex":"#EC4899","name":"Color","usage":"Usage"},"neutral":[{"hex":"#1F2937","name":"Dark"}]},"typography":{"heading":{"font":"Font","weights":["700"],"usage":"Usage"},"body":{"font":"Font","weights":["400"],"usage":"Usage"}},"brandVoice":{"personality":["Trait1"],"tone":"Tone","tagline":"Tagline","elevatorPitch":"Pitch","keyMessages":["Msg1"]},"socialAssets":[{"type":"Profile","description":"Desc","dimensions":"1080x1080px"}],"contentThemes":["Theme1"]}`
        }],
        temperature: 0.7
      })
    });

    const apiData = await response.json();

    if (!response.ok) {
      return res.status(500).json({ success: false, error: `Grok API Error: ${JSON.stringify(apiData)}` });
    }

    let content = apiData.choices[0].message.content;
    content = content.replace(/```json/g, '').replace(/```/g, '').trim();
    const firstBrace = content.indexOf('{');
    const lastBrace = content.lastIndexOf('}');
    content = content.substring(firstBrace, lastBrace + 1);
    const brandKit = JSON.parse(content);

    res.json({ success: true, brandKit });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
