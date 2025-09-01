import React from 'react';
import { motion } from 'framer-motion';

const MenuStatsSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
      {/* Main Stats Skeleton */}
      {[...Array(4)].map((_, index) => (
        <motion.div
          key={`stat-${index}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.6, ease: "easeOut" }}
          className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 animate-pulse"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-gray-300 rounded-2xl" />
            <div className="flex-1">
              <div className="w-24 h-5 bg-gray-300 rounded mb-2" />
              <div className="w-32 h-4 bg-gray-200 rounded" />
            </div>
          </div>
          <div className="w-16 h-10 bg-gray-300 rounded" />
        </motion.div>
      ))}
      
      {/* Food Type Distribution Skeleton */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
        className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 animate-pulse md:col-span-2 lg:col-span-1"
      >
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-gray-300 rounded-2xl" />
          <div className="flex-1">
            <div className="w-40 h-6 bg-gray-300 rounded mb-2" />
            <div className="w-48 h-4 bg-gray-200 rounded" />
          </div>
        </div>
        
        <div className="space-y-6">
          {[...Array(2)].map((_, index) => (
            <div key={`food-type-${index}`} className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-gray-300 rounded" />
                  <div className="w-20 h-5 bg-gray-300 rounded" />
                </div>
                <div className="w-12 h-5 bg-gray-300 rounded" />
              </div>
              <div className="w-full h-3 bg-gray-200 rounded-full" />
            </div>
          ))}
        </div>
      </motion.div>
      
      {/* Price Analysis Skeleton */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6, ease: "easeOut" }}
        className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 animate-pulse md:col-span-2 lg:col-span-1"
      >
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-gray-300 rounded-2xl" />
          <div className="flex-1">
            <div className="w-32 h-6 bg-gray-300 rounded mb-2" />
            <div className="w-40 h-4 bg-gray-200 rounded" />
          </div>
        </div>
        
        <div className="space-y-6">
          {[...Array(3)].map((_, index) => (
            <div key={`price-${index}`} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
              <div className="w-24 h-5 bg-gray-300 rounded" />
              <div className="w-16 h-6 bg-gray-300 rounded" />
            </div>
          ))}
        </div>
      </motion.div>
      
      {/* Top Categories Skeleton */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6, ease: "easeOut" }}
        className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 animate-pulse md:col-span-2 lg:col-span-1"
      >
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-gray-300 rounded-2xl" />
          <div className="flex-1">
            <div className="w-32 h-6 bg-gray-300 rounded mb-2" />
            <div className="w-44 h-4 bg-gray-200 rounded" />
          </div>
        </div>
        
        <div className="space-y-4">
          {[...Array(4)].map((_, index) => (
            <div key={`category-${index}`} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-300 rounded-lg" />
                <div className="w-20 h-5 bg-gray-300 rounded" />
              </div>
              <div className="w-8 h-5 bg-gray-300 rounded" />
            </div>
          ))}
        </div>
      </motion.div>
      
      {/* Availability Status Skeleton */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.6, ease: "easeOut" }}
        className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 animate-pulse md:col-span-2"
      >
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-gray-300 rounded-2xl" />
          <div className="flex-1">
            <div className="w-36 h-6 bg-gray-300 rounded mb-2" />
            <div className="w-48 h-4 bg-gray-200 rounded" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {[...Array(2)].map((_, index) => (
            <div key={`availability-${index}`} className="text-center p-8 bg-gray-50 rounded-3xl">
              <div className="w-20 h-20 bg-gray-300 rounded-2xl mx-auto mb-4" />
              <div className="w-12 h-10 bg-gray-300 rounded mx-auto mb-2" />
              <div className="w-24 h-6 bg-gray-300 rounded mx-auto mb-2" />
              <div className="w-20 h-8 bg-gray-300 rounded-full mx-auto" />
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default MenuStatsSkeleton;