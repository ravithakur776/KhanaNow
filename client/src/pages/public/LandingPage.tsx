import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search,
  Sparkles,
  Zap,
  ShieldCheck,
  MapPin,
  Clock,
  Flame,
  ArrowRight,
  Bookmark,
  Star,
  CheckCircle2,
  Phone,
  Smartphone,
  Send,
  Heart,
  Plus,
  Utensils,
  Award,
  Lock,
  Headphones,
  ShoppingBag,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card } from '../../components/ui/card';
import { Display, Heading, Text } from '../../components/ui/typography';
import { Container } from '../../components/layout/Container';
import { Section } from '../../components/layout/Section';
import { Grid } from '../../components/layout/Grid';
import { Stack, HStack, VStack } from '../../components/layout/Stack';
import { RatingStars } from '../../components/shared/RatingStars';
import { PriceDisplay } from '../../components/shared/PriceDisplay';
import { FoodTag } from '../../components/shared/FoodTag';
import { CategoryPill } from '../../components/shared/CategoryPill';
import { useCartStore } from '../../stores/useCartStore';
import { useUIStore } from '../../stores/useUIStore';
import {
  fadeUp,
  staggerContainer,
  scaleIn,
  buttonMotion,
  cardHoverMotion,
  pulseGlow,
} from '../../config/animations';

// Categories Data
const FEATURED_CUISINES = [
  { id: '1', name: 'Hyderabadi Biryani', icon: '🍲', count: '140+ Kitchens' },
  { id: '2', name: 'Artisan Pizza', icon: '🍕', count: '95+ Places' },
  { id: '3', name: 'Smash Burgers', icon: '🍔', count: '110+ Places' },
  { id: '4', name: 'North Indian Thali', icon: '🍛', count: '160+ Places' },
  { id: '5', name: 'Dim Sums & Asian', icon: '🥢', count: '85+ Places' },
  { id: '6', name: 'Desserts & Bakes', icon: '🍰', count: '70+ Places' },
  { id: '7', name: 'South Indian Crisp', icon: '🥟', count: '105+ Places' },
  { id: '8', name: 'Healthy Bowls', icon: '🥗', count: '50+ Places' },
];

// Top Restaurants Data
const TOP_RESTAURANTS = [
  {
    id: 'rest-1',
    name: 'Royal Biryani House',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80',
    cuisines: ['Hyderabadi Biryani', 'North Indian', 'Mughlai'],
    rating: 4.9,
    ratingsCount: 2420,
    eta: '20-25 min',
    costForTwo: 450,
    isPureVeg: false,
    offer: '50% OFF up to ₹100',
    distance: '1.8 km',
  },
  {
    id: 'rest-2',
    name: 'Artisan Pizza Workshop',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80',
    cuisines: ['Wood-fired Pizza', 'Italian', 'Pasta'],
    rating: 4.8,
    ratingsCount: 1890,
    eta: '18-22 min',
    costForTwo: 600,
    isPureVeg: false,
    offer: 'FLAT ₹125 OFF',
    distance: '2.4 km',
  },
  {
    id: 'rest-3',
    name: 'Green Leaf Pure Veg',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
    cuisines: ['South Indian', 'Special Thali', 'Dosai'],
    rating: 4.9,
    ratingsCount: 3100,
    eta: '15-20 min',
    costForTwo: 300,
    isPureVeg: true,
    offer: 'Free Delivery',
    distance: '1.2 km',
  },
  {
    id: 'rest-4',
    name: 'The Smash Burger Co.',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80',
    cuisines: ['American Burgers', 'Fries', 'Shakes'],
    rating: 4.7,
    ratingsCount: 1670,
    eta: '20-28 min',
    costForTwo: 500,
    isPureVeg: false,
    offer: '20% OFF',
    distance: '3.1 km',
  },
];

