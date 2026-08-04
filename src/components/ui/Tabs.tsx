import React from 'react';

export interface TabItem {
  value: string;
  label: string;
  count?: number;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (value: string) => void;
  variant?: 'line' | 'pill';
}

const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange, variant = 'line' }) => {
  if (variant === 'pill') {
    return (
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => onChange(tab.value)}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition ${
              activeTab === tab.value
                ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:border-violet-300 hover:text-violet-600'
            }`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className={`ml-1.5 px-1.5 py-0.5 text-xs rounded-full ${
                activeTab === tab.value ? 'bg-white/20' : 'bg-slate-100 text-slate-500'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>
    );
  }

  // default: line variant
  return (
    <div className="flex gap-4 border-b border-slate-200 w-full overflow-x-auto custom-scrollbar">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={`pb-3 px-1 text-sm font-semibold transition-colors relative whitespace-nowrap ${
            activeTab === tab.value
              ? 'text-violet-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className="ml-1.5 text-xs text-slate-400 font-normal">
              ({tab.count})
            </span>
          )}
          {activeTab === tab.value && (
            <span className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-violet-600 rounded-t-full" />
          )}
        </button>
      ))}
    </div>
  );
};

export { Tabs };
