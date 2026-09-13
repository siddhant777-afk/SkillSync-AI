import Navbar from "../components/layout/Navbar";

const MainLayout = ({ children }) => (
  <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200 flex flex-col">
    <Navbar />
    <main className="min-w-0 max-w-7xl mx-auto w-full flex-1 px-3 sm:px-6 py-5 overflow-x-hidden">
      {children}
    </main>
  </div>
);

export default MainLayout;
