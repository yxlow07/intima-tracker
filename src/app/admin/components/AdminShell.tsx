import AdminNavbar from "./AdminNavbar";

export default function AdminShell({ children, isAuthenticated }: { children: React.ReactNode, isAuthenticated: boolean }) {
    return (
        <div className="=min-h-[80vh] bg-slate-50">
            <AdminNavbar isAuthenticated={isAuthenticated} />
            
            {/* Page content */}
            <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
                {children}
            </main>
        </div>
    );
}
