export const mockFoodItems = [
  {
    id: 1,
    name: "Fresh Sandwiches",
    vendor: "Campus Cafe",
    quantity: 5,
    expiryDate: "2024-12-15T18:00:00",
    price: 3.99,
    image: "Food Image Here",
    category: "Ready-to-eat",
    description: "Freshly made sandwiches with assorted fillings"
  },
  {
    id: 2,
    name: "Vegetable Platter",
    vendor: "Green Bites",
    quantity: 8,
    expiryDate: "2024-12-14T20:00:00",
    price: 6.50,
    image: "Food Image Here",
    category: "Vegetarian",
    description: "Assorted fresh vegetables with dip"
  },
  {
    id: 3,
    name: "Fruit Basket",
    vendor: "Fresh Market",
    quantity: 3,
    expiryDate: "2024-12-16T22:00:00",
    price: 4.99,
    image: "Food Image Here",
    category: "Fruits",
    description: "Mixed seasonal fruits"
  },
  {
    id: 4,
    name: "Bakery Items",
    vendor: "Bread Heaven",
    quantity: 12,
    expiryDate: "2024-12-13T19:00:00",
    price: 2.99,
    image: "Food Image Here",
    category: "Bakery",
    description: "Assorted pastries and breads"
  },
  {
    id: 5,
    name: "Pasta Salad",
    vendor: "Italian Delight",
    quantity: 6,
    expiryDate: "2024-12-12T17:00:00",
    price: 5.50,
    image: "Food Image Here",
    category: "Ready-to-eat",
    description: "Cold pasta with vegetables and dressing"
  }
];

export const mockVendors = [
  {
    id: 1,
    name: "Campus Cafe",
    location: "University Campus, Building A",
    rating: 4.5,
    description: "Student-friendly cafe serving fresh sandwiches, salads, and daily specials",
    isVerified: true,
    verificationStatus: 'verified'
  },
  {
    id: 2,
    name: "Green Bites",
    location: "Downtown Main Street", 
    rating: 4.2,
    description: "Healthy and sustainable food options with focus on vegetarian meals",
    isVerified: false,
    verificationStatus: 'pending'
  },
  {
    id: 3,
    name: "Fresh Market",
    location: "Shopping District Mall",
    rating: 4.7,
    description: "Local market offering fresh produce and ready-to-eat meals",
    isVerified: true,
    verificationStatus: 'verified'
  },
  {
    id: 4,
    name: "Bread Heaven", 
    location: "City Center Plaza",
    rating: 4.8,
    description: "Artisan bakery specializing in fresh bread and pastries",
    isVerified: false,
    verificationStatus: 'pending'
  }
];