import { Product, Order, Customer } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-kale',
    name: 'Organic Curly Kale',
    category: 'Vegetables',
    price: 3.99,
    unit: '500g',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBkvGLgCgTW2DN-RufqmKGpN4e15VVdzeuESdGMXzSfhVraO-DDcU-assiealCeNhmBUSobjgmOq5MKCfkr_nvt_izBBR3vtQRV_ZlD5Rg6Vhq_tIbLC1ZSbJLbZnKCCaPX0xsDMBJLrMULLpt56XysXht4DUIU3XxKyOFn2JAS7E6hTyPug2aSlw3qrwKag9U1sAq5H5-cU1Wgh4n86HjDYw_w4_okJvzpIHo8nHrXDN8ircZpNQ5_T30mavBXtcuCH-hWgjnuI3Q',
    tag: 'Organic',
    stock: 12,
    maxStock: 100,
    description: 'Fresh organic curly kale with deep green leaves and dew drops. Hand-harvested daily for peak nutrient density and pristine taste.',
    rating: 4.8,
    reviewsCount: 340,
    nutritionalFacts: {
      calories: 49,
      fat: '0.9g',
      fiber: '3.6g',
      protein: '4.3g',
      details: 'Supercharged with vitamins A, K, and C, manganese, and powerful antioxidants.'
    },
    origin: {
      farm: 'Verdant Fields Farm',
      location: 'Sonoma County, CA',
      badges: ['Certified Organic', 'Biodynamic Soil']
    }
  },
  {
    id: 'prod-vine-tomatoes',
    name: 'Vine-Ripened Tomatoes',
    category: 'Vegetables',
    price: 5.50,
    unit: '400g',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBSQhfa1LyxvuIGhMzZJy9nv7gADFYjJOqKnwpIILAkQ_xGBFGpi3dZCKMYg-OJ2tevMsfVmMJ74DnvXQ_MiH-FgEC7BuaB1bAsbe-NRPh7lGyEdmJD_buZTuiVtdsWpHdaZGARiA8sKMCH5PANCxYhqd_mErLaseaaPV9JXiQcUKD1I9DPGAbQOJ5CdqGDEynOYVzbJROUr0NvpVHnjfZHOlCJ7lX33futv5pfEXCS5f-KS_QEoNyYKl1tIVVadre7q2ERKWldTKM',
    tag: 'Pesticide Free',
    stock: 84,
    maxStock: 120,
    description: 'Lush, vine-attached cluster tomatoes with perfectly balanced acidity and sweetness. Gently sun-ripened under natural conditions.',
    rating: 4.7,
    reviewsCount: 180,
    nutritionalFacts: {
      calories: 22,
      fat: '0.2g',
      fiber: '1.5g',
      protein: '1.1g',
      details: 'Excellent source of lycopene, vitamin C, potassium, and folate.'
    },
    origin: {
      farm: 'Red Hills Organics',
      location: 'Napa Valley, CA',
      badges: ['Pesticide Free', 'Water Conservation']
    }
  },
  {
    id: 'prod-avocados',
    name: 'Organic Avocados',
    category: 'Fruits',
    price: 4.99,
    unit: 'bunch (2 pcs)',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA9uJqfQGy5fsr25Svi82VOABsHI7UvOg4-ng2PMiDlRh9F-XQStqmJq9qVI6pv3jflMvD8tbaq06lejPNQgVLp_2P-xDMTa3j5YWtP0VJ0lCdXn5nfbPE_GiPwQsWe0RVZtlaYWm9mQqgq1sug8OQmg_hEvR_HrDpbnmGTOHGWzg_TwnblCvTCwlrE57bbE2gfEn06iJYMb8ciQxr1kwVqMyxfOhV1zK_3VYYw1_F9T7dKn3eh1iCToLuMMES_bsZXe1a_6ABz_R0',
    tag: 'Sale -20%',
    originalPrice: 6.25,
    stock: 14,
    maxStock: 80,
    description: 'Naturally ripened Hass avocados from the fertile valleys of Michoacán. Creamy texture, smooth skin, and rich buttery flavor.',
    rating: 4.9,
    reviewsCount: 1200,
    nutritionalFacts: {
      calories: 160,
      fat: '15g',
      fiber: '7g',
      protein: '2g',
      details: 'Abundant in monounsaturated heart-healthy fats, vitamin E, potassium, and B-complex vitamins.'
    },
    origin: {
      farm: 'Verde Valley Farms',
      location: 'Sonoma County, CA',
      badges: ['Certified Regenerative', 'Hand-Picked Daily']
    }
  },
  {
    id: 'prod-asparagus',
    name: 'Baby Asparagus',
    category: 'Vegetables',
    price: 6.75,
    unit: '250g',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDlzUuV7w_ojajaepARMnJsUsK_BSLfmleD43qmH2cO99k8As5xBrUJBdwUI9u_1Zm5ZRIzoIy2iNGd5wt-vWUPJdaMjX1DehpD8I6AwU6hkhCoqerd2SayetWnyMuj_Dt4qO7hqETt_jto-GmHu9PaEna5ooimsO498vUMTnJ1FbCv-8_8mEdQmUtgK9XIqDXbcsp2bMc28puzB50sqJfuY6gtcn4-KkXhnPlPX22kR3hUUhWtU1n2XId9-VO--vVQHWVeiHM-RlM',
    tag: 'Local',
    stock: 30,
    maxStock: 80,
    description: 'Crisp, tender green spears of baby asparagus. Tied with rustic twine, perfect for grilling, roasting, or steaming lightly.',
    rating: 4.6,
    reviewsCount: 95,
    nutritionalFacts: {
      calories: 20,
      fat: '0.1g',
      fiber: '2.1g',
      protein: '2.2g',
      details: 'High in folic acid, selenium, and vitamins K, A, and C.'
    },
    origin: {
      farm: 'Marin Greenhouses',
      location: 'Marin County, CA',
      badges: ['Local Sourced', 'Carbon Neutral']
    }
  },
  {
    id: 'prod-carrots',
    name: 'Bunch of Carrots',
    category: 'Vegetables',
    price: 2.49,
    unit: '1kg',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAfO0YiOTaq7exWFXQLjtO87fKK7hkcK2HgnwszlLO59NQAjuYbgWQZyTl-iY57Q1an7W3eRruhw6o5ljJ-DakNEbJ0ltKYQYu4YcxSPaVCZqOFOyojJ74QEvUsZg5Q6YeQDSwGft05PUdozUXWsdgxogY_B4xdIuRbBtbO7E_f9hmxLtN7tLtGvpkk-5VUln_2LlNK_le_zpRE01MYEHWDC5Uxsul5w94uuZVJ55V_-Iky4jwcwgd-9tWurNKFnYyF2eoeXen2i5w',
    tag: 'Organic',
    stock: 60,
    maxStock: 150,
    description: 'Earthy, vibrant orange carrots with leafy green tops still attached. Highly sweet, crisp, and freshly unearthed from organic soils.',
    rating: 4.8,
    reviewsCount: 210,
    nutritionalFacts: {
      calories: 41,
      fat: '0.2g',
      fiber: '2.8g',
      protein: '0.9g',
      details: 'Loaded with beta-carotene, antioxidants, and dietary fibers.'
    },
    origin: {
      farm: 'Sunsoil Root Farms',
      location: 'Sacramento Valley, CA',
      badges: ['Certified Organic', 'No Synthetic Sprays']
    }
  },
  {
    id: 'prod-cauliflower',
    name: 'Purple Cauliflower',
    category: 'Vegetables',
    price: 4.95,
    unit: '1 unit',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCqDpF2qfn2VSnW-3soZlg2IM0RSFYSCgyBHPG5c8Z6Y3TbmU_WsBY97w5tkEOxDjg-LVK26gXk4QBfOsR-bGazJMzqTVvg4ugL2WW592GM4bSLjrpPPoNHdncqhI-czcEZ2m34evJvCEVUL11VROBX0ZPVE3XSQkdvXzzZQ5mC1w_bcDwC5_gJDf81porCRvlHRZXPuoGfTsejmg3N3leuWKCo9zbL0Djr3gJwf_TSr9LRSMJ0BXP79uyatQN8qGWGbWIx_HI4HHQ',
    tag: 'Heirloom',
    stock: 5,
    maxStock: 50,
    description: 'An exceptional heirloom variety boasting deep violet crowns surrounded by fresh, robust green leaves. Sweet, mild, and nutty.',
    rating: 4.9,
    reviewsCount: 74,
    nutritionalFacts: {
      calories: 25,
      fat: '0.3g',
      fiber: '2g',
      protein: '1.9g',
      details: 'Distinctive color is rich in anthocyanins, powerful anti-inflammatory agents.'
    },
    origin: {
      farm: 'Heritage Seed Farms',
      location: 'Healdsburg, CA',
      badges: ['Heirloom Seed', 'Beetle-Protected Netting']
    }
  },
  {
    id: 'prod-bellpeppers',
    name: 'Mixed Bell Peppers',
    category: 'Vegetables',
    price: 5.99,
    unit: '3 pack',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAo1NZVYdMug4sqOqVqOKmR_U00HMOcJmUBYqGmHjpYdWiMxJg86nqONd4oKcdb6WwMTyTM5lpA8C5zE_OpJOdR0P10Uk34Vov7SU9UfFdFjTmC0yNNR7xkyuaQc7vU-5F5arz3nCB96EyeoMaEHlgPZuIfSFBNN5nivMe8HbsEcaa5dqIAx1B9cSW9s2HMm_HFqEXd7TgdhhaD0hGMVmRcq8umMAgevRSGEZzJo0NNy7hUw0FwqFO8s_-HCJB87rQOmi_fb2FBOFc',
    tag: 'Organic',
    stock: 22,
    maxStock: 80,
    description: 'Sweet, glossy bell peppers in a tri-color bundle of red, yellow, and green. Plump and crunchy with high moisture content.',
    rating: 4.7,
    reviewsCount: 165,
    nutritionalFacts: {
      calories: 31,
      fat: '0.3g',
      fiber: '2.1g',
      protein: '1g',
      details: 'Superb source of Vitamin C and Vitamin A for skin and immune support.'
    },
    origin: {
      farm: 'Coastal Fields',
      location: 'Santa Cruz, CA',
      badges: ['USDA Certified Organic', 'Drip-Irrigated']
    }
  },
  {
    id: 'prod-spinach',
    name: 'Baby Spinach',
    category: 'Vegetables',
    price: 3.25,
    unit: '200g',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCsk09-oMxY_FEZsnEoxNh1MtIrdvibx97a-U9MBEmeHkMEXrtF9uyg_bOZh8jcIynpHdE3IkAohdF9akwIlMLVa2x3XisVbrte8B6nQIugqs58Q5fBNatQCYSkRcCcXFinkocZN7aZLZ8uMRQhe8S402gGV8Ga_N9rM51Cdw4trFwcUKVYMypf8i3uUr_lre2GTd9PcaiuYvIXdAYsX0xNlQtORhLo58VlAWv55JvV1Xwf3mvg8lB8m-AdHJN0XNJjpFEASOkymBc',
    tag: 'Washed',
    stock: 15,
    maxStock: 120,
    description: 'Triple-washed young spinach leaves. Extremely tender, crisp, and ready-to-eat in salads or gently sautéed with garlic.',
    rating: 4.8,
    reviewsCount: 412,
    nutritionalFacts: {
      calories: 23,
      fat: '0.4g',
      fiber: '2.2g',
      protein: '2.9g',
      details: 'Abundant in iron, calcium, magnesium, and dietary folic acid.'
    },
    origin: {
      farm: 'Salad Bowl Orchards',
      location: 'Salinas Valley, CA',
      badges: ['Triple Washed', 'Hydro-cooled']
    }
  },
  {
    id: 'prod-cherry-tomatoes',
    name: 'Ruby Heirloom Cherry Tomatoes',
    category: 'Fruits',
    price: 4.99,
    unit: '250g',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA4rsQtg-fkPBJfLRdkZqacVOAuWtN8SndOLu73C0UcxXRtVN5eA_DFfzb_VWE4m4L3yQtxlhrbrXIABaMwItvVbrRcyPsYy-8rQE1KiB4ck2yQlQ1pO2HSlKbv_uj2VN9U1OgO4r6SJhAxukAVgZa-ivu83pJv_pBeIe1dCVZXlgVGB3wCRcmCViF776zaNhZyoEGoaV6CmS1vFzsX7sVMRDVizTwN9XRsCrat0afopPvsaVf_touVGdDx92UQmw3iotIxc01bT6Y',
    tag: 'Organic',
    stock: 40,
    maxStock: 80,
    description: 'Vibrant, ruby-red cherry tomatoes still on the vine. Bursting with sweet juice and unmatched rich tomato scent.',
    rating: 4.9,
    reviewsCount: 520,
    nutritionalFacts: {
      calories: 18,
      fat: '0.2g',
      fiber: '1.2g',
      protein: '0.9g',
      details: 'High concentration of antioxidant lycopene and beta-carotene.'
    },
    origin: {
      farm: 'Organic Gardens Inc',
      location: 'Sonoma County, CA',
      badges: ['Certified Organic', 'Hand-picked']
    }
  },
  {
    id: 'prod-sourdough',
    name: 'Artisan Sourdough Batard',
    category: 'Bakery',
    price: 6.50,
    unit: '600g',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAZVvHsA_hHo7dGtoZNhqitE4tNKqxNSxeLr9BthAF2P5JTXvCS2KPs5KH3R7pfsUdSRTH9XdeaKjbpp5E-QrwmASeTU91pyVZTUqSm0LHTIsSTmBj4aarXZQZRwY0cZx1ELQ0ZAdZXTh3uUelljMx_irp5ZbdySqiy1_3j2txZC-K19J6WP_7_exrlYnVBdF0STs04PPy4mQJtMQrtUR0Ub6WQ9i95NGT1Cm1pfoPrfXYWyo_d374aMiEA04cNioO-CoD9WtHuL7o',
    stock: 18,
    maxStock: 40,
    description: 'Slow-fermented wild yeast sourdough batard. Perfectly blistered crisp golden crust with a deeply aerated, soft, sour crumb.',
    rating: 4.9,
    reviewsCount: 840,
    nutritionalFacts: {
      calories: 250,
      fat: '1.2g',
      fiber: '2.4g',
      protein: '9g',
      details: 'Fermented naturally for over 36 hours for easy digestion and delicious tang.'
    },
    origin: {
      farm: 'Wild Yeast Bakery',
      location: 'San Francisco, CA',
      badges: ['Slow Fermented', 'Stone-milled Flour']
    }
  },
  {
    id: 'prod-microgreens',
    name: 'Living Microgreens Mix',
    category: 'Vegetables',
    price: 5.25,
    unit: '100g',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCm16aivdYwQ0sC0SaIBjQqt0jwPdQTgNEMl6ZKh0CG0vxA_axfZu4Gh1Uxq88kG3v2_yi-pzhDt2pXpKFAyk3cTDfy7ublEjoWMs_39beFP5m8rG0MD2Cc6eMH-J8OAx368-WNeR5YCx4jT52o4SbrVAfvjEipfz5Lrx7Xmf19NyznF61DHRyj22mQnWuPUGHoO2XMcuydi2XALamZaV43_OG2rgIfb8vCYCKASKRaNBTuonZLptDpj7P1GknwrP6jyJFpMNLiSw8',
    tag: 'Top Pick',
    stock: 25,
    maxStock: 60,
    description: 'A vibrant live harvest of organic shoots including red cabbage, broccoli, and pea shoots. Tender and intensely flavorful.',
    rating: 4.8,
    reviewsCount: 145,
    nutritionalFacts: {
      calories: 30,
      fat: '0.4g',
      fiber: '2g',
      protein: '3g',
      details: 'Contains up to 40 times higher nutrient concentrations than mature greens.'
    },
    origin: {
      farm: 'Zesty & Fresh Co',
      location: 'San Jose, CA',
      badges: ['Live Soil Pots', 'Zero Waste']
    }
  },
  {
    id: 'prod-milk',
    name: 'Grass-Fed Whole Milk',
    category: 'Dairy',
    price: 5.25,
    unit: 'gal',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD6NkqxWDQIlh6CBEdU6cWQ-fpqlSeGZfJFMbxYkKsfpZLMEteZQDfUkvzCT19Iqw_Ec73gB88y7Nsg3I0yyXDo_TDsSF7xmYSNYMdxtjvVxN-48yvVG5QV4ahod_uJsq3Y0Lc_i_NGXD7LetBM2vimFzqFBuyY-EJPxSxdyn-LQiKaeD3-ghmPYHBZ6cZpFpJEzTFCVkHt-98-lBzdS-EHH6YhiII0tQ2eYVveXFKjY6u0nLIdH_RYg3-fOoBvNv2ha-yQrpx-rKw',
    stock: 84,
    maxStock: 150,
    description: 'Rich and creamy non-homogenized whole milk from pasture-raised, grass-fed cows. Served in a cool condensation glass container.',
    rating: 4.8,
    reviewsCount: 380,
    nutritionalFacts: {
      calories: 149,
      fat: '8g',
      fiber: '0g',
      protein: '8g',
      details: 'Packed with calcium, Vitamin D3, and healthy Omega-3 fats.'
    },
    origin: {
      farm: 'Happy Cows Meadow',
      location: 'Marin County, CA',
      badges: ['100% Grass-Fed', 'Family Owned']
    }
  },
  {
    id: 'prod-croissants',
    name: 'Organic Almond Croissants',
    category: 'Bakery',
    price: 5.49,
    unit: '2 pack',
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80&w=600',
    tag: 'Butter Flaky',
    stock: 15,
    maxStock: 30,
    description: 'Flaky, butter-laminated organic pastries filled with sweet frangipane almond cream and topped with toasted almond slices.',
    rating: 4.8,
    reviewsCount: 195,
    nutritionalFacts: {
      calories: 320,
      fat: '18g',
      fiber: '2.5g',
      protein: '6g',
      details: 'Handcrafted with stone-ground organic wheat flour and premium pasture butter.'
    },
    origin: {
      farm: 'Wild Yeast Bakery',
      location: 'San Francisco, CA',
      badges: ['Organic Ingredients', 'Baked Daily']
    }
  },
  {
    id: 'prod-seeded-loaf',
    name: 'Whole Grain Seeded Loaf',
    category: 'Bakery',
    price: 5.99,
    unit: '700g',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=600',
    tag: 'High Fiber',
    stock: 20,
    maxStock: 50,
    description: 'Nutty and dense sourdough-based whole grain loaf encrusted with organic flax, sesame, sunflower, and pumpkin seeds.',
    rating: 4.7,
    reviewsCount: 110,
    nutritionalFacts: {
      calories: 210,
      fat: '4.5g',
      fiber: '6g',
      protein: '8g',
      details: 'Superb source of fiber and essential seed minerals. Free from additives.'
    },
    origin: {
      farm: 'Wild Yeast Bakery',
      location: 'San Francisco, CA',
      badges: ['Slow Fermented', 'Ancient Grains']
    }
  },
  {
    id: 'prod-blueberry-muffins',
    name: 'Organic Blueberry Muffins',
    category: 'Bakery',
    price: 6.25,
    unit: '4 pack',
    image: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?auto=format&fit=crop&q=80&w=600',
    tag: 'Gluten-Free',
    stock: 12,
    maxStock: 40,
    description: 'Moist, fluffy, gluten-free muffins baked with wild organic blueberries, almond flour, and a splash of fresh lemon zest.',
    rating: 4.9,
    reviewsCount: 315,
    nutritionalFacts: {
      calories: 180,
      fat: '7g',
      fiber: '3g',
      protein: '4g',
      details: 'Naturally sweetened with maple syrup and pure vanilla bean extract.'
    },
    origin: {
      farm: 'Marin Greenhouses',
      location: 'Marin County, CA',
      badges: ['Gluten-Free Cert.', 'No Refined Sugar']
    }
  },
  {
    id: 'prod-butter',
    name: 'Grass-Fed Salted Butter',
    category: 'Dairy',
    price: 4.99,
    unit: '250g',
    image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&q=80&w=600',
    tag: 'Artisan',
    stock: 28,
    maxStock: 100,
    description: 'Slow-churned sweet cream butter made from the milk of pasture-raised, grass-fed cows, mixed with delicate flakes of French sea salt.',
    rating: 4.9,
    reviewsCount: 220,
    nutritionalFacts: {
      calories: 100,
      fat: '11g',
      fiber: '0g',
      protein: '0.1g',
      details: 'High in Vitamin A, beta-carotene, and healthy CLA fatty acids.'
    },
    origin: {
      farm: 'Happy Cows Meadow',
      location: 'Marin County, CA',
      badges: ['100% Grass-Fed', 'Traditional Churn']
    }
  },
  {
    id: 'prod-yogurt',
    name: 'Greek Style Honey Yogurt',
    category: 'Dairy',
    price: 3.75,
    unit: '450g',
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&q=80&w=600',
    tag: 'Probiotic',
    stock: 45,
    maxStock: 120,
    description: 'Thick, triple-strained organic Greek style yogurt layered with sweet organic wildflower honey and rich live active cultures.',
    rating: 4.8,
    reviewsCount: 167,
    nutritionalFacts: {
      calories: 130,
      fat: '4g',
      fiber: '0g',
      protein: '15g',
      details: 'Contains 5 strains of live probiotic cultures for digestive health.'
    },
    origin: {
      farm: 'Happy Cows Meadow',
      location: 'Marin County, CA',
      badges: ['Pasture Raised', 'Rich in Protein']
    }
  },
  {
    id: 'prod-cheddar',
    name: 'Aged Organic White Cheddar',
    category: 'Dairy',
    price: 6.99,
    unit: '200g',
    image: 'https://images.unsplash.com/photo-1618164435735-413d3b066c9a?auto=format&fit=crop&q=80&w=600',
    tag: '12-Month Aged',
    stock: 35,
    maxStock: 80,
    description: 'Sharp, complex, and crumbly white cheddar aged for 12 months, sourced from sustainable local family-owned dairy cooperatives.',
    rating: 4.9,
    reviewsCount: 280,
    nutritionalFacts: {
      calories: 110,
      fat: '9g',
      fiber: '0g',
      protein: '7g',
      details: 'Excellent source of calcium, phosphorus, and vitamin B12.'
    },
    origin: {
      farm: 'Happy Cows Meadow',
      location: 'Marin County, CA',
      badges: ['Grass-Fed Milk', 'Aged to Perfection']
    }
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: '#FO-8821945',
    customerName: 'Eleanor Shellstrop',
    customerEmail: 'eleanor@shrimp.com',
    customerAvatar: 'ES',
    date: 'Oct 24, 2024',
    items: [
      { productId: 'prod-avocados', productName: 'Organic Avocados', quantity: 2, price: 4.99 },
      { productId: 'prod-cherry-tomatoes', productName: 'Ruby Heirloom Cherry Tomatoes', quantity: 1, price: 4.99 },
      { productId: 'prod-sourdough', productName: 'Artisan Sourdough Batard', quantity: 1, price: 6.50 }
    ],
    subtotal: 21.47,
    deliveryFee: 2.99,
    tax: 1.25,
    discount: 4.25,
    total: 21.46,
    status: 'Processing',
    address: '452 Organic Meadows Lane, Culinary District, SF 94103',
    deliveryTimeSlot: 'Today, 02:30 PM (Express)',
    paymentMethod: 'Credit Card (**** 4242)',
    timeline: [
      { stage: 'Order Received', time: '12:10 PM', description: "We've received your order and started preparing.", completed: true },
      { stage: 'Packed', time: '12:25 PM', description: 'All items were hand-picked and double-checked.', completed: true },
      { stage: 'On the Way', time: 'Pending', description: 'Your rider is 5 minutes away from your location.', completed: false },
      { stage: 'Delivered', time: 'Pending', description: 'Expected around 12:45 PM', completed: false }
    ]
  },
  {
    id: '#FO-8821946',
    customerName: 'Tahani Al-Jamil',
    customerEmail: 'tahani@gala.com',
    customerAvatar: 'TC',
    date: 'Oct 24, 2024',
    items: [
      { productId: 'prod-milk', productName: 'Grass-Fed Whole Milk', quantity: 4, price: 5.25 },
      { productId: 'prod-asparagus', productName: 'Baby Asparagus', quantity: 2, price: 6.75 }
    ],
    subtotal: 34.50,
    deliveryFee: 2.00,
    tax: 1.50,
    discount: 0,
    total: 38.00,
    status: 'Shipped',
    address: '1000 High Society Drive, Mansion Hill, SF 94105',
    deliveryTimeSlot: 'Today, 04:00 PM (Standard)',
    paymentMethod: 'Apple Pay',
    timeline: [
      { stage: 'Order Received', time: '10:00 AM', description: 'Order verified and processed.', completed: true },
      { stage: 'Packed', time: '10:30 AM', description: 'Gently placed in eco-coolers.', completed: true },
      { stage: 'On the Way', time: '11:15 AM', description: 'Rider is en route to your mansion.', completed: true },
      { stage: 'Delivered', time: 'Pending', description: 'Awaiting hand-off.', completed: false }
    ]
  },
  {
    id: '#FO-8821947',
    customerName: 'Chidi Anagonye',
    customerEmail: 'chidi@moral.edu',
    customerAvatar: 'CM',
    date: 'Oct 23, 2024',
    items: [
      { productId: 'prod-kale', productName: 'Organic Curly Kale', quantity: 3, price: 3.99 },
      { productId: 'prod-carrots', productName: 'Bunch of Carrots', quantity: 2, price: 2.49 }
    ],
    subtotal: 16.95,
    deliveryFee: 2.99,
    tax: 0.85,
    discount: 1.50,
    total: 19.29,
    status: 'Pending',
    address: 'Philosophy Department Room 410, SF University, SF 94132',
    deliveryTimeSlot: 'Tomorrow, 09:00 AM (Standard)',
    paymentMethod: 'UPI Payment',
    timeline: [
      { stage: 'Order Received', time: '09:45 PM', description: 'Order registered. System evaluating moral options.', completed: true },
      { stage: 'Packed', time: 'Pending', description: 'Items awaiting selective picking.', completed: false },
      { stage: 'On the Way', time: 'Pending', description: 'Rider dispatch pending.', completed: false },
      { stage: 'Delivered', time: 'Pending', description: 'Delivery pending.', completed: false }
    ]
  },
  {
    id: '#FO-8821948',
    customerName: 'Jason Mendoza',
    customerEmail: 'jason@bortles.com',
    customerAvatar: 'JM',
    date: 'Oct 23, 2024',
    items: [
      { productId: 'prod-bellpeppers', productName: 'Mixed Bell Peppers', quantity: 1, price: 5.99 }
    ],
    subtotal: 5.99,
    deliveryFee: 5.00,
    tax: 0.30,
    discount: 0,
    total: 11.29,
    status: 'Delivered',
    address: '606 Bortles Bud Way, Dance Central, SF 94102',
    deliveryTimeSlot: 'Oct 23, 12:45 PM',
    paymentMethod: 'Credit Card (**** 9876)',
    timeline: [
      { stage: 'Order Received', time: '11:00 AM', description: 'Order received. Threw a Molotov cocktail to celebrate.', completed: true },
      { stage: 'Packed', time: '11:30 AM', description: 'Safe packing.', completed: true },
      { stage: 'On the Way', time: '12:00 PM', description: 'Jaguar speed delivery.', completed: true },
      { stage: 'Delivered', time: '12:45 PM', description: 'Successfully handed off to customer.', completed: true }
    ]
  }
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-elena',
    name: 'Elena Rodriguez',
    email: 'elena.r@example.com',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDKscftR45XW_OOI3TtRvo-x9LUGzKQryxMR_RHSnbe02ETRjzbWdkZcQ5D1cA6bUGy214_Bz-mV_Fc4Ci9XX6fe7qT7XsabJ9xKaB88wqWdlC5UJrUc_RcpYfwP3XZedDZxta-stJg585HhtuwN8YMoIj3cxLJp6tHKNNb5k1Z6laVbElZPOdXoYrNY4eZXLdV7hP-Pvpfkp23Iwbgw-T-8Qi6aimTMq70Sf7sDmFaageX8WpFoXlHMu0-Z2BNBd_dycKDhQbK5gE',
    ordersCount: 24,
    joinDate: 'Jan 12, 2023',
    status: 'Active'
  },
  {
    id: 'cust-marcus',
    name: 'Marcus Thorne',
    email: 'm.thorne@webmail.org',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA4MYNlzKRT87fZ7iKRH7Lc7YD6NZuCLmiSGbL2ZTM9__fGkm9uzxGxOJvx-bhLbeiuBeWneQOrkX4pHeZtmg62XgZ95lZKIJq0ZzrMgnIikmjBdsry7yW3LjbJvcDspHSEYjCNTpZtFstPuNx3j0_MqQ_58LRt3rxPURp96yiJwx4x3B-Nc-6rHTvEXUg3fg3S_q3M4nS7kHz4sLQzuHFXvbx6xE6vtow8ULCVjgK5wvRBif5JZB69Hrtp5T_Xk8bMIP1u_8XzCGk',
    ordersCount: 18,
    joinDate: 'Mar 05, 2023',
    status: 'Active'
  },
  {
    id: 'cust-sarah',
    name: 'Sarah Jenkins',
    email: 'sarah.j@lifestyle.com',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDVXXbs8W1No5VFHPXS-PKgUOX6FqZKi9Godd6TbN97D3EUZJyHnxHLwT1f4xdsjNi4GNa9CL_XJmMC1WGjJFjScXMIF6OA1T9m-qKHaKahCJgWmHI0tH9gRtz-npyPf4WLTYKlcIk-Xvs8ctk8kNhEE4XaCnnJQSs8G02JQMybli3ua_tQWgvBbhLAlDFB9YV9As1-gKqYSO2ryGv7fEGxJ3oyZQvcD0Kx6IinukIYfmG_WEirZNuY73BYmRpSN8LchJvlWeTa9_g',
    ordersCount: 3,
    joinDate: 'Oct 21, 2023',
    status: 'Active'
  },
  {
    id: 'cust-david',
    name: 'David Chen',
    email: 'dchen@design.studio',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC8XQzrvqlp4zCAGI1woXIDbjSdXLKa2KVPM-y9Woo4q8189lrLqz2OfbRpYlRkQ6SWay34lSGyN6tARWaF0euXFrL55_MfzKVvfzqWYvgtLf7mem2qqeIntmAs8GUmOlCISJLAJBG4AVrEyrpPW389vOBWObCicpxlaHwGxSTBwhGA8GUJIkNxRiNNQTRVWMD4OFr3L-YpMM2RM6fqn07bKdjzW-v218l4qfseBlvJLC2wFxWsTRyc-cq1y2993Hq9-qV0_lnk75U',
    ordersCount: 12,
    joinDate: 'Nov 15, 2023',
    status: 'Active'
  }
];
