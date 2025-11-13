import React from 'react';

const CardGrid = ({ 
  children, 
  title, 
  subtitle, 
  className = '', 
  containerClass = '',
  showViewAll = false,
  viewAllLink = '/shop'
}) => {
  return (
    <section className={`py-8 sm:py-12 bg-white ${containerClass}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 sm:mb-12">
          <div className="text-center sm:text-left">
            {title && <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{title}</h2>}
            {subtitle && <p className="text-gray-600 max-w-2xl">{subtitle}</p>}
          </div>
          {showViewAll && (
            <div className="mt-4 sm:mt-0">
              <a 
                href={viewAllLink} 
                className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-800"
              >
                View all
                <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          )}
        </div>

        <div className="relative">
          {/* Mobile horizontal scroll container */}
          <div className="md:hidden pb-4 -mx-4 px-4 overflow-x-auto">
            <div className="flex space-x-4 w-max">
              {React.Children.map(children, (child, index) => (
                <div key={index} className="w-48 flex-shrink-0">
                  {child}
                </div>
              ))}
            </div>
          </div>
          
          {/* Desktop grid */}
          <div className={`hidden md:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 ${className}`}>
            {children}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CardGrid;
