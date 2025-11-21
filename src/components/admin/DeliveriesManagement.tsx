import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Truck } from "lucide-react";

interface Delivery {
  id: string;
  order_id: string;
  driver_name: string | null;
  driver_phone: string | null;
  status: string;
  estimated_delivery: string | null;
  orders: {
    order_number: string;
    delivery_address: string;
  };
}

const DeliveriesManagement = () => {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    driver_name: "",
    driver_phone: "",
    estimated_delivery: "",
    tracking_notes: "",
  });

  useEffect(() => {
    fetchDeliveries();

    const channel = supabase
      .channel('deliveries-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'deliveries' }, () => {
        fetchDeliveries();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchDeliveries = async () => {
    const { data, error } = await supabase
      .from("deliveries")
      .select(`
        *,
        orders!deliveries_order_id_fkey (order_number, delivery_address)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching deliveries:", error);
      return;
    }

    setDeliveries(data || []);
  };

  const updateDeliveryStatus = async (deliveryId: string, newStatus: string) => {
    const updateData: any = { status: newStatus };
    
    if (newStatus === "delivered") {
      updateData.actual_delivery = new Date().toISOString();
    }

    const { error } = await supabase
      .from("deliveries")
      .update(updateData)
      .eq("id", deliveryId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update delivery status",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Delivery status updated",
    });
    
    fetchDeliveries();
  };

  const updateDeliveryInfo = async () => {
    if (!selectedDelivery) return;

    const { error } = await supabase
      .from("deliveries")
      .update({
        driver_name: formData.driver_name,
        driver_phone: formData.driver_phone,
        estimated_delivery: formData.estimated_delivery,
        tracking_notes: formData.tracking_notes,
      })
      .eq("id", selectedDelivery.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update delivery information",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Delivery information updated",
    });
    
    setIsDialogOpen(false);
    fetchDeliveries();
  };

  const openEditDialog = (delivery: Delivery) => {
    setSelectedDelivery(delivery);
    setFormData({
      driver_name: delivery.driver_name || "",
      driver_phone: delivery.driver_phone || "",
      estimated_delivery: delivery.estimated_delivery || "",
      tracking_notes: "",
    });
    setIsDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-500",
      assigned: "bg-blue-500",
      picked_up: "bg-purple-500",
      in_transit: "bg-orange-500",
      delivered: "bg-green-500",
      failed: "bg-red-500",
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
                    <span className="font-semibold">{delivery.orders.order_number}</span>
                    <Badge className={getStatusColor(delivery.status)}>
                      {delivery.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Address: {delivery.orders.delivery_address}
                  </p>
                  {delivery.driver_name && (
                    <p className="text-sm">
                      Driver: {delivery.driver_name} ({delivery.driver_phone})
                    </p>
                  )}
                  {delivery.estimated_delivery && (
                    <p className="text-sm text-muted-foreground">
                      Est. Delivery: {new Date(delivery.estimated_delivery).toLocaleString()}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <Select
                    value={delivery.status}
                    onValueChange={(value) => updateDeliveryStatus(delivery.id, value)}
                  >
                    <SelectTrigger className="w-full md:w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="assigned">Assigned</SelectItem>
                      <SelectItem value="picked_up">Picked Up</SelectItem>
                      <SelectItem value="in_transit">In Transit</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(delivery)}
                  >
                    Edit Details
                  </Button>
                </div>
              </div>
            ))}
            {deliveries.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No deliveries yet</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Delivery Information</DialogTitle>
          </DialogHeader>
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
