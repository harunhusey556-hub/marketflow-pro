import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { FileText, Download } from "lucide-react";

interface Invoice {
  id: string;
  invoice_number: string;
  status: string;
  total_amount: number;
  issued_date: string;
  due_date: string | null;
  paid_date: string | null;
  orders: {
    order_number: string;
    profiles: {
      full_name: string;
      email: string;
    } | null;
  };
}

const InvoicesManagement = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    fetchInvoices();

    const channel = supabase
      .channel('invoices-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'invoices' }, () => {
        fetchInvoices();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchInvoices = async () => {
    const { data, error } = await supabase
      .from("invoices")
      .select(`
        *,
        orders!invoices_order_id_fkey (
          order_number,
          user_id
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching invoices:", error);
      return;
    }

    // Fetch profiles separately
    const invoicesWithProfiles = await Promise.all(
      (data || []).map(async (invoice) => {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, email")
          .eq("id", invoice.orders.user_id)
          .maybeSingle();

        return {
          ...invoice,
          orders: {
            ...invoice.orders,
            profiles: profile || null,
          },
        };
      })
    );

    setInvoices(invoicesWithProfiles);
  };

  const updateInvoiceStatus = async (invoiceId: string, newStatus: string) => {
    const updateData: any = { status: newStatus };
    
    if (newStatus === "paid" && !invoices.find(i => i.id === invoiceId)?.paid_date) {
      updateData.paid_date = new Date().toISOString();
    }

    const { error } = await supabase
      .from("invoices")
      .update(updateData)
      .eq("id", invoiceId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update invoice status",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Invoice status updated",
    });
    
    fetchInvoices();
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: "bg-gray-500",
      sent: "bg-blue-500",
      paid: "bg-green-500",
      overdue: "bg-red-500",
      cancelled: "bg-red-700",
    };
    return colors[status] || "bg-gray-500";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Invoices</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {invoices.map((invoice) => (
            <div
              key={invoice.id}
              className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border rounded-lg"
            >
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <span className="font-semibold">{invoice.invoice_number}</span>
                  <Badge className={getStatusColor(invoice.status)}>
                    {invoice.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Order: {invoice.orders.order_number}
                </p>
                <p className="text-sm text-muted-foreground">
                  Customer: {invoice.orders.profiles?.full_name || "N/A"} ({invoice.orders.profiles?.email})
                </p>
                <p className="text-sm">
                  Issued: {new Date(invoice.issued_date).toLocaleDateString()}
                </p>
                {invoice.due_date && (
                  <p className="text-sm text-muted-foreground">
                    Due: {new Date(invoice.due_date).toLocaleDateString()}
                  </p>
                )}
                {invoice.paid_date && (
                  <p className="text-sm text-green-600">
                    Paid: {new Date(invoice.paid_date).toLocaleDateString()}
                  </p>
                )}
                <p className="font-bold text-primary text-lg">${invoice.total_amount}</p>
              </div>
              <div className="flex flex-col gap-2">
                <Select
                  value={invoice.status}
                  onValueChange={(value) => updateInvoiceStatus(invoice.id, value)}
                >
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
              </div>
            </div>
          ))}
          {invoices.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No invoices yet</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default InvoicesManagement;
