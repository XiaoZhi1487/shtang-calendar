import React, { useState } from 'react';
import { MessageSquare, FileText, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { SubPageContainer } from '../components/Layout/SubPageContainer';
import { useThemeStore } from '../store/themeStore';
import { useUserStore } from '../store/userStore';
import { API_BASE } from '../config/api';

interface HelpFeedbackPageProps {
  onBack: () => void;
}

export function HelpFeedbackPage({ onBack }: HelpFeedbackPageProps) {
  const { theme } = useThemeStore();
  const { token } = useUserStore();
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const faqs = [
    {
      question: '什么是圩日？怎么看圩日？',
      answer: '圩日就是当地集市赶集的日子。在"圩日历"页面会自动显示当月每天的圩日情况，红色日期就是圩日。可以提前规划好进货和摆摊的时间。',
    },
    {
      question: '记账怎么用？为什么要记账？',
      answer: '在"记账"页面可以添加收入和支出。比如卖了多少斤水果、进货花了多少钱、摊位费多少。坚持记账可以清楚看到每天、每月的盈亏，帮你更好地规划生意。',
    },
    {
      question: '登录和不登录有什么区别？',
      answer: '不登录时，数据保存在你的手机上，换手机或清除浏览器数据后就没了。登录账号后，数据保存在云端，换手机、换设备都能找回，也不会丢失。',
    },
    {
      question: '怎么登录账号？',
      answer: '点击底部"我的" → 点击"登录/注册" → 输入手机号和密码（6位以上）。第一次使用会自动注册，再次使用同样的手机号密码登录即可。',
    },
    {
      question: '忘记密码怎么办？',
      answer: '目前请通过下方"意见反馈"提交您的手机号，我们会帮您重置。后续会增加短信找回密码功能。',
    },
    {
      question: '收益页面的数字对不上？',
      answer: '请检查记账日期是否正确。收益统计是按"记录日期"分组统计的，如果你把昨天的账记成今天的日期，就会算在今天里。可以在记账页面按日期筛选查看明细。',
    },
    {
      question: '数据会泄露吗？安全吗？',
      answer: '你的记账数据只保存在 MySQL 数据库中，只有你自己登录后才能看到。密码使用 bcrypt 加密存储，我们也看不到原始密码。',
    },
    {
      question: '可以在电脑上使用吗？',
      answer: '可以。在电脑浏览器打开同样的网址，登录你的账号后就能看到和手机端一样的数据。',
    },
    {
      question: '添加的记录可以删除吗？',
      answer: '可以。在记账页面找到要删除的记录，点击右侧删除图标即可确认删除。已登录用户会同步从云端删除。',
    },
    {
      question: '为什么有些日子收益显示为0？',
      answer: '说明那一天你没有添加任何记账记录。如果当天确实有生意，请补一条记录就会自动更新统计。',
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim() || submitting) return;

    setSubmitting(true);
    setError('');

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch(`${API_BASE}/feedback`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ content: feedback }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '提交失败，请稍后重试');
      }

      setSubmitted(true);
      setTimeout(() => {
        setFeedback('');
        setSubmitted(false);
      }, 3000);
    } catch (err: any) {
      setError(err.message || '提交失败');
    } finally {
      setSubmitting(false);
    }
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
                <div className={`text-sm leading-relaxed ${
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
                placeholder="遇到了什么问题？有什么建议？欢迎留言告诉我们..."
                className={`w-full px-4 py-4 rounded-xl border resize-none min-h-[150px transition-all focus:outline-none focus:ring-2 ${
                  theme === 'dark'
                    ? 'bg-slate-700 border-slate-600 text-white focus:border-amber-400 focus:ring-amber-400/30'
                    : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-amber-400 focus:ring-amber-400/30'
                }`}
                disabled={submitting}
              />
              <div className={`text-sm ${
                theme === 'dark' ? 'text-slate-500' : 'text-slate-400'
              }`}>
                {feedback.length}/2000 字
              </div>
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 text-red-700 text-sm">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={!feedback.trim() || submitting}
                className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-lg hover:shadow-amber-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              >
                <div className="flex items-center justify-center gap-2">
                  <Send size={18} />
                  {submitting ? '提交中...' : '提交反馈'}
                </div>
              </button>
              <div className={`text-xs text-center ${
                theme === 'dark' ? 'text-slate-500' : 'text-slate-400'
              }`}>
                登录后提交会带上您的账号信息，方便我们回访
              </div>
            </form>
          )}
        </div>
      </div>
    </SubPageContainer>
  );
}
