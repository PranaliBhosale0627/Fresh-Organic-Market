import React, { useState } from 'react';
import { ChefHat, Clock, Flame, Utensils, CheckCircle2, ShoppingCart, Plus, Check, ArrowRight, Sparkles, BookOpen } from 'lucide-react';
import { Product } from '../types';

interface RecipeIngredient {
  productId: string;
  productName: string;
  quantityNeeded: number;
  displayAmount: string;
}

interface Recipe {
  id: string;
  name: string;
  image: string;
  description: string;
  prepTime: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  calories: number;
  servings: number;
  category: 'Salad' | 'Warm Meal' | 'Breakfast' | 'Appetizer';
  ingredients: RecipeIngredient[];
  steps: string[];
}

interface RecipesViewProps {
  products: Product[];
  onAddToCart: (product: Product, quantity?: number) => void;
  onNavigate: (view: string) => void;
  onCompleteQuest: (questId: string) => void;
}

export default function RecipesView({
  products,
  onAddToCart,
  onNavigate,
  onCompleteQuest,
}: RecipesViewProps) {
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [activeCategory, setActiveCategory] = useState<'All' | 'Salad' | 'Warm Meal' | 'Breakfast' | 'Appetizer'>('All');
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [addSuccessMsg, setAddSuccessMsg] = useState<string | null>(null);

  // Define our 4 mouth-watering organic recipes tied directly to our database
  const RECIPES: Recipe[] = [
    {
      id: 'rec-avocado-toast',
      name: 'Verdant Heirloom Avocado Toast',
      image: 'https://images.unsplash.com/photo-1541532713592-79a0317b6b77?auto=format&fit=crop&q=80&w=800',
      description: 'Slow-fermented wild yeast sourdough toast layered with creamy Hass avocado mash, sweet ruby heirloom tomatoes, and freshly cut microgreens.',
      prepTime: '10 mins',
      difficulty: 'Easy',
      calories: 340,
      servings: 2,
      category: 'Breakfast',
      ingredients: [
        { productId: 'prod-avocados', productName: 'Organic Avocados', quantityNeeded: 1, displayAmount: '1 bunch (2 avocados)' },
        { productId: 'prod-sourdough', productName: 'Artisan Sourdough Batard', quantityNeeded: 1, displayAmount: '1 sourdough batard loaf' },
        { productId: 'prod-cherry-tomatoes', productName: 'Ruby Heirloom Cherry Tomatoes', quantityNeeded: 1, displayAmount: '100g cherry tomatoes (halved)' },
        { productId: 'prod-microgreens', productName: 'Living Microgreens Mix', quantityNeeded: 1, displayAmount: 'A generous pinch of living microgreens' }
      ],
      steps: [
        'Slice the artisan sourdough batard into thick slices and toast until beautifully golden and crisp.',
        'Cut open the Hass avocados, discard the pits, scoop the rich flesh into a small wooden bowl, and mash gently with a fork. Season with a pinch of sea salt, black pepper, and fresh lemon juice.',
        'Spread the avocado mash evenly over the warm toasted sourdough.',
        'Top with halved ruby cherry tomatoes and a handful of freshly clipped living microgreens. Drizzle with cold-pressed olive oil if desired.'
      ]
    },
    {
      id: 'rec-cauliflower-mash',
      name: 'Creamy Garlic & Curly Kale Cauliflower Mash',
      image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=800',
      description: 'A comforting low-carb alternative to traditional mashed potatoes, featuring steamed heirloom purple cauliflower folded with sautéed organic kale and grass-fed cream.',
      prepTime: '20 mins',
      difficulty: 'Medium',
      calories: 220,
      servings: 3,
      category: 'Warm Meal',
      ingredients: [
        { productId: 'prod-cauliflower', productName: 'Purple Cauliflower', quantityNeeded: 1, displayAmount: '1 head of Heirloom Purple Cauliflower' },
        { productId: 'prod-kale', productName: 'Organic Curly Kale', quantityNeeded: 1, displayAmount: '150g fresh curly kale leaves' },
        { productId: 'prod-milk', productName: 'Grass-Fed Whole Milk', quantityNeeded: 1, displayAmount: '1/3 cup warm whole milk' }
      ],
      steps: [
        'Wash the purple cauliflower and chop into small florets. Steam for 12-15 minutes until extremely tender.',
        'While cauliflower steams, remove tough ribs from the kale leaves and chop finely. Sauté in a pan with a splash of olive oil and minced garlic until bright green and tender.',
        'Transfer the hot cauliflower to a blender or food processor. Add warm grass-fed whole milk, a touch of butter, sea salt, and black pepper. Blend until perfectly smooth and creamy.',
        'Gently fold the sautéed curly kale into the purple cauliflower mash to create a beautiful, vibrantly contrasted dish. Serve warm.'
      ]
    },
    {
      id: 'rec-asparagus-medley',
      name: 'Summer Harvest Asparagus & Spinach Medley',
      image: 'https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?auto=format&fit=crop&q=80&w=800',
      description: 'A light, antioxidant-rich pan-roasted medley featuring crisp green spears of baby asparagus, sweet bell peppers, and tender baby spinach wilted to perfection.',
      prepTime: '15 mins',
      difficulty: 'Easy',
      calories: 180,
      servings: 2,
      category: 'Salad',
      ingredients: [
        { productId: 'prod-asparagus', productName: 'Baby Asparagus', quantityNeeded: 1, displayAmount: '1 bundle (250g) Baby Asparagus' },
        { productId: 'prod-spinach', productName: 'Baby Spinach', quantityNeeded: 1, displayAmount: '100g triple-washed Baby Spinach' },
        { productId: 'prod-bellpeppers', productName: 'Mixed Bell Peppers', quantityNeeded: 1, displayAmount: '1 bell pepper, sliced into strips' },
        { productId: 'prod-carrots', productName: 'Bunch of Carrots', quantityNeeded: 1, displayAmount: '1 sweet carrot, thinly julienned' }
      ],
      steps: [
        'Snap off the woody ends of the baby asparagus and cut the spears into 2-inch pieces.',
        'Heat olive oil in a large heavy skillet over medium-high heat. Add the asparagus and julienned carrots; cook for 4-5 minutes until crisp-tender.',
        'Toss in the mixed bell pepper strips and sauté for an additional 2-3 minutes.',
        'Turn off the heat, add the baby spinach, and toss gently until the leaves wilt from the residual heat. Season with a squeeze of fresh lemon juice, sea salt, and cracked black pepper.'
      ]
    },
    {
      id: 'rec-ruby-salad',
      name: 'Vibrant Ruby Cherry Tomato & Microgreen Bowl',
      image: 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&q=80&w=800',
      description: 'A farm-fresh salad boasting bursting heirloom cherry tomatoes, raw sweet carrots, and dynamic live soil microgreens tossed in a light zesty lemon vinaigrette.',
      prepTime: '10 mins',
      difficulty: 'Easy',
      calories: 140,
      servings: 2,
      category: 'Salad',
      ingredients: [
        { productId: 'prod-cherry-tomatoes', productName: 'Ruby Heirloom Cherry Tomatoes', quantityNeeded: 1, displayAmount: '200g cherry tomatoes' },
        { productId: 'prod-microgreens', productName: 'Living Microgreens Mix', quantityNeeded: 1, displayAmount: '1 container (100g) Living Microgreens' },
        { productId: 'prod-carrots', productName: 'Bunch of Carrots', quantityNeeded: 1, displayAmount: '2 medium sweet carrots (shaved)' }
      ],
      steps: [
        'Slice the ruby cherry tomatoes in half and place them in a wide wooden salad bowl.',
        'Use a vegetable peeler to shave the carrots into thin, elegant ribbons.',
        'Gently harvest and add the fresh living microgreens to the bowl.',
        'Drizzle with olive oil and fresh lemon juice, toss delicately to preserve the microgreens, and top with toasted pumpkin seeds or feta if desired.'
      ]
    }
  ];

  // Filters recipes
  const filteredRecipes = RECIPES.filter((r) => activeCategory === 'All' || r.category === activeCategory);

  const handleOpenRecipeDetail = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    // Select all ingredients by default
    setSelectedIngredients(recipe.ingredients.map(ing => ing.productId));
  };

  const toggleIngredientSelection = (productId: string) => {
    setSelectedIngredients(prev =>
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  const handleAddIngredientsToCart = () => {
    if (!selectedRecipe) return;

    let addedCount = 0;
    selectedRecipe.ingredients.forEach((ing) => {
      if (selectedIngredients.includes(ing.productId)) {
        const prod = products.find((p) => p.id === ing.productId);
        if (prod && prod.stock > 0) {
          onAddToCart(prod, 1);
          addedCount++;
        }
      }
    });

    if (addedCount > 0) {
      // Trigger quest completion!
      onCompleteQuest('quest-recipes');
      
      setAddSuccessMsg(`Successfully gathered ${addedCount} farm-fresh ingredients and added them to your cart!`);
      setTimeout(() => {
        setAddSuccessMsg(null);
        setSelectedRecipe(null);
      }, 3000);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 mb-24 text-left">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display-lg text-2xl md:text-3.5xl text-primary font-bold flex items-center gap-2">
            <ChefHat className="w-8 h-8 text-secondary" /> Farmhouse Cook Assistant
          </h1>
          <p className="text-on-surface-variant text-sm mt-1">
            Browse seasonal, healthy chef-crafted organic recipes and instantly shop all required fresh ingredients in one click.
          </p>
        </div>

        {/* Categories filters */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none shrink-0">
          {['All', 'Salad', 'Warm Meal', 'Breakfast'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat as any)}
              className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all shrink-0 ${
                activeCategory === cat
                  ? 'bg-secondary-container text-on-secondary-container shadow-sm border border-secondary/25'
                  : 'bg-white border border-outline-variant/20 text-on-surface-variant hover:bg-surface-container-low'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of recipes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filteredRecipes.map((recipe) => {
          // Check how many ingredients are in stock
          const ingredientsInStock = recipe.ingredients.filter(ing => {
            const p = products.find(p => p.id === ing.productId);
            return p && p.stock > 0;
          }).length;

          return (
            <div
              key={recipe.id}
              onClick={() => handleOpenRecipeDetail(recipe)}
              className="bg-white rounded-[32px] overflow-hidden border border-outline-variant/30 hover:border-primary/20 hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col justify-between"
            >
              <div>
                {/* Image */}
                <div className="relative h-56 overflow-hidden">
                  <img
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    src={recipe.image}
                    alt={recipe.name}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"></div>
                  
                  <span className="absolute bottom-4 left-4 bg-tertiary-fixed text-on-tertiary-fixed-variant text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-tertiary-fixed-dim/30">
                    {recipe.category}
                  </span>

                  <div className="absolute top-4 right-4 flex gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-[10px] font-bold uppercase tracking-wider">
                    <Clock className="w-3.5 h-3.5 mr-1 text-secondary" /> {recipe.prepTime}
                  </div>
                </div>

                {/* Info */}
                <div className="p-6 space-y-3">
                  <h3 className="font-bold text-lg md:text-xl text-primary group-hover:text-primary-container transition-colors line-clamp-1">
                    {recipe.name}
                  </h3>
                  <p className="text-on-surface-variant text-xs leading-relaxed line-clamp-2">
                    {recipe.description}
                  </p>

                  {/* Highlights info block */}
                  <div className="flex gap-4 text-xs font-semibold text-on-surface-variant pt-2 border-t border-outline-variant/10">
                    <div className="flex items-center gap-1">
                      <Flame className="w-4 h-4 text-secondary" />
                      <span>{recipe.calories} kcal</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Utensils className="w-4 h-4 text-primary" />
                      <span>{recipe.servings} Servings</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Sparkles className="w-4 h-4 text-tertiary" />
                      <span>{recipe.difficulty}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer row with ingredient availability */}
              <div className="bg-surface-container-low px-6 py-4 flex items-center justify-between border-t border-outline-variant/25">
                <span className="text-[11px] font-bold text-primary uppercase tracking-wider">
                  {ingredientsInStock} / {recipe.ingredients.length} Ingredients available
                </span>
                <span className="text-xs font-bold text-primary group-hover:translate-x-1.5 transition-transform flex items-center gap-1">
                  View Recipe <ArrowRight className="w-3.5 h-3.5 stroke-[2.5px]" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recipe Detail Fullscreen Modal Drawer */}
      {selectedRecipe && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[2.5rem] max-w-2xl w-full shadow-2xl border border-outline-variant/30 overflow-hidden my-8 max-h-[90vh] flex flex-col animate-fade-in">
            
            {/* Header image and overlay */}
            <div className="relative h-60 shrink-0">
              <img className="w-full h-full object-cover" src={selectedRecipe.image} alt={selectedRecipe.name} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              
              <button
                onClick={() => setSelectedRecipe(null)}
                className="absolute top-4 right-4 w-9 h-9 bg-black/40 backdrop-blur-md text-white hover:bg-black/60 rounded-full flex items-center justify-center font-bold"
              >
                ✕
              </button>

              <div className="absolute bottom-6 px-6 md:px-8 text-left">
                <span className="bg-secondary text-white text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-widest border border-white/20">
                  {selectedRecipe.category}
                </span>
                <h2 className="text-white font-display text-xl md:text-2xl font-bold mt-2">
                  {selectedRecipe.name}
                </h2>
              </div>
            </div>

            {/* Scrollable contents */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
              
              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 bg-surface-container rounded-2xl p-4 text-center font-bold text-xs">
                <div>
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-wider mb-0.5">Prep Time</p>
                  <p className="text-primary text-sm flex items-center justify-center gap-1">
                    <Clock className="w-4 h-4 text-secondary" /> {selectedRecipe.prepTime}
                  </p>
                </div>
                <div className="border-x border-outline-variant/30">
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-wider mb-0.5">Calorie Density</p>
                  <p className="text-primary text-sm flex items-center justify-center gap-1">
                    <Flame className="w-4 h-4 text-secondary" /> {selectedRecipe.calories} kcal
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-wider mb-0.5">Yield Size</p>
                  <p className="text-primary text-sm flex items-center justify-center gap-1">
                    <Utensils className="w-4 h-4 text-primary" /> {selectedRecipe.servings} Servings
                  </p>
                </div>
              </div>

              {/* Recipe description */}
              <p className="text-on-surface-variant text-xs md:text-sm leading-relaxed border-b border-outline-variant/10 pb-4">
                {selectedRecipe.description}
              </p>

              {/* Ingredients Shop Checklist */}
              <div className="space-y-3">
                <div className="flex justify-between items-baseline">
                  <h4 className="font-bold text-sm text-primary uppercase tracking-wider">
                    Required Harvest Ingredients
                  </h4>
                  <span className="text-[10px] text-on-surface-variant font-bold">
                    Check items to add to cart
                  </span>
                </div>

                <div className="space-y-2">
                  {selectedRecipe.ingredients.map((ing) => {
                    const prod = products.find((p) => p.id === ing.productId);
                    const isInStock = prod && prod.stock > 0;
                    const isSelected = selectedIngredients.includes(ing.productId);

                    return (
                      <div
                        key={ing.productId}
                        onClick={() => isInStock && toggleIngredientSelection(ing.productId)}
                        className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all select-none ${
                          !isInStock
                            ? 'bg-neutral-50 opacity-50 border-neutral-200 cursor-not-allowed'
                            : isSelected
                            ? 'bg-primary-fixed/20 border-primary shadow-sm cursor-pointer'
                            : 'bg-white border-outline-variant/30 hover:border-outline-variant cursor-pointer'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                            !isInStock
                              ? 'border-neutral-300'
                              : isSelected
                              ? 'bg-primary border-primary text-white'
                              : 'border-outline-variant'
                          }`}>
                            {isSelected && isInStock && <Check className="w-3.5 h-3.5 stroke-[3px]" />}
                          </div>

                          <div className="text-left">
                            <p className="font-bold text-xs text-on-surface">{ing.displayAmount}</p>
                            <p className="text-[10px] text-on-surface-variant font-medium">
                              Product: {ing.productName}
                            </p>
                          </div>
                        </div>

                        {/* Price / Stock status */}
                        <div className="text-right">
                          {prod ? (
                            <>
                              <p className="font-bold text-xs text-primary">${prod.price.toFixed(2)}</p>
                              <p className={`text-[9px] font-bold uppercase tracking-wider ${
                                isInStock ? 'text-emerald-700' : 'text-error'
                              }`}>
                                {isInStock ? `In Stock (${prod.stock})` : 'Out of Stock'}
                              </p>
                            </>
                          ) : (
                            <p className="text-[10px] text-error font-bold">Unavailable</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Prep Steps List */}
              <div className="space-y-4 pt-4 border-t border-outline-variant/10">
                <h4 className="font-bold text-sm text-primary uppercase tracking-wider">
                  Preparation Steps
                </h4>
                <ol className="space-y-3">
                  {selectedRecipe.steps.map((step, index) => (
                    <li key={index} className="flex gap-3 text-xs md:text-sm text-on-surface-variant leading-relaxed">
                      <span className="font-bold text-secondary text-sm bg-secondary-container/50 w-6 h-6 rounded-full flex items-center justify-center shrink-0">
                        {index + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* Bottom Actions banner */}
            <div className="bg-surface-container border-t border-outline-variant/30 px-6 py-4 shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {addSuccessMsg ? (
                <div className="w-full bg-emerald-50 border border-emerald-200 p-3 rounded-2xl flex items-center gap-2 text-emerald-800 text-xs font-bold justify-center">
                  <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600" />
                  {addSuccessMsg}
                </div>
              ) : (
                <>
                  <div className="text-left">
                    <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Shopping cart summary</p>
                    <p className="text-sm font-bold text-primary">
                      {selectedIngredients.length} ingredients selected
                    </p>
                  </div>

                  <button
                    onClick={handleAddIngredientsToCart}
                    disabled={selectedIngredients.length === 0}
                    className="bg-primary text-on-primary px-6 py-3.5 rounded-full font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow hover:bg-primary-container disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 duration-100"
                  >
                    <ShoppingCart className="w-4 h-4" /> Gather ingredients
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
