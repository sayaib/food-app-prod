import React from 'react';
import { motion } from 'framer-motion';

const MenuCardSkeleton = ({ index = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden animate-pulse"
    >
      {/* Image Skeleton */}
      <div className="relative">
        <div className="w-full h-48 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer" />
        
        {/* Top Badges Skeleton */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          <div className="w-16 h-6 bg-gray-300 rounded-full" />
          <div className="w-20 h-6 bg-gray-300 rounded-full" />
        </div>
        
        {/* Actions Menu Skeleton */}
        <div className="absolute top-3 right-3">
          <div className="w-8 h-8 bg-gray-300 rounded-full" />
        </div>
        
        {/* Price Badge Skeleton */}
        <div className="absolute bottom-3 right-3">
          <div className="w-20 h-10 bg-gray-300 rounded-xl" />
        </div>
      </div>
      
      {/* Content Skeleton */}
      <div className="p-5">
        {/* Category Tag Skeleton */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-4 h-4 bg-gray-300 rounded" />
          <div className="w-24 h-6 bg-gray-300 rounded-full" />
        </div>
        
        {/* Title Skeleton */}
        <div className="w-3/4 h-7 bg-gray-300 rounded mb-3" />
        
        {/* Description Skeleton */}
        <div className="space-y-2 mb-4">
          <div className="w-full h-4 bg-gray-300 rounded" />
          <div className="w-2/3 h-4 bg-gray-300 rounded" />
        </div>
        
        {/* Actions Skeleton */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-11 bg-gray-300 rounded-lg" />
            <div className="flex-1 h-11 bg-gray-300 rounded-lg" />
            <div className="w-11 h-11 bg-gray-300 rounded-lg" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MenuCardSkeleton;