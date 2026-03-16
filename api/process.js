export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { type, content } = req.body;
    let messages = [];
    if (type === 'scan') {
      messages = [{ role: 'user', content: [
        { type: 'image', source: { type: 'base64', media_type: content.mediaType, data: content.data } },
        { type: 'text', text: `Bu fiş veya dekonttan bilgileri çıkar, SADECE JSON döndür:\n{"not":"işlem adı","tutar":sayı,"kategori":"Market|Yemek|Ulaşım|Fatura|Kira|Eğlence|Sağlık|Diğer","tarih":"YYYY-MM-DD"}\nTarih bulamazsan: ${new Date().toISOString().split('T')[0]}` }
      ]}];
    } else if (type === 'voice') {
      messages = [{ role: 'user', content: `Kullanıcı şunu söyledi: "${content.transcript}"\nSADECE JSON döndür:\n{"not":"yer adı","tutar":sayı,"gelirMi":true/false,"kategori":"Market|Yemek|Ulaşım|Fatura|Kira|Eğlence|Sağlık|Gelir|Diğer"}` }];
    }
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 500, messages })
    });
    return res.status(200).json(await r.json());
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
