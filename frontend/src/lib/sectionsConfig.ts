import { Zap, Palette, BarChart3, Clock, Layers, AlertCircle, Globe } from 'lucide-react';

export interface SectionConfig {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const SECTIONS: SectionConfig[] = [
  { id: 'overview', label: 'Overview', icon: Zap },
  { id: 'accent', label: 'Accent Color', icon: Palette },
  { id: 'custom-domains', label: 'Custom Domains', icon: Globe },
  { id: 'activity', label: 'Activity', icon: BarChart3 },
  { id: 'uptime', label: 'Uptime', icon: Clock },
  { id: 'versions', label: 'Versions', icon: Layers },
  { id: 'actions', label: 'Danger Zone', icon: AlertCircle },
];
