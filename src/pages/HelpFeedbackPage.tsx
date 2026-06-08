import React, { useState } from 'react';
import { MessageSquare, FileText, Send, CheckCircle } from 'lucide-react';
import { SubPageContainer } from '../components/Layout/SubPageContainer';
import { useThemeStore } from '../store/themeStore';

interface HelpFeedbackPageProps {
  onBack: () => void;
}

export function HelpFeedbackPage({ onBack }: HelpFeedbackPageProps) {
  const { theme } = useThemeStore();
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const faqs = [
    {
      question: '如何记录圩日？',
      answer: '打开圩日历页面会自动显示当月的圩日，红色加粗显示。',
    },
    {
      question: '如何同步数据到云端？',
      answer: '在"我的"页面点击"同步数据"，需要先登录账号。',
    },
    {
      question: '如何查看历史收益？',
      answer: '在"收益"页面可以查看每日、每月、每年的收益数据。',
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;
    
    setSubmitted(true);
    setTimeout(() => {
      setFeedback('');
      setSubmitted(false);
    }, 2000);
  };

  return (
    <SubPageContainer title="帮助与反馈" onBack={onBack}>
      <div className="space-y-5">
        <div className={`rounded-2xl p-5 ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} shadow-sm`}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              theme === 'dark' ? 'bg-green-500/20' : 'bg-green-100'
            }`}>
              <FileText size={20} className={theme === 'dark' ? 'text-green-400' : 'text-green-600'} />
            </div>
            <h2 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              常见问题
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className={`p-4 rounded-xl ${
                  theme === 'dark' ? 'bg-slate-700/50' : 'bg-slate-50'
                }`}
              >
                <div className={`font-medium mb-2 ${
                  theme === 'dark' ? 'text-white' : 'text-slate-900'
                }`}>
                  {faq.question}
                </div>
                <div className={`text-sm ${
                  theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  {faq.answer}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={`rounded-2xl p-5 ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} shadow-sm`}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              theme === 'dark' ? 'bg-amber-500/20' : 'bg-amber-100'
            }`}>
              <MessageSquare size={20} className={theme === 'dark' ? 'text-amber-400' : 'text-amber-600'} />
            </div>
            <h2 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              意见反馈
            </h2>
          </div>

          {submitted ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 ${
                theme === 'dark' ? 'bg-green-500/20' : 'bg-green-100'
              }`}>
                <CheckCircle size={32} className={theme === 'dark' ? 'text-green-400' : 'text-green-600'} />
              </div>
              <div className="text-center">
                <div className={`font-semibold text-lg mb-1 ${
                  theme === 'dark' ? 'text-white' : 'text-slate-900'
                }`}>
                  提交成功！
                </div>
                <div className={`text-sm ${
                  theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  感谢您的反馈，我们会尽快处理
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="请描述您遇到的问题或建议..."
                className={`w-full px-4 py-4 rounded-xl border resize-none min-h-[150px transition-all focus:outline-none focus:ring-2 ${
                  theme === 'dark'
                    ? 'bg-slate-700 border-slate-600 text-white focus:border-amber-400 focus:ring-amber-400/30'
                    : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-amber-400 focus:ring-amber-400/30'
                }`}
              />
              <button
                type="submit"
                disabled={!feedback.trim()}
                className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-lg hover:shadow-amber-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              >
                <div className="flex items-center justify-center gap-2">
                  <Send size={18} />
                  提交反馈
                </div>
              </button>
            </form>
          )}
        </div>
      </div>
    </SubPageContainer>
  );
}
