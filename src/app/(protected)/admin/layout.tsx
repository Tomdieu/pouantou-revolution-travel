import { ReactNode } from 'react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';

// Ensure the page is only accessible to admins (This check logic might be in a middleware or page level wrapper, 
// strictly layout is for structure. Assuming middleware handles auth redirection)

export default function AdminLayout({ children }: { children: ReactNode }) {
    return (
        <div className="h-screen flex-1 bg-slate-50 flex overflow-hidden">
            {/* Sidebar */}
            <AdminSidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex relative flex-col min-w-0 transition-all duration-300 lg:ml-0">
                <AdminHeader />

                <main className="flex-1 p-6 overflow-y-auto">
                    <div className="max-w-7xl mx-auto space-y-6">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
