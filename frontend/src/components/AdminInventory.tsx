import React, { useState } from 'react';
import { Search, Plus, Boxes, Edit3, Trash2, Check, RefreshCw, AlertCircle } from 'lucide-react';
import { Product } from '../types';

interface AdminInventoryProps {
  products: Product[];
  onRestock: (productId: string, quantity?: number) => void;
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onUpdatePrice: (productId: string, newPrice: number) => void;
  onDeleteProduct: (productId: string) => void;
}

export default function AdminInventory({
  products,
  onRestock,
  onAddProduct,
  onUpdatePrice,
  onDeleteProduct,
}: AdminInventoryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states for new product
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('Vegetables');
  const [newPrice, setNewPrice] = useState('');
  const [newUnit, setNewUnit] = useState('500g');
  const [newStock, setNewStock] = useState('50');
  const [newTag, setNewTag] = useState('Organic');
  const [newDescription, setNewDescription] = useState('');
  const [newImage, setNewImage] = useState('');

  // Editing price states
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState('');

  // Sample organic images for quick selection in the form
  const sampleImages = [
    { url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBkvGLgCgTW2DN-RufqmKGpN4e15VVdzeuESdGMXzSfhVraO-DDcU-assiealCeNhmBUSobjgmOq5MKCfkr_nvt_izBBR3vtQRV_ZlD5Rg6Vhq_tIbLC1ZSbJLbZnKCCaPX0xsDMBJLrMULLpt56XysXht4DUIU3XxKyOFn2JAS7E6hTyPug2aSlw3qrwKag9U1sAq5H5-cU1Wgh4n86HjDYw_w4_okJvzpIHo8nHrXDN8ircZpNQ5_T30mavBXtcuCH-hWgjnuI3Q', label: 'Kale / Leafy Greens' },
    { url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBSQhfa1LyxvuIGhMzZJy9nv7gADFYjJOqKnwpIILAkQ_xGBFGpi3dZCKMYg-OJ2tevMsfVmMJ74DnvXQ_MiH-FgEC7BuaB1bAsbe-NRPh7lGyEdmJD_buZTuiVtdsWpHdaZGARiA8sKMCH5PANCxYhqd_mErLaseaaPV9JXiQcUKD1I9DPGAbQOJ5CdqGDEynOYVzbJROUr0NvpVHnjfZHOlCJ7lX33futv5pfEXCS5f-KS_QEoNyYKl1tIVVadre7q2ERKWldTKM', label: 'Vine Tomatoes' },
    { url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA9uJqfQGy5fsr25Svi82VOABsHI7UvOg4-ng2PMiDlRh9F-XQStqmJq9qVI6pv3jflMvD8tbaq06lejPNQgVLp_2P-xDMTa3j5YWtP0VJ0lCdXn5nfbPE_GiPwQsWe0RVZtlaYWm9mQqgq1sug8OQmg_hEvR_HrDpbnmGTOHGWzg_TwnblCvTCwlrE57bbE2gfEn06iJYMb8ciQxr1kwVqMyxfOhV1zK_3VYYw1_F9T7dKn3eh1iCToLuMMES_bsZXe1a_6ABz_R0', label: 'Hass Avocados' },
    { url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCqDpF2qfn2VSnW-3soZlg2IM0RSFYSCgyBHPG5c8Z6Y3TbmU_WsBY97w5tkEOxDjg-LVK26gXk4QBfOsR-bGazJMzqTVvg4ugL2WW592GM4bSLjrpPPoNHdncqhI-czcEZ2m34evJvCEVUL11VROBX0ZPVE3XSQkdvXzzZQ5mC1w_bcDwC5_gJDf81porCRvlHRZXPuoGfTsejmg3N3leuWKCo9zbL0Djr3gJwf_TSr9LRSMJ0BXP79uyatQN8qGWGbWIx_HI4HHQ', label: 'Purple Cauliflower' }
  ];

  // Filters
  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'All' || p.category.toLowerCase() === selectedCategory.toLowerCase();
    const q = searchQuery.toLowerCase();
    const matchesSearch = p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPrice || !newStock) return;

    onAddProduct({
      name: newName.trim(),
      category: newCategory,
      price: parseFloat(newPrice),
      unit: newUnit,
      image: newImage || sampleImages[0].url,
      tag: newTag || undefined,
      stock: parseInt(newStock),
      maxStock: 150,
      description: newDescription.trim() || 'A fresh premium organic selection harvested from our partner farms.',
      rating: 4.8,
      reviewsCount: 15,
      nutritionalFacts: {
        calories: 32,
        fat: '0.1g',
        fiber: '1.8g',
        protein: '1.2g',
        details: 'High minerals and trace elements.'
      },
      origin: {
        farm: 'Verdant Fields Farm',
        location: 'Sonoma County, CA',
        badges: ['Certified Organic']
      }
    });

    // Reset Form
    setNewName('');
    setNewPrice('');
    setNewStock('');
    setNewDescription('');
    setNewImage('');
    setShowAddModal(false);
  };

  const startEditPrice = (product: Product) => {
    setEditingPriceId(product.id);
    setTempPrice(product.price.toFixed(2));
  };

  const saveEditedPrice = (productId: string) => {
    const parsed = parseFloat(tempPrice);
    if (!isNaN(parsed) && parsed > 0) {
      onUpdatePrice(productId, parsed);
    }
    setEditingPriceId(null);
  };

  // Helper stock style resolver
  const getStockMeterStyle = (stock: number, max: number) => {
    const pct = Math.min(100, (stock / max) * 100);
    let color = 'bg-emerald-600';
    if (stock <= 15) {
      color = 'bg-error animate-pulse';
    } else if (stock <= 40) {
      color = 'bg-amber-500';
    }
    return { pct, color };
  };

  return (
    <div className="space-y-6 text-left pb-16">
      {/* Top Banner section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display-lg text-2xl md:text-3.5xl text-primary font-bold">Crop Inventory Management</h1>
          <p className="text-on-surface-variant text-sm mt-1">Add organic harvests, alter unit pricing structures, and execute restocking runs.</p>
        </div>

        <button
          onClick={() => {
            setNewImage(sampleImages[0].url);
            setShowAddModal(true);
          }}
          className="bg-primary text-on-primary px-5 py-3 rounded-full font-bold text-xs flex items-center gap-2 shadow hover:bg-primary-container active:scale-95 transition-all w-fit shrink-0 border border-primary/20"
        >
          <Plus className="w-4 h-4 stroke-[3.5px]" />
          Add Organic Crop
        </button>
      </div>

      {/* Stats Summary Panel */}
      <section className="bg-white rounded-2xl p-4 md:p-6 border border-outline-variant/30 shadow-sm grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center md:text-left border-r border-outline-variant/20 last:border-0 pr-2">
          <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Total Crop Types</p>
          <p className="text-2xl text-primary font-bold mt-1">{products.length}</p>
        </div>
        <div className="text-center md:text-left border-r border-outline-variant/20 last:border-0 pr-2">
          <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Critical Low Items</p>
          <p className="text-2xl text-error font-bold mt-1">
            {products.filter((p) => p.stock <= 15).length}
          </p>
        </div>
        <div className="text-center md:text-left border-r border-outline-variant/20 last:border-0 pr-2">
          <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Total Storage Pieces</p>
          <p className="text-2xl text-on-surface font-bold mt-1">
            {products.reduce((acc, p) => acc + p.stock, 0)}
          </p>
        </div>
        <div className="text-center md:text-left last:border-0">
          <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Storage Capacity</p>
          <p className="text-2xl text-secondary font-bold mt-1">
            {Math.round((products.reduce((acc, p) => acc + p.stock, 0) / products.reduce((acc, p) => acc + p.maxStock, 0)) * 100)}%
          </p>
        </div>
      </section>

      {/* Filter and Search actions */}
      <section className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="w-full sm:max-w-xs relative group">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search crop item..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-outline-variant/30 rounded-full h-11 pl-9 pr-4 text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-outline-variant"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none w-full sm:w-auto">
          {['All', 'Vegetables', 'Fruits', 'Bakery', 'Dairy'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-wider transition-colors shrink-0 ${
                selectedCategory === cat
                  ? 'bg-secondary-container text-on-secondary-container shadow-sm'
                  : 'bg-white border border-outline-variant/20 text-on-surface-variant hover:bg-surface-container-low'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Inventory Grid List */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((p) => {
          const { pct, color } = getStockMeterStyle(p.stock, p.maxStock);
          const isLow = p.stock <= 15;
          const isEditingPrice = editingPriceId === p.id;

          return (
            <div
              key={p.id}
              className="bg-white rounded-[24px] p-5 border border-outline-variant/30 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative"
            >
              {isLow && (
                <span className="absolute top-4 right-4 bg-error/15 text-error text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> CRITICAL STOCK
                </span>
              )}

              {/* Product header info */}
              <div className="flex items-start gap-4">
                <img className="w-16 h-16 rounded-2xl object-cover border border-outline-variant/10 shrink-0" src={p.image} alt={p.name} />
                <div className="space-y-1 text-left">
                  <span className="text-[10px] font-bold text-on-surface-variant/80 uppercase tracking-wider">{p.category} • {p.unit}</span>
                  <h4 className="font-bold text-sm text-on-surface line-clamp-1">{p.name}</h4>
                  
                  {/* Price display / Inline editing */}
                  <div className="flex items-center gap-1.5 pt-0.5">
                    {isEditingPrice ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={tempPrice}
                          onChange={(e) => setTempPrice(e.target.value)}
                          className="w-16 h-7 bg-surface-container border border-outline-variant rounded px-1.5 text-xs font-bold text-primary"
                          autoFocus
                        />
                        <button
                          onClick={() => saveEditedPrice(p.id)}
                          className="p-1 bg-secondary text-white rounded hover:opacity-95"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-sm text-primary">${p.price.toFixed(2)}</span>
                        <button
                          onClick={() => startEditPrice(p)}
                          className="p-1 hover:bg-surface-container rounded transition-colors text-on-surface-variant"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Progress bar stock */}
              <div className="mt-5 space-y-2">
                <div className="flex justify-between items-baseline text-xs font-semibold">
                  <span className="text-on-surface-variant">Stock Level:</span>
                  <span className={isLow ? 'text-error font-bold' : 'text-on-surface font-bold'}>
                    {p.stock} / {p.maxStock} units
                  </span>
                </div>
                <div className="w-full bg-surface-container-high h-2.5 rounded-full overflow-hidden">
                  <div className={`h-2.5 rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }}></div>
                </div>
              </div>

              {/* Quick actions buttons */}
              <div className="mt-5 pt-4 border-t border-outline-variant/10 flex gap-2">
                <button
                  onClick={() => onRestock(p.id, 50)}
                  className="flex-grow bg-primary/10 hover:bg-primary text-primary hover:text-white px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1 active:scale-95 border border-primary/10"
                >
                  <RefreshCw className="w-3 h-3" /> Restock +50
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Are you sure you want to delete crop ${p.name}?`)) {
                      onDeleteProduct(p.id);
                    }
                  }}
                  className="p-2 border border-error/20 hover:bg-error hover:text-white text-error rounded-xl transition-colors active:scale-90"
                  title="Remove product"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </section>

      {/* Add New Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[2rem] p-6 md:p-8 max-w-xl w-full shadow-2xl border border-outline-variant/30 my-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-headline-md text-xl text-primary font-bold flex items-center gap-2">
                <Boxes className="text-secondary" /> Add New Organic Crop
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full hover:bg-surface-container-low text-on-surface-variant flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1">
                  <label className="block text-xs font-bold text-on-surface uppercase tracking-wider" htmlFor="crop-name">Crop Name *</label>
                  <input
                    id="crop-name"
                    type="text"
                    required
                    placeholder="e.g. Organic Swiss Chard"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full h-11 px-4 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-outline-variant"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-on-surface uppercase tracking-wider" htmlFor="crop-category">Category *</label>
                  <select
                    id="crop-category"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full h-11 px-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  >
                    <option value="Vegetables">Vegetables</option>
                    <option value="Fruits">Fruits</option>
                    <option value="Dairy">Dairy</option>
                    <option value="Bakery">Bakery</option>
                    <option value="Pantry">Pantry</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-on-surface uppercase tracking-wider" htmlFor="crop-tag">Tag Badge</label>
                  <input
                    id="crop-tag"
                    type="text"
                    placeholder="e.g. Organic, Sale -10%"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    className="w-full h-11 px-4 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-outline-variant"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-on-surface uppercase tracking-wider" htmlFor="crop-price">Price ($) *</label>
                  <input
                    id="crop-price"
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g. 4.99"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full h-11 px-4 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-outline-variant"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-on-surface uppercase tracking-wider" htmlFor="crop-unit">Unit/Size *</label>
                  <input
                    id="crop-unit"
                    type="text"
                    required
                    placeholder="e.g. 500g or 2 units"
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    className="w-full h-11 px-4 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-outline-variant"
                  />
                </div>

                <div className="space-y-1 col-span-2">
                  <label className="block text-xs font-bold text-on-surface uppercase tracking-wider" htmlFor="crop-stock">Initial Stock Level *</label>
                  <input
                    id="crop-stock"
                    type="number"
                    required
                    placeholder="e.g. 80"
                    value={newStock}
                    onChange={(e) => setNewStock(e.target.value)}
                    className="w-full h-11 px-4 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-outline-variant"
                  />
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="block text-xs font-bold text-on-surface uppercase tracking-wider" htmlFor="crop-desc">Description</label>
                  <textarea
                    id="crop-desc"
                    placeholder="Harvest detail description..."
                    rows={2}
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="w-full p-4 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-outline-variant resize-none"
                  />
                </div>

                {/* Preset image selector */}
                <div className="col-span-2 space-y-2">
                  <label className="block text-xs font-bold text-on-surface uppercase tracking-wider">Crop Preset Image</label>
                  <div className="grid grid-cols-4 gap-2">
                    {sampleImages.map((img, i) => (
                      <div
                        key={i}
                        onClick={() => setNewImage(img.url)}
                        className={`aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all relative ${
                          newImage === img.url ? 'border-primary ring-2 ring-primary/20' : 'border-transparent'
                        }`}
                        title={img.label}
                      >
                        <img className="w-full h-full object-cover" src={img.url} alt={img.label} />
                        {newImage === img.url && (
                          <div className="absolute inset-0 bg-primary/25 flex items-center justify-center">
                            <Check className="w-5 h-5 text-white stroke-[3.5px]" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 text-xs font-semibold text-on-surface-variant hover:bg-surface-container rounded-full transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-semibold bg-primary text-on-primary rounded-full hover:bg-primary-container transition-colors shadow-sm"
                >
                  Create Crop Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
