import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import TopBar from './TopBar';
import Footer from './Footer';

interface LayoutProps {
  children?: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-[100dvh] bg-deep-void">
      <Navbar />
      <TopBar />
      <main className="lg:ml-[240px] pt-14 pb-16 lg:pb-0 min-h-[100dvh] flex flex-col">
        <div className="flex-1 p-4 lg:p-6 max-w-[1400px] mx-auto w-full">
          {children || <Outlet />}
        </div>
        <Footer />
      </main>
    </div>
  );
}
