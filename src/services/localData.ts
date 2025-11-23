import { mockDb } from "./mockDb";
import type {
  Product,
  Order,
  CartItem,
  Invoice,
  InvoiceStatus,
  PaymentMethod,
} from "./mockDb";
import type { LocalUser } from "./localAuth";

export const localData = {
  getProducts: () => mockDb.getProducts(),
  getProductById: async (id: string) => {
    const products = await mockDb.getProducts();
    return products.find((product) => product.id === id);
  },
  createProduct: (product: Omit<Product, "id" | "createdAt" | "updatedAt">) =>
    mockDb.createProduct(product),
  updateProduct: (id: string, updates: Partial<Omit<Product, "id">>) =>
    mockDb.updateProduct(id, updates),
  deleteProduct: (id: string) => mockDb.deleteProduct(id),
  createOrder: (params: {
    customer: Order["customer"];
    deliveryAddress: string;
    deliveryCity: string;
    deliveryPostalCode: string;
    notes?: string;
    paymentMethod?: PaymentMethod;
    items: CartItem[];
  }) => mockDb.createOrderFromCart(params),
  getOrders: () => mockDb.getOrders(),
  getOrdersByUser: async (userId: string) => {
    const orders = await mockDb.getOrders();
    return orders.filter((order) => order.customer.id === userId);
  },
  getInvoices: () => mockDb.getInvoices(),
  updateInvoiceStatus: (invoiceId: string, status: InvoiceStatus) =>
    mockDb.updateInvoiceStatus(invoiceId, status),
  updateOrderStatus: (orderId: string, status: Order["status"]) => mockDb.updateOrderStatus(orderId, status),
  updateDriverStatus: (orderId: string, status: Order["status"]) => mockDb.updateOrderStatus(orderId, status),
  updateDeliveryDetails: (orderId: string, details: Parameters<typeof mockDb.updateDeliveryDetails>[1]) =>
    mockDb.updateDeliveryDetails(orderId, details),
};

export async function getAdminStats() {
  const [orders, invoices] = await Promise.all([mockDb.getOrders(), mockDb.getInvoices()]);
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const pendingDeliveries = orders.filter((order) => order.status !== "delivered" && order.status !== "cancelled");

  return {
    totalOrders: orders.length,
    pendingDeliveries: pendingDeliveries.length,
    totalInvoices: invoices.length,
    totalRevenue,
  };
}

export async function getCustomerSummaries(users: LocalUser[]) {
  const orders = await mockDb.getOrders();
  return users.map((user) => {
    const userOrders = orders.filter((order) => order.customer.id === user.id);
    const totalSpent = userOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      orders: userOrders,
      totalOrders: userOrders.length,
      totalSpent,
    };
  });
}

export async function getDeliveries() {
  const orders = await mockDb.getOrders();
  return orders
    .filter((order) => order.assignedDriver || order.status !== "delivered")
    .map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      deliveryAddress: order.deliveryAddress,
      status: order.status,
      driver: order.assignedDriver,
      estimatedDelivery: order.estimatedDelivery,
      trackingNotes: order.trackingNotes,
    }));
}

export async function getInvoicesWithOrders(): Promise<
  Array<Invoice & { orderNumber: string; customerName: string; customerEmail: string }>
> {
  const [invoices, orders] = await Promise.all([mockDb.getInvoices(), mockDb.getOrders()]);
  return invoices.map((invoice) => {
    const order = orders.find((entry) => entry.id === invoice.orderId);
    return {
      ...invoice,
      orderNumber: order?.orderNumber ?? "N/A",
      customerName: order?.customer.fullName ?? "Unknown customer",
      customerEmail: order?.customer.email ?? "",
    };
  });
}

export type { Product, Order, Invoice, CartItem, PaymentMethod };
