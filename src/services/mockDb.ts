import { nanoid } from "nanoid";

import bananasImage from "@/assets/products/bananas.jpg";
import redApplesImage from "@/assets/products/red-apples.jpg";
import orangesImage from "@/assets/products/oranges.jpg";
import strawberriesImage from "@/assets/products/strawberries.jpg";
import broccoliImage from "@/assets/products/broccoli.jpg";
import carrotsImage from "@/assets/products/carrots.jpg";
import cucumbersImage from "@/assets/products/cucumbers.jpg";
import lettuceImage from "@/assets/products/lettuce.jpg";
import freshMilkImage from "@/assets/products/fresh-milk.jpg";
import greekYogurtImage from "@/assets/products/greek-yogurt.jpg";
import butterImage from "@/assets/products/butter.jpg";
import organicEggsImage from "@/assets/products/organic-eggs.jpg";
import freshBreadImage from "@/assets/products/fresh-bread.jpg";
import chickenFilletImage from "@/assets/products/chicken-fillet.jpg";
import beefTenderloinImage from "@/assets/products/beef-tenderloin.jpg";
import heroMarketImage from "@/assets/hero-market.jpg";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "out_for_delivery"
  | "delivering"
  | "delivered"
  | "cancelled";

export type DeliveryStatus =
  | "pending"
  | "assigned"
  | "picked_up"
  | "in_transit"
  | "delivered"
  | "failed";

export type PaymentMethod = "card" | "cash" | "invoice";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  category: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  image_url?: string;
  category: string;
  unit: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface DriverAssignment {
  id: string;
  name: string;
  phone: string;
  status: DeliveryStatus;
  assignedAt: string;
}

export interface OrderItemAdjustment {
  id: string;
  itemId: string;
  oldQty: number;
  newQty: number;
  reason?: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productCategory: string;
  unitPrice: number;
  orderedQty: number;
  deliveredQty: number;
}

export interface OrderCustomer {
  id: string;
  fullName: string;
  email: string;
  phone: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  totalAmount: number;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryPostalCode: string;
  notes?: string;
  estimatedDelivery?: string;
  trackingNotes?: string;
  paymentMethod?: PaymentMethod;
  createdAt: string;
  customer: OrderCustomer;
  items: OrderItem[];
  assignedDriver?: DriverAssignment;
  adjustments: OrderItemAdjustment[];
  invoiceId?: string;
}

export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled";

export interface Invoice {
  id: string;
  orderId: string;
  invoiceNumber: string;
  issuedAt: string;
  totalAmount: number;
  status: InvoiceStatus;
  dueDate?: string;
  paidDate?: string;
  payload: Record<string, unknown>;
}

interface MockDbShape {
  meta: {
    orderCounter: number;
    invoiceCounter: number;
  };
  cart: CartItem[];
  products: Product[];
  orders: Order[];
  invoices: Invoice[];
}

const STORAGE_KEY = "marketflow-lite-db";
const LATENCY_MS = 280;

