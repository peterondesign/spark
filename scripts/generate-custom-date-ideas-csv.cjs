const fs = require('fs');

const outPath = '/Users/peteriyitor/Downloads/date_ideas_rows (2).csv';

const rawItems = [
  "Farmer's market",
  "Flower market",
  "Street food stalls",
  "Bookstore cafe",
  "Comic book shop",
  "Library",
  "Big bookstore",
  "Beach picnic",
  "Riverside",
  "Viewpoint",
  "Viewpoint picnic",
  "Art museum",
  "History museum",
  "Beach sit + walk",
  "Marina watching boats",
  "Brunch spot",
  "Thrift store",
  "Record store",
  "Plant shop",
  "Blanket and lie down in park",
  "People-watching in park",
  "Grocery store + cook together",
  "Park bench",
  "Picnic",
  "Beach picnic",
  "Bike ride together",
  "Board game cafe",
  "Ice cream",
  "Puzzles",
  "Outdoor yoga",
  "Draw/Sketch together",
  "Street performers",
  "Pottery class",
  "Paint + sip",
  "Forest trail",
  "Coastal cliff hike",
  "Evening hike",
  "Animal shelter visit",
  "Feed ducks",
  "Photo walk",
  "Beach clean-up",
  "Cafe work session",
  "Table tennis",
  "Mini golf",
  "Bowling",
  "Basketball",
  "Book reading event",
  "Beach sunrise",
  "Street art walk",
  "Window shopping stroll",
  "Vintage shops",
  "Local boutiques",
  "Make tea at home",
  "Ferry ride",
  "Night walk",
  "Beach at night",
  "Park at night",
  "Riverside walk",
  "Stargazing at Park",
  "Stargazing at Beach",
  "Stargazing from Rooftop",
  "Movie night at home",
  "Outdoor cinema",
  "Indie theater",
  "Late night drive",
  "Nighttime viewpoint sit",
  "Hotel rooftop bar",
  "Cozy cafe",
  "Board games at home",
  "Live music",
  "Tennis",
  "Padel",
  "Rock climbing",
  "Swimming",
  "Park jog",
  "Trail run",
  "Beach swim",
  "Lake dip",
  "Cycling",
  "Running / jogging",
  "Rent bikes",
  "Scooter ride",
  "Skateboard",
  "Hiking",
  "Waterfalls",
  "Stand-up paddleboarding",
  "Kayaking",
  "Surfing",
  "Outdoor workout park",
  "Volleyball",
  "Beach volleyball",
  "Badminton",
  "Dance class",
  "Salsa Dance Class",
  "Bachata Dance Class",
  "Hip-hop Dance Class",
  "Contemporary Dance Class",
  "Night cycling",
  "Night run",
  "Bowling",
  "Beach night swim",
  "Arcade",
  "Pool / billiards",
  "Bouldering",
  "Indoor rock climbing",
  "Outdoor rock climbing",
  "Trampoline park",
  "Go-karting",
  "Laser tag",
  "Escape room",
  "Boxing",
  "Flower picking",
  "Sunrise picnic",
  "Scenic picnic",
  "Boat ride",
  "Vineyard visit",
  "Wine tasting",
  "Cooking together",
  "Paint each other",
  "Botanical garden",
  "Greenhouse visit",
  "Polaroid date",
  "Beach day",
  "Love letter exchange",
  "Scenic train ride",
  "Arts and Crafts",
  "Knitting",
  "Breakfast date",
  "Slow market shopping",
  "Hammock or blanket rest",
  "Spa day",
  "Massage session",
  "Sauna",
  "Handmade gift exchange",
  "Day cinema",
  "Shared reading",
  "Candlelight dinner",
  "Balcony dinner",
  "Floor dinner with candles",
  "Music listening session",
  "Hotel lounge",
  "Photo walk at night",
  "Night train",
  "tram ride",
  "Fine dining",
  "Private chef at home",
  "Helicopter ride",
  "Yacht rental",
  "Boat rental",
  "hotel stay",
  "concert",
  "Rent a car",
  "Hot air balloon ride",
  "cocktail class",
  "Language Exchange",
  "Ski resort",
  "Gourmet food tour",
  "Blindfolded taste test",
  "IKEA date",
  "Forest park",
  "Art exhibition",
  "Visit landmarks",
  "Cultural center",
  "Playground",
  "Unique Restaurants",
  "Hotpot dinner",
  "Brewery",
  "Craft Beers",
  "Aromatherapy",
  "Sushi",
  "Art Studio",
  "Make your own jewellry",
  "Zip lines",
  "Climbing walls",
  "bungee jumping",
  "Skydiving",
  "Cliff jumping",
  "Rent a limo",
  "Helicopter ride",
  "Orchestra",
  "Opera",
  "Small venue gig",
  "DJ set",
  "Jazz performance",
  "Jam session",
  "Musical theater",
  "Improv",
  "Candlelight concert",
  "Spoken word nights",
  "Slam poetry",
  "open mic",
  "One-person shows",
  "Bookstore readings",
  "Sketch comedy",
  "Haunted houses",
  "Escape rooms",
  "Traditional circus",
  "Cabaret shows",
  "Water parks",
  "carnivals",
  "Trampolines",
  "Magic shows",
  "paintball",
  "Breathwork sessions",
  "Meditation",
  "Sound baths",
  "Float therapy",
  "Sauna + cold exposure",
  "Horseback riding",
  "archery",
  "baking class",
  "baking together",
  "bird watching",
  "cable cars",
  "champagne brunch",
  "cooking class",
  "photoshoot at home",
  "fishing trip",
  "gardening together",
  "kite flying at a park",
  "martial arts class",
  "nature photography",
  "parasailing",
  "planetarium",
  "pub quiz",
  "road trip",
  "roller skating",
  "scuba diving",
  "silent disco",
  "video game night",
  "volunteer together",
  "VR Immersive Experience",
  "yoga in the park",
  "yoga class",
  "improv dance",
  "Hot yoga",
  "Motorcycle ride",
  "Drinks by the River",
  "amphibious tour",
  "pilates"
];

