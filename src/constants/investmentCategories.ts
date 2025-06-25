import { Ionicons } from '@expo/vector-icons';

export interface InvestmentCategory {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

export const investmentCategories: InvestmentCategory[] = [
  {
    id: 'mutual_funds',
    name: 'Mutual Funds',
    icon: 'trending-up',
    color: '#4264ED'
  },
  {
    id: 'property',
    name: 'Property',
    icon: 'home',
    color: '#34C759'
  },
  {
    id: 'stocks',
    name: 'Stocks',
    icon: 'stats-chart',
    color: '#FF9500'
  },
  {
    id: 'IPO',
    name: 'IPO',
    icon: 'trending-up',
    color: '#FF9500'
  },
  {
    id: 'crypto',
    name: 'Cryptocurrency',
    icon: 'logo-bitcoin',
    color: '#FF3B30'
  },
  {
    id: 'gold',
    name: 'Gold',
    icon: 'diamond',
    color: '#FFD700'
  }
]; 