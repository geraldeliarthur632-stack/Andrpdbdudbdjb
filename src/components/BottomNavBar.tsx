import React from 'react';
import { Home, Compass, BarChart2, User } from 'lucide-react';
import { soundEffects } from '../services/soundEffects';

export type MainTab = 'home' | 'explore' | 'progress' | 'profile';

interface BottomNavBarProps {
  activeTab: MainTab;
  onChangeTab: (tab: MainTab) => void;
  unreadCount?: number;
  theme?: 'light' | 'dark';
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onChangeTab,
  theme = 'light',
}) => {
  const isLight = theme === 'light';
  const tabs = [
    {
      id: 'home' as MainTab,
      label: 'Início',
      icon: Home,
    },
    {
      id: 'explore' as MainTab,
      label: 'Explorar',
      icon: Compass,
    },
    {
      id: 'progress' as MainTab,
      label: 'Progresso',
      icon: BarChart2,
    },
    {
      id: 'profile' as MainTab,
      label: 'Perfil',
      icon: User,
    },
  ];

  return (
    <nav
      id="bottom-nav-bar"
      className="sticky bottom-0 left-0 right-0 z-40 bg-white/95 border-t border-slate-200 text-slate-700 shadow-lg backdrop-blur-lg px-4 py-2 w-full mt-auto shrink-0 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
      role="navigation"
      aria-label="Navegação Principal"
    >
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => {
                soundEffects.playClick();
                onChangeTab(tab.id);
              }}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 relative group cursor-pointer ${
                isActive
                  ? isLight
                    ? 'text-indigo-600 scale-105 font-bold'
                    : 'text-[#8b5cf6] scale-105'
                  : isLight
                  ? 'text-slate-500 hover:text-slate-900'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-all duration-200 ${
                    isActive
                      ? isLight
                        ? 'stroke-[2.5] text-indigo-600 drop-shadow-[0_0_8px_rgba(99,102,241,0.3)]'
                        : 'stroke-[2.5] text-[#8b5cf6] drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]'
                      : 'stroke-[1.8] group-hover:scale-110'
                  }`}
                />
                {isActive && (
                  <span
                    className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${
                      isLight
                        ? 'bg-indigo-600 shadow-[0_0_6px_#6366f1]'
                        : 'bg-[#8b5cf6] shadow-[0_0_6px_#8b5cf6]'
                    }`}
                  />
                )}
              </div>
              <span
                className={`text-[11px] mt-1 font-semibold tracking-tight transition-all duration-200 ${
                  isActive
                    ? isLight
                      ? 'text-indigo-600 font-black'
                      : 'text-[#8b5cf6] font-bold'
                    : isLight
                    ? 'text-slate-500 group-hover:text-slate-800'
                    : 'text-slate-400 group-hover:text-slate-300'
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
