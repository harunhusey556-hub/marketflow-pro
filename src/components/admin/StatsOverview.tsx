import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, Package, FileText, DollarSign } from "lucide-react";

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
      title: "Total Orders",
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: "text-blue-600",
    },
    {
      title: "Active Deliveries",
      value: stats.pendingDeliveries,
      icon: Package,
      color: "text-orange-600",
    },
    {
      title: "Total Invoices",
      value: stats.totalInvoices,
      icon: FileText,
      color: "text-purple-600",
    },
    {
      title: "Total Revenue",
      value: `$${stats.totalRevenue.toFixed(2)}`,
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
