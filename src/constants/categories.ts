export interface Category {
  name: string;
  icon: string;
  color: string;
}

export interface CategoryTag {
  name: string;
  icon: string;
  color: string;
  tags: string[];
}

export const categories: Category[] = [
  { name: 'Food', icon: 'restaurant', color: '#FF6B6B' },
  {name: 'Groceries', icon: 'cart', color: '#FF6B6B'},
  { name: 'Transport', icon: 'car', color: '#4ECDC4' },
  { name: 'Entertainment', icon: 'film', color: '#45B7D1' },
  { name: 'Utilities', icon: 'flash', color: '#96CEB4' },
  { name: 'Shopping', icon: 'bag', color: '#FFEAA7' },
  { name: 'Health', icon: 'medical', color: '#DDA0DD' },
  { name: 'Education', icon: 'school', color: '#98D8C8' },
  { name: 'Travel', icon: 'airplane', color: '#F7DC6F' },
  { name: 'House', icon: 'home', color: '#F7DC6F' },
  { name: 'Trip', icon: 'mountain', color: '#F7DC6F' },
  { name: 'Others', icon: 'ellipsis-horizontal', color: '#F7DC6F' },
]; 

export const categoryTags: CategoryTag[] = [
  {name: 'Food', icon: 'restaurant', color: '#FF6B6B', tags: ['Swiggy', 'Zomato', "EatClub", "Restaurant", 'Grocery', 'Street Food', 'Others']},
  {name: 'Groceries', icon: 'cart', color: '#FF6B6B', tags: ['Blinkit', 'Zomato', 'InstaMart', 'Others']},
  {name: 'Transport', icon: 'car', color: '#4ECDC4', tags: ['Ola', 'Uber', 'Metro', 'Bus', 'Train', 'Fuel', 'Others']},
  {name: 'Entertainment', icon: 'film', color: '#45B7D1', tags: ['Netflix', 'Amazon Prime', 'Movie Theater', 'Concert', 'Games', 'Others']},
  {name: 'Utilities', icon: 'flash', color: '#96CEB4', tags: ['Electricity', 'Water', 'Gas', 'Internet', 'Phone Bill', 'Others']},
  {name: 'Shopping', icon: 'bag', color: '#FFEAA7', tags: ['Amazon', 'Flipkart', 'Mall', 'Local Market', 'Online Store', 'Others']},
  {name: 'Health', icon: 'medical', color: '#DDA0DD', tags: ['Pharmacy', 'Doctor', 'Hospital', 'Gym', 'Supplements', 'Tata 1MG', 'Others']},
  {name: 'Education', icon: 'school', color: '#98D8C8', tags: ['Books', 'Course', 'Tuition', 'Stationery', 'Online Course', 'Others']},
  {name: 'Travel', icon: 'airplane', color: '#F7DC6F', tags: ['Flight', 'Hotel', 'Train', 'Bus', 'Car', 'Metro', 'Others']},
  {name: 'House', icon: 'home', color: '#F7DC6F', tags: ['Rent', 'Maintenance', 'Repairs', 'Utilities', 'Others']},
  {name: 'Trip', icon: 'mountain', color: '#F7DC6F', tags: ['Solo', 'Group', 'Others']},
  {name: 'Others', icon: 'ellipsis-horizontal', color: '#F7DC6F', tags: ['Miscellaneous', 'Personal Care', 'Gifts', 'Donations', 'Custom']},
];