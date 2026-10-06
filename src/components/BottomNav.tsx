import React from 'react';
import { Home, Compass, BarChart2, User } from 'lucide-react';
import { soundEffects } from '../services/soundEffects';

export type MainTab = 'inicio' | 'explorar' | 'progresso' | 'perfil';

interface BottomNavProps {
  activeTab: MainTab;
  onChangeTab: (tab: MainTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onChangeTab }) => {
  const tabs = [
    {
      id: 'inicio' as MainTab,
      label: 'Início',
      icon: Home,
    },
    {
      id: 'explorar' as MainTab,
      label: 'Explorar',
      icon: Compass,
    },
    {
      id: 'progresso' as MainTab,
      label: 'Progresso',
      icon: BarChart2,
    },
    {
      id: 'perfil' as MainTab,
      label: 'Perfil',
      icon: User,
    },
  ];

  return (
    <nav
      className="sticky bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200 px-4 py-2 shrink-0 select-none text-slate-700 shadow-sm"
      aria-label="Navegação Principal"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto w-full">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                soundEffects.playClick();
                onChangeTab(tab.id);
              }}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 relative group active:scale-95 cursor-pointer ${
                isActive
                  ? 'text-indigo-600 font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {/* Active Indicator Glow Pill */}
              {isActive && (
                <span className="absolute -top-1 w-6 h-1 rounded-full bg-[#8b5cf6] shadow-[0_0_10px_#8b5cf6]" />
              )}

              <div
                className={`p-1.5 rounded-xl transition-all ${
                  isActive
                    ? 'bg-[#8b5cf6]/15 shadow-xs'
                    : 'group-hover:bg-[#161f38]/60'
                }`}
              >
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'scale-110 stroke-[2.5]' : 'stroke-2'
                  }`}
                />
              </div>

              <span
                className={`text-[11px] font-semibold tracking-tight transition-colors ${
                  isActive ? 'font-bold text-white' : 'text-slate-400'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
