import { useState } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
import DashboardStats from './DashboardStats';
import MaintenanceTrends from './MaintenanceTrends';
import PropertyDistribution from './PropertyDistribution';
import ExpenseCategories from './ExpenseCategories';
import QuickLinks from './QuickLinks';
import AIChat from '../ai/AIChat';

type WidgetConfig = {
  [key: string]: {
    title: string;
    component: React.ComponentType<any>;
    defaultWidth: string;
  }
};

const AVAILABLE_WIDGETS: WidgetConfig = {
  stats: {
    title: 'Statistics',
    component: DashboardStats,
    defaultWidth: 'col-span-full',
  },
  maintenance: {
    title: 'Maintenance Trends',
    component: MaintenanceTrends,
    defaultWidth: 'col-span-1 lg:col-span-2',
  },
  properties: {
    title: 'Property Distribution',
    component: PropertyDistribution,
    defaultWidth: 'col-span-1 lg:col-span-2',
  },
  expenses: {
    title: 'Expense Categories',
    component: ExpenseCategories,
    defaultWidth: 'col-span-1 lg:col-span-2',
  },
  quickLinks: {
    title: 'Quick Links',
    component: QuickLinks,
    defaultWidth: 'col-span-1',
  },
  aiChat: {
    title: 'AI Assistant',
    component: AIChat,
    defaultWidth: 'col-span-1 lg:col-span-2',
  },
};

export default function DashboardGrid() {
  const [activeWidgets, setActiveWidgets] = useLocalStorage<string[]>('dashboard-widgets', [
    'stats',
    'maintenance',
    'properties',
    'expenses',
  ]);

  const [showWidgetPicker, setShowWidgetPicker] = useState(false);

  const addWidget = (widgetId: string) => {
    if (!activeWidgets.includes(widgetId)) {
      setActiveWidgets([...activeWidgets, widgetId]);
    }
    setShowWidgetPicker(false);
  };

  const removeWidget = (widgetId: string) => {
    setActiveWidgets(activeWidgets.filter(id => id !== widgetId));
  };

  return (
    <div className="space-y-4">
      {showWidgetPicker && (
        <Card className="glass p-4 mb-6 border-white/[0.05]">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {Object.entries(AVAILABLE_WIDGETS).map(([id, widget]) => (
              <Button
                key={id}
                variant="outline"
                className="justify-start bg-white/[0.03] backdrop-blur-xl border-white/[0.05]"
                disabled={activeWidgets.includes(id)}
                onClick={() => addWidget(id)}
              >
                <Plus className="h-4 w-4 mr-2" />
                {widget.title}
              </Button>
            ))}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {activeWidgets.map((widgetId) => {
          const widget = AVAILABLE_WIDGETS[widgetId];
          if (!widget || !widgetId) return null;

          const WidgetComponent = widget.component;
          
          return (
            <div key={widgetId} className={widget.defaultWidth}>
              <Card className="glass relative h-full card-gradient border-white/[0.05]">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2 z-10 hover:bg-white/10"
                  onClick={() => removeWidget(widgetId)}
                >
                  <X className="h-4 w-4" />
                </Button>
                <div className="p-6">
                  <WidgetComponent />
                </div>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}