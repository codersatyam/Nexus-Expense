export interface Category {
  name: string;
  icon: string;
  color: string;
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
  { name: 'Others', icon: 'ellipsis-horizontal', color: '#F7DC6F' },
]; 

export const categoryTags = {
  Food: ['Swiggy', 'Zomato', "EatClub", "Restaurant", 'Grocery', 'Street Food', 'Others'],
  Groceries: ['Blinkit', 'Zomato', 'InstaMart', 'Others'],
  Transport: ['Ola', 'Uber', 'Metro', 'Bus', 'Train', 'Fuel', 'Others'],
  Entertainment: ['Netflix', 'Amazon Prime', 'Movie Theater', 'Concert', 'Games', 'Others'],
  Utilities: ['Electricity', 'Water', 'Gas', 'Internet', 'Phone Bill', 'Others'],
  Shopping: ['Amazon', 'Flipkart', 'Mall', 'Local Market', 'Online Store', 'Others'],
  Health: ['Pharmacy', 'Doctor', 'Hospital', 'Gym', 'Supplements', 'Tata 1MG', 'Others'],
  Education: ['Books', 'Course', 'Tuition', 'Stationery', 'Online Course', 'Others'],
  Travel: ['Flight', 'Hotel', 'Train', 'Bus', 'Car', 'Metro', 'Others'],
  House: ['Rent', 'Maintenance', 'Repairs', 'Utilities', 'Others'],
  Others: ['Miscellaneous', 'Personal Care', 'Gifts', 'Donations', 'Custom'],
};