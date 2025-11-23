import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LogOut, ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import OrdersManagement from "@/components/admin/OrdersManagement";
import DeliveriesManagement from "@/components/admin/DeliveriesManagement";
import InvoicesManagement from "@/components/admin/InvoicesManagement";
import StatsOverview from "@/components/admin/StatsOverview";
import CustomersManagement from "@/components/admin/CustomersManagement";
import ProductsManagement from "@/components/admin/ProductsManagement";
import { useAuth } from "@/contexts/AuthContext";

const Admin = () => {
  const navigate = useNavigate();
  const { user, isAdmin, signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user === null) {
      navigate("/auth");
      return;
    }
    if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have admin privileges",
        variant: "destructive",
      });
      navigate("/");
      return;
    }
    setIsLoading(false);
  }, [isAdmin, navigate, user]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading admin panel...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-background border-b sticky top-0 z-10">
        <div className="container py-4 px-4 md:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/")}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-2xl font-serif font-bold">Admin Dashboard</h1>
            </div>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8 px-4 md:px-6">
        <StatsOverview />
        
        <Tabs defaultValue="orders" className="mt-8">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="deliveries">Deliveries</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
          </TabsList>
          <TabsContent value="orders" className="mt-6">
            <OrdersManagement />
          </TabsContent>
          <TabsContent value="products" className="mt-6">
            <ProductsManagement />
          </TabsContent>
          <TabsContent value="customers" className="mt-6">
            <CustomersManagement />
          </TabsContent>
          <TabsContent value="deliveries" className="mt-6">
            <DeliveriesManagement />
          </TabsContent>
          <TabsContent value="invoices" className="mt-6">
            <InvoicesManagement />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
