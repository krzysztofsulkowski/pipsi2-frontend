import MetabaseReport from "./MetabaseReport"; 

export default function DashboardPage() {
    const MY_DASHBOARD_ID = 2; 

    return (
        <main className="min-h-screen bg-[#272C3C] text-white p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Witaj na Dashboardzie!</h1>
            </div>

            {}
             <div className="rounded-lg overflow-hidden border border-gray-600">
                <MetabaseReport dashboardId={MY_DASHBOARD_ID} />
            </div>
        </main>
    );
}