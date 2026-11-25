import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Header } from '../components/Header';
import { ShoppingCart, Check, Package, CreditCard, Play, X, Star, Trophy, Gift, Tag, Zap, Sparkles } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { apiGetProducts, apiCreateOrder, apiGetPurchasedProductIds, apiGetProgress, apiGetProgressForParent } from '../../services/api';

interface Product {
  id: number;
  title: string;
  age: string;
  ageGroup: '3-5' | '6-8' | '9+';
  description: string;
  price: number;
  color: string;
  imageUrl: string;
  videoUrl: string;
  isBudget?: boolean;
}

const products: Product[] = [
  // ── Ages 3–5 ──
  {
    id: 1,
    title: "Creative Arts Kit",
    age: "Ages 3-5", ageGroup: "3-5",
    description: "Explore colors, shapes, and textures through painting, drawing, and crafting activities.",
    price: 2499, color: "bg-[#ff8fa3]",
    imageUrl: "https://images.unsplash.com/photo-1685477111354-7ffb7c7d396f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
    videoUrl: "https://www.youtube.com/embed/yAiAJ85fPVE"
  },
  {
    id: 10,
    title: "Alphabet Flash Cards",
    age: "Ages 3-5", ageGroup: "3-5",
    description: "Fun illustrated flash cards to learn letters, numbers, and shapes. Perfect starter kit.",
    price: 499, color: "bg-[#ffd166]",
    imageUrl: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
    videoUrl: "https://www.youtube.com/embed/yAiAJ85fPVE",
    isBudget: true
  },
  {
    id: 11,
    title: "Sticker Activity Book",
    age: "Ages 3-5", ageGroup: "3-5",
    description: "Colorful activity book with 500+ stickers, mazes, and dot-to-dot fun for tiny hands.",
    price: 699, color: "bg-[#ff8fa3]",
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
    videoUrl: "https://www.youtube.com/embed/yAiAJ85fPVE",
    isBudget: true
  },

  // ── Ages 6–8 ──
  {
    id: 2,
    title: "Science Explorer Kit",
    age: "Ages 6-8", ageGroup: "6-8",
    description: "Discover the wonders of science with fun experiments and hands-on exploration.",
    price: 2999, color: "bg-[#8b7bd8]",
    imageUrl: "https://images.unsplash.com/photo-1758685734470-a75109299497?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
    videoUrl: "https://www.youtube.com/embed/a_TSR_v07m0"
  },
  {
    id: 4,
    title: "Reading & Writing Kit",
    age: "Ages 5-7", ageGroup: "6-8",
    description: "Build literacy skills through storytelling, creative writing, and reading activities.",
    price: 1999, color: "bg-[#ffd166]",
    imageUrl: "https://images.unsplash.com/photo-1762475833699-53a01f26565a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
    videoUrl: "https://www.youtube.com/embed/gH5qvD0g9wQ"
  },
  {
    id: 5,
    title: "Music & Rhythm Kit",
    age: "Ages 4-8", ageGroup: "6-8",
    description: "Introduce your child to music with instruments, rhythm games, and creative sound activities.",
    price: 3299, color: "bg-[#ff8fa3]",
    imageUrl: "https://images.unsplash.com/photo-1761243839303-618ae0906300?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
    videoUrl: "https://www.youtube.com/embed/H-9_dZSxq8k"
  },
  {
    id: 6,
    title: "Nature Discovery Kit",
    age: "Ages 5-9", ageGroup: "6-8",
    description: "Explore the natural world with outdoor activities, plant growing, and nature observation.",
    price: 2699, color: "bg-[#52C41A]",
    imageUrl: "https://images.unsplash.com/photo-1758307042875-cc40b192260d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
    videoUrl: "https://www.youtube.com/embed/WXY5yRQr4Ug"
  },
  {
    id: 12,
    title: "Story Dice Set",
    age: "Ages 6-8", ageGroup: "6-8",
    description: "Roll the dice and spin exciting stories! Boosts imagination, language, and creative thinking.",
    price: 599, color: "bg-[#8b7bd8]",
    imageUrl: "https://images.unsplash.com/photo-1611996575749-79a3a250f948?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
    videoUrl: "https://www.youtube.com/embed/gH5qvD0g9wQ",
    isBudget: true
  },
  {
    id: 13,
    title: "Mini Science Cards",
    age: "Ages 6-8", ageGroup: "6-8",
    description: "30 illustrated home-experiment cards — no lab needed, just curiosity!",
    price: 799, color: "bg-[#6ec4db]",
    imageUrl: "https://images.unsplash.com/photo-1628348070889-cb656235b4eb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
    videoUrl: "https://www.youtube.com/embed/a_TSR_v07m0",
    isBudget: true
  },

  // ── Ages 9+ ──
  {
    id: 3,
    title: "Math Adventure Kit",
    age: "Ages 7-10", ageGroup: "9+",
    description: "Make math exciting with games, puzzles, and real-world problem-solving challenges.",
    price: 2799, color: "bg-[#6ec4db]",
    imageUrl: "https://images.unsplash.com/photo-1509228468518-180dd4864904?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
    videoUrl: "https://www.youtube.com/embed/50qf99eUCUU"
  },
  {
    id: 7,
    title: "Building & Construction Kit",
    age: "Ages 4-8", ageGroup: "9+",
    description: "Build creativity and spatial skills with blocks, construction tools, and building challenges.",
    price: 2899, color: "bg-[#ffd166]",
    imageUrl: "https://images.unsplash.com/photo-1772920909185-05b854e3858f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
    videoUrl: "https://www.youtube.com/embed/4kxbT3c52hg"
  },
  {
    id: 8,
    title: "Coding & Robotics Kit",
    age: "Ages 8-12", ageGroup: "9+",
    description: "Learn programming basics and robotics through interactive projects and coding challenges.",
    price: 3999, color: "bg-[#8b7bd8]",
    imageUrl: "https://images.unsplash.com/photo-1568585262983-9b54814595a9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
    videoUrl: "https://www.youtube.com/embed/Fkd9TWUtFm0"
  },
  {
    id: 9,
    title: "Sports & Fitness Kit",
    age: "Ages 5-10", ageGroup: "9+",
    description: "Stay active with fun sports equipment, exercises, and fitness games for kids.",
    price: 2599, color: "bg-[#52C41A]",
    imageUrl: "https://images.unsplash.com/photo-1771924492117-06ba6ce2f408?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
    videoUrl: "https://www.youtube.com/embed/dhCM0C6GnrY"
  },
  {
    id: 14,
    title: "Brain Teaser Pack",
    age: "Ages 9+", ageGroup: "9+",
    description: "Challenging puzzles, riddles, and logic games that sharpen young minds and critical thinking.",
    price: 899, color: "bg-[#52C41A]",
    imageUrl: "https://images.unsplash.com/photo-1606167668584-78701c57f13d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
    videoUrl: "https://www.youtube.com/embed/50qf99eUCUU",
    isBudget: true
  },
  {
    id: 15,
    title: "Math Workbook Kit",
    age: "Ages 9+", ageGroup: "9+",
    description: "Comprehensive math practice with fun worksheets, games, and a mini calculator included.",
    price: 799, color: "bg-[#6ec4db]",
    imageUrl: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
    videoUrl: "https://www.youtube.com/embed/50qf99eUCUU",
    isBudget: true
  },
];

