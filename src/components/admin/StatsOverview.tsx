import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, Package, FileText, DollarSign } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getAdminStats } from "@/services/localData";

interface Stats {
  totalOrders: number;
  pendingDeliveries: number;
  totalInvoices: number;
  totalRevenue: number;
}

const StatsOverview = () => {
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0,
    pendingDeliveries: 0,
    totalInvoices: 0,
    totalRevenue: 0,
  });
  const { t } = useTranslation();

  useEffect(() => {
    getAdminStats()
      .then(setStats)
      .catch((error) => console.error("Error fetching stats:", error));
  }, []);

  const statCards = [
    {
      title: t("admin.stats.totalOrders"),
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: "text-blue-600",
    },
    {
      title: t("admin.stats.activeDeliveries"),
      value: stats.pendingDeliveries,
      icon: Package,
      color: "text-orange-600",
    },
    {
      title: t("admin.stats.totalInvoices"),
      value: stats.totalInvoices,
      icon: FileText,
      color: "text-purple-600",
    },
    {
      title: t("admin.stats.totalRevenue"),
      value: `€${stats.totalRevenue.toFixed(2)}`, // Changed to Euro
      icon: DollarSign,
      color: "text-green-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-5 w-5 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StatsOverview;
