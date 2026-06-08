import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { useAppStore, DiaryEntry } from '../../store/useAppStore';
import { useThemeStore } from '../../store/themeStore';

export function Diary() {
  const { diaries, saveDiary } = useAppStore();
  const { theme } = useThemeStore();
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [content, setContent] = useState('');

  useEffect(() => {
    const existing = diaries.find((d) => d.date === selectedDate);
    setContent(existing?.content || '');
  }, [selectedDate, diaries]);

  const handleSave = () => {
    if (!content.trim()) return;
    saveDiary({ date: selectedDate, content: content.trim() });
  };

  const diaryEntries = diaries
    .slice()
    .reverse()
    .filter((d) => d.content);

  return (
    <div className="space-y-5">
      {/* Date selector and editor */}
      <div className={`backdrop-blur-md rounded-2xl p-4 sm:p-5 border shadow-xl
        ${theme === 'dark'
          ? 'bg-slate-800/60 border-slate-700/50'
          : 'bg-white/70 border-amber-200/50'
        }
      `}>
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="text-amber-500" size={22} />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className={`flex-1 border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-base
              ${theme === 'dark'
                ? 'bg-slate-700/50 border-slate-600 text-white'
                : 'bg-white border-amber-200 text-amber-900'
              }
            `}
          />
        </div>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="今天发生了什么..."
          rows={7}
          className={`w-full border rounded-xl px-4 py-3 resize-none leading-relaxed text-base focus:outline-none focus:ring-2 focus:ring-amber-500/50
            ${theme === 'dark'
              ? 'bg-slate-700/30 border-slate-600 text-white placeholder-slate-500'
              : 'bg-amber-50/50 border-amber-200 text-amber-900 placeholder-amber-400'
            }
          `}
        />

        <button
          onClick={handleSave}
          disabled={!content.trim()}
          className={`mt-4 w-full font-semibold py-3 rounded-xl transition-colors text-base
            ${!content.trim()
              ? 'bg-slate-400 cursor-not-allowed text-slate-600'
              : 'bg-amber-500 hover:bg-amber-400 text-white'
            }
          `}
        >
          保存日记
        </button>
      </div>

      {/* Diary list */}
      <div className={`backdrop-blur-md rounded-2xl p-4 sm:p-5 border shadow-xl
        ${theme === 'dark'
          ? 'bg-slate-800/60 border-slate-700/50'
          : 'bg-white/70 border-amber-200/50'
        }
      `}>
        <h3 className={`text-lg font-semibold mb-4
          ${theme === 'dark' ? 'text-white' : 'text-amber-900'}
        `}>日记列表</h3>
        {diaryEntries.length === 0 ? (
          <p className={`text-center py-8 text-base
            ${theme === 'dark' ? 'text-slate-500' : 'text-amber-500'}
          `}>暂无日记</p>
        ) : (
          <div className="space-y-3 max-h-72 overflow-y-auto">
            {diaryEntries.map((entry: DiaryEntry) => (
              <div
                key={entry.date}
                onClick={() => setSelectedDate(entry.date)}
                className={`p-4 rounded-xl cursor-pointer transition-colors border
                  ${theme === 'dark'
                    ? 'bg-slate-700/30 hover:bg-slate-700/50 border-slate-700/30'
                    : 'bg-amber-50/50 hover:bg-amber-100 border-amber-100'
                  }
                `}
              >
                <p className="text-xs text-amber-500 font-medium mb-2">
                  {entry.date}
                </p>
                <p className={`text-sm line-clamp-3
                  ${theme === 'dark' ? 'text-slate-300' : 'text-amber-800'}
                `}>
                  {entry.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