// Popular Dishes Data
const POPULAR_DISHES = [
  {
    foodId: 'dish-1',
    name: 'Special Chicken Dum Biryani',
    restaurantName: 'Royal Biryani House',
    restaurantId: 'rest-1',
    price: 340,
    discountedPrice: 290,
    dietaryType: 'non-veg' as const,
    imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=80',
    rating: 4.9,
    tags: ['Bestseller', 'Chef Special'],
  },
  {
    foodId: 'dish-2',
    name: 'Truffle Mushroom Sourdough Pizza',
    restaurantName: 'Artisan Pizza Workshop',
    restaurantId: 'rest-2',
    price: 520,
    discountedPrice: 450,
    dietaryType: 'veg' as const,
    imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=80',
    rating: 4.8,
    tags: ['Gourmet', 'Woodfired'],
  },
  {
    foodId: 'dish-3',
    name: 'Tandoori Malai Chaap Platter',
    restaurantName: 'Green Leaf Pure Veg',
    restaurantId: 'rest-3',
    price: 280,
    discountedPrice: 240,
    dietaryType: 'veg' as const,
    imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&auto=format&fit=crop&q=80',
    rating: 4.9,
    tags: ['100% Veg', 'Charcoal Grilled'],
  },
  {
    foodId: 'dish-4',
    name: 'Double Truffle Smash Burger',
    restaurantName: 'The Smash Burger Co.',
    restaurantId: 'rest-4',
    price: 390,
    discountedPrice: 350,
    dietaryType: 'non-veg' as const,
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80',
    rating: 4.7,
    tags: ['Juicy Smash', 'Must Try'],
  },
];

// Why Choose Us Pillars
const US_PILLARS = [
  {
    icon: <Zap className="h-7 w-7 text-primary" />,
    title: '18-Min Hyper Delivery',
    description: 'Dynamic GPS route optimization ensures your food arrives piping hot within minutes.',
  },
  {
    icon: <ShieldCheck className="h-7 w-7 text-emerald-400" />,
    title: 'FSSAI Certified Kitchens',
    description: '100% verified clean kitchens with strict temperature and hygiene monitoring.',
  },
  {
    icon: <Lock className="h-7 w-7 text-amber-400" />,
    title: 'Encrypted 1-Click Pay',
    description: 'Instant friction-free checkout backed by Razorpay 256-bit encryption.',
  },
  {
    icon: <Sparkles className="h-7 w-7 text-purple-400" />,
    title: 'AI Taste Engine',
    description: 'Smart recommendations tailored to your taste profile, time of day, and weather.',
  },
  {
    icon: <Flame className="h-7 w-7 text-rose-400" />,
    title: 'Zero Surge Charges',
    description: 'No hidden surge fees during peak hours or heavy rain. Transparent pricing guaranteed.',
  },
  {
    icon: <Headphones className="h-7 w-7 text-cyan-400" />,
    title: '24/7 VIP Concierge',
    description: 'Round-the-clock priority resolution for any order query or customization request.',
  },
];

// How It Works Steps
const STEPS = [
  { step: '01', title: 'Discover & Search', description: 'Browse curated top-rated restaurants near you or ask AI to recommend.' },
  { step: '02', title: 'Customize Dish', description: 'Select your preferred portion sizes, spice levels, and add-ons.' },
  { step: '03', title: 'Instant 1-Click Pay', description: 'Checkout securely using UPI, Credit Cards, or Cash on Delivery.' },
  { step: '04', title: 'Live GPS Tracking', description: 'Watch your delivery partner move on an interactive real-time map.' },
];

