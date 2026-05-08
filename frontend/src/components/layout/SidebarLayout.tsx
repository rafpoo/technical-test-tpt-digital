import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function SidebarLayout() {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-950 md:flex">
      <Sidebar />
      <main className="min-h-screen flex-1">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
