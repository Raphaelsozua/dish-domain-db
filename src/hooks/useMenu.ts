import { useState, useMemo } from 'react';
import { mockRestaurant, mockCategories, mockProducts, mockReviews } from '@/data/mockData';

// Simplified hooks that return mock data
export const useRestaurantInfo = () => {
  return {
    data: mockRestaurant,
    isLoading: false,
    error: null
  };
};

export const useCategories = () => {
  return {
    data: mockCategories,
    isLoading: false,
    error: null
  };
};

export const useProducts = () => {
  return {
    data: mockProducts,
    isLoading: false,
    error: null
  };
};

export const useReviews = () => {
  return {
    data: mockReviews,
    isLoading: false,
    error: null
  };
};

export const useSubmitReview = () => {
  return {
    mutateAsync: async (reviewData: any) => {
      // Simulate API call
      console.log('Review submitted:', reviewData);
      return { success: true };
    },
    isLoading: false
  };
};