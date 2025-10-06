-- Insert dummy blog posts for testing
-- Idempotent: Only inserts if slugs don't already exist

-- Insert blog 1: The Evolution of Techno
INSERT INTO public.blogs (
  title,
  slug,
  content,
  excerpt,
  author,
  cover_image_url,
  status,
  featured,
  tags,
  seo_title,
  seo_description,
  published_at,
  created_at
)
SELECT
  'The Evolution of Techno: From Detroit to Berlin',
  'the-evolution-of-techno-from-detroit-to-berlin',
  E'Techno music has traveled a remarkable journey from its birthplace in Detroit to becoming the heartbeat of Berlin''s underground scene. In the mid-1980s, pioneers like Juan Atkins, Derrick May, and Kevin Saunderson created a sound that merged electronic experimentation with soulful grooves.\n\nThe genre found its European home in Berlin after the fall of the Wall in 1989. Clubs like Tresor and Berghain became temples of techno, where the music evolved into harder, more industrial sounds. The city''s abandoned spaces and post-reunification energy created the perfect breeding ground for this electronic revolution.\n\nToday, techno continues to evolve, incorporating influences from minimal, industrial, and ambient music. Modern producers are pushing boundaries while honoring the genre''s roots, creating a sound that''s both futuristic and deeply connected to its history.\n\nThe global techno scene now spans from Detroit and Berlin to Tokyo, São Paulo, and beyond. Each region brings its own flavor to the genre, ensuring that techno remains one of electronic music''s most dynamic and influential styles.',
  'Discover how techno music evolved from Detroit basements to Berlin''s legendary clubs, shaping electronic music culture worldwide.',
  'Marcus Rivera',
  'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=1200&h=675&fit=crop',
  'published',
  true,
  ARRAY['techno', 'detroit', 'berlin', 'electronic music', 'history'],
  'The Evolution of Techno: From Detroit to Berlin | Electronic Music History',
  'Explore the fascinating journey of techno music from its Detroit origins to Berlin''s underground scene and beyond.',
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '5 days'
WHERE NOT EXISTS (
  SELECT 1 FROM public.blogs WHERE slug = 'the-evolution-of-techno-from-detroit-to-berlin'
);

-- Insert blog 2: Festival Production
INSERT INTO public.blogs (
  title,
  slug,
  content,
  excerpt,
  author,
  cover_image_url,
  status,
  featured,
  tags,
  seo_title,
  seo_description,
  published_at,
  created_at
)
SELECT
  'Behind the Scenes: Electronic Music Festival Production',
  'behind-the-scenes-electronic-music-festival-production',
  E'Creating a world-class electronic music festival requires months of meticulous planning and coordination. From securing permits to designing immersive stage productions, every detail matters in crafting an unforgettable experience.\n\nThe technical setup alone can take weeks. Modern festivals feature cutting-edge sound systems, elaborate lighting rigs, and LED displays that create visual spectacles. Sound engineers work tirelessly to ensure perfect audio quality across massive outdoor venues, battling weather conditions and acoustic challenges.\n\nArtist logistics present another complex puzzle. Coordinating travel, accommodation, and technical riders for dozens of international DJs requires precision timing. Production teams must ensure each artist''s specific equipment needs are met, from rare analog synthesizers to custom DJ setups.\n\nSustainability has become increasingly important in festival production. Many organizers now implement eco-friendly initiatives like renewable energy, waste reduction programs, and carbon offset schemes. The goal is to minimize environmental impact while maximizing the transformative power of electronic music.\n\nBehind every magical festival moment lies countless hours of hard work from dedicated crews who bring these electronic music gatherings to life.',
  'An inside look at what it takes to produce a major electronic music festival, from technical setup to artist coordination.',
  'Sarah Chen',
  'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=1200&h=675&fit=crop',
  'published',
  true,
  ARRAY['festivals', 'production', 'events', 'behind the scenes', 'live music'],
  'Behind the Scenes: Electronic Music Festival Production',
  'Discover the complex process behind creating unforgettable electronic music festivals.',
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '3 days'
WHERE NOT EXISTS (
  SELECT 1 FROM public.blogs WHERE slug = 'behind-the-scenes-electronic-music-festival-production'
);

-- Insert blog 3: Modular Synthesis
INSERT INTO public.blogs (
  title,
  slug,
  content,
  excerpt,
  author,
  cover_image_url,
  status,
  featured,
  tags,
  seo_title,
  seo_description,
  published_at,
  created_at
)
SELECT
  'The Resurgence of Modular Synthesis in Modern Electronic Music',
  'the-resurgence-of-modular-synthesis-in-modern-electronic-music',
  E'Modular synthesizers are experiencing a renaissance in electronic music production. These intricate systems, composed of separate modules connected by patch cables, offer unparalleled sonic flexibility and hands-on creativity that software can''t replicate.\n\nThe tactile nature of modular synthesis appeals to producers seeking escape from screen-based production. Twisting knobs, patching cables, and experimenting with signal flow creates a more intimate, exploratory approach to sound design. Each module serves a specific function—oscillators, filters, envelopes—allowing producers to build custom instruments.\n\nCompanies like Moog, Make Noise, and Intellijel are pushing modular innovation forward. Modern modules incorporate digital processing alongside traditional analog circuits, expanding creative possibilities. The Eurorack format has become the industry standard, ensuring compatibility across manufacturers.\n\nModular synthesis isn''t just about nostalgia. Contemporary artists like Suzanne Ciani, Alessandro Cortini, and Kaitlyn Aurelia Smith demonstrate how modular systems can create cutting-edge, forward-thinking electronic music. The format encourages happy accidents and unexpected discoveries that lead to unique sonic signatures.\n\nWhether you''re a seasoned producer or curious beginner, modular synthesis offers a rewarding journey into the depths of electronic sound creation.',
  'Explore why modular synthesizers are making a comeback and how they''re shaping the future of electronic music production.',
  'David Thompson',
  'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1200&h=675&fit=crop',
  'published',
  false,
  ARRAY['synthesis', 'modular', 'production', 'gear', 'sound design'],
  'The Resurgence of Modular Synthesis in Modern Electronic Music',
  'Learn about the modular synthesis renaissance and how it''s transforming electronic music production.',
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '2 days'
WHERE NOT EXISTS (
  SELECT 1 FROM public.blogs WHERE slug = 'the-resurgence-of-modular-synthesis-in-modern-electronic-music'
);

