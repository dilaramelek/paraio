export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { messages, system } = req.body;

    const openrouterMessages = system
      ? [{ role: 'system', content: system }, ...messages]
      : messages;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://paraio.vercel.app',
        'X-Title': 'ParaIO'
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.2-3b-instruct:free',
        messages: openrouterMessages
      })
    });

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content || 'Bir sorun oluştu.';
    return res.status(200).json({ content: [{ type: 'text', text }] });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
