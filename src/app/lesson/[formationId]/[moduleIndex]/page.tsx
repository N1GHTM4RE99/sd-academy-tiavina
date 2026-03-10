'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import TopBar from '@/components/TopBar';
import { getFormationById, serviceColors } from '@/lib/formations';
import { PROFESSOR_SYSTEM_PROMPT, getLessonPrompt } from '@/lib/professor';
import { ChatMessage } from '@/lib/types';

export default function LessonPage() {
  const params = useParams();
  const formationId = params.formationId as string;
  const moduleIndex = parseInt(params.moduleIndex as string);
  const formation = getFormationById(formationId);
  const mod = formation?.modules[moduleIndex];

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lessonStarted, setLessonStarted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Start lesson automatically on load
  useEffect(() => {
    if (formation && module && !lessonStarted) {
      setLessonStarted(true);
      startLesson();
    }
  }, [formation, module]);

  const startLesson = async () => {
    const prompt = getLessonPrompt(formationId, moduleIndex);

    try {
      const response = await fetch('/api/professor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          useWebSearch: true,
          systemPrompt: PROFESSOR_SYSTEM_PROMPT,
        }),
      });

      const data = await response.json();

      const assistantMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.content || 'Désolé, une erreur est survenue. Veuillez réessayer.',
        timestamp: Date.now(),
      };

      setMessages([assistantMessage]);
    } catch (error) {
      console.error('Error starting lesson:', error);
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Désolé, une erreur est survenue. Veuillez réessayer plus tard.',
        timestamp: Date.now(),
      };
      setMessages([errorMessage]);
    } finally {
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/professor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content })),
          useWebSearch: true,
          systemPrompt: PROFESSOR_SYSTEM_PROMPT,
        }),
      });

      const data = await response.json();

      const assistantMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.content || 'Désolé, une erreur est survenue. Veuillez réessayer.',
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Désolé, une erreur est survenue. Veuillez réessayer plus tard.',
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!formation || !mod) {
    return (
      <div className="min-h-screen bg-background">
        <TopBar />
        <main className="pt-24 pb-12 px-4 max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-2xl font-bold font-syne text-white">Module non trouvé</h1>
            <Link href="/" style={{ color: serviceColors[formation?.service || 'social-media-setup'] }}>
              Retour au dashboard
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <TopBar />

      <main className="pt-20 pb-12 px-4 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <Link
                href={`/formation/${formationId}`}
                className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Retour à la formation
              </Link>
              <h1 className="text-2xl font-bold font-syne text-white">
                {mod?.title}
              </h1>
              <p className="text-gray-400">{formation.title}</p>
            </div>

            {/* Professor Badge - API coming soon */}
            {/* <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-card-bg border border-card-border">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1DA1F2] to-[#0088CC] flex items-center justify-center">
                <span className="text-white font-bold">PS</span>
              </div>
              <div>
                <div className="text-sm font-medium text-white">Professeur</div>
                <div className="text-xs text-gray-400">Expert Digital Marketing</div>
              </div>
            </div> */}
          </div>
        </div>

        {/* Chat Container */}
        <div className="card h-[600px] flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-[#1DA1F2] text-white'
                        : 'bg-card-bg border border-card-border text-gray-200'
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#1DA1F2] to-[#0088CC] flex items-center justify-center">
                          <span className="text-[10px] text-white font-bold">PS</span>
                        </div>
                        <span style={{ color: serviceColors[formation.service] }} className="font-medium">Professeur</span>
                      </div>
                    )}
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {(() => {
                        const content = message.content;
                        // If content looks like JSON, try to parse and format it
                        const trimmed = content.trim();
                        if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
                          try {
                            const parsed = JSON.parse(trimmed);
                            // If it's a questions array, format it nicely
                            if (parsed.questions && Array.isArray(parsed.questions)) {
                              return parsed.questions.map((q: Record<string, unknown>) => 
                                `❓ ${String(q.question)}\n${((q.options as string[]) || []).map((o, i) => `   ${String.fromCharCode(65+i)}. ${o}`).join('\n')}\n`
                              ).join('\n');
                            }
                            // For other JSON, return as formatted string
                            return JSON.stringify(parsed, null, 2);
                          } catch {
                            // If parsing fails, return original content
                            return content;
                          }
                        }
                        return content;
                      })()}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-card-bg border border-card-border rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#1DA1F2] to-[#0088CC] flex items-center justify-center">
                      <span className="text-[10px] text-white font-bold">PS</span>
                    </div>
                    <span style={{ color: serviceColors[formation.service] }} className="font-medium">Professeur réfléchit...</span>
                  </div>
                </div>
              </motion.div>
            )} */}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area - Coming soon */}
          {/* <form onSubmit={handleSubmit} className="border-t border-card-border p-4">
            <div className="flex gap-3">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Pose une question au professeur..."
                style={{ borderColor: serviceColors[formation.service] }}
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                style={{ backgroundColor: serviceColors[formation.service] }} className="text-white hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Envoyer
              </button>
            </div>
          </form> */}
          <form onSubmit={handleSubmit} className="border-t border-card-border p-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Posez votre question à Tiavina..."
                    className="flex-1 bg-background border border-card-border rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !inputValue.trim()}
                    className="bg-primary hover:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    {isLoading ? '...' : 'Envoyer'}
                  </button>
                </div>
              </form>
        </div>

        {/* Quiz CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6"
        >
          <div className="card p-6 text-center">
            <h3 className="text-xl font-bold font-syne text-white mb-2">
              Prêt à tester tes connaissances ?
            </h3>
            <p className="text-gray-400 mb-4">
              Passer le quiz pour valider ce module et débloquer le suivant.
            </p>
            <Link
              href={`/quiz/${formationId}/${moduleIndex}`}
              className="btn-primary inline-block"
              style={{
                backgroundColor: serviceColors[formation.service],
                color: serviceColors[formation.service] === '#FF2D78' ? 'white' : 'black',
              }}
            >
              Passer le quiz →
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
