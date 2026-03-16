export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { type, content } = req.body;
    let prompt = '';
    let parts = [];

    if (type === 'voice') {
      prompt = `Kullanıcı sesli olarak şunu söyledi: "${content.transcript}"
Bu bir finansal işlem. Bilgileri çıkar ve SADECE JSON döndür, başka hiçbir şey yazma:
{"not":"yer/işlem adı","tutar":sayı,"gelirMi":true/false,"kategori":"Market|Yemek|Ulaşım|Fatura|Kira|Eğlence|Sağlık|Gelir|Diğer"}
Tutar bulamazsan 0 yaz. Maaş/gelir söylenmişse gelirMi true olsun.`;
      parts = [{ text: prompt }];
    } else if (type === 'scan') {
      prompt = `Bu fiş veya dekonttaki bilgileri çıkar ve SADECE JSON döndür:
{"not":"işlem adı","tutar":sayısal_tutar,"kategori":"Market|Yemek|Ulaşım|Fatura|Kira|Eğlence|Sağlık|Diğer","tarih":"YYYY-MM-DD"}
Tutar bulamazsan 0 yaz. Tarih bulamazsan: ${new Date().toISOString().split('T')[0]}`;
      parts = [
        { inline_data: { mime_type: content.mediaType, data: content.data } },
        { text: prompt }
      ];
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ role: 'user', parts }] })
      }
    );

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return res.status(200).json({
      content: [{ type: 'text', text }]
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
