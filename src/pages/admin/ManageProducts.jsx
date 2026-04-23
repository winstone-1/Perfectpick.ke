import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  X, 
  Package, 
  Image as ImageIcon,
  ChevronLeft,
  Loader2,
  Video,
  Tag,
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
  const [products, setProducts]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [imageFiles, setImageFiles]   = useState([]);
  const [videoFiles, setVideoFiles]   = useState([]);
  const [bannerFile, setBannerFile]   = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'bags',
    images: [],
    videos: [],
    featured: false,
    discount: 0,
    discountLabel: '',
    discountBanner: '',
    variants: [{ name: 'Default', stock: 10 }],
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/products');
      setProducts(data.data || []);
    } catch {
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const resetForm = () => {
    setFormData({
      name: '', description: '', price: '', category: 'bags',
      images: [], videos: [], featured: false,
      discount: 0, discountLabel: '', discountBanner: '',
      variants: [{ name: 'Default', stock: 10 }],
    });
    setImageFiles([]);
    setVideoFiles([]);
    setBannerFile(null);
    setEditingProduct(null);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price,
      category: product.category,
      images: product.images || [],
      videos: product.videos || [],
      featured: product.featured || false,
      discount: product.discount || 0,
      discountLabel: product.discountLabel || '',
      discountBanner: product.discountBanner || '',
      variants: product.variants?.length > 0 ? product.variants : [{ name: 'Default', stock: 10 }],
    });
    setImageFiles([]);
    setVideoFiles([]);
    setBannerFile(null);
    setIsDialogOpen(true);
  };

  const handleAddVariant    = () => setFormData({ ...formData, variants: [...formData.variants, { name: '', stock: 0 }] });
  const handleRemoveVariant = (i) => setFormData({ ...formData, variants: formData.variants.filter((_, idx) => idx !== i) });
  const handleVariantChange = (i, field, value) => {
    const v = [...formData.variants];
    v[i][field] = field === 'stock' ? parseInt(value) || 0 : value;
    setFormData({ ...formData, variants: v });
  };

  const removeExistingImage = (i) => setFormData(p => ({ ...p, images: p.images.filter((_, idx) => idx !== i) }));
  const removeExistingVideo = (i) => setFormData(p => ({ ...p, videos: p.videos.filter((_, idx) => idx !== i) }));
  const removeNewImage      = (i) => setImageFiles(p => p.filter((_, idx) => idx !== i));
  const removeNewVideo      = (i) => setVideoFiles(p => p.filter((_, idx) => idx !== i));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.category) {
      return toast.error('Please fill in required fields');
    }
    setFormLoading(true);
    try {
      const data = new FormData();
      data.append('name',          formData.name);
      data.append('description',   formData.description);
      data.append('price',         formData.price);
      data.append('category',      formData.category);
      data.append('variants',      JSON.stringify(formData.variants));
      data.append('featured',      formData.featured);
      data.append('discount',      formData.discount);
      data.append('discountLabel', formData.discountLabel);
      data.append('images',        JSON.stringify(formData.images));
      imageFiles.forEach(f => data.append('images', f));

      const config = { headers: { 'Content-Type': 'multipart/form-data' } };

      let savedProduct;
      if (editingProduct) {
        const res = await api.put(`/admin/products/${editingProduct._id}`, data, config);
        savedProduct = res.data.data;
        toast.success('Product updated');
      } else {
        const res = await api.post('/admin/products', data, config);
        savedProduct = res.data.data;
        toast.success('Product created');
      }

      // Upload videos if any
      if (videoFiles.length > 0) {
        const vData = new FormData();
        vData.append('videos', JSON.stringify(formData.videos));
        videoFiles.forEach(f => vData.append('videos', f));
        await api.put(`/admin/products/${savedProduct._id}/videos`, vData, config);
      }

      // Upload banner if any
      if (bannerFile) {
        const bData = new FormData();
        bData.append('discountBanner', bannerFile);
        bData.append('discount',      formData.discount);
        bData.append('discountLabel', formData.discountLabel);
        await api.put(`/admin/products/${savedProduct._id}/banner`, bData, config);
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
    if (!window.confirm('Delete this product?')) return;
    try {
      await api.delete(`/admin/products/${id}`);
      toast.success('Product deleted');
      fetchProducts();
    } catch {
      toast.error('Failed to delete product');
    }
  };

  const PriceDisplay = (price) => new Intl.NumberFormat('en-KE', {
    style: 'currency', currency: 'KES', minimumFractionDigits: 0
  }).format(price);

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
                {/* LEFT COLUMN */}
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
                      {['bags','shoes','jewelry','gifts','accessories','clothes'].map(c => (
                        <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-primary">Base Price (KES) *</label>
                    <Input type="number" placeholder="5000" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="h-12 rounded-xl" />
                  </div>

                  {/* Product Images */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-primary">Product Images</label>
                    <div className="grid grid-cols-4 gap-3">
                      {formData.images.map((url, i) => (
                        <div key={`ei-${i}`} className="relative aspect-square rounded-xl overflow-hidden border border-border/10 group">
                          <img src={url} className="w-full h-full object-cover" />
                          <button type="button" onClick={() => removeExistingImage(i)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                      {imageFiles.map((file, i) => (
                        <div key={`ni-${i}`} className="relative aspect-square rounded-xl overflow-hidden border border-border/10 group">
                          <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                          <button type="button" onClick={() => removeNewImage(i)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <X size={12} />
                          </button>
                          <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-[8px] text-white p-1 text-center">New</div>
                        </div>
                      ))}
                      {(formData.images.length + imageFiles.length) < 5 && (
                        <label className="aspect-square border-2 border-dashed border-border/20 rounded-xl cursor-pointer hover:bg-surface transition-all flex flex-col items-center justify-center gap-1">
                          <Plus size={20} className="text-muted-foreground" />
                          <span className="text-[8px] font-bold text-muted-foreground uppercase">Add</span>
                          <input type="file" className="hidden" multiple accept="image/*" onChange={(e) => setImageFiles(p => [...p, ...Array.from(e.target.files)])} />
                        </label>
                      )}
                    </div>
                    <p className="text-[9px] text-muted-foreground italic">Up to 5 images. First one is primary.</p>
                  </div>

                  {/* Videos */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                      <Video size={12} /> Hero Background Videos
                    </label>
                    <div className="space-y-2">
                      {formData.videos.map((url, i) => (
                        <div key={`ev-${i}`} className="flex items-center gap-3 p-3 bg-surface rounded-xl border border-border/10 group">
                          <Video size={16} className="text-primary flex-shrink-0" />
                          <span className="text-xs text-muted-foreground truncate flex-1">Video {i + 1}</span>
                          <button type="button" onClick={() => removeExistingVideo(i)} className="text-red-500 hover:text-red-600">
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                      {videoFiles.map((file, i) => (
                        <div key={`nv-${i}`} className="flex items-center gap-3 p-3 bg-surface rounded-xl border border-primary/20 group">
                          <Video size={16} className="text-primary flex-shrink-0" />
                          <span className="text-xs text-dark font-bold truncate flex-1">{file.name}</span>
                          <span className="text-[9px] text-primary font-bold uppercase">New</span>
                          <button type="button" onClick={() => removeNewVideo(i)} className="text-red-500 hover:text-red-600">
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                      {(formData.videos.length + videoFiles.length) < 3 && (
                        <label className="flex items-center gap-3 p-3 border-2 border-dashed border-border/20 rounded-xl cursor-pointer hover:bg-surface transition-all">
                          <Video size={16} className="text-muted-foreground" />
                          <span className="text-xs font-bold text-muted-foreground">Upload video (mp4, mov, webm — max 100MB)</span>
                          <input type="file" className="hidden" accept="video/mp4,video/mov,video/webm" onChange={(e) => { if (e.target.files[0]) setVideoFiles(p => [...p, e.target.files[0]]); }} />
                        </label>
                      )}
                    </div>
                    <p className="text-[9px] text-muted-foreground italic">Up to 3 videos. Auto-played muted in landing page hero.</p>
                  </div>
                </div>

                {/* RIGHT COLUMN */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-primary">Description</label>
                    <textarea
                      className="w-full h-40 rounded-xl border border-border/20 p-4 text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                      placeholder="Tell the story of this piece..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>

                  {/* Featured toggle */}
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
                      <span className="block text-[10px] text-muted-foreground font-normal uppercase tracking-tight">Show in hero carousel and new arrivals</span>
                    </label>
                  </div>

                  {/* Discount Section */}
                  <div className="space-y-4 p-5 bg-surface rounded-2xl border border-border/5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                      <Tag size={12} /> Sale / Discount Banner
                    </label>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Discount %</label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          placeholder="e.g. 20"
                          value={formData.discount}
                          onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                          className="h-11 rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Sale Label</label>
                        <Input
                          placeholder="e.g. Weekend Sale"
                          value={formData.discountLabel}
                          onChange={(e) => setFormData({ ...formData, discountLabel: e.target.value })}
                          className="h-11 rounded-xl"
                        />
                      </div>
                    </div>

                    {/* Banner image */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Banner Image</label>
                      {(bannerFile || formData.discountBanner) ? (
                        <div className="relative rounded-xl overflow-hidden border border-border/10 group">
                          <img
                            src={bannerFile ? URL.createObjectURL(bannerFile) : formData.discountBanner}
                            className="w-full h-32 object-cover"
                          />
                          {bannerFile && (
                            <span className="absolute top-2 left-2 bg-primary text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">New</span>
                          )}
                          <button
                            type="button"
                            onClick={() => { setBannerFile(null); setFormData(p => ({ ...p, discountBanner: '' })); }}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <label className="flex items-center gap-3 p-4 border-2 border-dashed border-border/20 rounded-xl cursor-pointer hover:bg-white transition-all">
                          <ImageIcon size={16} className="text-muted-foreground" />
                          <span className="text-xs font-bold text-muted-foreground">Upload sale banner image (1200×600 ideal)</span>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => { if (e.target.files[0]) setBannerFile(e.target.files[0]); }}
                          />
                        </label>
                      )}
                      <p className="text-[9px] text-muted-foreground italic">Shows as one of 3 sale banners on the landing page.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Variants */}
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

      {/* Product Table */}
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
                  <th className="pb-4">Discount</th>
                  <th className="pb-4">Stock</th>
                  <th className="pb-4 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/10">
                {products.map((product) => {
                  const firstImage = product.images?.[0] || product.image;
                  const totalStock = (product.variants || []).reduce((a, b) => a + b.stock, 0);
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
                            {firstImage
                              ? <img src={firstImage} className="h-full w-full object-cover" />
                              : <ImageIcon size={20} className="text-medium opacity-20" />
                            }
                          </div>
                          <div className="flex flex-col">
                            <span className="font-serif font-bold text-dark">{product.name}</span>
                            <div className="flex items-center gap-2 mt-0.5">
                              {product.featured && <span className="text-[9px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full uppercase">Featured</span>}
                              {product.videos?.length > 0 && <span className="text-[9px] bg-blue-50 text-blue-600 font-bold px-2 py-0.5 rounded-full uppercase flex items-center gap-1"><Video size={8} /> {product.videos.length} video{product.videos.length > 1 ? 's' : ''}</span>}
                            </div>
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
                        {product.discount > 0 ? (
                          <span className="text-[10px] bg-red-50 text-red-600 font-black px-2 py-1 rounded-lg">
                            -{product.discount}%
                          </span>
                        ) : (
                          <span className="text-[10px] text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="py-6">
                        <span className={cn(
                          "font-bold text-sm px-3 py-1 rounded-lg",
                          totalStock < 5 ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"
                        )}>
                          {totalStock} Units
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