import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Package, DollarSign, Image as ImageIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getProductImage } from "@/lib/utils";
import { localData } from "@/services/localData";
import type { Product } from "@/services/mockDb";

const categories = ["Fruits", "Vegetables", "Meat", "Dairy", "Beverages", "Bakery", "Poultry"];

const ProductsManagement = () => {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "Fruits",
    price: "",
    unit: "kg",
    image_url: "",
    description: "",
    stock: "0",
    is_active: true,
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const data = await localData.getProducts();
    setProducts(data);
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      unit: product.unit,
      image_url: product.image_url ?? product.image,
      description: product.description ?? "",
      stock: product.stock.toString(),
      is_active: product.isActive !== false,
    });
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      category: "Fruits",
      price: "",
      unit: "kg",
      image_url: "",
      description: "",
      stock: "0",
      is_active: true,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const payload = {
      name: formData.name,
      category: formData.category,
      price: parseFloat(formData.price),
      unit: formData.unit,
      image: formData.image_url,
      image_url: formData.image_url,
      description: formData.description,
      stock: parseInt(formData.stock, 10),
      isActive: formData.is_active,
    };

    if (editingProduct) {
      await localData.updateProduct(editingProduct.id, payload);
      toast.success(t("common.success"));
    } else {
      await localData.createProduct(payload);
      toast.success(t("common.success"));
    }

    setIsDialogOpen(false);
    fetchProducts();
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    await localData.deleteProduct(id);
    toast.success(t("common.success"));
    fetchProducts();
  };

  return (
    <>
      <Card className="border-none shadow-none bg-transparent">
        <CardHeader className="px-0 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl">{t("admin.products")}</CardTitle>
            <CardDescription>Manage your product inventory and pricing.</CardDescription>
          </div>
          <Button onClick={openCreateDialog} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        </CardHeader>
        <CardContent className="px-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="group bg-card border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                  {(() => {
                    const img = getProductImage(product);
                    return img ? (
                      <img src={img} alt={product.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <ImageIcon className="h-10 w-10" />
                      </div>
                    );
                  })()}
                  <div className="absolute top-2 right-2">
                    <Badge variant={product.isActive ? "default" : "secondary"} className={product.isActive ? "bg-green-500 hover:bg-green-600" : ""}>
                      {product.isActive ? "Active" : "Draft"}
                    </Badge>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg line-clamp-1">{product.name}</h3>
                      <Badge variant="outline" className="mt-1 text-xs font-normal text-muted-foreground">
                        {product.category}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-lg text-primary">€{product.price.toFixed(2)}</span>
                      <span className="text-xs text-muted-foreground block">/ {product.unit}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t">
                    <Package className="h-4 w-4" />
                    <span>
                      Stock:{" "}
                      <span className={product.stock < 10 ? "text-red-500 font-bold" : "text-foreground"}>{product.stock}</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <Button variant="secondary" size="sm" onClick={() => openEditDialog(product)}>
                      <Edit className="h-3 w-3 mr-2" /> Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => deleteProduct(product.id)}
                    >
                      <Trash2 className="h-3 w-3 mr-2" /> Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Edit Product" : "Create New Product"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Product Name</Label>
                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Price (€)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    className="pl-9"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Unit (e.g. kg, pcs)</Label>
                <Input value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Stock Quantity</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Image URL</Label>
              <Input
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label className="text-base">Active Status</Label>
                <p className="text-sm text-muted-foreground">Visible to customers in the store</p>
              </div>
              <Switch checked={formData.is_active} onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })} />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{editingProduct ? "Update Product" : "Create Product"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProductsManagement;