const sampleProducts: Product[] = [
  {
    id: "prd-apples",
    name: "Organic Honeycrisp Apples",
    description: "Crisp organic apples sourced from local Finnish farms.",
    price: 4.9,
    stock: 120,
    image: redApplesImage,
    image_url: redApplesImage,
    category: "produce",
    unit: "kg",
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "prd-salmon",
    name: "Nordic Salmon Fillet",
    description: "Fresh salmon fillets delivered daily from Lapland.",
    price: 14.5,
    stock: 60,
    image: heroMarketImage,
    image_url: heroMarketImage,
    category: "seafood",
    unit: "kg",
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "prd-oatmilk",
    name: "Barista Oat Milk",
    description: "Creamy oat milk, perfect for cappuccinos and lattes.",
    price: 2.4,
    stock: 200,
    image: freshMilkImage,
    image_url: freshMilkImage,
    category: "dairy",
    unit: "l",
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "prd-bananas",
    name: "Fresh Bananas",
    description: "Sweet and ripe bananas, perfect for smoothies or snacks.",
    price: 2.1,
    stock: 150,
    image: bananasImage,
    image_url: bananasImage,
    category: "produce",
    unit: "kg",
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "prd-oranges",
    name: "Juicy Oranges",
    description: "Citrusy oranges packed with vitamin C.",
    price: 3.2,
    stock: 140,
    image: orangesImage,
    image_url: orangesImage,
    category: "produce",
    unit: "kg",
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "prd-strawberries",
    name: "Strawberries",
    description: "Sweet berries ideal for desserts.",
    price: 4.5,
    stock: 90,
    image: strawberriesImage,
    image_url: strawberriesImage,
    category: "produce",
    unit: "box",
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "prd-broccoli",
    name: "Broccoli Crowns",
    description: "Fresh green broccoli crowns rich in fiber.",
    price: 2.8,
    stock: 110,
    image: broccoliImage,
    image_url: broccoliImage,
    category: "produce",
    unit: "kg",
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "prd-carrots",
    name: "Organic Carrots",
    description: "Crunchy carrots grown with minimal pesticides.",
    price: 1.9,
    stock: 160,
    image: carrotsImage,
    image_url: carrotsImage,
    category: "produce",
    unit: "kg",
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "prd-cucumbers",
    name: "Refreshing Cucumbers",
    description: "Crisp cucumbers for salads and snacks.",
    price: 2.0,
    stock: 130,
    image: cucumbersImage,
    image_url: cucumbersImage,
    category: "produce",
    unit: "kg",
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "prd-lettuce",
    name: "Crispy Lettuce",
    description: "Tender lettuce heads for sandwiches or bowls.",
    price: 1.7,
    stock: 100,
    image: lettuceImage,
    image_url: lettuceImage,
    category: "produce",
    unit: "head",
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "prd-greek-yogurt",
    name: "Greek Yogurt",
    description: "Thick and creamy Greek yogurt.",
    price: 3.5,
    stock: 80,
    image: greekYogurtImage,
    image_url: greekYogurtImage,
    category: "dairy",
    unit: "500g",
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "prd-butter",
    name: "Creamy Butter",
    description: "Fresh butter ideal for baking and cooking.",
    price: 2.6,
    stock: 90,
    image: butterImage,
    image_url: butterImage,
    category: "dairy",
    unit: "250g",
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "prd-eggs",
    name: "Organic Eggs",
    description: "Free-range organic eggs from local farms.",
    price: 3.9,
    stock: 200,
    image: organicEggsImage,
    image_url: organicEggsImage,
    category: "dairy",
    unit: "dozen",
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "prd-fresh-bread",
    name: "Fresh Bread",
    description: "Artisan bread baked daily.",
    price: 3.2,
    stock: 70,
    image: freshBreadImage,
    image_url: freshBreadImage,
    category: "bakery",
    unit: "loaf",
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "prd-chicken-fillet",
    name: "Chicken Fillet",
    description: "Lean chicken fillet great for grilling.",
    price: 6.5,
    stock: 90,
    image: chickenFilletImage,
    image_url: chickenFilletImage,
    category: "meat",
    unit: "kg",
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "prd-beef-tenderloin",
    name: "Beef Tenderloin",
    description: "Premium beef tenderloin for special occasions.",
    price: 18.2,
    stock: 40,
    image: beefTenderloinImage,
    image_url: beefTenderloinImage,
    category: "meat",
    unit: "kg",
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

const defaultOrder: Order = {
  id: "ord-1001",
  orderNumber: "MFL-1001",
  status: "out_for_delivery",
  totalAmount: 42.6,
  deliveryAddress: "Itamerenkatu 5",
  deliveryCity: "Helsinki",
  deliveryPostalCode: "00180",
  notes: "Ring the bell twice",
  estimatedDelivery: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
  trackingNotes: "Driver en route",
  paymentMethod: "card",
  createdAt: new Date().toISOString(),
  customer: {
    id: "cust-1",
    fullName: "Linnea Korpela",
    email: "linnea@example.com",
    phone: "+358 50 123 4567",
  },
  items: [
    {
      id: "item-1",
      productId: "prd-apples",
      productName: "Organic Honeycrisp Apples",
      productCategory: "produce",
      unitPrice: 4.9,
      orderedQty: 5,
      deliveredQty: 5,
    },
    {
      id: "item-2",
      productId: "prd-salmon",
      productName: "Nordic Salmon Fillet",
      productCategory: "seafood",
      unitPrice: 14.5,
      orderedQty: 2,
      deliveredQty: 2,
    },
  ],
  assignedDriver: {
    id: "drv-1",
    name: "Mikko Laine",
    phone: "+358 44 555 1234",
    status: "in_transit",
    assignedAt: new Date().toISOString(),
  },
  adjustments: [],
};

const defaultDb: MockDbShape = {
  meta: {
    orderCounter: 1002,
    invoiceCounter: 2000,
  },
  cart: [],
  products: sampleProducts,
  orders: [defaultOrder],
  invoices: [],
};

let memoryState: MockDbShape = deepCopy(defaultDb);

function deepCopy<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

class MockDbService {
  private readDb(): MockDbShape {
    if (typeof window === "undefined") {
      return memoryState;
    }

    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      this.writeDb(defaultDb);
      return deepCopy(defaultDb);
    }

    try {
      const parsed = JSON.parse(raw);
      return this.hydrateShape(parsed);
    } catch (error) {
      console.warn("[mockDb] Failed to parse storage, resetting", error);
      this.writeDb(defaultDb);
      return deepCopy(defaultDb);
    }
  }

  private hydrateShape(input: Partial<MockDbShape>): MockDbShape {
    return {
      meta: {
        orderCounter: input.meta?.orderCounter ?? defaultDb.meta.orderCounter,
        invoiceCounter: input.meta?.invoiceCounter ?? defaultDb.meta.invoiceCounter,
      },
      cart: Array.isArray(input.cart) ? input.cart : [],
      products: Array.isArray(input.products) ? input.products : deepCopy(defaultDb.products),
      orders: Array.isArray(input.orders) ? input.orders : [],
      invoices: Array.isArray(input.invoices) ? input.invoices : [],
    };
  }

  private writeDb(db: MockDbShape) {
    memoryState = deepCopy(db);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryState));
    }
  }

  private async withLatency<T>(callback: () => T): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      setTimeout(() => {
        try {
          resolve(callback());
        } catch (error) {
          reject(error);
        }
      }, LATENCY_MS);
    });
  }

  private recalculateOrderTotal(order: Order) {
    order.totalAmount = Number(
      order.items.reduce((sum, item) => {
        const effectiveQty = item.deliveredQty ?? item.orderedQty;
        return sum + effectiveQty * item.unitPrice;
      }, 0).toFixed(2),
    );
  }

  private generateInvoiceForOrder(db: MockDbShape, order: Order) {
    if (order.invoiceId) {
      return;
    }

    const invoiceId = `inv-${nanoid(8)}`;
    const invoiceNumber = `INV-${db.meta.invoiceCounter}`;
    db.meta.invoiceCounter += 1;

    const invoice: Invoice = {
      id: invoiceId,
      orderId: order.id,
      invoiceNumber,
      issuedAt: new Date().toISOString(),
      totalAmount: order.totalAmount,
      status: "draft",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      payload: {
        customer: order.customer,
        items: order.items,
        orderNumber: order.orderNumber,
      },
    };

    db.invoices.push(invoice);
    order.invoiceId = invoiceId;
  }

  async getProducts(): Promise<Product[]> {
    return this.withLatency(() => deepCopy(this.readDb().products));
  }

  async updateProductStock(productId: string, stock: number): Promise<Product> {
    return this.withLatency(() => {
      const db = this.readDb();
      const product = db.products.find((p) => p.id === productId);
      if (!product) {
        throw new Error("Product not found");
      }
      product.stock = stock;
      this.writeDb(db);
      return deepCopy(product);
    });
  }

  getCartSnapshot(): CartItem[] {
    return deepCopy(this.readDb().cart);
  }

  saveCart(cart: CartItem[]) {
    const db = this.readDb();
    db.cart = deepCopy(cart);
    this.writeDb(db);
  }

  async createOrderFromCart(params: {
    customer: OrderCustomer;
    deliveryAddress: string;
    deliveryCity: string;
    deliveryPostalCode: string;
    notes?: string;
    paymentMethod?: PaymentMethod;
    items: CartItem[];
  }): Promise<Order> {
    return this.withLatency(() => {
      const db = this.readDb();
      const orderId = `ord-${nanoid(8)}`;
      const orderNumber = `MFL-${db.meta.orderCounter}`;
      db.meta.orderCounter += 1;

      const items: OrderItem[] = params.items.map((item) => ({
        id: `itm-${nanoid(8)}`,
        productId: item.id,
        productName: item.name,
        productCategory: item.category,
        unitPrice: item.price,
        orderedQty: item.quantity,
        deliveredQty: item.quantity,
      }));

      const totalAmount = items.reduce((sum, item) => sum + item.unitPrice * item.orderedQty, 0);

      const order: Order = {
        id: orderId,
        orderNumber,
        status: "pending",
        totalAmount: Number(totalAmount.toFixed(2)),
        deliveryAddress: params.deliveryAddress,
        deliveryCity: params.deliveryCity,
        deliveryPostalCode: params.deliveryPostalCode,
        notes: params.notes,
        paymentMethod: params.paymentMethod ?? "card",
        createdAt: new Date().toISOString(),
        customer: params.customer,
        items,
        adjustments: [],
      };

      db.orders.unshift(order);
      db.cart = [];
      this.writeDb(db);
      return deepCopy(order);
    });
  }

  async getOrders(): Promise<Order[]> {
    return this.withLatency(() => deepCopy(this.readDb().orders));
  }

  async getOrderById(orderId: string): Promise<Order | undefined> {
    return this.withLatency(() => {
      const db = this.readDb();
      const order = db.orders.find((o) => o.id === orderId);
      return order ? deepCopy(order) : undefined;
    });
  }

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
    return this.withLatency(() => {
      const db = this.readDb();
      const order = db.orders.find((o) => o.id === orderId);
      if (!order) {
        throw new Error("Order not found");
      }
      order.status = status;
      if (status === "delivered") {
        this.recalculateOrderTotal(order);
        this.generateInvoiceForOrder(db, order);
      }
      this.writeDb(db);
      return deepCopy(order);
    });
  }

  async assignDriver(
    orderId: string,
    driver: Pick<DriverAssignment, "name" | "phone">,
  ): Promise<Order> {
    return this.withLatency(() => {
      const db = this.readDb();
      const order = db.orders.find((o) => o.id === orderId);
      if (!order) {
        throw new Error("Order not found");
      }
      order.assignedDriver = {
        id: `drv-${nanoid(8)}`,
        name: driver.name,
        phone: driver.phone,
        status: "assigned",
        assignedAt: new Date().toISOString(),
      };
      this.writeDb(db);
      return deepCopy(order);
    });
  }

  async updateDeliveryDetails(
    orderId: string,
    details: {
      driverName?: string;
      driverPhone?: string;
      estimatedDelivery?: string;
      trackingNotes?: string;
    },
  ): Promise<Order> {
    return this.withLatency(() => {
      const db = this.readDb();
      const order = db.orders.find((o) => o.id === orderId);
      if (!order) {
        throw new Error("Order not found");
      }

      if (!order.assignedDriver) {
        order.assignedDriver = {
          id: `drv-${nanoid(8)}`,
          name: details.driverName || "Driver",
          phone: details.driverPhone || "",
          status: "assigned",
          assignedAt: new Date().toISOString(),
        };
      } else {
        order.assignedDriver.name = details.driverName ?? order.assignedDriver.name;
        order.assignedDriver.phone = details.driverPhone ?? order.assignedDriver.phone;
      }

      order.estimatedDelivery = details.estimatedDelivery ?? order.estimatedDelivery;
      order.trackingNotes = details.trackingNotes ?? order.trackingNotes;
      this.writeDb(db);
      return deepCopy(order);
    });
  }

  async updateDriverStatus(orderId: string, status: DeliveryStatus): Promise<Order> {
    return this.withLatency(() => {
      const db = this.readDb();
      const order = db.orders.find((o) => o.id === orderId);
      if (!order || !order.assignedDriver) {
        throw new Error("Order or driver assignment not found");
      }
      order.assignedDriver.status = status;
      this.writeDb(db);
      return deepCopy(order);
    });
  }

  async adjustOrderItems(params: {
    orderId: string;
    adjustments: Array<{ itemId: string; deliveredQty: number; reason?: string }>;
    markDelivered?: boolean;
  }): Promise<Order> {
    return this.withLatency(() => {
      const db = this.readDb();
      const order = db.orders.find((o) => o.id === params.orderId);
      if (!order) {
        throw new Error("Order not found");
      }

      params.adjustments.forEach(({ itemId, deliveredQty, reason }) => {
        const item = order.items.find((i) => i.id === itemId);
        if (!item) {
          return;
        }
        const normalizedQty = Math.max(0, deliveredQty);
        const prev = item.deliveredQty ?? item.orderedQty;
        item.deliveredQty = normalizedQty;
        order.adjustments.push({
          id: `adj-${nanoid(8)}`,
          itemId,
          oldQty: prev,
          newQty: normalizedQty,
          reason,
          updatedAt: new Date().toISOString(),
        });
      });

      this.recalculateOrderTotal(order);

      if (params.markDelivered) {
        order.status = "delivered";
        this.generateInvoiceForOrder(db, order);
      }

      this.writeDb(db);
      return deepCopy(order);
    });
  }

  async getDriverOrders(driverName?: string): Promise<Order[]> {
    return this.withLatency(() => {
      const db = this.readDb();
      const filtered = db.orders.filter((order) =>
        driverName
          ? order.assignedDriver?.name.toLowerCase() === driverName.toLowerCase()
          : Boolean(order.assignedDriver),
      );
      return deepCopy(filtered);
    });
  }

  async getInvoices(): Promise<Invoice[]> {
    return this.withLatency(() => deepCopy(this.readDb().invoices));
  }

  async updateInvoiceStatus(invoiceId: string, status: InvoiceStatus): Promise<Invoice> {
    return this.withLatency(() => {
      const db = this.readDb();
      const invoice = db.invoices.find((entry) => entry.id === invoiceId);
      if (!invoice) {
        throw new Error("Invoice not found");
      }
      invoice.status = status;
      if (status === "paid") {
        invoice.paidDate = new Date().toISOString();
      }
      this.writeDb(db);
      return deepCopy(invoice);
    });
  }

  async createProduct(data: Omit<Product, "id" | "createdAt" | "updatedAt">): Promise<Product> {
    return this.withLatency(() => {
      const db = this.readDb();
      const product: Product = {
        ...data,
        id: `prd-${nanoid(8)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      db.products.unshift(product);
      this.writeDb(db);
      return deepCopy(product);
    });
  }

  async updateProduct(productId: string, data: Partial<Omit<Product, "id">>): Promise<Product> {
    return this.withLatency(() => {
      const db = this.readDb();
      const product = db.products.find((entry) => entry.id === productId);
      if (!product) {
        throw new Error("Product not found");
      }
      Object.assign(product, data, { updatedAt: new Date().toISOString() });
      this.writeDb(db);
      return deepCopy(product);
    });
  }

  async deleteProduct(productId: string): Promise<void> {
    return this.withLatency(() => {
      const db = this.readDb();
      db.products = db.products.filter((product) => product.id !== productId);
      this.writeDb(db);
    });
  }
}

export const mockDb = new MockDbService();

