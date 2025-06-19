export interface Category {
  name: string;
  icon: string;
  color: string;
}

export const categories: Category[] = [
  { name: 'Food', icon: 'restaurant', color: '#FF6B6B' },
  { name: 'Transport', icon: 'car', color: '#4ECDC4' },
  { name: 'Entertainment', icon: 'film', color: '#45B7D1' },
  { name: 'Utilities', icon: 'flash', color: '#96CEB4' },
  { name: 'Shopping', icon: 'bag', color: '#FFEAA7' },
  { name: 'Health', icon: 'medical', color: '#DDA0DD' },
  { name: 'Education', icon: 'school', color: '#98D8C8' },
  { name: 'Others', icon: 'ellipsis-horizontal', color: '#F7DC6F' },
]; 