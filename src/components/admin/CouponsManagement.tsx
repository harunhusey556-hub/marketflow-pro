import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

const CouponsManagement = () => {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [newCoupon, setNewCoupon] = useState({
    code: "",
    discount_type: "percentage",
    discount_value: "",
    min_order_amount: "0"
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    const { data } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
    setCoupons(data || []);
  };

  const createCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("coupons").insert({
      ...newCoupon,
      discount_value: parseFloat(newCoupon.discount_value),
      min_order_amount: parseFloat(newCoupon.min_order_amount)
    });

    if (error) {
      toast.error("Kupon oluşturulamadı: " + error.message);
    } else {
      toast.success("Kupon oluşturuldu");
      fetchCoupons();
      setNewCoupon({ code: "", discount_type: "percentage", discount_value: "", min_order_amount: "0" });
    }
  };

  const deleteCoupon = async (id: string) => {
    await supabase.from("coupons").delete().eq("id", id);
    toast.success("Kupon silindi");
    fetchCoupons();
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader><CardTitle>Yeni Kupon Oluştur</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={createCoupon} className="space-y-4">
            <div>
              <Label>Kupon Kodu</Label>
              <Input 
                placeholder="YAZ2024" 
                value={newCoupon.code} 
                onChange={e => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})} 
                required 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>İndirim Tipi</Label>
                <Select 
                  value={newCoupon.discount_type} 
                  onValueChange={v => setNewCoupon({...newCoupon, discount_type: v})}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Yüzde (%)</SelectItem>
                    <SelectItem value="fixed">Sabit Tutar (₺)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Değer</Label>
                <Input 
                  type="number" 
                  placeholder="10" 
                  value={newCoupon.discount_value} 
                  onChange={e => setNewCoupon({...newCoupon, discount_value: e.target.value})} 
                  required 
                />
              </div>
            </div>
            <div>
              <Label>Min. Sepet Tutarı</Label>
              <Input 
                type="number" 
                value={newCoupon.min_order_amount} 
                onChange={e => setNewCoupon({...newCoupon, min_order_amount: e.target.value})} 
              />
            </div>
            <Button type="submit" className="w-full"><Plus className="mr-2 h-4 w-4"/> Kupon Ekle</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Aktif Kuponlar</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kod</TableHead>
                <TableHead>İndirim</TableHead>
                <TableHead>Min. Tutar</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.map(coupon => (
                <TableRow key={coupon.id}>
                  <TableCell className="font-medium">{coupon.code}</TableCell>
                  <TableCell>
                    {coupon.discount_type === 'percentage' ? `%${coupon.discount_value}` : `₺${coupon.discount_value}`}
                  </TableCell>
                  <TableCell>₺{coupon.min_order_amount}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => deleteCoupon(coupon.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default CouponsManagement;