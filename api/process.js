export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { type, content } = req.body;
    let parts = [];

    if (type === 'voice') {
      parts = [{ text: `Kullanıcı sesli olarak şunu söyledi: "${content.transcript}"\nSADECE JSON döndür, başka hiçbir şey yazma:\n{"not":"yer/işlem adı","tutar":sayı,"gelirMi":true/false,"kategori":"Market|Yemek|Ulaşım|Fatura|Kira|Eğlence|Sağlık|Gelir|Diğer"}\nTutar bulamazsan 0 yaz.` }];
    } else if (type === 'scan') {
      parts = [
        { inline_data: { mime_type: content.mediaType, data: content.data } },
        { text: `SADECE JSON döndür:\n{"not":"işlem adı","tutar":sayısal_tutar,"kategori":"Market|Yemek|Ulaşım|Fatura|Kira|Eğlence|Sağlık|Diğer","tarih":"YYYY-MM-DD"}` }
      ];
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ role: 'user', parts }] })
      }
    );

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return res.status(200).json({ content: [{ type: 'text', text }] });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
