import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Mail, Phone, MapPin } from "lucide-react";

interface Customer {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  created_at: string;
}

interface CustomerStats {
  totalOrders: number;
  totalSpent: number;
}

const CustomersManagement = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerStats, setCustomerStats] = useState<Record<string, CustomerStats>>({});
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching customers:", error);
      return;
    }

    setCustomers(data || []);
    
    // Fetch order stats for each customer
    if (data) {
      const statsPromises = data.map(async (customer) => {
        const { data: orders } = await supabase
          .from("orders")
          .select("total_amount")
          .eq("user_id", customer.id);

        return {
          customerId: customer.id,
          stats: {
            totalOrders: orders?.length || 0,
            totalSpent: orders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0,
          },
        };
      });

      const results = await Promise.all(statsPromises);
      const statsMap: Record<string, CustomerStats> = {};
      results.forEach((result) => {
        statsMap[result.customerId] = result.stats;
      });
      setCustomerStats(statsMap);
    }
  };

  const filteredCustomers = customers.filter((customer) =>
    customer.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Management</CardTitle>
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search customers by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredCustomers.map((customer) => {
            const stats = customerStats[customer.id];
            return (
              <div
                key={customer.id}
                className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg">{customer.full_name || "No name"}</h3>
                      <Badge variant="outline">
                        {stats?.totalOrders || 0} orders
                      </Badge>
                    </div>
                    <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <span>{customer.email}</span>
                      </div>
                      {customer.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          <span>{customer.phone}</span>
                        </div>
                      )}
                      {customer.address && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>
                            {customer.address}, {customer.city} {customer.postal_code}
                          </span>
                        </div>
                      )}
                    </div>
                    {stats && (
                      <div className="text-sm">
                        <span className="font-semibold">Total Spent: </span>
                        <span className="text-primary font-bold">${stats.totalSpent.toFixed(2)}</span>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Member since {new Date(customer.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button variant="outline" size="sm">
                      View Orders
                    </Button>
                    <Button variant="outline" size="sm">
                      Contact
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
          {filteredCustomers.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              {searchQuery ? "No customers found matching your search" : "No customers yet"}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomersManagement;
