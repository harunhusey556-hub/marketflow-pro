import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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

  // Renkler ve Fontlar
  const primaryColor = "#2563eb"; // Mavi tonu
  const secondaryColor = "#64748b"; // Gri tonu

  // --- HEADER ---
  // Şirket Adı
  doc.setFontSize(24);
  doc.setTextColor(primaryColor);
  doc.setFont("helvetica", "bold");
  doc.text("MARKETFRESH", 14, 20);

  // Şirket Bilgileri
  doc.setFontSize(10);
  doc.setTextColor(secondaryColor);
  doc.setFont("helvetica", "normal");
  doc.text("MarketFresh Gıda A.Ş.", 14, 30);
  doc.text("Teknoloji Cad. No:123, İstanbul", 14, 35);
  doc.text("info@marketfresh.com", 14, 40);

  // Fatura Başlığı
  doc.setFontSize(20);
  doc.setTextColor(primaryColor);
  doc.text("FATURA", 196, 20, { align: "right" });

  // Fatura Detayları (Sağ Üst)
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(`Fatura No: ${data.invoice_number}`, 196, 30, { align: "right" });
  doc.text(`Tarih: ${new Date(data.issued_date).toLocaleDateString("tr-TR")}`, 196, 35, { align: "right" });
  if (data.due_date) {
    doc.text(`Vade: ${new Date(data.due_date).toLocaleDateString("tr-TR")}`, 196, 40, { align: "right" });
  }

  // Ayırıcı Çizgi
  doc.setDrawColor(200, 200, 200);
  doc.line(14, 45, 196, 45);

  // --- MÜŞTERİ BİLGİLERİ ---
  doc.setFontSize(11);
  doc.setTextColor(primaryColor);
  doc.setFont("helvetica", "bold");
  doc.text("SAYIN:", 14, 55);

  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  doc.text(data.customer.name, 14, 62);
  doc.text(data.customer.address || "", 14, 67);
  doc.text(`${data.customer.city || ""} ${data.customer.postal_code || ""}`, 14, 72);
  doc.text(data.customer.email, 14, 77);

  // --- TABLO ---
  const tableColumn = ["Ürün / Hizmet", "Miktar", "Birim Fiyat", "Toplam"];
  const tableRows: any[] = [];

  data.items.forEach((item) => {
    const rowData = [
      item.description,
      item.quantity,
      `₺${item.unit_price.toFixed(2)}`,
      `₺${item.total.toFixed(2)}`,
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
      0: { cellWidth: "auto" }, // Açıklama
      1: { cellWidth: 20, halign: "center" }, // Miktar
      2: { cellWidth: 30, halign: "right" }, // Birim Fiyat
      3: { cellWidth: 30, halign: "right" }, // Toplam
    },
  });

  // --- TOPLAM HESAPLAMA ---
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  const rightAlignX = 196;
  
  doc.setFontSize(10);
  doc.setTextColor(secondaryColor);
  
  // Ara Toplam
  doc.text("Ara Toplam:", 140, finalY);
  doc.text(`₺${data.subtotal.toFixed(2)}`, rightAlignX, finalY, { align: "right" });

  // KDV
  doc.text("KDV (%10):", 140, finalY + 6);
  doc.text(`₺${data.tax.toFixed(2)}`, rightAlignX, finalY + 6, { align: "right" });

  // Teslimat
  doc.text("Teslimat Ücreti:", 140, finalY + 12);
  doc.text(`₺${data.delivery_fee.toFixed(2)}`, rightAlignX, finalY + 12, { align: "right" });

  // Genel Toplam
  doc.setFontSize(12);
  doc.setTextColor(primaryColor);
  doc.setFont("helvetica", "bold");
  doc.text("GENEL TOPLAM:", 140, finalY + 20);
  doc.text(`₺${data.total.toFixed(2)}`, rightAlignX, finalY + 20, { align: "right" });

  // --- FOOTER ---
  doc.setFontSize(9);
  doc.setTextColor(secondaryColor);
  doc.setFont("helvetica", "italic");
  doc.text("Bizi tercih ettiğiniz için teşekkür ederiz!", 105, 280, { align: "center" });

  // PDF'i İndir
  doc.save(`${data.invoice_number}.pdf`);
};