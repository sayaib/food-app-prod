import React from 'react';
import logoImage from '../../assets/logo.png';

const FoodsyaaLogo = ({ size = 'medium', variant = 'full', className = '' }) => {
  const sizes = {
    small: {
      container: 'h-8',
      logo: 'h-8 w-auto',
      text: 'text-lg',
      subtext: 'text-xs'
    },
    medium: {
      container: 'h-12',
      logo: 'h-12 w-auto',
      text: 'text-2xl',
      subtext: 'text-sm'
    },
    large: {
      container: 'h-16',
      logo: 'h-16 w-auto',
      text: 'text-3xl',
      subtext: 'text-base'
    },
    xlarge: {
      container: 'h-20',
      logo: 'h-20 w-auto',
      text: 'text-4xl',
      subtext: 'text-lg'
    }
  };

  const currentSize = sizes[size];

  const LogoImage = () => (
    <img 
      src={logoImage} 
      alt="Foodsyaa Logo" 
      className={`${currentSize.logo} object-contain`}
    />
  );

  if (variant === 'icon') {
    return (
      <div className={`flex items-center ${className}`}>
        <LogoImage />
      </div>
    );
  }

  if (variant === 'text') {
    return (
      <div className={`flex items-center ${className}`}>
        <div className={`font-bold ${currentSize.text}`}>
          <span className="text-orange-600">Food</span>
          <span className="text-yellow-500">Yaa</span>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <LogoImage />
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <LogoImage />
      {variant === 'full' && (
        <div className="flex flex-col">
          <div className={`font-bold ${currentSize.text} leading-tight`}>
            <span className="text-orange-600">Food</span>
            <span className="text-yellow-500">Yaa</span>
          </div>
          <div className={`${currentSize.subtext} text-gray-600 font-medium tracking-wider uppercase`}>
            Food Delivery
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodsyaaLogo;