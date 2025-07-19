import React from 'react';

interface ResponsiveTableProps {
  children: React.ReactNode;
}

const ResponsiveTable: React.FC<ResponsiveTableProps> = ({ children }) => {
  return (
    <div className="w-full bg-white rounded-lg shadow">
      <div className="max-w-full overflow-x-auto">
        <div className="inline-block min-w-full align-middle">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ResponsiveTable; 