const items = [...new Set(rawItems.map((s) => s.trim()).filter(Boolean))];

const titleOverrides = {
  "ikea date": "IKEA Date",
  "dj set": "DJ Set",
  "open mic": "Open Mic",
  "pool / billiards": "Pool / Billiards",
  "stand-up paddleboarding": "Stand-Up Paddleboarding",
  "hip-hop dance class": "Hip-Hop Dance Class",
  "paint + sip": "Paint + Sip",
  "sauna + cold exposure": "Sauna + Cold Exposure",
  "hotpot dinner": "Hotpot Dinner",
  "art studio": "Art Studio",
  "bookstore cafe": "Bookstore Cafe",
  "cafe work session": "Cafe Work Session",
  "cozy cafe": "Cozy Cafe",
  "tram ride": "Tram Ride",
  "hotel stay": "Hotel Stay",
  "concert": "Concert",
  "cocktail class": "Cocktail Class",
  "bungee jumping": "Bungee Jumping",
  "paintball": "Paintball",
  "vr immersive experience": "VR Immersive Experience",
  "hot yoga": "Hot Yoga",
  "pub quiz": "Pub Quiz",
  "drinks by the river": "Drinks by the River"
};

const minorWords = new Set(['a', 'an', 'and', 'at', 'for', 'from', 'in', 'of', 'on', 'or', 'the', 'to', 'with']);

function hasAny(text, patterns) {
  return patterns.some((pattern) => text.includes(pattern));
}

function normalizeWord(word) {
  if (!word) return word;
  return word
    .split('-')
    .map((part) => (part ? part.charAt(0).toUpperCase() + part.slice(1).toLowerCase() : part))
    .join('-');
}

function normalizeTitle(title) {
  const lower = title.toLowerCase();
  if (titleOverrides[lower]) return titleOverrides[lower];

  return lower
    .split(/(\s+|\/|\+)/)
    .map((token, index) => {
      if (/^\s+$/.test(token) || token === '/' || token === '+') return token;
      if (minorWords.has(token) && index !== 0) return token;
      return normalizeWord(token);
    })
    .join('');
}

