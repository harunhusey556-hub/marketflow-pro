import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, LogOut, User } from "lucide-react";
import { toast } from "sonner";

interface Order {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  created_at: string;
  delivery_address: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const getProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUserEmail(session.user.email || "");
      fetchOrders(session.user.id);
    };
    getProfile();
  }, [navigate]);

  const fetchOrders = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error("Siparişler yüklenirken hata:", error);
      toast.error("Sipariş geçmişi yüklenemedi.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-500",
      confirmed: "bg-blue-500",
      preparing: "bg-purple-500",
      out_for_delivery: "bg-orange-500",
      delivered: "bg-green-500",
      cancelled: "bg-red-500",
    };
    return colors[status] || "bg-gray-500";
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Yükleniyor...</div>;
  }

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="container px-4 md:px-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Hesabım</h1>
              <p className="text-muted-foreground">{userEmail}</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Çıkış Yap
          </Button>
        </div>

        <h2 className="text-xl font-semibold mb-4">Sipariş Geçmişim</h2>
        
        {orders.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Package className="h-12 w-12 mb-4 opacity-50" />
              <p>Henüz hiç siparişiniz bulunmuyor.</p>
              <Button variant="link" onClick={() => navigate("/")} className="mt-2">
                Alışverişe Başla
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-base font-medium">
                      #{order.order_number}
                    </CardTitle>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status === 'pending' ? 'Beklemede' : 
                       order.status === 'confirmed' ? 'Onaylandı' :
                       order.status === 'delivered' ? 'Teslim Edildi' : order.status}
                    </Badge>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString("tr-TR")}
                  </span>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Teslimat Adresi: {order.delivery_address}</span>
                    <span className="font-bold text-lg text-primary">
                      ₺{order.total_amount.toFixed(2)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;