// Customer Reviews Data
const TESTIMONIALS = [
  {
    name: 'Aarav Sharma',
    role: 'Product Lead at TechCorp',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    review: 'KhanaNow has completely ruined standard food delivery apps for me. The 18-minute delivery speed is mind-blowing, and the UI is butter smooth.',
    rating: 5,
  },
  {
    name: 'Ananya Verma',
    role: 'Senior UI Designer',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    review: 'The design aesthetic feels like an Apple product for food. Zero surge pricing and the AI recommendation engine always hits the spot.',
    rating: 5,
  },
  {
    name: 'Rohan Gupta',
    role: 'University Scholar',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    review: 'Late-night study sessions are saved by KhanaNow. Biryani arrives piping hot in 20 minutes with zero delivery fee.',
    rating: 5,
  },
];

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const openCartDrawer = useUIStore((state) => state.openCartDrawer);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim().includes('@')) {
      setSubscribed(true);
      setEmailInput('');
    }
  };

  return (
    <div className="space-y-24 overflow-x-hidden">
      {/* 1. HERO SECTION */}
      <Section padding="none" className="pt-8 pb-16 md:pt-16 md:pb-28">
        {/* Background Ambient Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-primary/20 blur-[160px] pointer-events-none rounded-full" />

        <Container size="xl" className="relative z-10">
          <motion.div
            variants={staggerContainer(0.1)}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center"
          >
            {/* Hero Left Content */}
            <motion.div variants={fadeUp} className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <Badge variant="default" className="py-1.5 px-4 text-xs font-extrabold uppercase tracking-widest shadow-lg">
                <Sparkles className="h-3.5 w-3.5 mr-1.5 text-primary animate-pulse" />
                ⚡ 18-Min Avg Express Delivery
              </Badge>

              <Display size="xl">
                Gastronomy Delivered with <Display size="xl" gradient={true}>AI Precision.</Display>
              </Display>

              <Text variant="lead" className="max-w-2xl mx-auto lg:mx-0">
                Discover master-crafted culinary dishes from top local kitchens. Enjoy 1-click checkout, zero surge fees, and live driver tracking.
              </Text>

              {/* Search Form */}
              <form onSubmit={handleSearch} className="max-w-xl mx-auto lg:mx-0 pt-2">
                <div className="glass-panel p-2 rounded-3xl shadow-2xl flex flex-col sm:flex-row gap-2 border-white/10">
                  <div className="flex-1 flex items-center px-4 gap-3 bg-card/60 rounded-2xl h-14">
                    <MapPin className="h-5 w-5 text-primary shrink-0 animate-bounce" />
                    <input
                      type="text"
                      placeholder="Search biryani, pizza, burgers, or restaurants..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-transparent text-foreground placeholder:text-muted-foreground text-sm font-medium focus:outline-none"
                    />
                  </div>
                  <Button type="submit" size="lg" className="h-14 font-extrabold px-8 rounded-2xl shadow-lg shadow-primary/30">
                    <Search className="h-5 w-5 mr-2" /> Find Food
                  </Button>
                </div>
              </form>

              {/* Trust Indicators */}
              <HStack gap="lg" align="center" justify="center" className="pt-6 text-xs font-bold text-muted-foreground lg:justify-start">
                <HStack gap="xs" align="center">
                  <Zap className="h-4 w-4 text-primary" />
                  <span>30-Min Guarantee</span>
                </HStack>
                <HStack gap="xs" align="center">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span>FSSAI Certified</span>
                </HStack>
                <HStack gap="xs" align="center">
                  <Flame className="h-4 w-4 text-amber-400" />
                  <span>Zero Surge Fee</span>
                </HStack>
              </HStack>
            </motion.div>

            {/* Hero Right Visuals (Floating Cards) */}
            <motion.div variants={scaleIn} className="lg:col-span-5 relative flex justify-center">
              <div className="relative w-full max-w-md aspect-square">
                {/* Main Hero Card Backdrop */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-primary/30 to-amber-500/20 blur-2xl opacity-60" />

                {/* Hero Showcase Card */}
                <div className="relative h-full w-full rounded-3xl overflow-hidden border border-white/10 shadow-2xl glass-panel p-4 flex flex-col justify-between">
                  <img
                    src="https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80"
                    alt="Hyderabadi Biryani Special"
                    className="h-64 w-full object-cover rounded-2xl"
                  />

                  <div className="p-4 space-y-2">
                    <HStack justify="between" align="center">
                      <Heading level="h4" className="truncate">Hyderabadi Dum Biryani</Heading>
                      <Badge variant="veg" className="font-extrabold">100% PURE VEG</Badge>
                    </HStack>

                    <HStack justify="between" align="center" className="text-xs text-muted-foreground font-medium">
                      <span>Royal Biryani House</span>
                      <RatingStars rating={4.9} size="sm" />
                    </HStack>
                  </div>
                </div>

                {/* Floating Widget 1: Live Driver Arrival */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -top-6 -left-6 glass-panel border border-white/10 p-3.5 rounded-2xl shadow-2xl flex items-center gap-3 z-20"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 font-bold">
                    <Zap className="h-5 w-5 animate-pulse" />
                  </div>
                  <div>
                    <Text variant="caption" weight="bold" className="text-emerald-400 uppercase tracking-wider">
                      Live Delivery
                    </Text>
                    <Text variant="small" weight="bold">Arriving in 14 Mins</Text>
                  </div>
                </motion.div>

                {/* Floating Widget 2: Instant Rating Stats */}
                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                  className="absolute -bottom-6 -right-6 glass-panel border border-white/10 p-3.5 rounded-2xl shadow-2xl flex items-center gap-3 z-20"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 font-bold">
                    <Star className="h-5 w-5 fill-current" />
                  </div>
                  <div>
                    <Text variant="small" weight="black">4.9 / 5.0 Rating</Text>
                    <Text variant="caption">150k+ Happy Foodies</Text>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </Container>
      </Section>

      {/* 2. FEATURED CUISINES CAROUSEL */}
      <Section padding="none">
        <Container size="xl">
          <HStack justify="between" align="end" className="mb-8">
            <div>
              <Heading level="h2">Explore By Cuisine</Heading>
              <Text variant="small">Handcrafted flavors categorized for your exact craving</Text>
            </div>
            <Link to="/search">
              <Button variant="ghost" className="font-bold text-primary hover:text-primary-hover">
                View All Cuisines <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </HStack>

          <Grid cols={4} gap="md">
            {FEATURED_CUISINES.map((cuisine) => (
              <Link key={cuisine.id} to={`/search?cuisine=${encodeURIComponent(cuisine.name)}`}>
                <Card className="p-5 text-center cursor-pointer border-border hover:border-primary/50 transition-all duration-300 group glass-card-hover">
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
                    {cuisine.icon}
                  </div>
                  <Heading level="h5" className="truncate">{cuisine.name}</Heading>
                  <Text variant="caption" className="mt-1">{cuisine.count}</Text>
                </Card>
              </Link>
            ))}
          </Grid>
        </Container>
      </Section>

      {/* 3. FEATURED RESTAURANTS SHOWCASE */}
      <Section padding="none">
        <Container size="xl">
          <HStack justify="between" align="end" className="mb-8">
            <div>
              <Heading level="h2">Top Master Kitchens Near You</Heading>
              <Text variant="small">Rigourously audited & FSSAI certified culinary partners</Text>
            </div>
            <Link to="/search">
              <Button variant="outline" className="font-bold">
                Explore All Kitchens
              </Button>
            </Link>
          </HStack>

          <Grid cols={4} gap="md">
            {TOP_RESTAURANTS.map((rest) => (
              <Card key={rest.id} className="overflow-hidden group cursor-pointer border-border hover:border-primary/40">
                <Link to={`/restaurant/${rest.id}`}>
                  <div className="relative h-48 w-full overflow-hidden bg-card">
                    <img
                      src={rest.image}
                      alt={rest.name}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    <div className="absolute top-3 left-3">
                      <Badge variant={rest.isPureVeg ? 'veg' : 'nonveg'} className="font-bold">
                        {rest.isPureVeg ? '100% PURE VEG' : 'VEG & NON-VEG'}
                      </Badge>
                    </div>

                    <div className="absolute bottom-3 left-3 bg-primary text-white text-xs font-black px-2.5 py-1 rounded-lg shadow-md">
                      {rest.offer}
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <HStack justify="between" align="start">
                      <Heading level="h4" className="truncate group-hover:text-primary transition-colors">
                        {rest.name}
                      </Heading>
                      <RatingStars rating={rest.rating} size="sm" />
                    </HStack>

                    <Text variant="small" className="truncate">{rest.cuisines.join(', ')}</Text>

                    <HStack justify="between" align="center" className="border-t border-border/60 pt-3 text-xs text-muted-foreground font-semibold">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-primary" /> {rest.eta}
                      </span>
                      <span>₹{rest.costForTwo} for two</span>
                    </HStack>
                  </div>
                </Link>
              </Card>
            ))}
          </Grid>
        </Container>
      </Section>

      {/* 4. POPULAR DISHES & QUICK ADD */}
      <Section padding="none">
        <Container size="xl">
          <HStack justify="between" align="end" className="mb-8">
            <div>
              <Heading level="h2">Trending Chef Recommendations</Heading>
              <Text variant="small">Top ordered dishes with 1-click express add to cart</Text>
            </div>
            <Link to="/search">
              <Button variant="ghost" className="font-bold text-primary">
                View Full Menu <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </HStack>

          <Grid cols={4} gap="md">
            {POPULAR_DISHES.map((dish) => (
              <Card key={dish.foodId} className="overflow-hidden border-border hover:border-primary/40 flex flex-col justify-between">
                <div>
                  <div className="relative h-44 w-full">
                    <img src={dish.imageUrl} alt={dish.name} className="h-full w-full object-cover" />
                    <div className="absolute top-3 left-3">
                      <FoodTag type={dish.dietaryType} />
                    </div>
                  </div>

                  <div className="p-5 space-y-2">
                    <Text variant="caption" className="text-primary font-bold">{dish.restaurantName}</Text>
                    <Heading level="h5" className="line-clamp-1">{dish.name}</Heading>
                    <PriceDisplay amount={dish.price} discountedAmount={dish.discountedPrice} size="md" />
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => {
                      addItem({
                        foodId: dish.foodId,
                        name: dish.name,
                        imageUrl: dish.imageUrl,
                        price: dish.discountedPrice || dish.price,
                        dietaryType: dish.dietaryType,
                        quantity: 1,
                        restaurantId: dish.restaurantId,
                        restaurantName: dish.restaurantName,
                      });
                      openCartDrawer();
                    }}
                    className="w-full font-extrabold gap-1.5 shadow-md"
                  >
                    <Plus className="h-4 w-4" /> Add to Cart
                  </Button>
                </div>
              </Card>
            ))}
          </Grid>
        </Container>
      </Section>

      {/* 5. WHY CHOOSE KHANANOW */}
      <Section padding="none">
        <Container size="xl">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <Badge variant="bestseller" className="px-3.5 py-1">THE KHANANOW ADVANTAGE</Badge>
            <Heading level="h1">Built for Food Lovers. Powered by Tech.</Heading>
            <Text variant="lead">Why thousands choose KhanaNow over traditional food delivery clones.</Text>
          </div>

          <Grid cols={3} gap="lg">
            {US_PILLARS.map((pillar, idx) => (
              <Card key={idx} className="p-8 border-border glass-card hover:border-primary/50 transition-all duration-300 space-y-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-card border border-border shadow-md">
                  {pillar.icon}
                </div>
                <Heading level="h4">{pillar.title}</Heading>
                <Text variant="small">{pillar.description}</Text>
              </Card>
            ))}
          </Grid>
        </Container>
      </Section>

      {/* 6. HOW IT WORKS TIMELINE */}
      <Section padding="none">
        <Container size="xl">
          <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
            <Heading level="h2">Seamless 4-Step Experience</Heading>
            <Text variant="small">From craving to piping hot meal in under 20 minutes</Text>
          </div>

          <Grid cols={4} gap="md">
            {STEPS.map((s, idx) => (
              <div key={idx} className="glass-panel p-6 rounded-3xl border border-white/10 space-y-3 relative">
                <span className="font-mono text-3xl font-black text-primary/40">{s.step}</span>
                <Heading level="h4">{s.title}</Heading>
                <Text variant="small">{s.description}</Text>
              </div>
            ))}
          </Grid>
        </Container>
      </Section>

      {/* 7. CUSTOMER TESTIMONIALS */}
      <Section padding="none">
        <Container size="xl">
          <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
            <Heading level="h2">Loved by 150,000+ Foodies</Heading>
            <Text variant="small">Here is what our community has to say about KhanaNow</Text>
          </div>

          <Grid cols={3} gap="lg">
            {TESTIMONIALS.map((t, idx) => (
              <Card key={idx} className="p-6 border-border space-y-4 glass-card">
                <RatingStars rating={t.rating} size="sm" />
                <Text variant="body" className="italic text-foreground/90">"{t.review}"</Text>
                <HStack gap="sm" align="center" className="pt-2 border-t border-border/60">
                  <img src={t.avatar} alt={t.name} className="h-10 w-10 rounded-full object-cover border border-primary/40" />
                  <div>
                    <Text variant="small" weight="bold">{t.name}</Text>
                    <Text variant="caption">{t.role}</Text>
                  </div>
                </HStack>
              </Card>
            ))}
          </Grid>
        </Container>
      </Section>

      {/* 8. DOWNLOAD APP SECTION */}
      <Section padding="none">
        <Container size="xl">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-card via-card/90 to-primary/20 border border-white/10 p-8 md:p-14 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-xl">
              <Badge variant="default" className="px-3.5 py-1">MOBILE APP</Badge>
              <Heading level="h1">Order Faster with the KhanaNow App</Heading>
              <Text variant="lead">Get exclusive app-only coupons, live driver map tracking, and 1-click reorder widgets.</Text>

              <HStack gap="md" className="pt-4">
                <Button size="lg" className="font-extrabold gap-2 shadow-lg shadow-primary/30">
                  <Smartphone className="h-5 w-5" /> Download App
                </Button>
              </HStack>
            </div>

            <div className="flex h-64 w-64 items-center justify-center rounded-3xl bg-card border border-white/10 shadow-2xl text-center p-6 shrink-0">
              <div>
                <Smartphone className="h-16 w-16 text-primary mx-auto mb-3 animate-pulse" />
                <Text variant="small" weight="bold">Scan to Download</Text>
                <Text variant="caption">Available on iOS & Android</Text>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* 9. NEWSLETTER SUBSCRIPTION */}
      <Section padding="none" className="pb-12">
        <Container size="md">
          <Card className="p-8 md:p-12 text-center border-border space-y-6 glass-panel">
            <div className="space-y-2 max-w-lg mx-auto">
              <Heading level="h2">Join the Foodie Club</Heading>
              <Text variant="small">Get secret weekend promo codes and new restaurant drop alerts.</Text>
            </div>

            {subscribed ? (
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-400 font-bold text-sm">
                ✓ Thank you for subscribing! Check your inbox for your ₹100 welcome voucher code.
              </div>
            ) : (
              <form onSubmit={handleNewsletter} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  required
                  placeholder="Enter your email address..."
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="flex-1 h-12 rounded-xl border border-border bg-card/80 px-4 text-sm font-medium text-foreground focus:border-primary focus:outline-none"
                />
                <Button type="submit" size="lg" className="font-bold h-12 px-6">
                  Subscribe <Send className="h-4 w-4 ml-1.5" />
                </Button>
              </form>
            )}
          </Card>
        </Container>
      </Section>
    </div>
  );
};
