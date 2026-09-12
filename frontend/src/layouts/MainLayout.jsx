import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";

const MainLayout = ({ children }) => (
  <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
    <div className="flex min-h-screen w-full max-w-full overflow-x-hidden">
      <Sidebar />
      <div className="flex min-w-0 max-w-full flex-1 flex-col overflow-x-hidden">
        <div className="px-4 pt-4 sm:px-6 sm:pt-6">
          <Navbar />
        </div>
        <main className="min-w-0 max-w-full flex-1 px-4 pb-8 pt-5 sm:px-6 sm:pt-6 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  </div>
);

export default MainLayout;