type AgeFilter = 'all' | '3-5' | '6-8' | '9+';

function getRewardTier(stars: number) {
  if (stars >= 50) return { label: "Champion", badge: "🏆", discount: 20, color: "from-[#ffd166] to-[#ff8fa3]", textColor: "text-[#0a0e27]", freeGift: "KidVerse Art Supply Kit (₹999 value)" };
  if (stars >= 25) return { label: "Super Star", badge: "⭐⭐", discount: 15, color: "from-[#8b7bd8] to-[#6ec4db]", textColor: "text-white", freeGift: "KidVerse Coloring Book Set (₹399 value)" };
  if (stars >= 10) return { label: "Star Learner", badge: "⭐", discount: 10, color: "from-[#6ec4db] to-[#52C41A]", textColor: "text-white", freeGift: null };
  return null;
}

function getCartGift(total: number) {
  if (total >= 8000) return { label: "KidVerse Art Supply Kit", value: "₹999", color: "text-[#ff8fa3]" };
  if (total >= 4000) return { label: "KidVerse Coloring Book", value: "₹399", color: "text-[#ffd166]" };
  if (total >= 1000) return { label: "KidVerse Bookmark Set", value: "₹199", color: "text-[#6ec4db]" };
  return null;
}

export function ParentDashboard() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [cart, setCart] = useState<number[]>([]);
  const [purchasedItems, setPurchasedItems] = useState<number[]>([]);
  const [productList, setProductList] = useState<Product[]>(products);
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Product | null>(null);
  const [childStars, setChildStars] = useState(0);
  const [ageFilter, setAgeFilter] = useState<AgeFilter>('all');
  const [showBudgetOnly, setShowBudgetOnly] = useState(false);

  useEffect(() => {
    const storedUserType = localStorage.getItem('userType');
    const storedUserName = localStorage.getItem('userName');

    if (storedUserType !== 'parent') {
      navigate('/login?type=parent');
      return;
    }

    if (storedUserName) setUserName(storedUserName);

    const readNumberList = (key: string) => {
      try {
        const value = JSON.parse(localStorage.getItem(key) || '[]');
        return Array.isArray(value) ? value.filter((item): item is number => typeof item === 'number') : [];
      } catch {
        return [];
      }
    };

    setCart(readNumberList('cart'));
    setPurchasedItems(readNumberList('purchasedItems'));

    // Fetch live product catalog from MySQL Spring Boot backend
    apiGetProducts().then((res) => {
      if (res && res.length > 0) setProductList(res);
    }).catch(console.warn);

    // Sync purchased items from database
    if (storedUserName) {
      apiGetPurchasedProductIds(storedUserName).then((purchasedIds) => {
        if (purchasedIds && purchasedIds.length > 0) {
          setPurchasedItems((prev) => {
            const merged = [...new Set([...prev, ...purchasedIds])];
            localStorage.setItem('purchasedItems', JSON.stringify(merged));
            return merged;
          });
        }
      }).catch(console.warn);
    }

    const syncStars = () => {
      const stored = Number.parseInt(localStorage.getItem('kidverse_game_stars') || '0', 10);
      setChildStars(Number.isFinite(stored) ? Math.max(0, stored) : 0);

      // Also sync from backend for this parent's child
      apiGetProgressForParent(storedUserName || 'parent@kidverse.com').then((res) => {
        if (res && typeof res.stars === 'number') {
          setChildStars(res.stars);
          localStorage.setItem('kidverse_game_stars', String(res.stars));
        }
      }).catch(console.warn);
    };

    syncStars();
    window.addEventListener('focus', syncStars);
    window.addEventListener('storage', syncStars);
    document.addEventListener('visibilitychange', syncStars);

    return () => {
      window.removeEventListener('focus', syncStars);
      window.removeEventListener('storage', syncStars);
      document.removeEventListener('visibilitychange', syncStars);
    };
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('userType');
    localStorage.removeItem('userName');
    navigate('/');
  };

  const addToCart = (productId: number) => {
    const newCart = [...cart, productId];
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const removeFromCart = (productId: number) => {
    const newCart = cart.filter(id => id !== productId);
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const reward = getRewardTier(childStars);
  const cartProducts = productList.filter(p => cart.includes(p.id));
  const subtotal = cartProducts.reduce((sum, p) => sum + p.price, 0);
  const discountPct = reward?.discount ?? 0;
  const discountAmount = Math.round(subtotal * discountPct / 100);
  const shipping = subtotal > 0 ? 399 : 0;
  const total = subtotal - discountAmount + shipping;
  const cartGift = getCartGift(subtotal);

  const completePurchase = async () => {
    try {
      await apiCreateOrder({
        username: userName || localStorage.getItem('userName') || 'parent@kidverse.com',
        productIds: cart,
        discountPct,
        shipping,
        freeGift: cartGift ? cartGift.label : undefined,
      });
    } catch (e) {
      console.warn('Backend order sync notification:', e);
    }

    const newPurchased = [...new Set([...purchasedItems, ...cart])];
    setPurchasedItems(newPurchased);
    localStorage.setItem('purchasedItems', JSON.stringify(newPurchased));
    setCart([]);
    localStorage.setItem('cart', JSON.stringify([]));
    setShowCheckout(false);
    const giftMsg = cartGift ? `\n🎁 Free Gift: ${cartGift.label} included!` : '';
    const discMsg = discountPct > 0 ? `\n💰 ${discountPct}% reward discount applied!` : '';
    alert(`Purchase successful! Your kits will be delivered soon. 🎉${discMsg}${giftMsg}`);
  };

  const filteredProducts = productList.filter(p => {
    if (ageFilter !== 'all' && p.ageGroup !== ageFilter) return false;
    if (showBudgetOnly && p.price >= 1000) return false;
    return true;
  });

  const ageGroups: { key: AgeFilter; label: string; emoji: string }[] = [
    { key: 'all', label: 'All Ages', emoji: '🌟' },
    { key: '3-5', label: 'Ages 3–5', emoji: '🐣' },
    { key: '6-8', label: 'Ages 6–8', emoji: '🚀' },
    { key: '9+', label: 'Ages 9+', emoji: '🧠' },
  ];

  return (
    <div className="min-h-screen bg-[#fffaf1] [background-image:radial-gradient(circle_at_10%_20%,rgba(255,209,102,0.18),transparent_24%),radial-gradient(circle_at_90%_35%,rgba(110,196,219,0.16),transparent_25%)]">
      <Header userType="parent" userName={userName} onLogout={handleLogout} />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
        {/* Welcome */}
        <div className="relative mb-8 overflow-hidden rounded-[2rem] bg-[#0a0e27] px-6 py-8 text-white shadow-2xl shadow-[#0a0e27]/10 sm:px-10 sm:py-10">
          <div className="absolute -right-12 -top-20 h-64 w-64 rounded-full bg-[#8b7bd8]/35 blur-3xl" />
          <div className="absolute bottom-0 right-[18%] h-24 w-24 rounded-full bg-[#ff8fa3]/20 blur-2xl" />
          <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.16em] text-[#ffd166]">
                <Sparkles className="h-4 w-4" /> Parent mission control
              </div>
              <h1 className="mb-3 text-4xl sm:text-5xl font-bold leading-tight">
                Welcome back, {userName || 'Parent'}!
              </h1>
              <p className="max-w-2xl text-lg text-white/65">
                Find hands-on adventures matched to your child’s age, interests, and growing curiosity.
              </p>
            </div>
            <div className="flex gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 backdrop-blur">
                <p className="text-2xl font-extrabold text-[#ffd166]">{productList.length}</p>
                <p className="text-xs font-bold uppercase tracking-wider text-white/50">Learning kits</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 backdrop-blur">
                <p className="text-2xl font-extrabold text-[#6ec4db]">{childStars}</p>
                <p className="text-xs font-bold uppercase tracking-wider text-white/50">Stars earned</p>
              </div>
            </div>
          </div>
        </div>

        {/* Child Rewards Panel */}
        {childStars > 0 ? (
          <div className={`rounded-[2rem] p-6 mb-8 bg-gradient-to-r ${reward ? reward.color : 'from-[#dfe3ea] to-[#eef0f3]'} shadow-lg shadow-[#8b7bd8]/10`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Trophy className={`w-8 h-8 ${reward ? reward.textColor : 'text-gray-600'}`} />
                </div>
                <div>
                  <p className={`${reward ? reward.textColor : 'text-gray-700'} mb-1`} style={{ fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Your Child's Game Rewards
                  </p>
                  <p className={`${reward ? reward.textColor : 'text-gray-800'}`} style={{ fontSize: '24px', fontWeight: '800' }}>
                    {reward ? `${reward.badge} ${reward.label}` : 'Keep Playing!'} — {childStars} ⭐ Stars Earned
                  </p>
                  {reward ? (
                    <p className={`${reward.textColor} opacity-80`} style={{ fontSize: '15px' }}>
                      {reward.discount}% discount applied automatically at checkout
                      {reward.freeGift ? ` • Free: ${reward.freeGift}` : ''}
                    </p>
                  ) : (
                    <p className="text-gray-600" style={{ fontSize: '15px' }}>
                      Earn 10 stars to unlock a 10% discount. Keep playing!
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <div className="flex gap-1">
                  {[10, 25, 50].map(threshold => (
                    <div
                      key={threshold}
                      className={`px-3 py-1 rounded-full text-xs font-bold ${childStars >= threshold ? 'bg-white text-[#0a0e27]' : 'bg-white/20 text-white/60'}`}
                    >
                      {threshold >= 50 ? '🏆' : threshold >= 25 ? '⭐⭐' : '⭐'} {threshold}+ = {threshold >= 50 ? '20%' : threshold >= 25 ? '15%' : '10%'}
                    </div>
                  ))}
                </div>
                <p className="text-white/60 text-xs mt-1">Child earns stars by playing games</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl p-5 mb-8 bg-white border-2 border-dashed border-[#8b7bd8]/30 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#8b7bd8]/10 flex items-center justify-center flex-shrink-0">
              <Star className="w-6 h-6 text-[#8b7bd8]" />
            </div>
            <div>
              <p className="text-[#0a0e27]" style={{ fontSize: '17px', fontWeight: '700' }}>Unlock Rewards via Your Child's Gameplay!</p>
              <p className="text-gray-500" style={{ fontSize: '14px' }}>When your child plays games in the Kids Zone, they earn stars — which give you automatic discounts (min. 10%) at checkout.</p>
            </div>
          </div>
        )}

        {/* Cart Summary */}
        {cart.length > 0 && (
          <div className="sticky top-[78px] z-30 bg-[#7565cc]/95 backdrop-blur-xl text-white rounded-3xl p-5 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl shadow-[#7565cc]/20">
            <div className="flex items-center gap-4">
              <ShoppingCart className="w-8 h-8 flex-shrink-0" />
              <div>
                <p style={{ fontSize: '20px', fontWeight: '700' }}>
                  {cart.length} {cart.length === 1 ? 'item' : 'items'} in cart
                </p>
                <p style={{ fontSize: '15px' }}>
                  Subtotal: ₹{subtotal.toLocaleString('en-IN')}
                  {discountPct > 0 && <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-sm">−{discountPct}% reward</span>}
                </p>
                {cartGift && (
                  <p className="flex items-center gap-1 mt-1" style={{ fontSize: '13px' }}>
                    <Gift className="w-4 h-4" /> Free gift: {cartGift.label}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() => setShowCheckout(true)}
              className="px-6 py-3 bg-white text-[#8b7bd8] rounded-full hover:bg-gray-100 transition-colors flex-shrink-0"
              style={{ fontSize: '18px', fontWeight: '700' }}
            >
              Checkout
            </button>
          </div>
        )}

        {/* Free Gift Banner (when cart qualifies but cart is empty) */}
        {cart.length === 0 && (
          <div className="rounded-2xl p-4 mb-8 bg-gradient-to-r from-[#ff8fa3]/10 to-[#ffd166]/10 border border-[#ff8fa3]/20 flex flex-wrap gap-4 items-center">
            <Gift className="w-5 h-5 text-[#ff8fa3] flex-shrink-0" />
            <span className="text-[#0a0e27]" style={{ fontSize: '14px', fontWeight: '600' }}>Free Gifts with Purchase:</span>
            <span className="text-gray-600 text-sm">🔖 Bookmark Set <span className="text-[#6ec4db] font-bold">(₹1,000+)</span></span>
            <span className="text-gray-600 text-sm">📚 Coloring Book <span className="text-[#ffd166] font-bold">(₹4,000+)</span></span>
            <span className="text-gray-600 text-sm">🎨 Art Supply Kit <span className="text-[#ff8fa3] font-bold">(₹8,000+)</span></span>
          </div>
        )}

        {/* Filter Bar */}
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#7565cc]">Curated for curious minds</p>
            <h2 className="mt-1 text-3xl font-bold text-[#0a0e27]">Explore learning kits</h2>
          </div>
          <p className="hidden text-sm font-semibold text-gray-500 sm:block">{filteredProducts.length} kits shown</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-8 rounded-3xl border border-[#0a0e27]/10 bg-white/75 p-3 shadow-sm backdrop-blur">
          <div className="flex flex-wrap gap-2" aria-label="Filter learning kits by age">
            {ageGroups.map(g => (
              <button
                key={g.key}
                onClick={() => setAgeFilter(g.key)}
                aria-pressed={ageFilter === g.key}
                className={`px-5 py-2 rounded-full transition-all ${
                  ageFilter === g.key
                    ? 'bg-[#7565cc] text-white shadow-md'
                    : 'bg-transparent text-gray-700 border border-transparent hover:bg-white hover:border-[#8b7bd8]/30'
                }`}
                style={{ fontSize: '15px', fontWeight: '600' }}
              >
                {g.emoji} {g.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowBudgetOnly(v => !v)}
            aria-pressed={showBudgetOnly}
            className={`flex items-center gap-2 px-5 py-2 rounded-full border transition-all ${
              showBudgetOnly
                ? 'bg-[#ffd166] text-[#0a0e27] border-[#ffd166]'
                : 'bg-white text-gray-700 border-gray-200 hover:border-[#ffd166]'
            }`}
            style={{ fontSize: '15px', fontWeight: '600' }}
          >
            <Tag className="w-4 h-4" />
            Under ₹1,000
          </button>
        </div>

        {/* Products Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {filteredProducts.map((product) => {
            const isPurchased = purchasedItems.includes(product.id);
            const isInCart = cart.includes(product.id);

            return (
              <div key={product.id} className="group/card bg-white rounded-[1.75rem] overflow-hidden border border-[#0a0e27]/10 shadow-[0_12px_35px_rgba(20,25,54,0.07)] hover:shadow-[0_20px_45px_rgba(20,25,54,0.13)] hover:-translate-y-1 transition-all duration-300 relative">
                {product.isBudget && (
                  <div className="absolute top-3 left-3 z-10 bg-[#ffd166] text-[#0a0e27] px-3 py-1 rounded-full flex items-center gap-1" style={{ fontSize: '12px', fontWeight: '700' }}>
                    <Zap className="w-3 h-3" /> Budget Pick
                  </div>
                )}
                <div
                  className={`${product.color} h-52 flex items-center justify-center relative group cursor-pointer overflow-hidden`}
                  onClick={() => setSelectedVideo(product)}
                >
                  <ImageWithFallback
                    src={product.imageUrl}
                    alt={product.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="bg-white rounded-full p-4">
                      <Play className="w-8 h-8 text-[#8b7bd8]" fill="currentColor" />
                    </div>
                  </div>
                  {isPurchased && (
                    <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full flex items-center gap-1">
                      <Check className="w-4 h-4" />
                      <span style={{ fontSize: '12px', fontWeight: '600' }}>Purchased</span>
                    </div>
                  )}
                </div>
                <div className="p-5 sm:p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700" style={{ fontSize: '14px' }}>
                      {product.age}
                    </span>
                    <div className="text-right">
                      <span className="text-[#0a0e27]" style={{ fontSize: '24px', fontWeight: '700' }}>
                        ₹{product.price.toLocaleString('en-IN')}
                      </span>
                      {discountPct > 0 && (
                        <p className="text-green-600" style={{ fontSize: '13px', fontWeight: '600' }}>
                          You pay ₹{Math.round(product.price * (1 - discountPct / 100)).toLocaleString('en-IN')} after {discountPct}% off
                        </p>
                      )}
                    </div>
                  </div>
                  <h3 className="text-[#0a0e27] mb-2 text-2xl font-bold leading-tight">
                    {product.title}
                  </h3>
                  <p className="text-gray-600 mb-5 leading-relaxed">
                    {product.description}
                  </p>

                  {isPurchased ? (
                    <button
                      disabled
                      className="w-full py-3 bg-green-100 text-green-700 rounded-full flex items-center justify-center gap-2"
                      style={{ fontSize: '16px', fontWeight: '600' }}
                    >
                      <Package className="w-5 h-5" />
                      Already Purchased
                    </button>
                  ) : isInCart ? (
                    <button
                      onClick={() => removeFromCart(product.id)}
                      className="w-full py-3 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors"
                      style={{ fontSize: '16px', fontWeight: '600' }}
                    >
                      Remove from Cart
                    </button>
                  ) : (
                    <button
                      onClick={() => addToCart(product.id)}
                      className="w-full py-3.5 bg-[#7565cc] text-white rounded-2xl hover:bg-[#6555bd] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#7565cc]/15 group-hover/card:shadow-[#7565cc]/25"
                      style={{ fontSize: '16px', fontWeight: '600' }}
                    >
                      <ShoppingCart className="w-5 h-5" />
                      Add to Cart
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {filteredProducts.length === 0 && (
          <div className="mb-12 rounded-3xl border-2 border-dashed border-[#8b7bd8]/30 bg-white px-6 py-14 text-center">
            <Package className="mx-auto mb-4 h-10 w-10 text-[#8b7bd8]" />
            <h2 className="text-2xl font-bold text-[#0a0e27]">No kits match these filters</h2>
            <p className="mt-2 text-gray-600">Try another age group or turn off the budget filter.</p>
            <button
              onClick={() => {
                setAgeFilter('all');
                setShowBudgetOnly(false);
              }}
              className="mt-5 rounded-full bg-[#8b7bd8] px-6 py-3 font-bold text-white transition-colors hover:bg-[#7a6ac7]"
            >
              Show all kits
            </button>
          </div>
        )}
      </div>

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-[#0a0e27] mb-6" style={{ fontSize: '36px', fontWeight: '700' }}>
              Checkout
            </h2>

            <div className="space-y-4 mb-6">
              {cartProducts.map(product => (
                <div key={product.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '600' }}>{product.title}</h3>
                    <p className="text-gray-500" style={{ fontSize: '14px' }}>{product.age}</p>
                  </div>
                  <span style={{ fontSize: '20px', fontWeight: '700' }}>₹{product.price.toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>

            {/* Free gift row */}
            {cartGift && (
              <div className="mb-4 p-4 rounded-2xl bg-gradient-to-r from-[#ff8fa3]/10 to-[#ffd166]/10 border border-[#ff8fa3]/30 flex items-center gap-3">
                <Gift className="w-6 h-6 text-[#ff8fa3] flex-shrink-0" />
                <div>
                  <p style={{ fontSize: '16px', fontWeight: '700' }}>Free Gift Included!</p>
                  <p className="text-gray-600" style={{ fontSize: '14px' }}>{cartGift.label} ({cartGift.value} value) added to your order</p>
                </div>
              </div>
            )}

            {/* Reward gift row */}
            {reward?.freeGift && (
              <div className="mb-4 p-4 rounded-2xl bg-gradient-to-r from-[#ffd166]/20 to-[#8b7bd8]/10 border border-[#ffd166]/40 flex items-center gap-3">
                <Trophy className="w-6 h-6 text-[#ffd166] flex-shrink-0" />
                <div>
                  <p style={{ fontSize: '16px', fontWeight: '700' }}>{reward.label} Reward!</p>
                  <p className="text-gray-600" style={{ fontSize: '14px' }}>{reward.freeGift} added to your order</p>
                </div>
              </div>
            )}

            <div className="border-t pt-6 mb-6 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600" style={{ fontSize: '18px' }}>Subtotal:</span>
                <span style={{ fontSize: '18px' }}>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              {discountPct > 0 && (
                <div className="flex justify-between text-green-600">
                  <span style={{ fontSize: '18px' }}>Reward Discount ({discountPct}%):</span>
                  <span style={{ fontSize: '18px', fontWeight: '700' }}>−₹{discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600" style={{ fontSize: '18px' }}>Shipping:</span>
                <span style={{ fontSize: '18px' }}>₹{shipping}</span>
              </div>
              <div className="flex justify-between border-t pt-4">
                <span style={{ fontSize: '24px', fontWeight: '700' }}>Total:</span>
                <span style={{ fontSize: '24px', fontWeight: '700' }}>₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowCheckout(false)}
                className="flex-1 py-4 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-colors"
                style={{ fontSize: '18px', fontWeight: '600' }}
              >
                Cancel
              </button>
              <button
                onClick={completePurchase}
                className="flex-1 py-4 bg-[#8b7bd8] text-white rounded-full hover:bg-[#7a6ac7] transition-colors flex items-center justify-center gap-2"
                style={{ fontSize: '18px', fontWeight: '700' }}
              >
                <CreditCard className="w-5 h-5" />
                Complete Purchase
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video Modal */}
      {selectedVideo && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedVideo(null)}
        >
          <div className="bg-white rounded-3xl p-6 max-w-4xl w-full" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-[#0a0e27]" style={{ fontSize: '28px', fontWeight: '700' }}>
                  {selectedVideo.title} — Tutorial
                </h2>
                <p className="text-gray-600" style={{ fontSize: '16px' }}>
                  Learn how to use this kit with your child
                </p>
              </div>
              <button onClick={() => setSelectedVideo(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="aspect-video rounded-2xl overflow-hidden bg-gray-900">
              <iframe
                width="100%" height="100%"
                src={selectedVideo.videoUrl}
                title={selectedVideo.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
