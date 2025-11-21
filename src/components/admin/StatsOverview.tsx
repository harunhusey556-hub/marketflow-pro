import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, Package, FileText, DollarSign, TrendingUp } from "lucide-react";

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

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [ordersResult, deliveriesResult, invoicesResult] = await Promise.all([
        supabase.from("orders").select("id, total_amount"),
        supabase.from("deliveries").select("id").in("status", ["pending", "assigned", "in_transit"]),
        supabase.from("invoices").select("id, total_amount"),
      ]);

      const totalRevenue = ordersResult.data?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;

      setStats({
        totalOrders: ordersResult.data?.length || 0,
        pendingDeliveries: deliveriesResult.data?.length || 0,
        totalInvoices: invoicesResult.data?.length || 0,
        totalRevenue,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const statCards = [
    {
      title: "Toplam Sipariş",
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: "bg-blue-100 text-blue-600",
      desc: "Tüm zamanlar",
    },
    {
      title: "Aktif Teslimat",
      value: stats.pendingDeliveries,
      icon: Package,
      color: "bg-orange-100 text-orange-600",
      desc: "Dağıtımda veya beklemede",
    },
    {
      title: "Kesilen Faturalar",
      value: stats.totalInvoices,
      icon: FileText,
      color: "bg-purple-100 text-purple-600",
      desc: "Toplam fatura adedi",
    },
    {
      title: "Toplam Ciro",
      value: `₺${stats.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: "bg-green-100 text-green-600",
      desc: "Brüt gelir",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat) => (
        <Card key={stat.title} className="border-none shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-full ${stat.color}`}>
              <stat.icon className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
              {stat.desc}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StatsOverview;
