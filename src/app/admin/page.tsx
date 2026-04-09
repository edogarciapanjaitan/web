import { getDashboardStatsAction, getDailyShiftReportAction, getTopProductsAction } from "./dashboard-actions";
import DashboardChart from "./dashboard-chart";
import ShiftReportTable from "./shift-report-table";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const sParams = await searchParams;

  // Read URL params for child components
  const chartType = typeof sParams.chart === "string" ? sParams.chart : "transactions";
  
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  
  const selectedMonth = typeof sParams.month === "string" ? parseInt(sParams.month) : currentMonth;
  const selectedYear = typeof sParams.year === "string" ? parseInt(sParams.year) : currentYear;

  const shiftSearch = typeof sParams.shiftSearch === "string" ? sParams.shiftSearch : "";
  const shiftFilter = typeof sParams.shiftFilter === "string" ? sParams.shiftFilter : "all";
  const shiftPage = typeof sParams.shiftPage === "string" ? parseInt(sParams.shiftPage) : 1;

  const statsRes = await getDashboardStatsAction(selectedMonth, selectedYear);
  const dashboardStats = (statsRes.success && statsRes.data) ? statsRes.data : [];

  const topProductsRes = await getTopProductsAction(selectedMonth, selectedYear);
  const topProducts = (topProductsRes.success && topProductsRes.data) ? topProductsRes.data : [];

  const shiftRes = await getDailyShiftReportAction(7);
  const shiftReports = shiftRes.success ? shiftRes.data : [];

  return (
    <div style={{ animation: "fadeInUp 0.5s ease-out" }}>
      <div className="dashboard-greeting">
        <h2>Selamat Datang di Portal Admin ⚙️</h2>
        <p>Gunakan panel di sebelah kiri untuk mengelola aspek krusial sistem kasir.</p>
      </div>

      <DashboardChart 
        data={dashboardStats || []} 
        topProducts={topProducts || []}
        initialChartType={chartType} 
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
      />

      {shiftReports.length > 0 && (
        <div style={{ marginTop: "2rem" }}>
          <ShiftReportTable reports={shiftReports} initialSearch={shiftSearch} initialFilter={shiftFilter} initialPage={shiftPage} />
        </div>
      )}
    </div>
  );
}
