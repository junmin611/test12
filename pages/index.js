
import { useState } from 'react';
import jsPDF from 'jspdf';

const questions = [
  {
    question: "당신의 창업 아이디어를 간단히 설명해 주세요.",
    intent: "아이디어의 전체 개요 파악",
    example: "예: 1인 가구를 위한 반찬 구독 서비스"
  },
  {
    question: "어떤 문제(불편함/비효율/갈증)를 해결하려고 하시나요?",
    intent: "실제 Pain Point 확인",
    example: "예: 자취생의 식사 준비 어려움"
  },
  {
    question: "비슷한 경쟁자가 등장했을 때 어떻게 대응할 수 있을까요?",
    intent: "지속 가능성 및 대응 전략 평가",
    example: "예: 개인 맞춤 데이터 락인, 브랜드 강화"
  }
];

export default function Home() {
  const [step, setStep] = useState(-1);
  const [answers, setAnswers] = useState(Array(questions.length).fill(''));
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const updated = [...answers];
    updated[step] = e.target.value;
    setAnswers(updated);
  };

  const handleNext = () => {
    if (step < questions.length - 1) setStep(step + 1);
  };

  const handleSubmit = async () => {
    setLoading(true);

    const prompt = `다음은 사용자의 창업 아이디어 진단 응답입니다. 각 항목에 대한 요약, 시장성 점수(100점 기준), 예상 수익, 주요 리스크, 실행 전략을 JSON으로 요약해줘.\n\n${questions.map((q, i) => \`\${i + 1}. \${q.question}\n답변: \${answers[i]}\`).join('\n\n')}`;

    const gptResponse = await fetch('/api/gpt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });

    if (!gptResponse.ok) {
      console.error('GPT 요청 실패:', gptResponse.status, await gptResponse.text());
      alert('GPT 연결에 문제가 발생했습니다. 콘솔을 확인해주세요.');
      setLoading(false);
      return;
    }

    const data = await gptResponse.json();
    setResult(data);
    setLoading(false);
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text('AI 창업 아이디어 진단 보고서', 20, 20);
    doc.setFontSize(12);
    let y = 40;
    Object.entries(result).forEach(([key, value]) => {
      const val = Array.isArray(value) ? value.join(', ') : value;
      doc.text(`${key}: ${val}`, 20, y);
      y += 10;
    });
    doc.save('startup_diagnosis.pdf');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-400 to-blue-600 text-white">
      <div className="flex justify-start items-center px-6 py-4 bg-transparent">
        <h1 className="text-xl font-bold">STARTUP AI</h1>
      </div>

      <div className="flex flex-col items-center text-center px-4 py-20">
        {step === -1 && !result ? (
          <>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">AI가 진단하는 당신의 창업 아이디어</h2>
            <p className="text-lg md:text-xl mb-6">혁신적인 인공지능 기술로 창업 아이디어를 분석하고, 단계별로 필요한 정보를 제공해 드립니다.</p>
            <button className="bg-white text-blue-600 font-semibold px-6 py-3 hover:bg-blue-100 mt-4" onClick={() => setStep(0)}>
              진단 시작하기
            </button>
          </>
        ) : result ? (
          <div className="bg-white text-black p-6 rounded-xl max-w-2xl w-full">
            <h2 className="text-2xl font-bold mb-4">AI 진단 결과</h2>
            <p><strong>요약:</strong> {result.요약}</p>
            <p><strong>시장 타당성 점수:</strong> {result.시장_타당성_점수}점</p>
            <p><strong>예상 매출:</strong> {result.예상_매출}</p>
            <p><strong>리스크:</strong> {result.리스크.join(', ')}</p>
            <p><strong>실행 전략:</strong> {result.실행_전략}</p>
            <p><strong>추천 등급:</strong> {result.추천_등급}</p>
            <button onClick={downloadPDF} className="mt-4 bg-blue-600 text-white px-6 py-2 rounded">PDF 저장</button>
          </div>
        ) : (
          <div className="w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-4">Q{step + 1}. {questions[step].question}</h2>
            <p className="text-sm text-left mb-1">💡 <strong>질문 의도:</strong> {questions[step].intent}</p>
            <p className="text-sm text-left italic text-gray-200 mb-2">예시: {questions[step].example}</p>
            <textarea
              className="w-full mb-4 text-black p-2 rounded"
              rows={5}
              value={answers[step]}
              onChange={handleChange}
            />
            {step < questions.length - 1 ? (
              <button onClick={handleNext} className="bg-white text-blue-600 px-6 py-2 font-semibold">
                다음 질문
              </button>
            ) : (
              <button onClick={handleSubmit} className="bg-white text-blue-600 px-6 py-2 font-semibold" disabled={loading}>
                {loading ? '분석 중...' : '제출하기'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
