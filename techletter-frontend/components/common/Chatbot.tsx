'use client';

import { useEffect, useRef, useState } from 'react';
import api from '@/lib/api';

interface Message {
  role: 'bot' | 'user';
  text: string;
  time: string;
}

const SUGGESTIONS = ['오늘 핫한 뉴스 알려줘', 'AI 트렌드 요약해줘', '내 관심사 뉴스 추천해줘'];

function getNow() {
  return new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'bot',
      text: '안녕하세요. MINIME AI 비서입니다.\n궁금한 IT 뉴스나 트렌드를 물어보세요.',
      time: getNow(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen) window.setTimeout(() => inputRef.current?.focus(), 250);
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setMessages((prev) => [...prev, { role: 'user', text: userMessage, time: getNow() }]);
    setInput('');
    setIsLoading(true);

    try {
      const { data } = await api.post('/chatbot/ask', { message: userMessage });
      setMessages((prev) => [
        ...prev,
        { role: 'bot', text: data.answer ?? data.reply ?? '응답을 받지 못했습니다.', time: getNow() },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'bot', text: '서버와 연결하지 못했습니다. 잠시 후 다시 시도해주세요.', time: getNow() },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const showSuggestions = messages.length === 1 && !isLoading;
  const hasUnread = !isOpen && messages.length > 1;

  return (
    <div className="fixed bottom-[calc(110px+env(safe-area-inset-bottom))] right-6 z-[9999] hidden font-sans sm:block">
      {isOpen && (
        <section className="mb-4 flex h-[540px] w-[356px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-3xl border border-black/10 bg-[#F5F4EF] shadow-2xl">
          <header className="flex items-center justify-between bg-[#1A1916] px-4 py-3 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-sm font-bold">AI</div>
              <div>
                <div className="text-sm font-bold">MINIME AI</div>
                <div className="text-[11px] text-white/50">실시간 뉴스 연동</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-sm transition hover:bg-white/20"
              aria-label="챗봇 닫기"
            >
              X
            </button>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((message, index) => (
              <div key={`${message.time}-${index}`} className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div
                  className={`max-w-[83%] whitespace-pre-wrap break-words px-4 py-2.5 text-sm leading-relaxed ${
                    message.role === 'user'
                      ? 'rounded-[18px_18px_4px_18px] bg-[#1A1916] text-white'
                      : 'rounded-[18px_18px_18px_4px] border border-black/5 bg-white text-[#1A1916]'
                  }`}
                >
                  {message.text}
                </div>
                <span className="mt-1 px-1 text-[10px] text-black/35">{message.time}</span>
              </div>
            ))}
            {isLoading && (
              <div className="inline-flex gap-1 rounded-[18px_18px_18px_4px] border border-black/5 bg-white px-4 py-3">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:120ms]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:240ms]" />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {showSuggestions && (
            <div className="flex flex-wrap gap-2 px-4 pb-3">
              {SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => {
                    setInput(suggestion);
                    inputRef.current?.focus();
                  }}
                  className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs text-gray-700 transition hover:border-black/40"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 border-t border-black/10 bg-[#ECEAE2] px-3 py-3">
            <input
              ref={inputRef}
              className="min-w-0 flex-1 rounded-full border border-black/10 bg-white px-4 py-2.5 text-sm text-[#1A1916] outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
              type="text"
              placeholder="뉴스에 대해 물어보세요"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && handleSend()}
              disabled={isLoading}
            />
            <button
              type="button"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1A1916] text-sm font-bold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              aria-label="메시지 전송"
            >
              -&gt;
            </button>
          </div>
        </section>
      )}

      <button
        type="button"
        className="relative flex h-[60px] w-[60px] flex-col items-center justify-center rounded-[18px] bg-blue-600 text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-700"
        onClick={() => setIsOpen((open) => !open)}
        aria-label={isOpen ? '챗봇 닫기' : '챗봇 열기'}
      >
        <span className="text-base font-bold">{isOpen ? 'X' : 'AI'}</span>
        {!isOpen && <span className="text-[9px] tracking-wider text-white/80">CHAT</span>}
        {hasUnread && <span className="absolute -right-0.5 -top-0.5 h-4 w-4 rounded-full border-2 border-blue-600 bg-red-500" />}
      </button>
    </div>
  );
}
