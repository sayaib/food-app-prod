import React from 'react';
import { motion } from 'framer-motion';

const MenuFormSkeleton = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="bg-white p-8 animate-pulse"
    >
      {/* Header Skeleton */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-gray-300 rounded-2xl" />
        <div className="flex-1">
          <div className="w-32 h-7 bg-gray-300 rounded mb-2" />
          <div className="w-48 h-4 bg-gray-200 rounded" />
        </div>
      </div>
      
      {/* Form Fields Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Item Name */}
          <div className="space-y-2">
            <div className="w-20 h-5 bg-gray-300 rounded" />
            <div className="w-full h-12 bg-gray-200 rounded-lg" />
          </div>
          
          {/* Description */}
          <div className="space-y-2">
            <div className="w-24 h-5 bg-gray-300 rounded" />
            <div className="w-full h-24 bg-gray-200 rounded-lg" />
          </div>
          
          {/* Price */}
          <div className="space-y-2">
            <div className="w-16 h-5 bg-gray-300 rounded" />
            <div className="w-full h-12 bg-gray-200 rounded-lg" />
          </div>
        </div>
        
        {/* Right Column */}
        <div className="space-y-6">
          {/* Image Upload */}
          <div className="space-y-2">
            <div className="w-20 h-5 bg-gray-300 rounded" />
            <div className="w-full h-48 bg-gray-200 rounded-lg border-2 border-dashed border-gray-300" />
          </div>
          
          {/* Category */}
          <div className="space-y-2">
            <div className="w-20 h-5 bg-gray-300 rounded" />
            <div className="flex gap-3">
              <div className="flex-1 h-12 bg-gray-200 rounded-lg" />
              <div className="w-24 h-12 bg-gray-200 rounded-lg" />
            </div>
          </div>
          
          {/* Food Type */}
          <div className="space-y-2">
            <div className="w-24 h-5 bg-gray-300 rounded" />
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-300 rounded-full" />
                <div className="w-8 h-4 bg-gray-300 rounded" />
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-300 rounded-full" />
                <div className="w-16 h-4 bg-gray-300 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Action Buttons Skeleton */}
      <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-gray-200">
        <div className="flex-1 h-12 bg-gray-300 rounded-lg" />
        <div className="flex-1 sm:flex-none w-full sm:w-32 h-12 bg-gray-200 rounded-lg" />
      </div>
    </motion.div>
  );
};

export default MenuFormSkeleton;