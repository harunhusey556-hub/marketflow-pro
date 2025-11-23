import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Mail, Phone, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getAllUsers } from "@/services/localAuth";
import { getCustomerSummaries } from "@/services/localData";

interface CustomerSummary {
  id: string;
  fullName: string;
  email: string;
  totalOrders: number;
  totalSpent: number;
}

const CustomersManagement = () => {
  const { t } = useTranslation();
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const users = getAllUsers();
    getCustomerSummaries(users).then((summaries) =>
      setCustomers(
        summaries.map((summary) => ({
          id: summary.id,
          fullName: summary.fullName,
          email: summary.email,
          totalOrders: summary.totalOrders,
          totalSpent: summary.totalSpent,
        })),
      ),
    );
  }, []);

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("admin.customers")}</CardTitle>
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
          {filteredCustomers.map((customer) => (
            <div key={customer.id} className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-lg">{customer.fullName}</h3>
                    <Badge variant="outline">{customer.totalOrders} orders</Badge>
                  </div>
                  <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>{customer.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>+358 400 000 000</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>Helsinki, Finland</span>
                    </div>
                  </div>
                  <div className="text-sm">
                    <span className="font-semibold">Total Spent: </span>
                    <span className="text-primary font-bold">€{customer.totalSpent.toFixed(2)}</span>
                  </div>
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
          ))}
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
