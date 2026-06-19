export const initialPosts = [
  {
    id: 'kyoto-autumn-trail',
    author: 'Elena Rostova',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    timeAgo: '2 hours ago',
    location: 'Kyoto, Japan',
    title: 'Autumn Temple Trail: Hidden Gems & Matcha',
    description: 'Just wrapped up an incredible trail through Kyoto\'s quieter, northern temples. Far away from the massive crowds of Kiyomizu-dera, finding solace in nature and ancient wood craftsmanship. Highlight of the trip was definitely Otagi Nenbutsu-ji with its whimsical moss-covered statues.',
    cost: '$450 USD',
    duration: '3 Days, 2 Nights',
    highlights: ['Otagi Nenbutsu-ji', 'Arashiyama Bamboo Grove', 'Tenryu-ji Temple'],
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDlkwHhgCwaNzdYaQ-cpF4N4xk0ttNio8KiiDSIS-14uRHaBr1EoGCunGuRl8Xt_KrzzJAEr8tdkyHSphvQZ8Q36DePPWCZIQXHej8a5h8z7OBWQl8HhbD0kkBtSR6qoQi-C8JPEBnfa0SDPlP3AEnke8BTflS7EbXMA37aVpp0y3HK39pCgYKpU9xjuwtZEAkWeHlauNQw2TPMyESvH1P0NB24bD9kaD3kSr9tB5GpCLBC5Y5TokYrz1PUj8Un0nJLGRnNAdShB4Qw',
    imageAlt: 'Scenic Japanese temple surrounded by vivid red and orange autumn leaves',
    votes: 342,
    commentsCount: 2,
    difficulty: 'Moderate',
    dayByDay: [
      {
        day: 1,
        title: 'Arrival & Northern Kyoto Exploration',
        description: 'Arrived in Kyoto, dropped off our luggage, and headed straight to Northern Kyoto. Visited peaceful rock gardens and enjoyed a traditional matcha tea ceremony overlooking a pond.',
        badges: ['Culture', 'Matcha', 'Zen Gardens']
      },
      {
        day: 2,
        title: 'Arashiyama Trails and Bamboo Shrines',
        description: 'Woke up early to catch the Arashiyama bamboo forest without the crowds, continuing upwards past Giou-ji Temple to the serene stone steps of Saga-Toriimoto.',
        badges: ['Bamboo Hike', 'Old Town', 'Nature']
      },
      {
        day: 3,
        title: 'Whimsical Moss Stone Statues',
        description: 'Explored Otagi Nenbutsu-ji. Here, 1,200 whimsical stone statues carved by various craftsmen stand covered in moss, each with a unique humorous face or posture. Truly a unique and deeply personal highlight.',
        badges: ['Temple Art', 'Hidden Gems', 'Photography'],
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBsfhb_meZ_QAdqsWAGajaxkqgOjYbktdAg1RYvRI0F7WT3vLMPBTPmqdJvucNk8UZ7RAnmQRHk9Rqa5QsGq4S_nrkyClzjCEF9IFIopy4sxy8qcHkWR7QauWBHyaW4EcxYeqY1D39l7viOd3Bl9kctlcQ5GHwigVfwNbw__8hXyJRHSJ_bevEj6gm2g5bj2ps3u4rc9P_oJ7SWvPhOPieo2BgV0mBFC9OhiuKUoKPkbl_JxX0i9kCvxHAT52EByOe0qXkskU_ogH7B',
        imageAlt: 'Quaint stone statues of whimsical spirits covered in thick green moss'
      }
    ],
    comments: [
      {
        id: 'c1',
        author: 'Takeshi Tanaka',
        authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        timeAgo: '1 hour ago',
        votes: 18,
        text: 'Otagi Nenbutsu-ji is absolutely wonderful! I always recommend travelers to go there instead of the chaotic Kiyomizu-dera to experience the true essence of Kyoto.',
        replies: [
          {
            id: 'c1_r1',
            author: 'Elena Rostova',
            authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
            timeAgo: '45 mins ago',
            votes: 5,
            text: 'Exactly! Your guide-book recommendation on this actually saved our trip. Thank you so much Takeshi!'
          }
        ]
      },
      {
        id: 'c2',
        author: 'Sarah Jenkins',
        authorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
        timeAgo: '30 mins ago',
        votes: 10,
        text: 'Did you hire a bicycle or walk all the way from Arashiyama station? The path looks gorgeous!'
      }
    ]
  },
  {
    id: 'kyoto-hidden-temples',
    author: 'Sakura Travels',
    authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    timeAgo: '1 day ago',
    location: 'Kyoto, Japan',
    title: 'A Serene Autumn Week in Kyoto\'s Hidden Temples',
    description: 'Come along on our boutique guided tour showcasing the hidden architectural marvels of old Kyoto. We focus on lesser-visited wooden temples, offering authentic tea sensory tests, moss-garden photography, and traditional monk vegetarian meals.',
    cost: '$1,200 USD',
    duration: '7 Days, 6 Nights',
    highlights: ['Moss Garden Photography', 'Zen Temple Stay', 'Gion Evening Stroll'],
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCQL_hnHlCXGmr5fJtCu2FJk2efWi762hHLHJ9bDu9-vkWxxyZ_1qkQOg96OUMwmEloOXZ2VxbeUPzOpQ8g_Zdbg8E29cDar79T1ajuGV27V3UQ9WcjpT4bqp9f80BZlJbvytAqfC4bYR4lfkti-Zwnf8pJ0XavBMUADjPm-zAipCKywvk91jTkAurMYSTdQOwswSmsN-XlXHe747UTHm11WopYYUO3zAnHdRaRSGFHj-gIQrdK_pkFPpb977n1dKKKeJqM892NTUli',
    imageAlt: 'Beautiful wooden traditional architecture surrounded by mossy garden steps and vibrant foliage',
    votes: 125,
    commentsCount: 3,
    difficulty: 'Easy',
    dayByDay: [
      {
        day: 1,
        title: 'Arrival & Northern Higashiyama',
        description: 'Meet at Kyoto Station, check in to our luxury Machiya boutique townhouse, and take a peaceful sunset walk past canal paths in Northern Higashiyama.',
        badges: ['Canal Walk', 'Boutique Townhouse', 'Welcome Dinner']
      },
      {
        day: 2,
        title: 'Ohara\'s Rural Charm and Shoryo Garden',
        description: 'Journey to the rural mountain village of Ohara. Visit Sanzen-in Temple to witness miniature child-like stone Buddhas emerging from deep-green velvet moss rugs.',
        badges: ['Sanzen-in Temple', 'Mountain Landscapes', 'Moss Photography']
      },
      {
        day: 3,
        title: 'Arashiyama, Beyond the Bamboo',
        description: 'Venture beyond the commercial bamboo trails to visit the beautiful wooden temples hidden in Arashiyama\'s lush green hillsides.',
        badges: ['Otagi Statues', 'Quiet Trails'],
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBsfhb_meZ_QAdqsWAGajaxkqgOjYbktdAg1RYvRI0F7WT3vLMPBTPmqdJvucNk8UZ7RAnmQRHk9Rqa5QsGq4S_nrkyClzjCEF9IFIopy4sxy8qcHkWR7QauWBHyaW4EcxYeqY1D39l7viOd3Bl9kctlcQ5GHwigVfwNbw__8hXyJRHSJ_bevEj6gm2g5bj2ps3u4rc9P_oJ7SWvPhOPieo2BgV0mBFC9OhiuKUoKPkbl_JxX0i9kCvxHAT52EByOe0qXkskU_ogH7B',
        imageAlt: 'Peaceful moss wood steps in scenic garden'
      }
    ],
    comments: [
      {
        id: 'hc1',
        author: 'Marcus Aurel',
        authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
        timeAgo: '16 hours ago',
        votes: 8,
        text: 'Booked this for my parents wedding anniversary last autumn. They absolutely loved the Zen Temple stay. Thank you for curate-ing such an stress-free itinerary!'
      },
      {
        id: 'hc2',
        author: 'Yuki Morimoto',
        authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        timeAgo: '20 hours ago',
        votes: 5,
        text: 'The vegetarian monk meals (Shojin Ryori) on Day 4 were incredibly detailed. Worth every penny!'
      }
    ]
  }
];

