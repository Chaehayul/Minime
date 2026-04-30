'use client';

import { useState, useRef, useEffect } from 'react';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: '안녕하세요! TechLetter AI 비서입니다. 궁금한 IT 뉴스를 물어보세요!' }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 메시지가 추가될 때마다 맨 아래로 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage = input;
    // 유저 메시지 화면에 추가
    setMessages((prev) => [...prev, { role: 'user', text: userMessage }]);
    setInput('');

    // 로딩 중 표시 (진짜 AI가 생각할 시간이 필요하니까요!)
    setMessages((prev) => [...prev, { role: 'bot', text: '타이핑 중...' }]);

    try {
      // 🚀 백엔드 API 호출! (http://localhost:3000 부분은 본인 백엔드 포트에 맞게 확인해주세요)
      const response = await fetch('http://localhost:3000/chatbot/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await response.json();

      // '타이핑 중...' 메시지를 지우고 진짜 AI 답변으로 교체
      setMessages((prev) => {
        const newMessages = [...prev];
        newMessages.pop(); 
        return [...newMessages, { role: 'bot', text: data.reply }];
      });
    } catch (error) {
      setMessages((prev) => {
        const newMessages = [...prev];
        newMessages.pop();
        return [...newMessages, { role: 'bot', text: '앗, 백엔드 서버와 연결할 수 없어요! 백엔드가 켜져 있는지 확인해 주세요 😭' }];
      });
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* 챗봇 창 (isOpen이 true일 때만 보임) */}
      {isOpen && (
        <div className="mb-4 w-80 sm:w-96 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 transition-all duration-300 transform origin-bottom-right">
          {/* 헤더: 글자색을 text-white에서 text-gray-900으로 변경 */}
          <div className="bg-blue-600 p-4 font-bold flex justify-between items-center shadow-md z-10 text-gray-900">
            <span className="flex items-center gap-2">🤖 TechLetter AI 비서</span>
            <button onClick={() => setIsOpen(false)} className="hover:text-gray-800">✕</button>
          </div>
          
          {/* 대화창 */}
          <div className="flex-1 p-4 overflow-y-auto bg-slate-50 flex flex-col gap-3">
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                // 유저 메시지 버블: bg-blue-500 위의 글자색을 text-white에서 text-gray-900으로 변경
                className={`max-w-[80%] p-3 rounded-2xl text-sm shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-blue-500 self-end rounded-br-sm text-gray-900' 
                    : 'bg-white border border-gray-100 text-gray-800 self-start rounded-bl-sm'
                }`}
              >
                {msg.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* 입력창 */}
          <div className="p-3 bg-white border-t border-gray-200 flex gap-2 items-center">
            <input
              type="text"
              className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow text-gray-900"
              placeholder="뉴스에 대해 물어보세요..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            {/* 전송 버튼: 화살표 색상을 text-white에서 text-gray-900으로 변경 */}
            <button 
              onClick={handleSend}
              className="bg-blue-600 w-10 h-10 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors shadow-md text-gray-900"
            >
              ➤
            </button>
          </div>
        </div>
      )}

      {/* 동그란 플로팅 열기 버튼: 아이콘 색상을 text-white에서 text-gray-900으로 변경 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 bg-blue-600 rounded-full shadow-xl flex items-center justify-center text-2xl hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 ${isOpen ? 'rotate-90 opacity-0 pointer-events-none' : 'rotate-0 opacity-100'} text-gray-900`}
      >
        💬
      </button>
    </div>
  );
}