-- Insert blog 4: Underground Scene
INSERT INTO public.blogs (
  title,
  slug,
  content,
  excerpt,
  author,
  cover_image_url,
  status,
  featured,
  tags,
  seo_title,
  seo_description,
  published_at,
  created_at
)
SELECT
  'Ankara''s Underground Electronic Music Scene: A Hidden Gem',
  'ankara-underground-electronic-music-scene',
  E'While Istanbul often dominates Turkey''s electronic music conversation, Ankara is quietly cultivating a vibrant underground scene that deserves recognition. The capital city''s electronic music community is tight-knit, passionate, and fiercely independent.\n\nVenues like Kite, Guus, and Shades have become sanctuaries for underground electronic music lovers. These intimate spaces host everything from minimal techno to experimental ambient, creating environments where music takes center stage over commercial concerns.\n\nLocal producers and DJs are developing a distinctive Ankara sound that blends traditional Turkish musical elements with contemporary electronic production. This cultural fusion creates something unique—neither purely Western nor traditionally Turkish, but authentically Ankara.\n\nThe scene''s DIY ethos is particularly strong. Promoters organize warehouse parties and outdoor gatherings that capture the spirit of early rave culture. These events prioritize community and musical exploration over profit, fostering genuine connections between artists and audiences.\n\nAnkara''s electronic music scene proves that you don''t need to be in a major global hub to create something special. Sometimes the most interesting movements happen in unexpected places, driven by passionate communities committed to pushing boundaries.',
  'Discover the thriving underground electronic music scene in Ankara, Turkey''s capital city.',
  'Elif Yılmaz',
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&h=675&fit=crop',
  'published',
  false,
  ARRAY['ankara', 'underground', 'local scene', 'turkey', 'clubs'],
  'Ankara''s Underground Electronic Music Scene: A Hidden Gem',
  'Explore the vibrant underground electronic music scene flourishing in Turkey''s capital city.',
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '1 day'
WHERE NOT EXISTS (
  SELECT 1 FROM public.blogs WHERE slug = 'ankara-underground-electronic-music-scene'
);

-- Insert blog 5: DJ Technology
INSERT INTO public.blogs (
  title,
  slug,
  content,
  excerpt,
  author,
  cover_image_url,
  status,
  featured,
  tags,
  seo_title,
  seo_description,
  published_at,
  created_at
)
SELECT
  'The Future of DJ Technology: AI and Beyond',
  'the-future-of-dj-technology-ai-and-beyond',
  E'DJ technology is evolving at an unprecedented pace. Artificial intelligence, machine learning, and advanced software are transforming how DJs perform, create, and connect with audiences. The future of DJing looks radically different from its vinyl roots.\n\nAI-powered tools are already assisting DJs with harmonic mixing, track selection, and even real-time remixing. Software can analyze crowd energy and suggest tracks that match the mood, though many purists argue this removes the human intuition that makes great DJs special.\n\nStem separation technology allows DJs to isolate and manipulate individual elements of tracks in real-time. Vocals, drums, basslines, and melodies can be independently controlled, enabling unprecedented creative freedom during live performances.\n\nHaptic feedback systems are being developed to give digital DJing more tactile feel. These innovations aim to bridge the gap between the physical sensation of manipulating vinyl and the convenience of digital performance.\n\nDespite technological advances, the core of DJing remains unchanged: reading the room, building energy, and creating memorable experiences. Technology should enhance, not replace, the human element that makes live electronic music performances magical.\n\nThe future of DJing will likely blend cutting-edge technology with timeless performance skills, creating new possibilities while honoring the art form''s rich history.',
  'How AI and emerging technologies are reshaping the art of DJing and what it means for electronic music''s future.',
  'James Martinez',
  'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=1200&h=675&fit=crop',
  'published',
  false,
  ARRAY['dj technology', 'ai', 'future', 'innovation', 'performance'],
  'The Future of DJ Technology: AI and Beyond',
  'Discover how artificial intelligence and emerging technologies are transforming the art of DJing.',
  NOW() - INTERVAL '6 hours',
  NOW() - INTERVAL '6 hours'
WHERE NOT EXISTS (
  SELECT 1 FROM public.blogs WHERE slug = 'the-future-of-dj-technology-ai-and-beyond'
);

