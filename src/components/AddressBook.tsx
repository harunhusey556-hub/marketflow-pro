import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, MapPin, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Address {
  id: string;
  title: string;
  address: string;
  city: string;
  postal_code: string;
}

interface AddressBookProps {
  onSelectAddress?: (address: Address) => void;
}

const AddressBook = ({ onSelectAddress }: AddressBookProps) => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newAddress, setNewAddress] = useState({ title: "", address: "", city: "", postal_code: "" });

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data } = await supabase.from("addresses").select("*").eq("user_id", session.user.id);
    setAddresses(data || []);
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase.from("addresses").insert({
      user_id: session.user.id,
      ...newAddress
    });

    if (error) {
      toast.error("Adres eklenemedi");
    } else {
      toast.success("Adres eklendi");
      setIsDialogOpen(false);
      setNewAddress({ title: "", address: "", city: "", postal_code: "" });
      fetchAddresses();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("addresses").delete().eq("id", id);
    if (!error) {
      toast.success("Adres silindi");
      fetchAddresses();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Adreslerim</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline"><Plus className="w-4 h-4 mr-2"/> Yeni Ekle</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Yeni Adres Ekle</DialogTitle></DialogHeader>
            <form onSubmit={handleAddAddress} className="space-y-4">
              <div><Label>Adres Başlığı (Örn: Ev)</Label><Input value={newAddress.title} onChange={e => setNewAddress({...newAddress, title: e.target.value})} required /></div>
              <div><Label>Adres</Label><Input value={newAddress.address} onChange={e => setNewAddress({...newAddress, address: e.target.value})} required /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Şehir</Label><Input value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} required /></div>
                <div><Label>Posta Kodu</Label><Input value={newAddress.postal_code} onChange={e => setNewAddress({...newAddress, postal_code: e.target.value})} required /></div>
              </div>
              <Button type="submit" className="w-full">Kaydet</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-3">
        {addresses.map(addr => (
          <Card key={addr.id} className={`cursor-pointer hover:border-primary ${onSelectAddress ? 'active:scale-95 transition-transform' : ''}`} onClick={() => onSelectAddress && onSelectAddress(addr)}>
            <CardContent className="p-4 flex justify-between items-start">
              <div className="flex gap-3">
                <MapPin className="w-5 h-5 text-primary mt-1" />
                <div>
                  <p className="font-semibold">{addr.title}</p>
                  <p className="text-sm text-muted-foreground">{addr.address}</p>
                  <p className="text-sm text-muted-foreground">{addr.city}, {addr.postal_code}</p>
                </div>
              </div>
              {!onSelectAddress && (
                <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleDelete(addr.id); }}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AddressBook;