import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import i18n from "@/i18n"; // i18n instance'ını import ediyoruz

interface InvoiceData {
  invoice_number: string;
  issued_date: string;
  due_date: string | null;
  customer: {
    name: string;
    email: string;
    address: string;
    city: string;
    postal_code: string;
  };
  items: Array<{
    description: string;
    quantity: number;
    unit_price: number;
    total: number;
  }>;
  subtotal: number;
  tax: number;
  delivery_fee: number;
  total: number;
}

export const generateInvoicePDF = (data: InvoiceData) => {
  const doc = new jsPDF();
  const t = i18n.t; // Çeviri fonksiyonu

  // Renkler
  const primaryColor = "#2563eb";
  const secondaryColor = "#64748b";

  // --- HEADER ---
  doc.setFontSize(24);
  doc.setTextColor(primaryColor);
  doc.setFont("helvetica", "bold");
  doc.text("MARKETFRESH", 14, 20);

  doc.setFontSize(10);
  doc.setTextColor(secondaryColor);
  doc.setFont("helvetica", "normal");
  doc.text(t("invoice.companyName"), 14, 30);
  doc.text(t("invoice.companyAddress"), 14, 35);
  doc.text("info@marketfresh.com", 14, 40);

  doc.setFontSize(20);
  doc.setTextColor(primaryColor);
  doc.text(t("invoice.title"), 196, 20, { align: "right" });

  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(`${t("invoice.number")}: ${data.invoice_number}`, 196, 30, { align: "right" });
  doc.text(`${t("invoice.date")}: ${new Date(data.issued_date).toLocaleDateString("fi-FI")}`, 196, 35, { align: "right" }); // Tarih formatı Fince standart
  if (data.due_date) {
    doc.text(`${t("invoice.dueDate")}: ${new Date(data.due_date).toLocaleDateString("fi-FI")}`, 196, 40, { align: "right" });
  }

  doc.setDrawColor(200, 200, 200);
  doc.line(14, 45, 196, 45);

  // --- MÜŞTERİ ---
  doc.setFontSize(11);
  doc.setTextColor(primaryColor);
  doc.setFont("helvetica", "bold");
  doc.text(t("invoice.to"), 14, 55);

  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  doc.text(data.customer.name, 14, 62);
  doc.text(data.customer.address || "", 14, 67);
  doc.text(`${data.customer.city || ""} ${data.customer.postal_code || ""}`, 14, 72);
  doc.text(data.customer.email, 14, 77);

  // --- TABLO ---
  const tableColumn = [
    t("invoice.item"),
    t("invoice.quantity"),
    t("invoice.unitPrice"),
    t("invoice.total")
  ];
  const tableRows: (string | number)[][] = [];

  data.items.forEach((item) => {
    const rowData = [
      item.description,
      item.quantity,
      `€${item.unit_price.toFixed(2)}`,
      `€${item.total.toFixed(2)}`,
    ];
    tableRows.push(rowData);
  });

  autoTable(doc, {
    startY: 85,
    head: [tableColumn],
    body: tableRows,
    theme: "striped",
    headStyles: {
      fillColor: primaryColor,
      textColor: "#ffffff",
      fontStyle: "bold",
    },
    styles: {
      fontSize: 10,
      cellPadding: 3,
    },
    columnStyles: {
      0: { cellWidth: "auto" },
      1: { cellWidth: 20, halign: "center" },
      2: { cellWidth: 30, halign: "right" },
      3: { cellWidth: 30, halign: "right" },
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  const rightAlignX = 196;

  doc.setFontSize(10);
  doc.setTextColor(secondaryColor);

  doc.text(`${t("invoice.subtotal")}:`, 140, finalY);
  doc.text(`€${data.subtotal.toFixed(2)}`, rightAlignX, finalY, { align: "right" });

  doc.text(`${t("invoice.tax")} (%10):`, 140, finalY + 6);
  doc.text(`€${data.tax.toFixed(2)}`, rightAlignX, finalY + 6, { align: "right" });

  doc.text(`${t("invoice.deliveryFee")}:`, 140, finalY + 12);
  doc.text(`€${data.delivery_fee.toFixed(2)}`, rightAlignX, finalY + 12, { align: "right" });

  doc.setFontSize(12);
  doc.setTextColor(primaryColor);
  doc.setFont("helvetica", "bold");
  doc.text(`${t("invoice.grandTotal")}:`, 140, finalY + 20);
  doc.text(`€${data.total.toFixed(2)}`, rightAlignX, finalY + 20, { align: "right" });

  doc.setFontSize(9);
  doc.setTextColor(secondaryColor);
  doc.setFont("helvetica", "italic");
  doc.text(t("invoice.footer"), 105, 280, { align: "center" });

  doc.save(`${data.invoice_number}.pdf`);
};