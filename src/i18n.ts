import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// İngilizce Çeviriler
const en = {
  translation: {
    nav: {
      home: "Home",
      products: "Products",
      about: "About",
      contact: "Contact",
      admin: "Admin Panel",
      profile: "Profile",
      cart: "Cart",
      signIn: "Sign In",
      signOut: "Sign Out"
    },
    cart: {
      title: "Shopping Cart",
      empty: "Your cart is empty",
      subtotal: "Subtotal",
      delivery: "Delivery",
      total: "Total",
      checkout: "Proceed to Checkout",
      clear: "Clear Cart",
      items: "items"
    },
    checkout: {
      title: "Checkout",
      desc: "Complete your order by providing delivery details",
      address: "Delivery Address",
      city: "City",
      postalCode: "Postal Code",
      notes: "Delivery Notes (Optional)",
      notesPlaceholder: "Leave at door, ring bell, etc.",
      paymentLabel: "Payment Method",
      paymentPlaceholder: "Select a payment method",
      payment: {
        card: "Card",
        cash: "Cash",
        invoice: "Invoice"
      },
      placeOrder: "Place Order",
      processing: "Processing..."
    },
    admin: {
      dashboard: "Admin Dashboard",
      orders: "Orders",
      products: "Products",
      customers: "Customers",
      deliveries: "Deliveries",
      invoices: "Invoices",
      coupons: "Coupons",
      stats: {
        totalOrders: "Total Orders",
        activeDeliveries: "Active Deliveries",
        totalInvoices: "Total Invoices",
        totalRevenue: "Total Revenue",
        allTime: "All time",
        inTransit: "In transit or pending",
        totalCount: "Total count",
        grossRevenue: "Gross revenue"
      }
    },
    invoice: {
      title: "INVOICE",
      number: "Invoice No",
      date: "Date",
      dueDate: "Due Date",
      to: "TO:",
      item: "Item / Service",
      quantity: "Qty",
      unitPrice: "Unit Price",
      total: "Total",
      subtotal: "Subtotal",
      tax: "VAT",
      deliveryFee: "Delivery Fee",
      grandTotal: "GRAND TOTAL",
      footer: "Thank you for your business!",
      companyName: "MarketFresh Foods Ltd.",
      companyAddress: "Technology Ave. No:123, Helsinki",
      download: "Download PDF",
      status: "Status",
      draft: "Draft",
      sent: "Sent",
      paid: "Paid",
      overdue: "Overdue",
      cancelled: "Cancelled"
    },
    order: {
      management: "Order Management",
      desc: "Track and update incoming orders.",
      number: "Order No",
      customer: "Customer",
      delivery: "Delivery",
      status: {
        pending: "Pending",
        confirmed: "Confirmed",
        preparing: "Preparing",
        out_for_delivery: "Out for Delivery",
        delivered: "Delivered",
        cancelled: "Cancelled"
      },
      details: "Details",
      guest: "Guest",
      totalAmount: "Total Amount",
      subtotal: "Subtotal",
      grandTotal: "Grand Total",
      customerNote: "Customer Note",
      close: "Close"
    },
    common: {
      loading: "Loading...",
      error: "Error",
      success: "Success",
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      edit: "Edit",
      update: "Update",
      errorLoadingOrders: "Error loading orders",
      orderStatusUpdated: "Order status updated",
      updateFailed: "Update failed",
      errorLoadingItems: "Error loading items"
    }
  }
};

// Fince Çeviriler
const fi = {
  translation: {
    nav: {
      home: "Etusivu",
      products: "Tuotteet",
      about: "Meistä",
      contact: "Yhteystiedot",
      admin: "Hallintapaneeli",
      profile: "Profiili",
      cart: "Ostoskori",
      signIn: "Kirjaudu",
      signOut: "Kirjaudu ulos"
    },
    cart: {
      title: "Ostoskori",
      empty: "Ostoskorisi on tyhjä",
      subtotal: "Välisumma",
      delivery: "Toimitus",
      total: "Yhteensä",
      checkout: "Kassalle",
      clear: "Tyhjennä kori",
      items: "tuotetta"
    },
    checkout: {
      title: "Kassa",
      desc: "Viimeistele tilaus syöttämällä toimitustiedot",
      address: "Toimitusosoite",
      city: "Kaupunki",
      postalCode: "Postinumero",
      notes: "Toimituskommentit (Valinnainen)",
      notesPlaceholder: "Jätä ovelle, soita ovikelloa, jne.",
      paymentLabel: "Maksutapa",
      paymentPlaceholder: "Valitse maksutapa",
      payment: {
        card: "Kortti",
        cash: "Käteinen",
        invoice: "Lasku"
      },
      placeOrder: "Tilaa",
      processing: "Käsitellään..."
    },
    admin: {
      dashboard: "Hallintapaneeli",
      orders: "Tilaukset",
      products: "Tuotteet",
      customers: "Asiakkaat",
      deliveries: "Toimitukset",
      invoices: "Laskut",
      coupons: "Kupongit",
      stats: {
        totalOrders: "Tilaukset Yhteensä",
        activeDeliveries: "Aktiiviset Toimitukset",
        totalInvoices: "Laskut Yhteensä",
        totalRevenue: "Kokonaistulot",
        allTime: "Kaikki ajat",
        inTransit: "Kuljetuksessa tai odottaa",
        totalCount: "Kokonaislkm",
        grossRevenue: "Bruttotulot"
      }
    },
    invoice: {
      title: "LASKU",
      number: "Laskunro",
      date: "Päivämäärä",
      dueDate: "Eräpäivä",
      to: "VASTAANOTTAJA:",
      item: "Tuote / Palvelu",
      quantity: "Määrä",
      unitPrice: "Yks.hinta",
      total: "Yhteensä",
      subtotal: "Välisumma",
      tax: "ALV",
      deliveryFee: "Toimituskulu",
      grandTotal: "LOPPUSUMMA",
      footer: "Kiitos asioinnistanne!",
      companyName: "MarketFresh Foods Oy",
      companyAddress: "Teknologiakatu 123, Helsinki",
      download: "Lataa PDF",
      status: "Tila",
      draft: "Luonnos",
      sent: "Lähetetty",
      paid: "Maksettu",
      overdue: "Erääntynyt",
      cancelled: "Peruttu"
    },
    order: {
      management: "Tilausten Hallinta",
      desc: "Seuraa ja päivitä saapuvia tilauksia.",
      number: "Tilausnro",
      customer: "Asiakas",
      delivery: "Toimitus",
      status: {
        pending: "Odottaa",
        confirmed: "Vahvistettu",
        preparing: "Valmistelussa",
        out_for_delivery: "Toimituksessa",
        delivered: "Toimitettu",
        cancelled: "Peruttu"
      },
      details: "Tiedot",
      guest: "Vieras",
      totalAmount: "Kokonaissumma",
      subtotal: "Välisumma",
      grandTotal: "Loppusumma",
      customerNote: "Asiakkaan huomautus",
      close: "Sulje"
    },
    common: {
      loading: "Ladataan...",
      error: "Virhe",
      success: "Onnistui",
      save: "Tallenna",
      cancel: "Peruuta",
      delete: "Poista",
      edit: "Muokkaa",
      update: "Päivitä",
      errorLoadingOrders: "Tilausten lataaminen epäonnistui",
      orderStatusUpdated: "Tilauksen tila päivitetty",
      updateFailed: "Päivitys epäonnistui",
      errorLoadingItems: "Tuotteiden lataaminen epäonnistui"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: en,
      fi: fi
    },
    fallbackLng: "en", // Varsayılan dil İngilizce
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
