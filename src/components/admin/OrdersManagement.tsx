import { useCallback, useEffect, useState } from "react";
import { mockDb, Order, OrderItem } from "@/services/mockDb";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { Clock, Eye, MapPin, ShoppingBag, Loader2 } from "lucide-react";

const OrdersManagement = () => {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [driverQuantities, setDriverQuantities] = useState<Record<string, number>>({});
  const [driverNotes, setDriverNotes] = useState("");
  const [driverSaving, setDriverSaving] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await mockDb.getOrders();
      setOrders(data);
    } catch (error) {
      console.error("Failed to load orders", error);
      toast.error(t("common.errorLoadingOrders", "Unable to load orders"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const syncOrderList = (updated: Order) => {
    setOrders((previous) => previous.map((order) => (order.id === updated.id ? updated : order)));
  };

  const updateOrderStatus = async (orderId: string, newStatus: Order["status"]) => {
    try {
      const updated = await mockDb.updateOrderStatus(orderId, newStatus);
      syncOrderList(updated);
      toast.success(t("common.orderStatusUpdated", "Order status updated"));
    } catch (error) {
      console.error(error);
      toast.error(t("common.updateFailed", "Update failed"));
    }
  };

  const viewOrderDetails = async (order: Order) => {
    setIsDialogOpen(true);
    setItemsLoading(true);
    try {
      const fresh = await mockDb.getOrderById(order.id);
      if (!fresh) {
        toast.error(t("common.errorLoadingItems", "Unable to load order items"));
        return;
      }
      setSelectedOrder(fresh);
      setOrderItems(fresh.items);
      const draft: Record<string, number> = {};
      fresh.items.forEach((item) => {
        draft[item.id] = item.deliveredQty ?? item.orderedQty;
      });
      setDriverQuantities(draft);
      setDriverNotes("");
    } catch (error) {
      console.error(error);
      toast.error(t("common.errorLoadingItems", "Unable to load order items"));
    } finally {
      setItemsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-500 hover:bg-yellow-600 text-white",
      confirmed: "bg-blue-500 hover:bg-blue-600 text-white",
      preparing: "bg-purple-500 hover:bg-purple-600 text-white",
      out_for_delivery: "bg-orange-500 hover:bg-orange-600 text-white",
      delivering: "bg-orange-600 hover:bg-orange-700 text-white",
      delivered: "bg-green-500 hover:bg-green-600 text-white",
      cancelled: "bg-red-500 hover:bg-red-600 text-white",
    };
    return colors[status] || "bg-gray-500 text-white";
  };

  const handleDriverQuantityChange = (itemId: string, value: string) => {
    const parsed = parseInt(value, 10);
    if (Number.isNaN(parsed)) return;
    setDriverQuantities((prev) => ({ ...prev, [itemId]: parsed }));
  };

  const saveDriverAdjustments = async (markDelivered = false) => {
    if (!selectedOrder) return;
    setDriverSaving(true);
    try {
      const adjustments = Object.entries(driverQuantities).map(([itemId, deliveredQty]) => ({
        itemId,
        deliveredQty,
        reason: driverNotes || undefined,
      }));

      const updated = await mockDb.adjustOrderItems({
        orderId: selectedOrder.id,
        adjustments,
        markDelivered,
      });

      setSelectedOrder(updated);
      setOrderItems(updated.items);
      syncOrderList(updated);

      toast.success(
        markDelivered
          ? t("common.orderMarkedDelivered", "Order marked as delivered")
          : t("common.driverUpdateSaved", "Driver adjustments saved"),
      );

      if (markDelivered) {
        setIsDialogOpen(false);
      }
    } catch (error) {
      console.error(error);
      toast.error(t("common.updateFailed", "Update failed"));
    } finally {
      setDriverSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Card className="border-none shadow-none bg-transparent">
        <CardHeader className="px-0">
          <CardTitle className="text-2xl">
            {t("order.managementTitle", "Order Management")}
          </CardTitle>
          <CardDescription>
            {t("order.managementSubtitle", "Track live orders, drivers, and invoices.")}
          </CardDescription>
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
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-mono font-bold text-lg bg-muted px-2 py-1 rounded">
                        {order.orderNumber}
                      </span>
                      <Badge className={`${getStatusColor(order.status)} border-none`}>
                        {t(`order.status.${order.status}`, order.status)}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center ml-auto lg:ml-0">
                        <Clock className="w-3 h-3 mr-1" />
                        {new Date(order.createdAt).toLocaleString("fi-FI")}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-1">
                        <p className="text-muted-foreground font-medium flex items-center">
                          <ShoppingBag className="w-3.5 h-3.5 mr-1.5" /> {t("order.customer", "Customer")}
                        </p>
                        <p className="font-semibold">{order.customer.fullName}</p>
                        <p className="text-xs text-muted-foreground">{order.customer.email}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-muted-foreground font-medium flex items-center">
                          <MapPin className="w-3.5 h-3.5 mr-1.5" /> {t("order.delivery", "Delivery")}
                        </p>
                        <p>{order.deliveryAddress}</p>
                        <p className="text-xs text-muted-foreground">
                          {order.deliveryCity}, {order.deliveryPostalCode}
                        </p>
                        {order.assignedDriver && (
                          <p className="text-xs text-muted-foreground pt-1">
                            {t("order.driver", "Driver")}: {order.assignedDriver.name} ·{" "}
                            {order.assignedDriver.status.replace("_", " ")}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col justify-between items-end gap-4 lg:border-l lg:pl-6 min-w-[200px]">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        {t("order.totalAmount", "Total amount")}
                      </p>
                      <p className="text-2xl font-bold text-primary">
                        €{order.totalAmount.toFixed(2)}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 w-full">
                      <Select
                        value={order.status}
                        onValueChange={(value) => updateOrderStatus(order.id, value as Order["status"])}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">{t("order.status.pending", "Pending")}</SelectItem>
                          <SelectItem value="confirmed">{t("order.status.confirmed", "Confirmed")}</SelectItem>
                          <SelectItem value="preparing">{t("order.status.preparing", "Preparing")}</SelectItem>
                          <SelectItem value="out_for_delivery">
                            {t("order.status.out_for_delivery", "Out for delivery")}
                          </SelectItem>
                          <SelectItem value="delivering">{t("order.status.delivering", "Delivering")}</SelectItem>
                          <SelectItem value="delivered">{t("order.status.delivered", "Delivered")}</SelectItem>
                          <SelectItem value="cancelled">{t("order.status.cancelled", "Cancelled")}</SelectItem>
                        </SelectContent>
                      </Select>

                      <Button
                        variant="secondary"
                        className="w-full"
                        onClick={() => viewOrderDetails(order)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        {t("order.viewDetails", "View details")}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {orders.length === 0 && (
              <div className="text-center py-12 bg-muted/30 rounded-lg border border-dashed">
                <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-muted-foreground font-medium">
                  {t("order.emptyState", "No orders yet. Incoming orders will appear here.")}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              {t("order.detailsTitle", "Order details")}:
              <span className="font-mono bg-primary/10 text-primary px-2 py-0.5 rounded">
                {selectedOrder?.orderNumber}
              </span>
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col gap-4">
            {selectedOrder?.notes && (
              <div className="bg-amber-50 border border-amber-100 p-3 rounded-md text-sm text-amber-800">
                <strong>{t("order.customerNote", "Customer note")}:</strong> {selectedOrder.notes}
              </div>
            )}

            <ScrollArea className="flex-1 border rounded-md bg-muted/10 p-4">
              {itemsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
                </div>
              ) : (
                <div className="space-y-3">
                  {orderItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between bg-background p-3 rounded border">
                      <div className="flex flex-col">
                        <span className="font-semibold">{item.productName}</span>
                        <span className="text-xs text-muted-foreground badge badge-outline w-fit mt-1">
                          {item.productCategory}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {item.orderedQty} x €{item.unitPrice.toFixed(2)}
                        </div>
                        <div className="font-bold text-primary">
                          €{(item.unitPrice * item.orderedQty).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            <div className="space-y-2 border-t pt-4 bg-background">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {t("order.subtotal", "Subtotal")}:
                </span>
                <span>€{(selectedOrder?.totalAmount || 0).toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold text-primary">
                <span>{t("order.grandTotal", "Grand total")}:</span>
                <span>€{selectedOrder?.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3 border rounded-md p-4 bg-muted/30">
            <div className="flex items-center justify-between">
              <p className="font-semibold">
                {t("order.driverAdjustments", "Driver adjustments")}
              </p>
              <Badge variant="outline">
                {selectedOrder?.assignedDriver?.name || t("order.driverUnassigned", "Unassigned")}
              </Badge>
            </div>
            <div className="space-y-3">
              {orderItems.map((item) => (
                <div key={item.id} className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <div className="flex-1">
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-xs text-muted-foreground">
                      {t("order.ordered", "Ordered")}: {item.orderedQty} · {t("order.delivered", "Delivered")}:{" "}
                      {item.deliveredQty ?? item.orderedQty}
                    </p>
                  </div>
                  <Input
                    type="number"
                    min={0}
                    className="sm:w-32"
                    value={driverQuantities[item.id] ?? item.deliveredQty ?? item.orderedQty}
                    onChange={(event) => handleDriverQuantityChange(item.id, event.target.value)}
                  />
                </div>
              ))}
            </div>
            <Textarea
              placeholder={t("order.driverNotePlaceholder", "Driver notes (optional)")}
              value={driverNotes}
              onChange={(event) => setDriverNotes(event.target.value)}
            />
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button onClick={() => saveDriverAdjustments(false)} disabled={driverSaving}>
                {driverSaving ? t("order.saving", "Saving...") : t("order.saveAdjustments", "Save adjustments")}
              </Button>
              <Button
                variant="secondary"
                onClick={() => saveDriverAdjustments(true)}
                disabled={driverSaving}
              >
                {t("order.saveAndDeliver", "Save and mark delivered")}
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              {t("order.close", "Close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default OrdersManagement;
