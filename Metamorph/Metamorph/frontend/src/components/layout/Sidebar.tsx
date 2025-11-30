import { LayoutDashboard, Plus, FolderOpen } from 'lucide-react';

type Page = 'dashboard' | 'new-analysis' | 'projects' | 'help';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const navItems = [
  { id: 'dashboard' as Page, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'new-analysis' as Page, label: 'New Analysis', icon: Plus },
  { id: 'projects' as Page, label: 'Past Projects', icon: FolderOpen },
];

export function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-slate-200">
        <div className="bg-emerald-50 rounded-lg p-3">
          <p className="text-xs text-emerald-800 mb-1">AI Model Status</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            <span className="text-xs text-emerald-700">GNN v2.1.0 Active</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