export const initialPackages = [
  {
    id: 'bali-tropical-escape',
    title: '7-Day Tropical Paradise Escape',
    destination: 'Bali, Indonesia',
    duration: '7 Days, 6 Nights',
    agencyName: 'Wanderlust Travels Inc.',
    agencyLogo: 'https://images.unsplash.com/photo-1519751138087-5bf79df62d5b?w=150',
    isVerifiedAgency: true,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCSwEFWvWBfG2WMp9_eJlv5jWemkHhHXHICDU0fzedNN5don1SRTCbI4dBp07t35CxJ28PG5YkL3ccCAHAe7VkDvdElHe9MlyVQaPUm03nSjwOs6l8FO2pQjvd-1BudvwZhBgn7xzwviLHGqrRNRdH15d5nhmWekJQVf76fcvRth9eJ5wena60vtctuQI-477LecW-d5fAuF2k2Cp9PeqbUhkzxlXEhYa04a0-UQvL0CPA2PriwKDkpDFOZmnkaUpk1xHFPSSskY8od',
    imageAlt: 'Beautiful blue tropical beachfront lagoon with volcanic mountains in the background',
    price: 2499,
    status: 'Active',
    description: 'Escape to a carefully curated Balinese itinerary. Discover the lush emerald terraced rice fields of Ubud, swim in pristine turquoise ocean waters, and stay in award-winning luxury cliffside beachfront villas.',
    inclusions: [
      '6 nights in premium 5-star beachfront resorts',
      'Daily authentic Balinese breakfast & fine gourmet dinners',
      'Airport luxury class transfer & private driver guide',
      'Full access passes to premium beach clubs & temple tours',
      'High-speed high-bandwidth resort-wide Wi-Fi'
    ],
    stayNameText: 'Azure Beachfront Villas',
    stayDescText: 'Ocean-view luxury suites with private plunge pools, situated right on the white sands of Seminyak beach. Known for their world-class wellness spa and 24/7 personal butler service.',
    stayRating: 4.9,
    stayReviewsCount: 184,
    stayValue: 1200,
    dayByDay: [
      {
        day: 1,
        title: 'Arrival & Welcome Dinner',
        description: 'Smooth luxury car transfer from Ngurah Rai Airport. Refreshing tropical welcome drinks followed by a scenic sunset waterfront dinner at Seminyak Beach.',
        badges: ['VIP Transfer', 'Beachfront Dinner']
      },
      {
        day: 2,
        title: 'Island Hopping & Turtle Snorkeling',
        description: 'Sail in a fast private catamaran to Nusa Penida to swim with gentle manta rays and giant ocean turtles. Explore scenic coastal lookouts.',
        badges: ['Catamaran Cruising', 'Snorkeling']
      },
      {
        day: 3,
        title: 'Cultural Heritage of Ubud and Rice Fields',
        description: 'Hike through the breathtaking Tegallalang Rice Terraces and explore the serene temple ponds of Pura Tirta Empul in the lush valley.',
        badges: ['Sacred Temples', 'Emerald Terraces']
      }
    ]
  },
  {
    id: 'swiss-alps-discovery',
    title: 'Swiss Alps Luxury Scenic Tour',
    destination: 'Zermatt & St. Moritz, Switzerland',
    duration: '5 Days, 4 Nights',
    agencyName: 'Alpine Escapes Ltd.',
    isVerifiedAgency: true,
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1000',
    imageAlt: 'Snowy Matterhorn peak rising above alpine lakes',
    price: 3450,
    status: 'Active',
    description: 'Marvel at the majestic peak of the Matterhorn in Switzerland. Includes high-end glacier train tours, chalet hospitality, and gourmet fondue tastings.',
    inclusions: [
      'Glacier Express first-class mountain-view passes',
      'Chalet stays with indoor heated pools',
      'Full guided alpine hikes and cable car accesses'
    ],
    stayNameText: 'The Matterhorn Peak Chalet',
    stayDescText: 'Traditional wooden chalet styled with modern glass walls overlooking the alpine range, offering warm timber fireplace environments.',
    stayRating: 5.0,
    stayReviewsCount: 92,
    stayValue: 1800,
    dayByDay: [
      {
        day: 1,
        title: 'Zermatt Greeting',
        description: 'Arrive at car-free Zermatt station. Hotel horse-drawn carriage or eco-taxi ride to the chalet, complete with matching alpine greeting spreads.',
        badges: ['Car-free Zermatt', 'Carriage Ride']
      }
    ]
  }
];

