import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { FileText, Download, Loader2, Calendar, User, CreditCard } from "lucide-react";
import { generateInvoicePDF } from "@/lib/pdfGenerator";

interface Invoice {
  id: string;
  invoice_number: string;
  status: string;
  total_amount: number;
  subtotal: number;
  tax_amount: number;
  delivery_fee: number;
  issued_date: string;
  due_date: string | null;
  paid_date: string | null;
  order_id: string;
  orders: {
    order_number: string;
    delivery_address: string;
    delivery_city: string;
    delivery_postal_code: string;
    profiles: {
      full_name: string;
      email: string;
      phone: string;
    } | null;
  };
}

const InvoicesManagement = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

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
    try {
      const { data, error } = await supabase
        .from("invoices")
        .select(`
          *,
          orders!invoices_order_id_fkey (
            order_number,
            user_id,
            delivery_address,
            delivery_city,
            delivery_postal_code
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Profil bilgilerini ayrı çek
      const invoicesWithProfiles = await Promise.all(
        (data || []).map(async (invoice) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, email, phone")
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
    } catch (error: any) {
      console.error("Error:", error);
      toast.error("Faturalar yüklenirken hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const updateInvoiceStatus = async (invoiceId: string, newStatus: string) => {
    try {
      const updateData: any = { status: newStatus };

      if (newStatus === "paid" && !invoices.find(i => i.id === invoiceId)?.paid_date) {
        updateData.paid_date = new Date().toISOString();
      }

      const { error } = await supabase
        .from("invoices")
        .update(updateData)
        .eq("id", invoiceId);

      if (error) throw error;
      toast.success("Fatura durumu güncellendi");
    } catch (error) {
      toast.error("Durum güncellenemedi");
    }
  };

  const handleDownloadPDF = async (invoice: Invoice) => {
    setDownloadingId(invoice.id);
    try {
      // Sipariş kalemlerini çek (PDF için gerekli)
      const { data: items, error } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", invoice.order_id);

      if (error) throw error;

      const pdfData = {
        invoice_number: invoice.invoice_number,
        issued_date: invoice.issued_date || new Date().toISOString(),
        due_date: invoice.due_date,
        customer: {
          name: invoice.orders.profiles?.full_name || "Misafir Kullanıcı",
          email: invoice.orders.profiles?.email || "",
          address: invoice.orders.delivery_address,
          city: invoice.orders.delivery_city,
          postal_code: invoice.orders.delivery_postal_code,
        },
        items: (items || []).map((item) => ({
          description: item.product_name,
          quantity: item.quantity,
          unit_price: Number(item.unit_price),
          total: Number(item.subtotal),
        })),
        subtotal: Number(invoice.subtotal),
        tax: Number(invoice.tax_amount),
        delivery_fee: Number(invoice.delivery_fee),
        total: Number(invoice.total_amount),
      };

      generateInvoicePDF(pdfData);
      toast.success("PDF indiriliyor...");
    } catch (error) {
      console.error(error);
      toast.error("PDF oluşturulurken hata oluştu");
    } finally {
      setDownloadingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid": return <Badge className="bg-green-500 hover:bg-green-600">Ödendi</Badge>;
      case "overdue": return <Badge className="bg-red-500 hover:bg-red-600">Gecikmiş</Badge>;
      case "sent": return <Badge className="bg-blue-500 hover:bg-blue-600">Gönderildi</Badge>;
      case "cancelled": return <Badge className="bg-gray-500">İptal</Badge>;
      default: return <Badge variant="secondary">Taslak</Badge>;
    }
  };

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardHeader className="px-0">
        <CardTitle className="text-2xl">Fatura Yönetimi</CardTitle>
        <CardDescription>Tüm müşteri faturalarını görüntüleyin ve yönetin.</CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <div className="space-y-4">
          {invoices.map((invoice) => (
            <div
              key={invoice.id}
              className="bg-card border rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div className="flex flex-col md:flex-row justify-between gap-6">
                {/* Sol Taraf: Bilgiler */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">{invoice.invoice_number}</h4>
                      <p className="text-xs text-muted-foreground">Sipariş: {invoice.orders.order_number}</p>
                    </div>
                    {getStatusBadge(invoice.status)}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm text-muted-foreground pl-12">
                    <div className="flex items-center gap-2">
                      <User className="h-3.5 w-3.5" />
                      <span>{invoice.orders.profiles?.full_name || "İsimsiz"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{new Date(invoice.issued_date).toLocaleDateString("tr-TR")}</span>
                    </div>
                    <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
                      <CreditCard className="h-3.5 w-3.5" />
                      <span className="font-semibold text-foreground">₺{invoice.total_amount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Sağ Taraf: Aksiyonlar */}
                <div className="flex flex-row md:flex-col gap-2 justify-end min-w-[160px]">
                  <Select
                    value={invoice.status}
                    onValueChange={(value) => updateInvoiceStatus(invoice.id, value)}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Durum" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Taslak</SelectItem>
                      <SelectItem value="sent">Gönderildi</SelectItem>
                      <SelectItem value="paid">Ödendi</SelectItem>
                      <SelectItem value="overdue">Gecikmiş</SelectItem>
                      <SelectItem value="cancelled">İptal</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadPDF(invoice)}
                    disabled={downloadingId === invoice.id}
                    className="h-9"
                  >
                    {downloadingId === invoice.id ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="mr-2 h-4 w-4" />
                    )}
                    PDF İndir
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {invoices.length === 0 && (
            <div className="text-center py-12 bg-muted/30 rounded-lg border border-dashed">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-muted-foreground font-medium">Henüz oluşturulmuş fatura bulunmuyor.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default InvoicesManagement;
