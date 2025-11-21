import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Eye, Clock, MapPin, ShoppingBag, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface Order {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  delivery_address: string;
  delivery_city: string;
  delivery_postal_code: string;
  notes?: string;
  created_at: string;
  user_id?: string;
  profiles: { full_name: string; email: string; phone: string } | null;
}

interface OrderItem {
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  product_category: string;
}

const OrdersManagement = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [itemsLoading, setItemsLoading] = useState(false);

  useEffect(() => {
    fetchOrders();

    const channel = supabase
      .channel('orders-admin')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchOrders();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const ordersWithProfiles = await Promise.all(
        (data || []).map(async (order) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, email, phone")
            .eq("id", order.user_id)
            .maybeSingle();

          return {
            ...order,
            profiles: profile || null,
          };
        })
      );

      setOrders(ordersWithProfiles);
    } catch (error) {
      console.error("Siparişler yüklenemedi:", error);
      toast.error("Sipariş listesi yüklenirken hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus as any })
        .eq("id", orderId);

      if (error) throw error;
      toast.success("Sipariş durumu güncellendi");

      // Eğer teslim edildi olarak işaretlenirse teslimat tarihini de güncelle
      if (newStatus === 'delivered') {
        await supabase
          .from('deliveries')
          .update({ status: 'delivered', actual_delivery: new Date().toISOString() })
          .eq('order_id', orderId);
      }

    } catch (error) {
      console.error(error);
      toast.error("Güncelleme başarısız oldu");
    }
  };

  const viewOrderDetails = async (order: Order) => {
    setSelectedOrder(order);
    setIsDialogOpen(true);
    setItemsLoading(true);

    try {
      const { data, error } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", order.id);

      if (error) throw error;
      setOrderItems(data || []);
    } catch (error) {
      toast.error("Ürün detayları yüklenemedi");
    } finally {
      setItemsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-500 hover:bg-yellow-600 text-yellow-950",
      confirmed: "bg-blue-500 hover:bg-blue-600",
      preparing: "bg-purple-500 hover:bg-purple-600",
      out_for_delivery: "bg-orange-500 hover:bg-orange-600",
      delivered: "bg-green-500 hover:bg-green-600",
      cancelled: "bg-red-500 hover:bg-red-600",
    };
    return colors[status] || "bg-gray-500";
  };

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <>
      <Card className="border-none shadow-none bg-transparent">
        <CardHeader className="px-0">
          <CardTitle className="text-2xl">Sipariş Yönetimi</CardTitle>
          <CardDescription>Gelen siparişleri takip edin ve durumlarını güncelleyin.</CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-card border rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <div className="flex flex-col lg:flex-row justify-between gap-6">
                  <div className="flex-1 space-y-4">
                    {/* Üst Satır: Sipariş No ve Durum */}
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-mono font-bold text-lg bg-muted px-2 py-1 rounded">
                        {order.order_number}
                      </span>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status.replace(/_/g, " ").toUpperCase()}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center ml-auto lg:ml-0">
                        <Clock className="w-3 h-3 mr-1" />
                        {new Date(order.created_at).toLocaleString("tr-TR")}
                      </span>
                    </div>

                    {/* Bilgi Izgarası */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-1">
                        <p className="text-muted-foreground font-medium flex items-center">
                          <ShoppingBag className="w-3.5 h-3.5 mr-1.5" /> Müşteri
                        </p>
                        <p className="font-semibold">{order.profiles?.full_name || "Misafir"}</p>
                        <p className="text-xs text-muted-foreground">{order.profiles?.email}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-muted-foreground font-medium flex items-center">
                          <MapPin className="w-3.5 h-3.5 mr-1.5" /> Teslimat
                        </p>
                        <p>{order.delivery_address}</p>
                        <p className="text-xs text-muted-foreground">
                          {order.delivery_city}, {order.delivery_postal_code}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Sağ Taraf: Aksiyonlar ve Toplam */}
                  <div className="flex flex-col justify-between items-end gap-4 lg:border-l lg:pl-6 min-w-[200px]">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Toplam Tutar</p>
                      <p className="text-2xl font-bold text-primary">
                        ₺{order.total_amount.toFixed(2)}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 w-full">
                      <Select
                        value={order.status}
                        onValueChange={(value) => updateOrderStatus(order.id, value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Beklemede</SelectItem>
                          <SelectItem value="confirmed">Onaylandı</SelectItem>
                          <SelectItem value="preparing">Hazırlanıyor</SelectItem>
                          <SelectItem value="out_for_delivery">Yolda</SelectItem>
                          <SelectItem value="delivered">Teslim Edildi</SelectItem>
                          <SelectItem value="cancelled">İptal</SelectItem>
                        </SelectContent>
                      </Select>

                      <Button
                        variant="secondary"
                        className="w-full"
                        onClick={() => viewOrderDetails(order)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Detaylar
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {orders.length === 0 && (
              <div className="text-center py-12 bg-muted/30 rounded-lg border border-dashed">
                <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-muted-foreground font-medium">Henüz sipariş bulunmuyor.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detaylar Modalı */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              Sipariş Detayı: <span className="font-mono bg-primary/10 text-primary px-2 py-0.5 rounded">{selectedOrder?.order_number}</span>
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col gap-4">
            {selectedOrder?.notes && (
              <div className="bg-amber-50 border border-amber-100 p-3 rounded-md text-sm text-amber-800">
                <strong>Müşteri Notu:</strong> {selectedOrder.notes}
              </div>
            )}

            <ScrollArea className="flex-1 border rounded-md bg-muted/10 p-4">
              {itemsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
                </div>
              ) : (
                <div className="space-y-3">
                  {orderItems.map((item, index) => (
                    <div key={index} className="flex items-center justify-between bg-background p-3 rounded border">
                      <div className="flex flex-col">
                        <span className="font-semibold">{item.product_name}</span>
                        <span className="text-xs text-muted-foreground badge badge-outline w-fit mt-1">
                          {item.product_category}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {item.quantity} x ₺{item.unit_price.toFixed(2)}
                        </div>
                        <div className="font-bold text-primary">
                          ₺{item.subtotal.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            <div className="space-y-2 border-t pt-4 bg-background">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Ara Toplam:</span>
                <span>₺{(selectedOrder?.total_amount || 0).toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold text-primary">
                <span>Genel Toplam:</span>
                <span>₺{selectedOrder?.total_amount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Kapat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default OrdersManagement;