export const initialVerifications = [
  {
    id: 'av_1',
    companyName: 'Everest Trekkers Co.',
    submittedAt: 'June 18, 2026',
    email: 'info@everesttrekkers.np',
    phone: '+977-1-443213',
    filesCount: 3,
    status: 'pending'
  },
  {
    id: 'av_2',
    companyName: 'Oceanic Wonders Ltd.',
    submittedAt: 'June 15, 2026',
    email: 'verify@oceanicwonders.com',
    phone: '+61-2-9876-5432',
    filesCount: 2,
    status: 'pending'
  }
];

export const initialFlaggedPosts = [
  {
    id: 'fp_1',
    username: 'SpammyMcSpammer',
    userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    timeAgo: '4 hours ago',
    type: 'Spam',
    content: '🚨🚨 MAKE $5000/DAY FROM TOURISM TRICKS! CLICK LYNK NOW ➡️ malicious-url.travel'
  },
  {
    id: 'fp_2',
    username: 'AggressiveHiker91',
    userAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
    timeAgo: '12 hours ago',
    type: 'Harassment',
    content: 'You guys are complete idiots for going to Kyoto. That city is literally just concrete and fake geishas. Stay home!'
  }
];

export const initialCommentReports = [
  {
    id: 'cr_1',
    username: 'TrollBot',
    postId: 'kyoto-autumn-trail',
    postTitle: 'Autumn Temple Trail: Hidden Gems & Matcha',
    text: 'Nobody cares about your fake zen pictures. Go post elsewhere.',
    reportsCount: 5
  },
  {
    id: 'cr_2',
    username: 'CrypticCoiner',
    postId: 'kyoto-autumn-trail',
    postTitle: 'Autumn Temple Trail: Hidden Gems & Matcha',
    text: 'Buy Vazhikal Coin pre-sale now! Guaranteed 100x returns before autumn.',
    reportsCount: 9
  }
];
