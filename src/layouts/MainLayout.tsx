import { FC, ReactNode } from 'react';
import Navbar from '../components/Navbar';

interface MainLayoutProps {
  children: ReactNode;
  title?: string;
}

const MainLayout: FC<MainLayoutProps> = ({ children, title }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      {title && (
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          </div>
        </header>
      )}
      <main className="flex-grow">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;