function slugify(s) {
  return s
    .toLowerCase()
    .replace(/[+/]/g, ' ')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function inferCategory(t) {
  const s = t.toLowerCase();
  if (/(aromatherapy|breathwork|meditation|sound bath|float therapy|sauna)/.test(s)) return 'Relaxation';
  if (/paintball/.test(s)) return 'Outdoor';
  if (/(market|food|brunch|cafe|ice cream|tea|grocery|picnic|bar|vineyard|wine|cooking|breakfast|dinner|chef|cocktail|restaurant|hotpot|brewery|beer|sushi|taste test|baking|champagne brunch)/.test(s)) return 'Food & Drink';
  if (/(museum|library|book|comic|record|art|vintage|boutique|thrift|pottery|paint|reading|craft|knitting|language exchange|love letter|polaroid|gift exchange|cultural center|landmarks|jewellry|art studio|art exhibition|photoshoot|photography|planetarium|volunteer)/.test(s)) return 'Cultural';
  if (/(yoga|bike|hike|basketball|bowling|golf|table tennis|clean-up|trail|tennis|padel|climbing|swimming|jog|run|cycling|scooter|skateboard|waterfalls|paddleboarding|kayaking|surfing|workout|volleyball|badminton|dance|bouldering|trampoline|boxing|ski|zip lines|bungee|skydiving|cliff jumping|horseback|paintball|playground|archery|bird watching|cable cars|fishing|gardening|kite flying|martial arts|parasailing|road trip|roller skating|scuba diving|motorcycle|amphibious tour|pilates)/.test(s)) return 'Outdoor';
  return 'Entertainment';
}

function inferLocation(t) {
  const s = t.toLowerCase();
  if (/(aromatherapy|massage|spa day|float therapy|sauna)/.test(s)) return '{type:indoor,setting:spa}';
  if (/(breathwork|meditation|sound bath)/.test(s)) return '{type:indoor,setting:studio}';
  if (/(beach|coastal|marina|ferry|riverside|lake|swim|dip|waterfalls|paddleboarding|kayaking|surfing|boat ride|boat rental|yacht|vineyard|water parks|cliff jumping|fishing|parasailing|scuba diving|drinks by the river|amphibious tour)/.test(s)) return '{type:outdoor,setting:waterfront}';
  if (/(park|trail|hike|viewpoint|stargazing|forest|jog|run|workout|volleyball|badminton|cycling|rent bikes|skateboard|flower picking|picnic|botanical garden|garden|hammock|hot air balloon|ski|forest park|playground|horseback|zip lines|bungee|skydiving|paintball|archery|bird watching|cable cars|gardening|kite flying|road trip|motorcycle ride|yoga in the park)/.test(s)) return '{type:outdoor,setting:park}';
  if (/(cafe|bookstore|library|museum|theater|bar|shop|store|home|shelter|bowling|golf|pottery|paint|dance class|arcade|billiards|bouldering|climbing walls|indoor rock climbing|trampoline|laser tag|escape room|escape rooms|boxing|greenhouse|spa|massage|sauna|cinema|hotel|concert|cocktail class|fine dining|chef|ikea|cultural center|brewery|art studio|opera|orchestra|gig|dj set|jazz|jam session|spoken word|poetry|open mic|circus|cabaret|magic shows|baking class|photoshoot at home|martial arts class|planetarium|pub quiz|video game night|vr immersive experience|yoga class|hot yoga|pilates|silent disco)/.test(s)) return '{type:indoor,setting:urban}';
  return '{type:outdoor,setting:urban}';
}

function inferTime(t) {
  const s = t.toLowerCase();
  return /(night|evening|stargazing|sunrise|rooftop|bar|live music|cinema|theater|concert|hotel lounge|fine dining|opera|orchestra|gig|dj set|jazz|jam session|spoken word|poetry|open mic|cabaret|candlelight|magic shows|pub quiz|silent disco|video game night|drinks by the river)/.test(s)
    ? 'Night'
    : 'Daytime';
}

function inferMood(t) {
  const s = t.toLowerCase();
  if (/(bike|hike|basketball|bowling|golf|table tennis|yoga|clean-up|trail|tennis|padel|climbing|swimming|jog|run|cycling|scooter|skateboard|waterfalls|paddleboarding|kayaking|surfing|workout|volleyball|badminton|dance|bouldering|trampoline|boxing|ski|go-karting|laser tag|escape room|zip lines|bungee|skydiving|cliff jumping|paintball|horseback|playground|archery|cable cars|fishing|gardening|kite flying|martial arts|parasailing|roller skating|scuba diving|road trip|motorcycle ride|amphibious tour|pilates)/.test(s)) return 'active';
  if (/(aromatherapy|breathwork|meditation|sound bath|float therapy|sauna|massage|spa day)/.test(s)) return 'chill';
  if (/(picnic|night walk|stargazing|viewpoint|beach at night|riverside walk|cozy|love letter|candlelight dinner|balcony dinner|floor dinner|boat ride|yacht|hotel stay|sunrise picnic|scenic picnic|beach day|massage|spa day|blindfolded taste test|music listening session|sauna|aromatherapy|sound baths|float therapy|meditation|champagne brunch|drinks by the river|planetarium)/.test(s)) return 'romantic';
  return 'chill';
}

function inferPrice(t) {
  const s = t.toLowerCase();
  if (/(bar|hotel rooftop|pottery|paint \+ sip|mini golf|bowling|ferry|museum|theater|padel|rock climbing|paddleboarding|kayaking|surfing|dance class|spa day|massage|sauna|fine dining|private chef|helicopter|yacht|boat rental|hotel stay|concert|hot air balloon|cocktail class|ski resort|vineyard|wine tasting|go-karting|laser tag|escape room|escape rooms|opera|orchestra|cabaret|water parks|craft beers|brewery|hotpot|rent a limo|skydiving|bungee jumping|horseback riding|float therapy)/.test(s)) {
    return 'expensive';
  }
  return 'affordable';
}

function buildDescription(title, category) {
  const s = title.toLowerCase();
  if (hasAny(s, ['picnic', 'beach day', 'viewpoint', 'stargazing', 'boat ride', 'night walk', 'riverside', 'marina', 'sunrise'])) {
    return `Slow down and share an easy romantic moment with ${title}.`;
  }
  if (hasAny(s, ['market', 'shop', 'shopping', 'ikea', 'bookstore', 'library', 'museum', 'exhibition', 'cultural center', 'landmarks'])) {
    return `Explore ${title} together and turn it into a conversation-filled date.`;
  }
  if (hasAny(s, ['dinner', 'brunch', 'breakfast', 'cafe', 'restaurant', 'brewery', 'wine', 'cocktail', 'sushi', 'hotpot', 'taste test', 'food tour'])) {
    return `Make ${title} the centerpiece of a date built around good food, drinks, and time together.`;
  }
  if (hasAny(s, ['concert', 'gig', 'opera', 'orchestra', 'jazz', 'dj set', 'spoken word', 'poetry', 'open mic', 'theater', 'circus', 'cabaret', 'magic shows', 'improv'])) {
    return `Plan a night around ${title} and enjoy a shared live experience.`;
  }
  if (hasAny(s, ['massage', 'spa', 'sauna', 'meditation', 'breathwork', 'sound bath', 'float therapy', 'aromatherapy'])) {
    return `Use ${title} to unwind, reset, and spend calm time together.`;
  }
  if (hasAny(s, ['paint', 'pottery', 'art studio', 'jewellry', 'craft', 'knitting', 'polaroid', 'draw', 'sketch', 'handmade gift'])) {
    return `Get creative with ${title} and leave the date with something memorable.`;
  }
  if (hasAny(s, ['ride', 'train', 'tram', 'car', 'limo', 'helicopter', 'balloon', 'yacht', 'rental', 'ferry'])) {
    return `Turn the journey into the date with ${title} and enjoy the change of scenery.`;
  }
  if (category === 'Outdoor') {
    return `Choose ${title} for an active date that gets you moving together.`;
  }
  if (category === 'Cultural') {
    return `Use ${title} to share ideas, curiosity, and a little creativity.`;
  }
  if (category === 'Relaxation') {
    return `Keep the pace gentle with ${title} and focus on being present together.`;
  }
  return `Enjoy ${title} together with a simple plan and room for natural conversation.`;
}

function buildTip(title, mood, timeOfDay) {
  const s = title.toLowerCase();
  if (hasAny(s, ['hike', 'trail', 'run', 'cycling', 'swim', 'kayaking', 'surfing', 'ski', 'horseback', 'paintball', 'zip lines', 'skydiving', 'bungee'])) {
    return 'Check the weather, wear the right gear, and bring water.';
  }
  if (hasAny(s, ['picnic', 'beach', 'park', 'viewpoint', 'stargazing', 'sunrise'])) {
    return 'Pack a blanket, a simple snack, and a backup plan for weather changes.';
  }
  if (hasAny(s, ['dinner', 'brunch', 'breakfast', 'restaurant', 'bar', 'brewery', 'wine', 'cocktail', 'hotpot', 'chef'])) {
    return 'Book ahead if needed and leave enough time to enjoy the experience slowly.';
  }
  if (hasAny(s, ['concert', 'gig', 'opera', 'orchestra', 'theater', 'open mic', 'poetry', 'cabaret', 'circus', 'magic shows'])) {
    return 'Get tickets early and plan your timing around the start of the show.';
  }
  if (hasAny(s, ['museum', 'library', 'bookstore', 'market', 'shop', 'ikea', 'landmarks', 'cultural center'])) {
    return 'Go in with a loose plan and give yourselves time to wander.';
  }
  if (hasAny(s, ['massage', 'spa', 'sauna', 'meditation', 'breathwork', 'sound bath', 'float therapy', 'aromatherapy'])) {
    return 'Choose a quieter time slot and avoid rushing the rest of the day.';
  }
  if (hasAny(s, ['paint', 'pottery', 'craft', 'knitting', 'jewellry', 'draw', 'sketch', 'polaroid'])) {
    return 'Wear something practical and focus on having fun instead of getting it perfect.';
  }
  if (timeOfDay === 'Night') {
    return 'Plan transport ahead of time so the night stays easy and relaxed.';
  }
  if (mood === 'romantic') {
    return 'Keep the plan simple so you can stay focused on each other.';
  }
  return 'Keep it low-pressure and leave space for the date to unfold naturally.';
}

function buildLongDescription(title, category, mood) {
  const s = title.toLowerCase();
  if (hasAny(s, ['picnic', 'viewpoint', 'stargazing', 'boat ride', 'night walk', 'love letter', 'candlelight dinner', 'balcony dinner', 'floor dinner'])) {
    return `${title} works well when you want a more intentional date with time to talk, slow down, and enjoy the setting. It is easy to personalize with food, music, or a scenic route.`;
  }
  if (hasAny(s, ['market', 'museum', 'library', 'bookstore', 'shop', 'exhibition', 'landmarks', 'cultural center', 'ikea'])) {
    return `${title} gives you a natural mix of movement and conversation. You can explore at your own pace, react to what you find, and keep the plan flexible.`;
  }
  if (hasAny(s, ['dinner', 'brunch', 'breakfast', 'restaurant', 'brewery', 'wine', 'cocktail', 'sushi', 'hotpot', 'chef', 'taste test'])) {
    return `${title} is a strong choice when you want the date to feel easy but memorable. Good food and a comfortable setting make conversation flow without forcing the moment.`;
  }
  if (hasAny(s, ['concert', 'gig', 'opera', 'orchestra', 'jazz', 'dj set', 'poetry', 'open mic', 'theater', 'cabaret', 'circus', 'magic shows', 'improv'])) {
    return `${title} adds built-in energy to the date and gives you something to share in real time. It also makes the before and after conversation more interesting.`;
  }
  if (hasAny(s, ['massage', 'spa', 'sauna', 'meditation', 'breathwork', 'sound bath', 'float therapy', 'aromatherapy'])) {
    return `${title} is ideal when you want a softer pace and a more restorative kind of connection. It creates space to relax together without needing a packed schedule.`;
  }
  if (hasAny(s, ['paint', 'pottery', 'art studio', 'jewellry', 'craft', 'knitting', 'polaroid', 'draw', 'sketch', 'handmade gift'])) {
    return `${title} makes the date feel personal because you are creating something side by side. The process is playful, low-pressure, and often more memorable than the finished result.`;
  }
  if (category === 'Outdoor' || mood === 'active') {
    return `${title} is a good fit when you want the date to feel energetic and shared. A little movement keeps things from feeling stiff and gives you something to do together.`;
  }
  if (category === 'Relaxation') {
    return `${title} works best when the goal is to slow the pace and enjoy calm time together. It is simple, grounding, and easy to build the rest of the day around.`;
  }
  return `${title} is an easy date idea that keeps the pressure low while still giving you a shared experience. A small plan and the right timing usually make it feel thoughtful without overcomplicating it.`;
}

function csvEscape(v) {
  const str = String(v ?? '');
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

const header = [
  'id',
  'title',
  'category',
  'location',
  'description',
  'slug',
  'image',
  'timeOfDay',
  'mood',
  'priceLevel',
  'tips',
  'longDescription',
  'trending'
];

const rows = items.map((title, i) => {
  const normalizedTitle = normalizeTitle(title);
  const category = inferCategory(normalizedTitle);
  const location = inferLocation(normalizedTitle);
  const timeOfDay = inferTime(normalizedTitle);
  const mood = inferMood(normalizedTitle);
  const priceLevel = inferPrice(normalizedTitle);
  const slug = slugify(normalizedTitle);
  const row = [
    i + 1,
    normalizedTitle,
    category,
    location,
    buildDescription(normalizedTitle, category),
    slug,
    `https://ljixbbwscwfdqygjmljq.supabase.co/storage/v1/object/public/generated-images/${slug}.jpg`,
    timeOfDay,
    mood,
    priceLevel,
    buildTip(normalizedTitle, mood, timeOfDay),
    buildLongDescription(normalizedTitle, category, mood),
    'false'
  ];

  return row.map(csvEscape).join(',');
});

const csv = [header.join(','), ...rows].join('\n') + '\n';
fs.writeFileSync(outPath, csv, 'utf8');

console.log(`Wrote ${items.length} ideas to ${outPath}`);
