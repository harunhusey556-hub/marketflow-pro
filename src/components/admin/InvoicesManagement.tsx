import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { FileText, Download } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getInvoicesWithOrders, localData } from "@/services/localData";
import type { Invoice } from "@/services/mockDb";

type InvoiceRow = Invoice & {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
};

const InvoicesManagement = () => {
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const { t } = useTranslation();

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    const data = await getInvoicesWithOrders();
    setInvoices(data);
  };

  const updateInvoiceStatus = async (invoiceId: string, newStatus: Invoice["status"]) => {
    await localData.updateInvoiceStatus(invoiceId, newStatus);
    toast({
      title: "Success",
      description: "Invoice status updated",
    });
    fetchInvoices();
  };

  const handleDownloadPDF = () => {
    toast({
      title: t("common.loading"),
      description: "PDF generation coming soon",
    });
  };

  const getStatusBadge = (status: Invoice["status"]) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-500">{t("invoice.paid")}</Badge>;
      case "sent":
        return <Badge className="bg-blue-500">{t("invoice.sent")}</Badge>;
      case "draft":
        return <Badge className="bg-gray-500">{t("invoice.draft")}</Badge>;
      case "overdue":
        return <Badge className="bg-red-500">{t("invoice.overdue")}</Badge>;
      case "cancelled":
        return <Badge className="bg-red-700">{t("invoice.cancelled")}</Badge>;
      default:
        return <Badge className="bg-gray-500">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("admin.invoices")}</CardTitle>
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
                  <span className="font-semibold">{invoice.invoiceNumber}</span>
                  {getStatusBadge(invoice.status)}
                </div>
                <p className="text-sm text-muted-foreground">Order: {invoice.orderNumber}</p>
                <p className="text-sm text-muted-foreground">
                  Customer: {invoice.customerName} ({invoice.customerEmail})
                </p>
                <p className="text-sm">Issued: {new Date(invoice.issuedAt).toLocaleDateString()}</p>
                {invoice.dueDate && (
                  <p className="text-sm text-muted-foreground">Due: {new Date(invoice.dueDate).toLocaleDateString()}</p>
                )}
                {invoice.paidDate && (
                  <p className="text-sm text-green-600">Paid: {new Date(invoice.paidDate).toLocaleDateString()}</p>
                )}
                <p className="font-bold text-primary text-lg">€{invoice.totalAmount.toFixed(2)}</p>
              </div>
              <div className="flex flex-col gap-2">
                <Select
                  value={invoice.status}
                  onValueChange={(value) => updateInvoiceStatus(invoice.id, value as Invoice["status"])}
                >
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">{t("invoice.draft")}</SelectItem>
                    <SelectItem value="sent">{t("invoice.sent")}</SelectItem>
                    <SelectItem value="paid">{t("invoice.paid")}</SelectItem>
                    <SelectItem value="overdue">{t("invoice.overdue")}</SelectItem>
                    <SelectItem value="cancelled">{t("invoice.cancelled")}</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
                  <Download className="mr-2 h-4 w-4" />
                  {t("invoice.download")}
                </Button>
              </div>
            </div>
          ))}
          {invoices.length === 0 && (
            <p className="text-center text-muted-foreground py-8">{t("common.loading")}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default InvoicesManagement;
