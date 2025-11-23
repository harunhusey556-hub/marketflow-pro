import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Truck } from "lucide-react";
import { getDeliveries, localData } from "@/services/localData";

interface DeliveryRow {
  id: string;
  orderNumber: string;
  status: string;
  deliveryAddress: string;
  driver?: {
    name: string;
    phone: string;
    status: string;
  };
  estimatedDelivery?: string;
  trackingNotes?: string;
}

const statuses = ["pending", "confirmed", "preparing", "out_for_delivery", "delivering", "delivered", "cancelled"];

const DeliveriesManagement = () => {
  const [deliveries, setDeliveries] = useState<DeliveryRow[]>([]);
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryRow | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    driver_name: "",
    driver_phone: "",
    estimated_delivery: "",
    tracking_notes: "",
  });

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    const data = await getDeliveries();
    setDeliveries(data);
  };

  const updateDeliveryStatus = async (orderId: string, newStatus: string) => {
    await localData.updateOrderStatus(orderId, newStatus as any);
    toast({
      title: "Success",
      description: "Delivery status updated",
    });
    fetchDeliveries();
  };

  const updateDeliveryInfo = async () => {
    if (!selectedDelivery) return;
    await localData.updateDeliveryDetails(selectedDelivery.id, {
      driverName: formData.driver_name,
      driverPhone: formData.driver_phone,
      estimatedDelivery: formData.estimated_delivery,
      trackingNotes: formData.tracking_notes,
    });
    toast({
      title: "Success",
      description: "Delivery information updated",
    });
    setIsDialogOpen(false);
    fetchDeliveries();
  };

  const openEditDialog = (delivery: DeliveryRow) => {
    setSelectedDelivery(delivery);
    setFormData({
      driver_name: delivery.driver?.name ?? "",
      driver_phone: delivery.driver?.phone ?? "",
      estimated_delivery: delivery.estimatedDelivery ?? "",
      tracking_notes: delivery.trackingNotes ?? "",
    });
    setIsDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-500",
      confirmed: "bg-blue-500",
      preparing: "bg-purple-500",
      out_for_delivery: "bg-orange-500",
      delivering: "bg-orange-600",
      delivered: "bg-green-500",
      cancelled: "bg-red-500",
    };
    return colors[status] || "bg-gray-500";
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>All Deliveries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {deliveries.map((delivery) => (
              <div
                key={delivery.id}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border rounded-lg"
              >
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <Truck className="h-5 w-5 text-muted-foreground" />
                    <span className="font-semibold">{delivery.orderNumber}</span>
                    <Badge className={getStatusColor(delivery.status)}>{delivery.status.replace(/_/g, " ")}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Address: {delivery.deliveryAddress}</p>
                  {delivery.driver && (
                    <p className="text-sm">
                      Driver: {delivery.driver.name} ({delivery.driver.phone})
                    </p>
                  )}
                  {delivery.estimatedDelivery && (
                    <p className="text-sm text-muted-foreground">
                      Est. Delivery: {new Date(delivery.estimatedDelivery).toLocaleString()}
                    </p>
                  )}
                  {delivery.trackingNotes && <p className="text-sm text-muted-foreground">{delivery.trackingNotes}</p>}
                </div>
                <div className="flex flex-col gap-2">
                  <Select value={delivery.status} onValueChange={(value) => updateDeliveryStatus(delivery.id, value)}>
                    <SelectTrigger className="w-full md:w-[220px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status.replace(/_/g, " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" onClick={() => openEditDialog(delivery)}>
                    Edit Details
                  </Button>
                </div>
              </div>
            ))}
            {deliveries.length === 0 && <p className="text-center text-muted-foreground py-8">No deliveries yet</p>}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Delivery Information</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground mb-2">Update driver and delivery details</p>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="driver_name">Driver Name</Label>
              <Input
                id="driver_name"
                value={formData.driver_name}
                onChange={(e) => setFormData({ ...formData, driver_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="driver_phone">Driver Phone</Label>
              <Input
                id="driver_phone"
                value={formData.driver_phone}
                onChange={(e) => setFormData({ ...formData, driver_phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="estimated_delivery">Estimated Delivery</Label>
              <Input
                id="estimated_delivery"
                type="datetime-local"
                value={formData.estimated_delivery}
                onChange={(e) => setFormData({ ...formData, estimated_delivery: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tracking_notes">Tracking Notes</Label>
              <Input
                id="tracking_notes"
                value={formData.tracking_notes}
                onChange={(e) => setFormData({ ...formData, tracking_notes: e.target.value })}
              />
            </div>
            <Button onClick={updateDeliveryInfo} className="w-full">
              Update Delivery
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DeliveriesManagement;
