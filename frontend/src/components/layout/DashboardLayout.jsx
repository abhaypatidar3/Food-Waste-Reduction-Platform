import Sidebar from './Sidebar';

const DashboardLayout = ({ children, role = 'ngo' }) => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role={role} />
      <main className="flex-1 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;