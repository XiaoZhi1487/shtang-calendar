import React, { useState } from 'react';
import { Plus, Trash2, TrendingUp, TrendingDown, Calculator, ShoppingBag } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { useThemeStore } from '../../store/themeStore';

const categories = {
  expense: ['进货', '房租', '水电费', '人工', '包装', '运输', '其他'],
  income: ['水果', '蔬菜', '零食', '维修', '其他'],
};

const subCategories = {
  '水果': ['苹果', '香蕉', '橙子', '葡萄', '西瓜', '草莓', '其他'],
  '蔬菜': ['白菜', '萝卜', '西红柿', '黄瓜', '茄子', '土豆', '其他'],
  '进货': ['水果', '蔬菜', '零食', '其他'],
};

const units = ['斤', '公斤', '个', '箱', '袋'];

export function AccountBook() {
  const { accounts, addAccount, deleteAccount } = useAppStore();
  const { theme } = useThemeStore();
  const [type, setType] = useState<'expense' | 'income'>('income');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('斤');
  const [note, setNote] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const today = new Date().toISOString().split('T')[0];
  const todayAccounts = accounts.filter((a) => a.date === selectedDate);
  const todayIncome = todayAccounts
    .filter((a) => a.type === 'income')
    .reduce((sum, a) => sum + a.amount, 0);
  const todayExpense = todayAccounts
    .filter((a) => a.type === 'expense')
    .reduce((sum, a) => sum + a.amount, 0);
  const todayProfit = todayIncome - todayExpense;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !category) return;

    addAccount({
      type,
      amount: parseFloat(amount),
      category,
      subCategory: subCategory || undefined,
      quantity: quantity ? parseFloat(quantity) : undefined,
      unit: quantity ? unit : undefined,
      note,
      date: selectedDate,
    });

    setAmount('');
    setCategory('');
    setSubCategory('');
    setQuantity('');
    setNote('');
  };

  const quickAdd = (cat: string, subCat: string, price: number) => {
    addAccount({
      type: 'income',
      amount: price,
      category: cat,
      subCategory: subCat,
      date: today,
    });
  };

  return (
    <div className="space-y-5">
      {/* Date Selector */}
      <div className={`backdrop-blur-md rounded-2xl p-4 border shadow-lg
        ${theme === 'dark'
          ? 'bg-slate-800/60 border-slate-700/50'
          : 'bg-white/70 border-amber-200/50'
        }
      `}>
        <label className={`block text-sm mb-2
          ${theme === 'dark' ? 'text-slate-400' : 'text-amber-700'}
        `}>选择日期</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className={`w-full border rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-amber-500/50
            ${theme === 'dark'
              ? 'bg-slate-700/50 border-slate-600 text-white'
              : 'bg-white border-amber-200 text-amber-900'
            }
          `}
        />
        {selectedDate === today && (
          <p className={`text-xs mt-2
            ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}
          `}>✓ 今天</p>
        )}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className={`border rounded-2xl p-4 shadow-lg
          ${theme === 'dark'
            ? 'bg-emerald-500/10 border-emerald-500/20'
            : 'bg-emerald-50 border-emerald-200'
          }
        `}>
          <div className="flex items-center gap-2 text-emerald-500 mb-2">
            <TrendingUp size={18} />
            <span className="text-sm font-medium">收入</span>
          </div>
          <p className="text-xl font-bold text-emerald-500">
            ¥{todayIncome.toFixed(2)}
          </p>
        </div>
        <div className={`border rounded-2xl p-4 shadow-lg
          ${theme === 'dark'
            ? 'bg-rose-500/10 border-rose-500/20'
            : 'bg-rose-50 border-rose-200'
          }
        `}>
          <div className="flex items-center gap-2 text-rose-500 mb-2">
            <TrendingDown size={18} />
            <span className="text-sm font-medium">支出</span>
          </div>
          <p className="text-xl font-bold text-rose-500">
            ¥{todayExpense.toFixed(2)}
          </p>
        </div>
        <div className={`border rounded-2xl p-4 shadow-lg
          ${theme === 'dark'
            ? 'bg-amber-500/10 border-amber-500/20'
            : 'bg-amber-50 border-amber-200'
          }
        `}>
          <div className="flex items-center gap-2 text-amber-500 mb-2">
            <Calculator size={18} />
            <span className="text-sm font-medium">利润</span>
          </div>
          <p className={`text-xl font-bold ${todayProfit >= 0 ? 'text-amber-500' : 'text-rose-500'}`}>
            ¥{todayProfit.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Quick Add (only for today) */}
      {selectedDate === today && (
        <div className={`backdrop-blur-md rounded-2xl p-4 border shadow-lg
          ${theme === 'dark'
            ? 'bg-slate-800/60 border-slate-700/50'
            : 'bg-white/70 border-amber-200/50'
          }
        `}>
          <h3 className={`text-lg font-semibold mb-3
            ${theme === 'dark' ? 'text-white' : 'text-amber-900'}
          `}>快捷记录</h3>
          <div className="grid grid-cols-4 gap-2">
            {[5, 10, 15, 20, 25, 30, 50, 100].map((price) => (
              <button
                key={price}
                type="button"
                onClick={() => quickAdd('水果', '其他', price)}
                className={`py-2 px-3 rounded-xl font-semibold transition-all text-sm
                  ${theme === 'dark'
                    ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                    : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                  }
                `}
              >
                +{price}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Add form */}
      <form
        onSubmit={handleSubmit}
        className={`backdrop-blur-md rounded-2xl p-4 sm:p-5 border space-y-4 shadow-xl
          ${theme === 'dark'
            ? 'bg-slate-800/60 border-slate-700/50'
            : 'bg-white/70 border-amber-200/50'
          }
        `}
      >
        <h3 className={`text-lg font-semibold mb-1
          ${theme === 'dark' ? 'text-white' : 'text-amber-900'}
        `}>添加记录</h3>

        {/* Type toggle */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setType('expense');
              setCategory('');
              setSubCategory('');
            }}
            className={`flex-1 py-2.5 px-4 rounded-xl font-semibold transition-all text-base ${
              type === 'expense'
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                : theme === 'dark'
                ? 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
                : 'bg-amber-100/50 text-amber-700 hover:bg-amber-200'
            }`}
          >
            <TrendingDown size={18} className="inline mr-1" />
            支出
          </button>
          <button
            type="button"
            onClick={() => {
              setType('income');
              setCategory('');
              setSubCategory('');
            }}
            className={`flex-1 py-2.5 px-4 rounded-xl font-semibold transition-all text-base ${
              type === 'income'
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                : theme === 'dark'
                ? 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
                : 'bg-amber-100/50 text-amber-700 hover:bg-amber-200'
            }`}
          >
            <TrendingUp size={18} className="inline mr-1" />
            收入
          </button>
        </div>

        {/* Amount */}
        <div>
          <label className={`block text-sm mb-1.5
            ${theme === 'dark' ? 'text-slate-400' : 'text-amber-700'}
          `}>金额 (元)</label>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className={`w-full border rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-amber-500/50
              ${theme === 'dark'
                ? 'bg-slate-700/50 border-slate-600 text-white placeholder-slate-500'
                : 'bg-white border-amber-200 text-amber-900 placeholder-amber-400'
              }
            `}
          />
        </div>

        {/* Category */}
        <div>
          <label className={`block text-sm mb-1.5
            ${theme === 'dark' ? 'text-slate-400' : 'text-amber-700'}
          `}>分类</label>
          <div className="flex flex-wrap gap-2">
            {categories[type].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setCategory(cat);
                  setSubCategory('');
                }}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  category === cat
                    ? 'bg-amber-500 text-white shadow-md'
                    : theme === 'dark'
                    ? 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
                    : 'bg-amber-100/50 text-amber-700 hover:bg-amber-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Sub Category */}
        {category && subCategories[category as keyof typeof subCategories] && (
          <div>
            <label className={`block text-sm mb-1.5
              ${theme === 'dark' ? 'text-slate-400' : 'text-amber-700'}
            `}>细分</label>
            <div className="flex flex-wrap gap-2">
              {subCategories[category as keyof typeof subCategories].map((subCat) => (
                <button
                  key={subCat}
                  type="button"
                  onClick={() => setSubCategory(subCat)}
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    subCategory === subCat
                      ? 'bg-emerald-500 text-white shadow-md'
                      : theme === 'dark'
                      ? 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
                      : 'bg-emerald-100/50 text-emerald-700 hover:bg-emerald-200'
                  }`}
                >
                  {subCat}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quantity & Unit */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={`block text-sm mb-1.5
              ${theme === 'dark' ? 'text-slate-400' : 'text-amber-700'}
            `}>数量 (可选)</label>
            <input
              type="number"
              step="0.1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="0"
              className={`w-full border rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-amber-500/50
                ${theme === 'dark'
                  ? 'bg-slate-700/50 border-slate-600 text-white placeholder-slate-500'
                  : 'bg-white border-amber-200 text-amber-900 placeholder-amber-400'
                }
              `}
            />
          </div>
          <div>
            <label className={`block text-sm mb-1.5
              ${theme === 'dark' ? 'text-slate-400' : 'text-amber-700'}
            `}>单位</label>
            <div className="flex flex-wrap gap-2">
              {units.map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => setUnit(u)}
                  className={`flex-1 px-2 py-3 rounded-xl text-sm font-medium transition-all ${
                    unit === u
                      ? 'bg-amber-500 text-white shadow-md'
                      : theme === 'dark'
                      ? 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
                      : 'bg-amber-100/50 text-amber-700 hover:bg-amber-200'
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Note */}
        <div>
          <label className={`block text-sm mb-1.5
            ${theme === 'dark' ? 'text-slate-400' : 'text-amber-700'}
          `}>备注</label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="可选"
            className={`w-full border rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-amber-500/50
              ${theme === 'dark'
                ? 'bg-slate-700/50 border-slate-600 text-white placeholder-slate-500'
                : 'bg-white border-amber-200 text-amber-900 placeholder-amber-400'
              }
            `}
          />
        </div>

        <button
          type="submit"
          className="w-full bg-amber-500 hover:bg-amber-400 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 text-base"
        >
          <Plus size={20} />
          添加记录
        </button>
      </form>

      {/* Records list */}
      <div className={`backdrop-blur-md rounded-2xl p-4 sm:p-5 border shadow-xl
        ${theme === 'dark'
          ? 'bg-slate-800/60 border-slate-700/50'
          : 'bg-white/70 border-amber-200/50'
        }
      `}>
        <h3 className={`text-lg font-semibold mb-3 flex items-center gap-2
          ${theme === 'dark' ? 'text-white' : 'text-amber-900'}
        `}>
          <ShoppingBag size={20} />
          今日记录
          {todayAccounts.length > 0 && (
            <span className={`text-sm font-normal
              ${theme === 'dark' ? 'text-slate-400' : 'text-amber-600'}
            `}>({todayAccounts.length}条)</span>
          )}
        </h3>
        {todayAccounts.length === 0 ? (
          <p className={`text-center py-8 text-base
            ${theme === 'dark' ? 'text-slate-500' : 'text-amber-500'}
          `}>暂无记录</p>
        ) : (
          <div className="space-y-2.5 max-h-80 overflow-y-auto">
            {todayAccounts
              .slice()
              .reverse()
              .map((entry) => (
                <div
                  key={entry.id}
                  className={`flex items-center justify-between p-4 rounded-xl border
                    ${theme === 'dark'
                      ? 'bg-slate-700/30 border-slate-700/30'
                      : 'bg-amber-50/50 border-amber-100'
                    }
                  `}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        entry.type === 'income'
                          ? 'bg-emerald-500/20 text-emerald-500'
                          : 'bg-rose-500/20 text-rose-500'
                      }`}
                    >
                      {entry.type === 'income' ? (
                        <TrendingUp size={18} />
                      ) : (
                        <TrendingDown size={18} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className={`font-medium
                          ${theme === 'dark' ? 'text-white' : 'text-amber-900'}
                        `}>
                          {entry.category}
                        </p>
                        {entry.subCategory && (
                          <span className={`text-xs px-2 py-0.5 rounded-full
                            ${theme === 'dark'
                              ? 'bg-slate-600 text-slate-300'
                              : 'bg-amber-200 text-amber-800'
                            }
                          `}>
                            {entry.subCategory}
                          </span>
                        )}
                        {entry.quantity && entry.unit && (
                          <span className={`text-xs
                            ${theme === 'dark' ? 'text-slate-400' : 'text-amber-600'}
                          `}>
                            {entry.quantity}{entry.unit}
                          </span>
                        )}
                      </div>
                      {entry.note && (
                        <p className={`text-xs mt-0.5
                          ${theme === 'dark' ? 'text-slate-500' : 'text-amber-600'}
                        `}>{entry.note}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`font-bold text-base ${
                        entry.type === 'income'
                          ? 'text-emerald-500'
                          : 'text-rose-500'
                      }`}
                    >
                      {entry.type === 'income' ? '+' : '-'}¥
                      {entry.amount.toFixed(2)}
                    </span>
                    <button
                      onClick={() => deleteAccount(entry.id)}
                      className={`p-2 transition-colors
                        ${theme === 'dark'
                          ? 'text-slate-500 hover:text-rose-400'
                          : 'text-amber-500 hover:text-rose-500'
                        }
                      `}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
