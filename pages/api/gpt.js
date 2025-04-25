
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { prompt } = req.body;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7
      })
    });

    const json = await response.json();
    const gptText = json.choices?.[0]?.message?.content;

    let result;
    try {
      result = JSON.parse(gptText);
    } catch {
      result = {
        요약: 'AI 분석 실패',
        시장_타당성_점수: 0,
        예상_매출: '-',
        리스크: [],
        실행_전략: '-',
        추천_등급: '-'
      };
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('OpenAI 요청 오류:', error);
    res.status(500).json({ error: 'GPT 연결 실패' });
  }
}
