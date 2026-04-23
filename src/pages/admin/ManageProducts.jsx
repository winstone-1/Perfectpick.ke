import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  X, 
  Package, 
  Image as ImageIcon,
  ChevronLeft,
  Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '../../components/ui/dialog';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [imageFile, setImageFile] = useState([]);

  // ✅ Missing formData state - this was causing the crash
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'bags',
    images: [],
    variants: [{ name: 'Default', stock: 10 }],
    featured: false
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/products');
      setProducts(data.data || []);
    } catch (error) {
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: 'bags',
      images: [],
      variants: [{ name: 'Default', stock: 10 }],
      featured: false
    });
    setImageFile([]);
    setEditingProduct(null);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      images: product.images || (product.image ? [product.image] : []),
      variants: product.variants?.length > 0 ? product.variants : [{ name: 'Default', stock: 10 }],
      featured: product.featured || false
    });
    setImageFile([]);
    setIsDialogOpen(true);
  };

  const handleAddVariant = () => {
    setFormData({ 
      ...formData, 
      variants: [...formData.variants, { name: '', stock: 0 }] 
    });
  };

  const handleRemoveVariant = (index) => {
    const newVariants = formData.variants.filter((_, i) => i !== index);
    setFormData({ ...formData, variants: newVariants });
  };

  const handleVariantChange = (index, field, value) => {
    const newVariants = [...formData.variants];
    newVariants[index][field] = field === 'stock' ? parseInt(value) || 0 : value;
    setFormData({ ...formData, variants: newVariants });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFile(prev => [...prev, ...files]);
  };

  const removeSelectedFile = (index) => {
    setImageFile(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.category) {
      return toast.error('Please fill in required fields');
    }

    setFormLoading(true);
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description);
      data.append('price', formData.price);
      data.append('category', formData.category);
      data.append('variants', JSON.stringify(formData.variants));
      data.append('featured', formData.featured);
      
      // Append existing images that weren't removed
      data.append('images', JSON.stringify(formData.images));
      
      // Append new files
      imageFile.forEach(file => {
        data.append('images', file);
      });

      const config = {
        headers: { 'Content-Type': 'multipart/form-data' }
      };

      if (editingProduct) {
        await api.put(`/admin/products/${editingProduct._id}`, data, config);
        toast.success('Product updated');
      } else {
        await api.post('/admin/products', data, config);
        toast.success('Product created');
      }
      setIsDialogOpen(false);
      resetForm();
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/admin/products/${id}`);
      toast.success('Product deleted');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const PriceDisplay = (price) => new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 0 }).format(price);

  return (
    <div className="container mx-auto px-4 py-12 lg:py-20 space-y-12">
      <Link to="/admin" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group">
        <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </Link>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-serif font-black text-dark">Manage Products</h1>
          <p className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">Total: {products.length} Products</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="btn-primary rounded-2xl h-14 px-8 text-lg font-black shadow-lg">
              <Plus className="mr-2" /> Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl overflow-y-auto max-h-[90vh] rounded-[2.5rem] border-none shadow-2xl p-0">
            <div className="sticky top-0 z-10 bg-surface px-10 py-6 border-b border-border/10 flex justify-between items-center">
              <DialogTitle className="font-serif font-black text-2xl text-dark">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </DialogTitle>
              <button onClick={() => setIsDialogOpen(false)} className="h-8 w-8 rounded-full hover:bg-white/50 flex items-center justify-center transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-10 space-y-8 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-primary">Product Name *</label>
                    <Input placeholder="e.g. Vintage Leather Tote" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="h-12 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-primary">Category *</label>
                    <select 
                      className="w-full h-12 rounded-xl border border-border/20 px-4 text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      {['bags', 'shoes', 'jewelry', 'gifts', 'accessories', 'clothes'].map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-primary">Base Price (KES) *</label>
                    <Input type="number" placeholder="5000" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="h-12 rounded-xl" />
                  </div>
                  
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-primary">Product Images</label>
                    
                    <div className="grid grid-cols-4 gap-4">
                      {/* Existing Images */}
                      {formData.images.map((url, i) => (
                        <div key={`existing-${i}`} className="relative aspect-square rounded-xl overflow-hidden border border-border/10 group">
                          <img src={url} className="w-full h-full object-cover" />
                          <button 
                            type="button" 
                            onClick={() => removeExistingImage(i)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                      
                      {/* Selected Files */}
                      {imageFile.map((file, i) => (
                        <div key={`new-${i}`} className="relative aspect-square rounded-xl overflow-hidden border border-border/10 group bg-surface">
                          <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                          <button 
                            type="button" 
                            onClick={() => removeSelectedFile(i)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={12} />
                          </button>
                          <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-[8px] text-white p-1 text-center truncate">
                            New
                          </div>
                        </div>
                      ))}

                      {/* Add Button */}
                      {(formData.images.length + imageFile.length) < 5 && (
                        <label className="aspect-square border-2 border-dashed border-border/20 rounded-xl cursor-pointer hover:bg-surface transition-all flex flex-col items-center justify-center gap-1">
                          <Plus size={20} className="text-muted-foreground" />
                          <span className="text-[8px] font-bold text-muted-foreground uppercase">Add</span>
                          <input 
                            type="file" 
                            className="hidden" 
                            multiple
                            accept="image/*"
                            onChange={handleFileChange}
                          />
                        </label>
                      )}
                    </div>
                    <p className="text-[9px] text-muted-foreground italic">Up to 5 images. The first one will be used as primary.</p>
                  </div>
                </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-primary">Description</label>
                      <textarea 
                        className="w-full h-56 rounded-xl border border-border/20 p-4 text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                        placeholder="Tell the story of this piece..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      />
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-surface rounded-2xl border border-border/5">
                      <input 
                        type="checkbox" 
                        id="featured"
                        checked={formData.featured}
                        onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                        className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                      />
                      <label htmlFor="featured" className="text-sm font-bold text-dark cursor-pointer select-none">
                        Feature on homepage
                        <span className="block text-[10px] text-muted-foreground font-normal uppercase tracking-tight">Display in hero carousel and new arrivals strip</span>
                      </label>
                    </div>
                  </div>
                </div>

              {/* Variants Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black uppercase tracking-widest text-primary">Variants & Stock</label>
                  <Button type="button" variant="ghost" size="sm" onClick={handleAddVariant} className="text-primary hover:text-primary-hover font-bold">
                    <Plus size={16} className="mr-1" /> Add Variant
                  </Button>
                </div>
                <div className="space-y-3">
                  {formData.variants.map((v, i) => (
                    <div key={i} className="flex gap-4 items-center">
                      <Input placeholder="Name (e.g. Small / Brown)" value={v.name} onChange={(e) => handleVariantChange(i, 'name', e.target.value)} className="h-11 rounded-xl" />
                      <Input type="number" placeholder="Stock" value={v.stock} onChange={(e) => handleVariantChange(i, 'stock', e.target.value)} className="w-32 h-11 rounded-xl" />
                      <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveVariant(i)} className="text-red-500 hover:text-red-600 hover:bg-red-50" disabled={formData.variants.length === 1}>
                        <Trash2 size={18} />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <DialogFooter className="pt-6">
                <Button className="btn-primary w-full h-14 rounded-2xl text-lg font-black" disabled={formLoading}>
                  {formLoading ? <Loader2 className="animate-spin" /> : (editingProduct ? 'Save Changes' : 'Create Product')}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Product List */}
      <div className="space-y-4">
        {loading ? (
          Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)
        ) : products.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b border-border/10">
                <tr>
                  <th className="pb-4 pl-4">Product</th>
                  <th className="pb-4">Category</th>
                  <th className="pb-4">Price</th>
                  <th className="pb-4">Stock</th>
                  <th className="pb-4 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/10">
                {products.map((product) => {
                  const firstImage = product.images?.[0] || product.image;
                  return (
                    <motion.tr 
                      key={product._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="group hover:bg-white/50 transition-colors"
                    >
                      <td className="py-6 pl-4">
                        <div className="flex items-center gap-4">
                          <div className="h-14 w-14 bg-surface rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center">
                            {firstImage ? <img src={firstImage} className="h-full w-full object-cover" /> : <ImageIcon size={20} className="text-medium opacity-20" />}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-serif font-bold text-dark">{product.name}</span>
                            {product.images?.length > 1 && (
                              <span className="text-[9px] text-muted-foreground font-bold">+{product.images.length - 1} more images</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-6">
                        <Badge variant="outline" className="rounded-full bg-white border-border/10 uppercase tracking-widest text-[9px] font-bold">
                          {product.category}
                        </Badge>
                      </td>
                      <td className="py-6 font-bold text-dark">{PriceDisplay(product.price)}</td>
                      <td className="py-6">
                        <span className={cn(
                          "font-bold text-sm px-3 py-1 rounded-lg",
                          (product.variants || []).reduce((a, b) => a + b.stock, 0) < 5 ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"
                        )}>
                          {(product.variants || []).reduce((a, b) => a + b.stock, 0)} Units
                        </span>
                      </td>
                      <td className="py-6 pr-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" className="hover:bg-white rounded-xl" onClick={() => handleEdit(product)}>
                            <Pencil size={18} />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50 rounded-xl" onClick={() => handleDelete(product._id)}>
                            <Trash2 size={18} />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-32 flex flex-col items-center justify-center text-center opacity-40 italic">
            <Package size={64} className="mb-4" />
            <p>Your collection is currently empty.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageProducts;