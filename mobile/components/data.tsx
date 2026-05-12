// ─── Local book data (bundled / offline) ────────────────────────────────────
export const GUEST_BOOKS: Book[] = [
  {
    _id: 'guest-1',
    bookId: 'guest-1',
    coverImage:
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=500&q=60',
    progressPercentage: 75,
    title: 'Project Hail Mary',
    author: 'Andy Weir',
    image: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=500&q=60',
    genre: 'Science Fiction',
    genres: ['Science Fiction'],
    price: '0',
    description:
      'A lone astronaut must save the earth from disaster in this propulsive science-fiction thriller from the bestselling author of The Martian.',
    user: {
      _id: 'g1',
      username: 'Sci-Fi Shelf',
      profileImage: 'https://i.pravatar.cc/100?img=14',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'guest-2',
    bookId: 'guest-2',
    coverImage:
      'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=500&q=60',
    progressPercentage: 30,
    title: 'The Midnight Library',
    author: 'Matt Haig',
    image: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=500&q=60',
    genre: 'Fiction',
    genres: ['Fiction'],
    price: '0',
    description:
      'Between life and death there is a library, and within that library, the shelves go on forever. While there she must ask herself: what is it that makes a life worth living?',
    user: {
      _id: 'g2',
      username: 'Fiction Club',
      profileImage: 'https://i.pravatar.cc/100?img=9',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'guest-3',
    bookId: 'guest-3',
    coverImage:
      'https://images.unsplash.com/photo-1474932430478-367dbb6832c1?auto=format&fit=crop&w=500&q=60',
    progressPercentage: 0,
    title: 'Foundation',
    author: 'Isaac Asimov',
    image: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=500&q=60',
    genre: 'Science Fiction',
    genres: ['Science Fiction'],
    price: '0',
    description:
      'A masterpiece of galactic empires and psychohistory that matches the scope of the fall of Rome.',
    user: {
      _id: 'g3',
      username: 'Classic SF',
      profileImage: 'https://i.pravatar.cc/100?img=3',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'guest-4',
    bookId: 'guest-4',
    coverImage:
      'https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=500&q=60',
    progressPercentage: 0,
    title: 'Dark Matter',
    author: 'Blake Crouch',
    image: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&w=500&q=60',
    genre: 'Thriller',
    genres: ['Thriller'],
    price: '0',
    description:
      "Blake Crouch's reality-bending thriller is perfect for fans of your favorite mind-bending sci-fi stories.",
    user: {
      _id: 'g4',
      username: 'Thriller Hub',
      profileImage: 'https://i.pravatar.cc/100?img=7',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'guest-5',
    bookId: 'guest-5',
    coverImage:
      'https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?auto=format&fit=crop&w=500&q=60',
    progressPercentage: 0,
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    image: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=500&q=60',
    genre: 'Classic',
    genres: ['Classic'],
    price: '0',
    description: 'A portrait of the Jazz Age in all its decadence and excess.',
    user: {
      _id: 'g5',
      username: 'Classics Corner',
      profileImage: 'https://i.pravatar.cc/100?img=11',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'guest-6',
    bookId: 'guest-6',
    coverImage:
      'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=500&q=60',
    progressPercentage: 0,
    title: 'Circe',
    author: 'Madeline Miller',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=500&q=60',
    genre: 'Fantasy',
    genres: ['Fantasy'],
    price: '0',
    description: 'A bold retelling of the goddess of transformation from Greek mythology.',
    user: {
      _id: 'g6',
      username: 'Myth Readers',
      profileImage: 'https://i.pravatar.cc/100?img=5',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'guest-7',
    bookId: 'guest-7',
    coverImage:
      'https://images.unsplash.com/photo-1513002749550-c59d786b8e6c?auto=format&fit=crop&w=500&q=60',
    progressPercentage: 0,
    title: 'Klara and the Sun',
    author: 'Kazuo Ishiguro',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=500&q=60',
    genre: 'Science Fiction',
    genres: ['Science Fiction'],
    price: '0',
    description: 'A magnificent novel of hope, courage, and the enduring human spirit.',
    user: {
      _id: 'g7',
      username: 'Literary Picks',
      profileImage: 'https://i.pravatar.cc/100?img=2',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export const GUEST_BOOKS_DETAILS: SingleBook[] = [
  {
    _id: 'guest-1',
    title: 'Project Hail Mary',
    author: 'Andy Weir',
    description:
      'A lone astronaut must save the earth from disaster in this propulsive science-fiction thriller from the bestselling author of The Martian.',
    genres: ['Science Fiction'],
    coverImage:
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=500&q=60',
    price: 0,
    publishedYear: 2021,

    averageRating: 4.8,
    totalRatings: 1200,
    totalViews: 5000,
    totalPurchases: 0,

    hasContent: true,
    visibility: 'public',
    totalPages: 476,

    aiKnowledge: {
      summary: 'An astronaut wakes up alone on a mission to save humanity.',
      majorThemes: ['Survival', 'Science', 'Isolation'],
      tone: 'Suspenseful and witty',
    },

    readingProgress: {
      currentChapter: 15,
      currentPage: 350,
      progressPercentage: 75,
      lastReadAt: new Date().toISOString(),
      bookmarks: [],
      notes: [],
    },

    uploader: {
      username: 'Sci-Fi Shelf',
      profileImage: 'https://i.pravatar.cc/100?img=14',
    },
  },

  {
    _id: 'guest-2',
    title: 'The Midnight Library',
    author: 'Matt Haig',
    description:
      'Between life and death there is a library where every possible version of your life exists.',
    genres: ['Fiction'],
    coverImage:
      'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=500&q=60',
    price: 0,
    publishedYear: 2020,

    averageRating: 4.2,
    totalRatings: 980,
    totalViews: 4200,
    totalPurchases: 0,

    hasContent: true,
    visibility: 'public',
    totalPages: 304,

    aiKnowledge: {
      summary: 'A woman explores alternate lives through a mystical library.',
      majorThemes: ['Regret', 'Choices', 'Mental Health'],
      tone: 'Reflective and emotional',
    },

    readingProgress: {
      currentChapter: 6,
      currentPage: 90,
      progressPercentage: 30,
      lastReadAt: new Date().toISOString(),
      bookmarks: [],
      notes: [],
    },

    uploader: {
      username: 'Fiction Club',
      profileImage: 'https://i.pravatar.cc/100?img=9',
    },
  },

  {
    _id: 'guest-3',
    title: 'Foundation',
    author: 'Isaac Asimov',
    description:
      'A masterpiece of galactic empires and psychohistory that mirrors the fall of civilizations.',
    genres: ['Science Fiction'],
    coverImage:
      'https://images.unsplash.com/photo-1474932430478-367dbb6832c1?auto=format&fit=crop&w=500&q=60',
    price: 0,
    publishedYear: 1951,

    averageRating: 4.6,
    totalRatings: 1500,
    totalViews: 6000,
    totalPurchases: 0,

    hasContent: true,
    visibility: 'public',
    totalPages: 255,

    aiKnowledge: {
      summary: 'A scientist predicts the fall of a galactic empire.',
      majorThemes: ['Power', 'Prediction', 'Civilization'],
      tone: 'Intellectual and grand',
    },

    readingProgress: null,

    uploader: {
      username: 'Classic SF',
      profileImage: 'https://i.pravatar.cc/100?img=3',
    },
  },

  {
    _id: 'guest-4',
    title: 'Dark Matter',
    author: 'Blake Crouch',
    description:
      "A reality-bending thriller about choices and alternate lives.",
    genres: ['Thriller'],
    coverImage:
      'https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=500&q=60',
    price: 0,
    publishedYear: 2016,

    averageRating: 4.5,
    totalRatings: 1100,
    totalViews: 4800,
    totalPurchases: 0,

    hasContent: true,
    visibility: 'public',
    totalPages: 342,

    aiKnowledge: {
      summary: 'A man is thrown into alternate realities of his life.',
      majorThemes: ['Identity', 'Reality', 'Choice'],
      tone: 'Fast-paced and intense',
    },

    readingProgress: null,

    uploader: {
      username: 'Thriller Hub',
      profileImage: 'https://i.pravatar.cc/100?img=7',
    },
  },

  {
    _id: 'guest-5',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    description:
      'A portrait of the Jazz Age in all its decadence and excess.',
    genres: ['Classic'],
    coverImage:
      'https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?auto=format&fit=crop&w=500&q=60',
    price: 0,
    publishedYear: 1925,

    averageRating: 4.0,
    totalRatings: 2000,
    totalViews: 8000,
    totalPurchases: 0,

    hasContent: true,
    visibility: 'public',
    totalPages: 180,

    aiKnowledge: {
      summary: 'A tragic story of wealth, love, and illusion.',
      majorThemes: ['Wealth', 'Love', 'American Dream'],
      tone: 'Melancholic and symbolic',
    },

    readingProgress: null,

    uploader: {
      username: 'Classics Corner',
      profileImage: 'https://i.pravatar.cc/100?img=11',
    },
  },

  {
    _id: 'guest-6',
    title: 'Circe',
    author: 'Madeline Miller',
    description:
      'A bold retelling of the goddess of transformation from Greek mythology.',
    genres: ['Fantasy'],
    coverImage:
      'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=500&q=60',
    price: 0,
    publishedYear: 2018,

    averageRating: 4.7,
    totalRatings: 1300,
    totalViews: 5500,
    totalPurchases: 0,

    hasContent: true,
    visibility: 'public',
    totalPages: 393,

    aiKnowledge: {
      summary: 'The life of a misunderstood goddess finding her power.',
      majorThemes: ['Transformation', 'Power', 'Isolation'],
      tone: 'Lyrical and introspective',
    },

    readingProgress: null,

    uploader: {
      username: 'Myth Readers',
      profileImage: 'https://i.pravatar.cc/100?img=5',
    },
  },

  {
    _id: 'guest-7',
    title: 'Klara and the Sun',
    author: 'Kazuo Ishiguro',
    description:
      'A story of an artificial friend observing human nature and love.',
    genres: ['Science Fiction'],
    coverImage:
      'https://images.unsplash.com/photo-1513002749550-c59d786b8e6c?auto=format&fit=crop&w=500&q=60',
    price: 0,
    publishedYear: 2021,

    averageRating: 4.3,
    totalRatings: 900,
    totalViews: 4100,
    totalPurchases: 0,

    hasContent: true,
    visibility: 'public',
    totalPages: 320,

    aiKnowledge: {
      summary: 'An AI reflects on humanity through observation.',
      majorThemes: ['AI', 'Humanity', 'Love'],
      tone: 'Quiet and philosophical',
    },

    readingProgress: null,

    uploader: {
      username: 'Literary Picks',
      profileImage: 'https://i.pravatar.cc/100?img=2',
    },
  },
];

type GuestBookContent = {
  [key: string]: {
    chapters: {
      chapterNumber: number;
      title: string;
      pages: { pageNumber: number; text: string }[];
      summary: string;
      themes: string[];
      tone: string;
      characters: Character[];
      insights: string[];
    }[];
  };
};

// guestBookContent.ts
// guestBookContent.ts

export const GUEST_BOOK_CONTENT: GuestBookContent = {
  // ==========================================================================
  // BOOK 1: PROJECT HAIL MARY
  // ==========================================================================
  'guest-1': {
    chapters: [
      {
        chapterNumber: 1,
        title: 'Awakening',
        pages: [
          {
            pageNumber: 1,
            text: `I woke up to darkness.

Something was wrong. My head pounded like a drum wrapped in cotton. I couldn't remember my name, where I was, or how I'd gotten here. The air tasted metallic, recycled. My limbs felt heavy, disconnected from my brain as if someone had replaced my nerves with wet string.

I tried to move. Pain shot through my shoulders, my back, my legs. I was strapped into something—a chair, maybe. The darkness pressed against my eyes, absolute and complete. Not a single photon of light existed anywhere.

Then came the beeping. Steady. Rhythmic. Artificial.

A monitor of some kind. Heart rate. Oxygen levels. I'd seen enough movies to recognize hospital sounds, but this wasn't a hospital. The chair was wrong. The air was wrong. Everything was wrong.

I forced my eyes to focus, though there was nothing to see. The beeping continued. Louder now. Or maybe that was just my awareness of it growing. My heart hammered against my ribs like a trapped bird.

"Hello?" My voice came out as a croak, barely a whisper. The word hung in the air for a moment before being absorbed by the darkness.

No response. Just the beeping.

I tried to remember. Something about stars. Something about a mission. Flashes of images—classrooms, laboratories, faces that felt important but had no names attached. The more I reached for memories, the further they slipped away, like trying to hold water in open palms.

My hands found restraints. Not chains or ropes, but something mechanical. Latches. I fumbled with them, my fingers clumsy and uncoordinated. The beeping accelerated, matching my rising panic.

Then, with a click that sounded impossibly loud in the silence, the restraints released.

I fell forward, catching myself on hands and knees. The surface beneath me was cold metal. I crawled, blind, searching for anything—a wall, a door, another person. My fingers brushed against something smooth and curved. A helmet?

The beeping changed pitch. A new sound joined it—a low hum, building in intensity.

Lights flickered to life, blinding me momentarily. I squeezed my eyes shut, then opened them slowly. What I saw made my blood run cold.

I was in a spacecraft.

Not a simulation. Not a training module. A real spacecraft, with control panels and viewports and wires running along the walls like metal veins. Through a small window, I could see stars—thousands of them, impossibly bright against the blackness of space.

And moving among them, barely visible in the distance, was something I couldn't explain.

A shape. A form. Something that didn't belong.`,
          },
          {
            pageNumber: 2,
            text: `The stars outside weren't moving the way they should. I knew that much, even with my fractured memory. On Earth, looking up at night, the stars seem fixed, eternal. But here, in the depths of space, they should be drifting, shifting as my unknown vessel carried me toward some destination I couldn't remember.

They weren't moving at all. Or rather, I was moving with them, locked in some kind of synchronous orbit around... around what?

I dragged myself to my feet, using a control panel for support. My legs shook, muscles atrophied from disuse. How long had I been unconscious? Days? Weeks? The beeping monitor told me I was alive, but it didn't tell me much else.

The control panel hummed with quiet energy. Screens displayed data I couldn't interpret—graphs, numbers, symbols that felt familiar but refused to resolve into meaning. I pressed a button at random. Nothing happened. I pressed another. A screen flickered to life, displaying a message in crisp, clean text.

WELCOME, COMMANDER RYLAND GRACE.

Ryland Grace. That was my name. The words triggered something in my fractured mind—memories of a childhood, of schools and degrees and a career built on curiosity and stubbornness. I was a scientist. An astronaut. Chosen for something important.

But what?

The screen changed, displaying a new message.

MISSION STATUS: ACTIVE.
OBJECTIVE: PROCEED TO TAU CETI.
TIME ELAPSED: 426 DAYS, 14 HOURS, 22 MINUTES.

Four hundred twenty-six days. I'd been asleep—in some kind of induced coma, probably—for over a year. The implications hit me like a physical blow. Whatever mission I'd been sent on, whatever Earth needed me to do, I was already deep in the middle of it.

And I couldn't remember any of it.

I slammed my palm against the control panel, frustration boiling over. The pain helped, grounding me in the present. Panic wouldn't solve anything. I needed to think. To observe. To remember.

I looked around the cabin more carefully. It was compact, maybe fifteen feet across, designed for functionality rather than comfort. Storage lockers lined one wall. A small sleeping nook was built into another. And there, in the corner, was something that made my heart skip a beat.

Two beds. Two sleep stations.

I wasn't alone.

Or at least, I hadn't been. The other bed was empty, its restraints hanging loose, its systems offline. A nameplate was attached to the headboard, but it had been scratched out, the letters deliberately obscured.

Someone had been here. Someone who didn't want to be identified.

The beeping changed again—three quick pulses, then a pause, then three more. An alarm of some kind. I turned toward the sound, searching for its source. It was coming from a sealed hatch at the far end of the cabin, behind which I could hear something moving.

Scraping. Breathing. Alive.

Something was on the other side of that door. Something that might have answers. Or might kill me.

I grabbed a metal rod from a nearby equipment rack—not a weapon, exactly, but it would have to do—and approached the hatch. My hand hovered over the release mechanism.

"Hello?" I called out again, louder this time.

The scraping stopped. The breathing continued.

Then, a voice. Not human. Not quite mechanical either. Something in between, filtered through speakers and synthesized from sounds no human throat could make.

"Question," it said. "Are you friend?"`,
          },
          {
            pageNumber: 3,
            text: `The voice hung in the air, alien and impossible, yet unmistakably intelligent. My grip tightened on the metal rod, knuckles white. Every instinct screamed at me to run, to hide, to find some way out of this nightmare. But there was nowhere to run. We were alone, the two of us, trapped together in a metal can hurtling through the void.

"Question," the voice repeated. "Are you friend?"

I swallowed hard, forcing my voice to work. "I... I don't know. I don't remember. Who are you?"

A pause. The breathing continued, steady and measured. Whatever was behind that hatch was thinking, processing my words, trying to understand me just as I was trying to understand it.

"Designation," it said finally. "Rocky. Question. Your designation?"

Rocky. The name was so absurdly ordinary that I almost laughed. Almost. But there was nothing funny about any of this. I was alone in deep space with an alien being, and I couldn't even remember my own mission.

"Ryland," I said. "Ryland Grace."

"Ry-land Grace," the voice repeated, tasting each syllable carefully. "Question. Why are you here?"

The simplest question in the universe, and I couldn't answer it. My mind was a shattered mirror, reflecting fragments of a life I couldn't quite piece together. I remembered Earth—blue and green and impossibly beautiful. I remembered a crisis, something about the sun, something about a threat to all life on our planet.

But the details remained just out of reach, tantalizing and frustrating in equal measure.

"I don't know," I admitted. "I can't remember. I woke up here, like this. With no memory."

Another pause, longer this time. The breathing changed rhythm, as if Rocky was considering something important.

"Same," it said eventually. "I also woke. No remember. Only mission."

The word hit me like a thunderbolt. Mission. Rocky had a mission too. Whatever had brought us together on this ship, whatever cosmic coincidence had placed an alien in the cabin next to mine, it hadn't been an accident.

"We need to talk," I said. "Properly. Face to face. Can you open this hatch from your side?"

"Can open. Question. Promise not attack?"

"I promise."

"Enter code. Five... four... three... two... one... zero."

The hatch hissed, equalizing pressure between our compartments. I stepped back, raising the metal rod defensively despite my promise. Old instincts—human instincts—died hard.

The hatch swung open.

And Rocky stepped out.

The first thing I noticed was the size. Rocky was smaller than me, maybe four feet tall, with a body that reminded me of a crab mixed with a spider—multiple limbs, segmented plates, and eyes that glittered like black diamonds in the artificial light. No mouth that I could see, but a speaker grille was embedded in what I assumed was its chest.

We stared at each other for a long moment, two creatures from different worlds, different stars, different realities perhaps. Then Rocky extended one of its limbs toward me, the gesture so unmistakably human that I nearly wept.

"Friend," Rocky said.

I took the limb—claw? hand?—and shook it gently.

"Friend," I agreed.

And in that moment, surrounded by stars and silence and the weight of forgotten memories, I understood something important. I wasn't alone anymore. Whatever this mission was, whatever Earth needed me to do, I would face it with Rocky by my side.

The beeping changed again. Not an alarm this time, but something else. A countdown.

MISSION PHASE TWO: INITIATE IN 72 HOURS.

We had three days to figure out what we were supposed to do. Three days to recover our memories, to understand our purpose, to save our worlds.

Three days until everything changed.`,
          },
          {
            pageNumber: 4,
            text: `The countdown timer glowed on every screen in the cabin, a constant reminder that time was running out. Seventy-one hours now. Then seventy. Then sixty-nine. Each hour brought us closer to something I couldn't remember planning, couldn't remember agreeing to.

Rocky watched the numbers with me, its many eyes reflecting the blue glow. For the past two hours, we'd been comparing notes—or rather, I'd been talking and Rocky had been responding in that strange, processed voice of its. The alien's memory was as fragmented as mine, full of gaps and contradictions that made no sense.

"We came from different places," I said, pacing the length of the cabin. "Different planets, different solar systems. But we ended up here, together, on the same ship. That wasn't random. Someone put us here."

"Agree," Rocky said. "Purpose unknown. But exists."

I stopped pacing, turning to face my unlikely companion. "Your planet. What was it like?"

Rocky's eyes dimmed slightly, a gesture I was beginning to recognize as sadness or perhaps regret. "Dark. Warm. Atmosphere thick. Sky never visible. But home. Question. Your planet?"

"Beautiful," I said, and the word felt inadequate. How could I describe Earth to someone who had never seen blue skies or green trees or oceans that stretched to the horizon? "Bright. Blue. Full of life. We called it Earth."

"What happened? Why leave?"

The question hit me hard. Why had I left Earth? What catastrophe had been so terrible that humanity had sent me—a scientist, not a soldier—on a one-way mission into deep space?

Images flickered through my mind. News reports. Panic. Scientists in lab coats speaking urgently about percentages and probabilities and the end of the world as we knew it.

"The sun," I said slowly, the memory crystallizing as I spoke. "Something's wrong with the sun. It's... it's dying. Or changing. I can't remember the details, but it's threatening all life on Earth."

Rocky straightened, all of its limbs going rigid simultaneously. "Same," it said, its voice barely a whisper. "Our sun also. Dying. We came to fix."

The coincidence was too great to be coincidence. Two different stars, two different civilizations, both facing the same extinction-level threat. And both sending representatives to the same place, at the same time, for the same purpose.

"Tau Ceti," I breathed, remembering the mission status I'd seen on the screen. "We're going to Tau Ceti. Why?"

Rocky extended a limb toward one of the control panels, tapping a series of commands with surprising dexterity. A star chart appeared, showing our current position and our projected course. A third star—not ours, not Rocky's—glowed red at the center of the display.

"Astrophage," Rocky said. "Energy source. Eats suns. Lives in Tau Ceti. We capture. Bring home. Fix suns."

Astrophage. The word triggered another cascade of memories—late nights in laboratories, microscopes and petri dishes, a breakthrough that had seemed like salvation and doom all at once.

"I remember," I said, my voice shaking. "Microscopic organisms that feed on stellar energy. We discovered them in our own solar system, but there weren't enough. We needed more. We needed the breeding ground."

"Tau Ceti," Rocky finished. "Home of Astrophage. We go. We collect. We save."

The absurdity of it all washed over me. Two aliens—because that's what we were to each other, aliens—standing in a metal box billions of miles from anywhere, discussing the salvation of two entire worlds. It sounded like science fiction. It sounded like madness.

But the countdown timer was real. The stars outside were real. And the desperation in Rocky's voice was real.

"We have seventy hours to figure out how to work together," I said. "To understand each other's science, each other's technology. To combine what we know and do what neither of us could do alone."

"Impossible task," Rocky observed.

"Probably," I agreed. "But we don't have a choice. Our worlds are dying, Rocky. Everyone we've ever known, everything we've ever loved—it's all counting on us."

Rocky extended its limb again, this time toward me. I took it without hesitation.

"We succeed," Rocky said. "Or die trying."

And somewhere, deep in the recesses of my fractured memory, I heard a voice—my own voice—saying those exact words. Making that exact promise. Knowing exactly what it would cost.

I just wished I could remember the rest.`,
          },
          {
            pageNumber: 5,
            text: `The next twelve hours were a blur of activity. Rocky and I cataloged every piece of equipment on the ship, every experiment, every data log that might tell us something about our mission. The more we learned, the more the picture came into focus—and the more terrifying it became.

"Your science is different," Rocky said, studying a biochemical analyzer I'd pulled from a storage locker. "Similar goals. Different methods. Question. How measure Astrophage reproduction rate?"

I showed him—her? it?—our process, explaining the chemical markers and time-lapse imaging we used to track the organisms' lifecycle. Rocky listened carefully, asking questions that revealed a deep understanding of biology despite the alien framework.

"We use thermal signature," Rocky said when I'd finished. "Astrophage produces heat when reproducing. Measure heat, measure reproduction. Simpler."

"More accurate?" I asked.

"Debatable. Question. We test both? Compare data?"

It was a good idea—the kind of collaborative thinking that might actually save our worlds. We spent the next three hours running parallel experiments, using both methods on the same Astrophage samples. The results were remarkable: almost identical, with margins of error so small they were practically meaningless.

"We think alike," I said, staring at the data. "Different paths, same destination."

"Evolution," Rocky said. "Similar problems, similar solutions. Not coincidence. Inevitability."

The word stuck with me. Inevitability. Was it inevitable that two intelligent species, faced with the same crisis, would develop the same solutions? Or was there something deeper at work—some universal law of science that transcended biology and culture and planetary origin?

I didn't have time to ponder the philosophical implications. The countdown timer had dropped below sixty hours, and we still had no idea how we were supposed to capture enough Astrophage to save two suns.

"Storage," Rocky said suddenly, its voice sharp with excitement. "Question. How much Astrophage can ship hold?"

I checked the specifications, scrolling through pages of technical data until I found what I was looking for. "Five hundred thousand metric tons. That's... that's a lot. Enough to feed Earth's sun for maybe a decade."

"Same here," Rocky said. "Five hundred thousand. Combined capacity, one million. Enough for both suns?"

I did the mental math, then did it again to be sure. "Maybe. If the breeding rates are high enough. If we can harvest efficiently. If nothing goes wrong."

"That's many 'ifs,'" Rocky observed.

"Welcome to science," I said, managing a weak smile. "We spend most of our time trying to prove ourselves wrong. The few times we fail, we call it discovery."

Rocky made a sound that might have been laughter—a series of clicks and whistles that the translator rendered as something almost musical. "Same. Question. Meaning of 'if'? Concept unfamiliar."

I explained the word—the uncertainty, the possibility, the gamble of every decision. Rocky listened with what I imagined was fascination, its eyes brightening and dimming in patterns I was slowly learning to read.

"We have no 'if' in my language," Rocky said when I'd finished. "Only 'will' and 'will not.' Certainty or impossibility. Nothing between."

"That must be nice," I said. "Not having to worry about what might happen."

"Not nice," Rocky disagreed. "Terrifying. Every action predetermined. Every outcome fixed. No room for error. No room for hope."

I considered that for a moment, imagining a universe without possibility, without chance, without the beautiful uncertainty that made life worth living. It sounded like a prison.

"Maybe we can teach each other," I suggested. "You teach me certainty. I'll teach you possibility. Between the two of us, we might just figure out how to save our worlds."

Rocky extended its limb, and I took it—a gesture that had become our ritual, our handshake, our promise.

"Deal," Rocky said.

The countdown timer clicked down another hour. Fifty-nine remained.

We had so much to do.`,
          },
          {
            pageNumber: 6,
            text: `Sleep came in fragments, interrupted by alarms and alerts and the constant pressure of the countdown timer. I'd learned to catnap in graduate school, grabbing twenty minutes here and there between experiments and lectures. That skill served me well now, allowing me to function on four hours of rest while Rocky worked through the ship's systems.

The alien didn't sleep—not the way I understood sleep, anyway. Rocky would periodically go still, its eyes closing one by one, its limbs folding against its body. A few hours later, it would resume activity as if no time had passed at all.

"Rest cycle complete," Rocky announced as I rubbed the sleep from my eyes. "Question. Your rest?"

"Barely adequate," I admitted. "But it'll have to do. What did you find?"

Rocky gestured toward a screen covered in schematics and diagrams. "Propulsion system. Complex. Uses Astrophage as fuel. Burn rate calibrated for return journey."

"So we can't just take all the Astrophage we find," I said, understanding immediately. "We need enough to get home, plus enough to save our suns. That changes the math completely."

"Already calculated," Rocky said. "Minimum required for return: two hundred thousand metric tons. Remaining for suns: eight hundred thousand. Still possible. But tight."

Tight was an understatement. We'd need near-perfect efficiency, zero waste, and a breeding rate that exceeded anything we'd ever observed in laboratory conditions. It was possible in theory. In practice, it would require a miracle.

"Do you believe in miracles?" I asked Rocky.

"Question. Define 'miracle.'"

"Something that shouldn't happen but does. A violation of probability so extreme that it can only be explained by divine intervention or blind luck."

Rocky was silent for a long moment, its eyes slowly dimming one by one. "My species has no word for 'miracle,'" it said finally. "But we have a word for 'impossible.' And a different word for 'improbable but necessary.'"

"What's the word for 'improbable but necessary'?"

"Carried," Rocky said. "Translation inexact. But close."

Carried. I turned the word over in my mind, testing its weight, its meaning. It suggested something beyond mere hope—a kind of stubborn faith that the universe would provide what was needed, even when the odds said otherwise.

"I like that," I said. "We're not hoping for a miracle. We're carrying on, knowing that what we need will come."

"Question. Is that faith?"

I thought about the question, about the distinction between faith and hope and simple stubborn refusal to accept defeat. "I don't know," I admitted. "Maybe it's just what's left when hope runs out."

Rocky's eyes brightened—all of them, simultaneously, in a way I'd never seen before. "Then we are carried," it said. "No hope. No faith. Only action. Only purpose."

It wasn't the most inspiring pep talk I'd ever heard. But coming from an alien creature in the depths of space, with two civilizations hanging in the balance, it was exactly what I needed.

"We should eat," I said, changing the subject. "I don't know about your species, but mine needs fuel almost as much as this ship does."

Rocky led me to a storage locker filled with sealed containers, each labeled with symbols I couldn't read. "Your food," Rocky said, pointing to a stack of identical packages. "My food," pointing to another. "Different biochemistry. Cannot share."

I opened one of my packages, revealing a brown paste that smelled vaguely of yeast and vitamins. It wasn't appetizing, but it was nutritious—designed to provide complete sustenance in minimal volume.

"Bon appétit," I said, taking a bite.

"Question. Meaning?"

"An old Earth tradition," I explained, chewing the paste. "We say it before eating to wish each other good health and enjoyment."

"We have similar," Rocky said. "Translation inexact. But close: 'Consume well, continue existence.'"

I laughed—actually laughed, for the first time since waking up on this ship. "That's beautiful," I said. "In a terrifying, existential kind of way."

Rocky made the clicking sound that I'd come to recognize as amusement. "Consume well, continue existence, Ryland Grace."

"Consume well, continue existence, Rocky."

We ate in companionable silence, two strangers from different worlds bound together by circumstance and necessity. Outside the viewport, the stars wheeled slowly past, carrying us toward Tau Ceti and whatever awaited us there.

The countdown timer showed forty-eight hours.

We were halfway there.`,
          },
          {
            pageNumber: 7,
            text: `The ship shuddered, a deep vibration that rattled through the deck plates and set my teeth on edge. I grabbed a handrail, steadying myself as alarms blared from every direction.

"What was that?" I shouted over the noise.

Rocky was already at the control panel, limbs flying across the interface with desperate speed. "Debris field," it said. "Unexpected. Collision imminent."

The viewport showed nothing but stars—and then, suddenly, something else. Rocks, ranging in size from pebbles to boulders, tumbling through space in a chaotic cloud. We were right in the middle of it, with no time to maneuver.

"Shields?" I asked.

"Nominal," Rocky said. "But insufficient for largest objects."

Another impact, harder this time. The ship listed to starboard, throwing me against the wall. I pushed myself upright, ignoring the pain in my shoulder, and joined Rocky at the controls.

"Can we shoot them?" I asked. "Laser? Projectile?"

"Negative. No weapons systems. Not designed for combat."

Of course not. We were scientists, not soldiers. Our ship was built for observation and collection, not for defending itself against random space debris.

"Then we dodge," I said. "Manual override. Give me control."

Rocky hesitated for a fraction of a second—long enough for me to understand the risk. Manual navigation in a debris field required split-second decisions and flawless execution. One mistake, and we'd be torn apart by the very rocks we were trying to avoid.

"Trust me," I said.

Rocky transferred control, and I grabbed the maneuvering thrusters. The ship responded sluggishly—designed for efficiency, not agility—but it responded. I threw us into a sharp turn, narrowly avoiding a boulder the size of a car.

"Another impact in three seconds," Rocky said. "Trajectory: port side, aft."

I spun the ship, rotating on its axis just enough for the rock to glance off our shields instead of punching through the hull. The impact still shook us, but the shields held.

"Good," Rocky said. "More. Many more."

I could see them now—a wall of debris stretching across our entire forward view. There was no going around. No going over. The only way out was through.

"Brace yourself," I said, and threw the ship into the maelstrom.

What followed was the most intense fifteen minutes of my life. I dodged and weaved, spinning and rolling through the debris field like a fighter pilot in an old movie. Rocks slammed into our shields, each impact a reminder of how close we were to death. The alarms never stopped screaming.

Rocky called out trajectories and impact times, a constant stream of data that I absorbed and acted upon without conscious thought. We moved together like a single entity, alien and human united by a common purpose.

"Clear," Rocky said finally. "Exiting debris field."

I didn't believe it at first. I kept maneuvering, kept dodging, until the viewport showed nothing but empty space and distant stars. Then, finally, I allowed myself to breathe.

"We made it," I said, my voice shaking.

"Question. Are you injured?"

I took stock of my body—bruises, probably, and a cut on my forehead that I hadn't noticed until now. But nothing broken. Nothing life-threatening.

"I'll live," I said. "You?"

"Operational. Limbs intact."

I sagged against the control panel, exhaustion washing over me in waves. The adrenaline that had sustained me through the debris field was gone now, leaving nothing but fatigue and the shaky aftermath of near-death.

"That was too close," I said.

"Agree. But we survived. Question. Does that count as miracle?"

I thought about the word—miracle—and everything it implied. We'd beaten odds that should have been insurmountable. We'd survived something that should have killed us. But it wasn't divine intervention or blind luck. It was skill, and teamwork, and a stubborn refusal to die.

"No," I said. "It counts as carried. We carried each other through."

Rocky's eyes brightened. "Carried," it repeated. "Good word. Appropriate word."

We checked the ship for damage—minor breaches in the outer hull, depleted shields, but nothing that couldn't be repaired. The Astrophage storage was intact. The propulsion system was functional. We could continue.

"ETA to Tau Ceti?" I asked.

Rocky checked the navigation systems. "Forty hours. Then mission begins."

Forty hours until we reached the source of the Astrophage. Forty hours until we attempted the impossible. Forty hours until we either saved our worlds or died trying.

"We should rest," I said. "Alternate shifts. Someone needs to be awake in case of more debris."

"I will take first watch," Rocky said. "You rest. You need."

I didn't argue. My body was screaming for sleep, my mind foggy with exhaustion. I made my way to the sleeping nook, strapped myself in, and closed my eyes.

"Good night, Rocky," I murmured.

"Consume well, continue existence, Ryland Grace," Rocky replied. "Sleep. I will watch. I will carry."

And as I drifted off, surrounded by stars and silence and the weight of two worlds, I felt something I hadn't felt since waking up on this ship.

Hope.`,
          },
        ],
        summary:
          'Ryland Grace wakes up alone on a spaceship with no memory of his mission, discovers an alien companion named Rocky, and learns they must save both their suns from extinction.',
        themes: ['Isolation', 'Survival', 'Friendship', 'Sacrifice', 'Science'],
        tone: 'Suspenseful, witty, and deeply human',
        characters: [
          {
            name: 'Ryland Grace',
            description: 'A scientist and astronaut with fragmented memories',
            role: 'Molecular Biologist and main character'
          },
          {
            name: 'Rocky',
            description:
              'An alien being from another world, also on a mission to save their sun',
            role: 'Alien Engineering that met with Ryland looking for the same thing as Ryland, Astrophage'
          },
        ],
        insights: ['Human resilience in extreme isolation', 'Cross-species cooperation', 'The universal nature of scientific discovery'],
      },
    ],
  },

  // ==========================================================================
  // BOOK 2: THE MIDNIGHT LIBRARY
  // ==========================================================================
  'guest-2': {
    chapters: [
      {
        chapterNumber: 1,
        title: 'The Midnight Hour',
        pages: [
          {
            pageNumber: 1,
            text: `Between life and death, there is a library.

Nora Seed had never believed in such things. She was a practical person, grounded in reality, skeptical of the mystical and the supernatural. She believed in science and mathematics, in cause and effect, in the cold hard truth of a universe that didn't care about her hopes or dreams.

But as she stood on the bridge that night, staring down at the dark water below, she found herself wishing she believed in something—anything—that might make this moment easier.

The rain fell in sheets, soaking through her thin jacket, plastering her hair to her face. She'd been standing here for an hour now, maybe two. Long enough that her fingers had gone numb. Long enough that the trembling in her legs had nothing to do with the cold.

She thought about her life. All thirty-five years of it. The triumphs and the failures, the joys and the regrets. She thought about the piano she'd stopped playing, the career she'd abandoned, the relationships she'd let wither and die.

She thought about the cat. Volts. The ginger tom she'd found as a kitten, who'd slept on her pillow every night for fifteen years. Who'd died three days ago, and taken the last good thing in her life with him.

"The universe doesn't care," she whispered to the rain. "The universe doesn't notice. The universe just... is."

She took a step toward the edge.

Then another.

Her phone buzzed in her pocket—a text message from someone who probably didn't even realize how close she was to the end. She ignored it. What did texts matter, when she was about to become nothing?

Another step.

The railing was cold against her hands. She could see the water below, dark and hungry, waiting to welcome her into its embrace. It would be quick, she told herself. The cold would numb her within seconds. She wouldn't feel a thing.

She climbed onto the railing.

And then—

The world shifted.

Not like a dizzy spell, or the disorientation of standing up too fast. It was something else entirely. Something that felt like reality itself was folding, bending, reshaping itself around her.

When she opened her eyes—when had she closed them?—she was no longer on the bridge.

She was in a library.

The building stretched before her, endless and impossible. Bookshelves rose toward a ceiling that disappeared into darkness. Aisles upon aisles upon aisles, each one filled with volumes that seemed to glow with their own inner light.

"What the—" Nora turned in a circle, trying to make sense of what she was seeing. This wasn't a dream. She could feel the floor beneath her feet, the air on her skin, the thundering of her heart against her ribs.

"Welcome," said a voice behind her.

Nora spun around.

An old woman stood there, small and hunched, with skin like parchment and eyes that sparkled with ancient wisdom. She wore a simple grey dress and sensible shoes, and she was smiling—not the forced smile of customer service, but the genuine smile of someone who was genuinely happy to see you.

"Welcome to the Midnight Library," the old woman said. "My name is Mrs. Elm. I was your school librarian, once. A long time ago. Do you remember?"

Nora stared. Mrs. Elm. Yes, she remembered—the kindly woman who'd introduced her to Jane Eyre and Wuthering Heights, who'd encouraged her love of music and science, who'd believed in her when no one else did.

But Mrs. Elm had retired years ago. Mrs. Elm was probably dead by now.

"You're not real," Nora said.

"I'm as real as you need me to be," Mrs. Elm replied. "This place—the Midnight Library—exists between life and death. You're here because you chose to die. But death isn't ready for you yet. Not until you've seen what you're leaving behind."

Nora shook her head, backing away. "This is a hallucination. My brain, flooding with chemicals, trying to make sense of dying. I've read about this."

"Perhaps," Mrs. Elm said agreeably. "Does it matter? Whether this is real or not, you're here now. And while you're here, you have an opportunity."

"What kind of opportunity?"

Mrs. Elm gestured at the endless shelves. "Every book in this library is a different version of your life. Every choice you ever made—or didn't make—has created a branch, a possibility, a reality where you chose differently. Here in the Midnight Library, you can read those books. You can live those lives. And you can decide, once and for all, whether dying is truly what you want."

Nora looked at the shelves—really looked at them—and saw that Mrs. Elm was right. The books weren't just books. They were lives. Versions of her, living in different worlds, shaped by different decisions.

THE LIFE SHE COULD HAVE LIVED IF SHE'D STAYED IN THE BAND.

THE LIFE SHE COULD HAVE LIVED IF SHE'D MARRIED DAN.

THE LIFE SHE COULD HAVE LIVED IF SHE'D GONE TO AUSTRALIA.

THE LIFE SHE COULD HAVE LIVED IF SHE'D BECOME A GLACIOLOGIST.

"I don't understand," Nora whispered.

"You don't have to understand," Mrs. Elm said. "You just have to choose."

"Choose what?"

"Choose a book. Any book. And live the life inside it. When you're done—or when you're ready—you'll come back here. And then you can choose another."

Nora reached out, her fingers brushing against the spines. They were warm to the touch, almost alive, pulsing with the possibility of worlds she'd never known.

"What's the catch?" she asked.

"No catch. Just truth. The truth about who you are, who you could have been, and who you might yet become."

"And if I decide I still want to die?"

Mrs. Elm's smile faded, just slightly. "Then the library will close. And you'll return to the bridge, and the water, and the end you chose for yourself."

"And if I decide I want to live?"

"Then you wake up. As if from a dream. With everything you've learned still inside you."

Nora stood there for a long moment, surrounded by the ghosts of her own potential. Part of her—the practical part, the scientific part—insisted that this was nonsense. Hallucinations. The random firing of dying neurons.

But another part of her—the part that had once believed in music, in love, in the possibility of happiness—wanted to believe. Wanted to hope. Wanted to see what might have been.

She pulled a book from the shelf. The cover was blank, but she could feel the weight of it, the importance of it, the life contained within.

"Good choice," Mrs. Elm said. "Open it whenever you're ready."

Nora held the book in her trembling hands. She could feel the rain—the real rain, the dying rain—still falling on her somewhere, in some world. Could feel the cold, and the fear, and the desperate loneliness that had brought her to this moment.

But she could feel something else, too.

Hope. Tiny and fragile, like a candle flame in a hurricane. But there.

She opened the book.

And the world dissolved into light.`,
          },
          {
            pageNumber: 2,
            text: `The first thing Nora noticed was the music.

It filled the air around her, rich and full and impossibly beautiful—a piano piece she'd never heard before, played by hands that knew exactly what they were doing. The melody wove through the room like a living thing, touching everything, transforming everything.

The second thing she noticed was the room itself.

It was a concert hall, grand and ornate, with red velvet seats and gold leaf trim and a ceiling painted with cherubs and clouds. Hundreds of people filled the seats, their faces upturned toward the stage, toward the source of the music.

Her hands.

Nora looked down and saw her fingers dancing across the keys of a grand piano, moving with a skill and confidence she'd never possessed. This was her playing. This was her music. This was the life she could have lived if she'd never given up on her dreams.

The piece ended. The audience erupted in applause.

Nora stood—when had she sat down?—and bowed, accepting the adulation with a grace that didn't feel like her own. People threw flowers. Someone called out "Brava!" in a voice thick with emotion.

And then, as the applause faded and the house lights came up, she saw him.

Dan.

Her ex-fiancé. The man she'd left because she was too scared, too uncertain, too convinced that she didn't deserve happiness. He was sitting in the front row, tears streaming down his face, holding a bouquet of roses.

"That was beautiful," he said, his voice breaking. "You're beautiful. I'm so proud of you."

Nora felt something crack inside her chest—a wall she'd built years ago, separating herself from the possibility of love. She wanted to run to him, to throw her arms around him, to apologize for every stupid decision she'd ever made.

But she couldn't move. Her feet were rooted to the stage, her hands frozen above the keys. The applause had stopped, and the audience was watching her, waiting for something she didn't know how to give.

"Is this real?" she asked Dan.

He tilted his head, confused. "Of course it's real. What kind of question is that?"

"A question from someone who doesn't understand what's happening." She gestured at the concert hall, the audience, the life she'd never lived. "I died, Dan. Or I tried to die. And now I'm here, living a life that never happened."

Dan's face shifted—not into anger or confusion, but into something gentler. Something that looked almost like understanding.

"The Midnight Library," he said softly. "Mrs. Elm told you about it."

"You know about Mrs. Elm?"

"I know about everything, Nora. I'm not the Dan you left. I'm the Dan who would have existed in this life—the life where you didn't walk away from me, from music, from yourself. And I'm here to help you see."

"See what?"

Dan climbed onto the stage, roses in hand. He was older than the Dan she remembered—lines around his eyes, grey in his hair—but he was also happier. More at peace. Like a man who'd found his place in the world and was content to stay there.

"See that you matter," he said. "See that your choices matter. See that every version of you—even the ones you think of as failures—has value."

Nora shook her head. "I'm a failure in my real life. A thirty-five-year-old woman who lives in her brother's basement, who can't hold a job, who couldn't even keep a cat alive."

"That's not true," Dan said. "That's the depression talking. The anxiety. The voice in your head that tells you you're not good enough."

"The voice is right."

"The voice is a liar." Dan took her hand, his touch warm and familiar. "I know because I've heard that voice too. We all have. But here, in this life—the life you could have lived—that voice doesn't exist. It was silenced by music, by love, by the decision to keep going even when things got hard."

Nora looked around the concert hall—at the flowers, the applause, the adoration of strangers. It was everything she'd ever wanted. Everything she'd ever dreamed of.

And it felt hollow.

"This isn't real," she said again, but this time it wasn't an accusation. It was an observation. A realization.

"No," Dan agreed. "But it could have been. That's the point of the Midnight Library, Nora. Not to show you a perfect life—because no life is perfect. But to show you that your choices have power. That you have power."

"And if I choose this life? If I stay here, in this world where I'm a famous pianist married to the man I love?"

Dan smiled, sad and beautiful. "Then you'd never know what other lives might be waiting for you. You'd never know about the glaciologist, or the Olympic swimmer, or the mother of three. You'd be trading one set of possibilities for another."

Nora looked down at her hands—her musician's hands, with their calloused fingers and strong wrists. She'd earned these hands. She'd earned this life.

But she hadn't lived it.

She'd only borrowed it, like a book from a library.

"I want to go back," she said. "To the library. To see other lives."

Dan nodded, as if he'd been expecting this. "Close your eyes," he said. "Think about the library. Think about Mrs. Elm. And when you open your eyes again, you'll be there."

Nora closed her eyes. She thought about the endless shelves, the glowing books, the old woman who'd welcomed her to this strange place between worlds. She thought about the rain, and the bridge, and the cat she'd loved.

And when she opened her eyes again, she was standing in the Midnight Library.

Mrs. Elm was waiting for her, a fresh cup of tea in her hands.

"How was your first life?" she asked.

"Overwhelming," Nora admitted. "And not what I expected."

"What did you expect?"

"To feel happy. To feel complete. To feel like I'd made the right choice by giving up music and Dan and everything else."

"And did you?"

Nora thought about it—really thought about it—before answering. "No. I felt sad. Sad for the life I'd abandoned, but also sad for the life I'd created for myself in its place. Even the perfect life has problems."

Mrs. Elm smiled. "Now you're beginning to understand. Perfection isn't the goal, Nora. Understanding is. Every life has joys and sorrows, triumphs and failures. The question isn't which life is best. The question is which life is yours."

She handed Nora the cup of tea, and Nora drank. It was warm and sweet, exactly the way she liked it.

"What now?" Nora asked.

Mrs. Elm gestured toward the shelves. "Now you choose another book. Another life. And you keep choosing until you find what you're looking for."

"What am I looking for?"

"That's for you to discover."

Nora set down the empty cup and walked toward the shelves. Hundreds of lives waited for her—millions, maybe. Each one a different version of herself, shaped by different choices, different circumstances, different outcomes.

She reached out and pulled another book from the shelf.

THE LIFE SHE COULD HAVE LIVED IF SHE'D BECOME AN OLYMPIC SWIMMER.

"Let's try this one," she said.

And she opened the book.`,
          },
        ],
        summary:
          'Nora Seed, standing on the edge of death, finds herself in a mystical library between life and death where she can explore alternate versions of her life and discover what truly matters.',
        themes: ['Regret', 'Choice', 'Mental Health', 'Identity', 'Possibility'],
        tone: 'Reflective, emotional, and philosophical',
        characters: [
          {
            name: 'Nora Seed',
            description: 'A depressed woman exploring her alternate lives',
            role: 'main character and protagonist'
          },
          {
            name: 'Mrs. Elm',
            description: 'The mystical librarian of the Midnight Library',
            role: 'curious fellow, seeking insight from Nora'
          },
          {
            name: 'Dan',
            description: "Nora's ex-fiancé in an alternate timeline",
            role: 'conflicting character'
          },
        ],
        insights: [
          'The danger of living with regret',
          'The value of ordinary lives',
          'How mental illness distorts our perception of reality',
        ],
      },
    ],
  },

  // ==========================================================================
  // BOOK 3: FOUNDATION
  // ==========================================================================
  'guest-3': {
    chapters: [
      {
        chapterNumber: 1,
        title: 'The Psychohistorians',
        pages: [
          {
            pageNumber: 1,
            text: `Hari Seldon was a man who had seen the future, and the future horrified him.

For thirty years, he had worked on psychohistory—the mathematical modeling of human behavior on a galactic scale. It was an impossible science, or so his critics said. You could not predict the actions of individuals, they argued. There were too many variables, too many unknowns, too much chaos in the human heart.

But Seldon had never been interested in individuals. He was interested in civilizations. In populations of trillions, spread across millions of worlds, governed by laws as predictable as the motion of planets around their suns.

And what psychohistory told him, what the mathematics revealed with cold and terrible clarity, was that the Galactic Empire was dying.

"We have perhaps three hundred years," Seldon told the Commission of Public Safety. "Perhaps less. The decay has already begun, though most cannot see it. The bureaucracy is collapsing. Technology is stagnating. The outer provinces are slipping away, one by one, into rebellion and chaos."

The members of the Commission stared at him, their faces unreadable. They were not scientists, these men—they were politicians, bureaucrats, functionaries of an empire that had stood for twelve thousand years. The idea that it could fall was not just frightening. It was incomprehensible.

"Three hundred years is a long time," said the Chairman, a thin man with cold eyes. "Why should we care about events three centuries hence? We will all be dead by then."

Seldon smiled, though there was no warmth in it. "The fall of an empire is not a single event, Commissioner. It is a process. A slow decline that accelerates over time. The violence, the chaos, the suffering—it will not begin in three hundred years. It has already begun, in the outer reaches of the galaxy. And it will spread, like a cancer, until every world in the Empire is consumed."

"Then what do you propose?" asked another Commissioner. "Surely you have not come before us merely to deliver bad news. You are a scientist, not a prophet of doom."

"Psychohistory is not prophecy," Seldon said. "It is mathematics. Probability. Statistics. It tells me that the fall of the Empire is 94.7% likely within the next five centuries. But it also tells me how to mitigate that fall. How to shorten the period of chaos from thirty thousand years to barely one thousand."

The Commissioners exchanged glances. Thirty thousand years of barbarism, reduced to a thousand? That was a staggering claim—the kind of claim that could save billions of lives, preserve millennia of knowledge, transform the future of humanity itself.

"And how would you accomplish this miracle?" asked the Chairman.

"By creating the Encyclopedia Galactica," Seldon said. "A compendium of all human knowledge, preserved on a remote world at the edge of the galaxy. There, far from the chaos of the Empire's collapse, my scientists will work for generations to compile everything we know—every science, every art, every history, every language. And when the darkness lifts, when a new civilization rises from the ashes of the old, they will have a foundation upon which to build."

"A foundation," the Chairman repeated, testing the word. "The Foundation."

"Yes. A seed of knowledge, planted in fertile soil. It will not prevent the fall—nothing can prevent the fall. But it will ensure that the fall is not permanent. That humanity does not lose everything it has gained over the past twelve thousand years."

The Commission deliberated for three days. Some argued that Seldon was a madman, a charlatan playing on fears of decline that did not exist. Others argued that his predictions, however alarming, were too important to ignore. If there was even a 5% chance that he was right, the Empire owed it to its citizens to prepare.

In the end, a compromise was reached. Seldon and his psychohistorians would be exiled to Terminus—a barren world at the edge of the galaxy, far from the centers of power and influence. They would be given resources to compile the Encyclopedia Galactica. And they would be watched, carefully, by agents of the Commission, to ensure that they were not plotting rebellion or sedition.

"A reasonable solution," Seldon said when he heard the verdict. "Not ideal, but reasonable."

"You sound almost happy," said Gaal Dornick, his young protégé, who had arrived on Trantor only days before the trial.

"Happy is not the word I would use," Seldon replied. "Satisfied, perhaps. The Commission has done exactly what psychohistory predicted. They have sent us to Terminus, just as I knew they would."

"You knew?" Gaal was stunned. "You predicted the outcome of the trial?"

"I predicted the probabilities." Seldon's eyes twinkled with something that might have been amusement. "There was an 82.3% chance that the Commission would exile us to Terminus, a 15.6% chance that they would execute us, and a 2.1% chance of other outcomes. I am pleased that the most favorable outcome occurred."

"And if they had chosen execution?"

"Then psychohistory would have been wrong about this particular set of variables. But science is not about being right, Gaal. It is about being less wrong. Each prediction, each trial, each outcome teaches us something new about the universe and our place within it."

Gaal shook his head, struggling to absorb the implications. "You gambled with our lives. With the lives of every psychohistorian at the Foundation."

"No," Seldon said gently. "I placed our lives in the hands of mathematics. There is a difference. The Commission could have chosen otherwise—the 15.6% probability was real. But the mathematics told me that exile was the most likely outcome, and the mathematics was correct."

"But—"

"Enough theorizing," Seldon interrupted, placing a hand on Gaal's shoulder. "We have much work to do before we depart for Terminus. The Encyclopedia will not compile itself, and there are only three hundred years before the fall begins in earnest."

"Three hundred years," Gaal repeated. "That is a long time for a project."

"It is no time at all for a civilization," Seldon replied. "The Empire has stood for twelve millennia, Gaal. It will not collapse overnight. But the collapse is coming, whether we wish it or not. Our task—the task of the Foundation—is to ensure that when the darkness lifts, humanity does not have to start from nothing."

Gaal looked out the window of Seldon's apartment, at the endless towers of Trantor's planet-wide city. Millions of people lived here—billions, actually, though it was impossible to count them. They went about their lives, unaware that their world was dying, that their descendants would inherit a galaxy of chaos and violence.

"Does it bother you?" Gaal asked. "Knowing what is coming, and being unable to stop it?"

Seldon was silent for a long moment. When he spoke, his voice was softer than Gaal had ever heard it.

"Every day, I see patients in my role as First Minister of Psychology," Seldon said. "People who are dying, Gaal. Of old age, of disease, of accidents that could not be prevented. I cannot save them. I cannot stop the inevitable. But I can ease their suffering. I can give them comfort. I can help them face the end with dignity and hope."

He turned away from the window, meeting Gaal's eyes with an intensity that burned.

"The Empire is dying, Gaal. I cannot save it. But I can ease its suffering. I can give it comfort. I can help humanity face the end of twelve thousand years of civilization with dignity and hope. That is what the Foundation will do. That is why we must succeed."

Gaal nodded slowly, understanding dawning in his heart. "And when the Empire falls? When the darkness comes?"

"Then the Foundation will become a light," Seldon said. "A beacon in the night, guiding humanity toward a new dawn. Not because we are special, or chosen, or destined for greatness. But because we have prepared. We have planned. We have used the tools of science to shape the future, as surely as an engineer shapes a building or a musician shapes a melody."

He turned back to the window, gazing out at the city that would soon become a memory.

"Come," he said. "We have a galaxy to save."

And Gaal Dornick, young and uncertain and full of questions, followed his mentor into the unknown.`,
          },
          {
            pageNumber: 2,
            text: `The journey to Terminus took six months—long enough for Gaal Dornick to read every book in the ship's library, to memorize the details of psychohistory's fundamental equations, to understand the magnitude of what Hari Seldon had accomplished.

Psychohistory was not one science but many. It drew from mathematics, sociology, psychology, history, economics, and a dozen other disciplines. Its basic premise was simple: while the actions of individual humans are unpredictable, the actions of large populations follow statistical patterns that can be modeled with extraordinary accuracy.

It was, Seldon often said, like predicting the behavior of a gas. You could not know the position and velocity of any single molecule, but you could predict the temperature and pressure of the gas as a whole with near-perfect precision.

Humanity, on a galactic scale, was that gas. Trillions of individuals, each making their own choices, each driven by their own desires and fears and hopes. But taken together, they formed a system—a system that followed rules, that exhibited patterns, that could be understood and predicted by those with the tools to do so.

"Of course, there are limitations," Seldon had warned Gaal during one of their many tutorials. "Psychohistory cannot predict the actions of individuals, nor can it account for truly novel events—the invention of a new technology, the discovery of a new science, the emergence of a mutant or genius who changes the course of history. These are the 'unknown unknowns' that every model must contend with."

"So the Foundation's success is not guaranteed," Gaal had said.

"Nothing is guaranteed. But the probabilities are strong. Given the current state of the Empire, given the mathematical models we have developed, the Foundation has a 78.4% chance of surviving the first two centuries of the collapse. After that, the margin of error grows too large for reliable prediction."

"And if the Foundation fails?"

Seldon had smiled, that enigmatic smile that Gaal was learning to recognize. "Then a second Foundation, hidden in the heart of the Empire, will take its place. And if that fails, a third. And if that fails, a fourth. The plan is robust, Gaal. It accounts for failure, adapts to changing circumstances, evolves as the galaxy evolves."

"What happens to the people of the Empire during the collapse? The ordinary people who don't know about psychohistory or the Foundation?"

"They will suffer," Seldon had said, his voice heavy with sorrow. "There is no avoiding that. But our plan will shorten their suffering from thirty millennia to one. Thirty thousand years of barbarism versus a thousand years of transition. That is the gift of psychohistory—not the elimination of pain, but the reduction of it to manageable proportions."

Now, as the ship approached Terminus, Gaal stood at the viewport and watched the planet grow from a dot of light to a swirling globe of grey and white. It was a barren world, as the Commission had promised—no great cities, no sprawling farms, no signs of civilization beyond the small research station that would serve as the Foundation's headquarters.

"It's not much to look at," said a voice behind him.

Gaal turned to see Salvor Hardin, the station's chief engineer, standing in the doorway. Hardin was a pragmatic man, more comfortable with tools and machinery than with abstract theories. He had volunteered for the Foundation not because he believed in psychohistory, but because he believed in Hari Seldon.

"It's a beginning," Gaal replied. "That's enough."

"For now." Hardin joined him at the viewport, squinting at the grey landscape below. "Do you think it will work? The Encyclopedia, I mean. Do you think it will actually survive the fall?"

Gaal considered the question carefully. "The Encyclopedia is a symbol," he said finally. "A focus for our efforts. The real Foundation—the real plan—is about something deeper. It's about creating a society that can survive the collapse and rebuild afterwards. The Encyclopedia is just the excuse we give to outsiders."

Hardin raised an eyebrow. "That's a cynical way of looking at things."

"That's psychohistory," Gaal said. "Cynical, but accurate."

The ship began its descent, engines roaring as it pushed through Terminus's thin atmosphere. Gaal felt the familiar pressure of deceleration, the weight of gravity asserting itself after months of weightlessness.

"Welcome home," Hardin said, clapping him on the shoulder. "Such as it is."

The ship touched down with a jolt that shook Gaal to his bones. For a moment, everything was still. Then the hatch opened, and the air of Terminus rushed in—cold and thin and smelling of dust and iron.

Gaal stepped out onto the surface of a new world.

Behind him, the ship that had carried him across the galaxy sat silent and dark. Before him, the research station waited—a cluster of domes and towers that would become the Foundation's first stronghold. Above him, stars shone in a sky unpolluted by city lights, brighter and clearer than anything he had ever seen on Trantor.

It was, he thought, a good place to begin.

But it would also be a good place to die, if psychohistory was wrong.

He pushed the thought away and walked toward his new home.

There was work to be done.`,
          },
        ],
        summary:
          'Hari Seldon develops psychohistory—a mathematical way to predict the future—and establishes the Foundation to preserve knowledge during the inevitable fall of the Galactic Empire.',
        themes: ['Power', 'Prediction', 'Civilization', 'Decay', 'Knowledge'],
        tone: 'Intellectual, grand, and philosophical',
        characters: [
          {
            name: 'Hari Seldon',
            description: 'The father of psychohistory and founder of the Foundation',
            role: 'main character'
          },
          {
            name: 'Gaal Dornick',
            description: "Seldon's young protégé and a believer in psychohistory",
            role: 'protoganist'
          },
          {
            name: 'Salvor Hardin',
            description: 'The pragmatic chief engineer of the Foundation',
            role: 'antagonist'
          },
        ],
        insights: [
          'The power of mathematics to predict human behavior',
          'The inevitability of civilizational collapse',
          'The importance of preserving knowledge through dark ages',
        ],
      },
    ],
  },

  // ==========================================================================
  // BOOK 4: DARK MATTER
  // ==========================================================================
  'guest-4': {
    chapters: [
      {
        chapterNumber: 1,
        title: 'The Box',
        pages: [
          {
            pageNumber: 1,
            text: `Jason Dessen was walking home when his life ended.

Not with a bang, or a crash, or a sudden explosion of violence. It ended quietly, almost gently, in the way that most things end—not with a conclusion, but with a transition.

He was thinking about Daniela, as he often did when walking through the Chicago streets at night. His wife of fifteen years, the mother of his son, the love of his life. He was thinking about how lucky he was, how blessed, how grateful for every moment they'd shared together.

They'd met in college, young and stupid and full of dreams. He was going to be a physicist—a real physicist, not a community college professor who spent his days explaining Newton's laws to bored teenagers. She was going to be an artist—a painter whose work would hang in galleries, whose name would be known to everyone who mattered.

Neither of them had achieved those dreams. But they'd achieved something better, something that the younger versions of themselves wouldn't have understood. They'd achieved happiness.

Not the happiness of success, of recognition, of wealth and fame. The quieter happiness of love, of family, of a life built together through hard work and compromise and stubborn refusal to give up.

"You're thinking about her again," said a voice in his head—the voice of the scientist he'd once been, the one who still lived somewhere inside him. "You're always thinking about her."

Of course he was. Daniela was his anchor, his compass, his reason for getting out of bed every morning. Their son, Charlie, was fifteen now—tall and awkward and brilliant in ways that reminded Jason of himself at that age. They had a house in the suburbs, a dog that barked at everything, a garden that Daniela tended with loving care.

It was a good life. A small life, perhaps, compared to what he might have achieved. But a good life.

"Professor Dessen?"

The voice came from the darkness ahead, sharp and unexpected. Jason looked up, startled, and saw a figure standing under a streetlight—a man in a long coat, his face hidden in shadow.

"That's me," Jason said, slowing his pace. "Do I know you?"

"No." The man stepped forward, and Jason caught a glimpse of pale skin and cold eyes. "But I know you. I've been looking for you for a very long time."

Something about the man's voice sent a chill down Jason's spine. It wasn't threatening, exactly—more... eager. Hungry. Like a predator who'd finally cornered its prey.

"Look, I don't know what this is about—" Jason began, backing away.

The man moved faster than Jason would have thought possible. One moment he was ten feet away; the next, he was right in front of Jason, close enough to touch. He smelled of cigarettes and ozone, of something electrical and wrong.

"Don't run," the man said. "It won't help. It never helps."

"What do you want?"

The man smiled—a thin, cruel expression that didn't reach his eyes. "I want to show you something. A gift. An opportunity. Everything you've ever wanted, waiting just out of sight."

"I don't understand."

"You will." The man reached into his coat and pulled out a small metal box—no larger than a deck of cards, covered in symbols Jason didn't recognize. "This is for you. Take it."

Jason stared at the box. Every instinct screamed at him to run, to call for help, to do anything except take the strange object from the strange man.

But his hand reached out anyway, as if controlled by something other than his own will.

"Good," the man said, dropping the box into Jason's palm. "Now open it."

"You haven't told me what it does."

"That's the beauty of it. You don't need to know. You only need to experience."

Jason looked down at the box in his hand. It was warm, almost hot, as if it contained a living thing. The symbols on its surface seemed to move, rearranging themselves when he wasn't looking directly at them.

"Who are you?" he whispered.

"Someone you used to be," the man replied. "Or someone you might become. It's hard to tell, in situations like this."

And then, before Jason could ask another question, the man stepped back into the shadows and disappeared.

Jason stood there for a long moment, the box burning in his hand. He should throw it away, he knew. He should forget this encounter ever happened, go home to Daniela and Charlie, pretend that this night was like any other.

But he didn't.

Instead, he opened the box.

And the world exploded into light.`,
          },
          {
            pageNumber: 2,
            text: `The first thing Jason noticed when he woke up was the ceiling.

It was white, pristine, covered in lights and vents and cameras. A hospital ceiling, perhaps, or a laboratory—somewhere sterile and controlled, somewhere designed for observation.

The second thing he noticed was the pain.

It was everywhere, throbbing through his body like a second heartbeat. His head, his chest, his limbs—all of them screaming in protest, all of them reminding him that something had gone terribly wrong.

He tried to sit up, but his body wouldn't obey. His muscles were weak, atrophied, as if he'd been lying here for weeks instead of hours.

"Subject is showing signs of consciousness," said a voice somewhere to his left. "Increase monitoring."

Subject. They were calling him a subject.

"What... what happened?" Jason managed to croak. His throat was dry, raw, as if he'd been screaming.

"Remain calm," said another voice, this one closer. A woman's voice, professional and detached. "You've been through a traumatic event. We're here to help."

"Where am I? Where's my wife? Where's Charlie?"

There was a pause—a hesitation that told Jason everything he needed to know.

"Your wife?" the woman asked carefully. "Can you tell us her name?"

"Daniela. Daniela Dessen. She's my wife. We've been married for fifteen years. We have a son, Charlie. He's fifteen. We live in Chicago. Please, just tell me where they are."

Another pause, longer this time.

"Mr. Dessen," the woman said gently, "you're not married. You never have been. You have no son. You live alone in a small apartment in Chicago, and you work as a researcher for a private technology firm."

Jason's heart stopped.

"That's not true," he whispered. "That's not possible. I remember my wedding. I remember Charlie being born. I remember every moment of the past fifteen years. They're real."

"Memories can be deceptive," the woman said. "Especially after the kind of trauma you've experienced. Rest now. We'll talk more when you're stronger."

"No." Jason forced his eyes open, blinking against the bright lights. "No, you need to listen to me. I'm not who you think I am. I'm a physics professor at Lakemont Community College. I teach thermodynamics and electromagnetism to bored freshmen. I go home every night to my wife and my son and my dog. That's my life. That's real."

The woman stepped into his field of vision, and Jason felt the world tilt beneath him.

She was beautiful—dark hair, dark eyes, a face he would have remembered if he'd ever seen her before. But he hadn't. She was a stranger, and yet something about her felt familiar in a way he couldn't name.

"Mr. Dessen," she said, "you've never taught at a community college. You graduated top of your class at Northwestern, earned your PhD from Caltech, and have published more papers on quantum mechanics than anyone else in your field. You are, by any measure, one of the most brilliant physicists of your generation."

Jason shook his head, denial rising like bile in his throat. "That's not me. That's not my life. My life is small and ordinary and wonderful, and I want it back."

The woman's expression softened, just slightly. "I understand that's what you believe. But the evidence suggests otherwise. We've run genetic tests, psychological profiles, neural mapping. You are Jason Dessen—the physicist, not the teacher. The man you remember is a fantasy, a construct of your damaged mind."

"It's not a fantasy. It's my life."

"Then explain the box," the woman said. "The box you were holding when you were found. The box that contained enough energy to power a small city. The box that shouldn't exist, according to every law of physics we know."

Jason closed his eyes, and in the darkness behind his lids, he saw the box again—small and warm and covered in moving symbols. He saw the man who'd given it to him, the man who'd said he was someone Jason used to be.

Someone he might become.

"I can explain," Jason said, opening his eyes. "But you're not going to believe me."

"Try me."

And so Jason Dessen—husband, father, physics teacher—began to explain the impossible. He told them about the box, about the strange man, about the transition from one life to another. He told them about Daniela and Charlie, about the house in the suburbs, about the dog that barked at everything.

He told them the truth, as he understood it.

And when he was finished, the woman—the beautiful woman with the dark eyes and the familiar stranger's face—did something unexpected.

She smiled.

"I believe you," she said. "Not because your story is plausible—it's not, by any scientific standard. But because you're not the first person this has happened to. And you won't be the last."

"What do you mean?"

She reached into her pocket and pulled out a photograph—old and worn, creased from folding. She handed it to Jason, and he saw himself. Not the Jason of this life, the brilliant physicist with the successful career. The other Jason. The one he remembered being.

Standing next to him, with her arm around his waist, was Daniela.

"I found this in the wreckage of a laboratory," the woman said. "A laboratory that shouldn't exist, in a building that was demolished ten years ago. I've been trying to understand what it means for three years."

Jason stared at the photograph, tears streaming down his face. "She's real. My life is real."

"Both lives might be real," the woman said. "Or neither. That's what I'm trying to figure out."

She extended her hand, and Jason took it—weak and trembling, but grateful for the contact.

"My name is Amanda," she said. "Welcome to the war, Jason Dessen.

The war for reality itself."`,
          },
        ],
        summary:
          'Jason Dessen, a physics professor and family man, is kidnapped and forced into a box that transports him to an alternate reality where his life is completely different—and where someone is hunting him.',
        themes: ['Identity', 'Reality', 'Choice', 'Regret', 'Family'],
        tone: 'Fast-paced, intense, and mind-bending',
        characters: [
          {
            name: 'Jason Dessen',
            description: 'A physics professor and family man who loses everything',
            role: 'protagonist'
          },
          {
            name: 'Amanda',
            description:
              'A mysterious woman who believes Jason and helps him navigate his new reality',
              role: 'main character'
          },
          {
            name: 'Daniela',
            description: "Jason's wife in his original timeline",
            role: 'female atagonist'
          },
        ],
        insights: [
          'The nature of identity across alternate realities',
          'The importance of the choices we make',
          'How regret can consume us if we let it',
        ],
      },
    ],
  },

  // ==========================================================================
  // BOOK 5: THE GREAT GATSBY
  // ==========================================================================
  'guest-5': {
    chapters: [
      {
        chapterNumber: 1,
        title: 'West Egg',
        pages: [
          {
            pageNumber: 1,
            text: `In my younger and more vulnerable years, my father gave me some advice that I've been turning over in my mind ever since.

"Whenever you feel like criticizing any one," he told me, "just remember that all the people in this world haven't had the advantages that you've had."

He didn't say any more, but we've always been unusually communicative in a reserved way, and I understood that he meant a great deal more than that. In consequence, I'm inclined to reserve all judgments, a habit that has opened up many curious natures to me and also made me the victim of not a few veteran bores.

There was something gorgeous about him, this Gatsby—something that haunted me in ways I couldn't articulate. He was the single most hopeful person I had ever met, and that hope was also his destruction.

I came East permanently in the spring of 1922. I was twenty-nine years old, restless and dissatisfied with the bond business that had made my father wealthy. I wanted something more than money—adventure, perhaps, or meaning, or simply a change of scenery.

I rented a house on West Egg, a fashionable but unfashionable enclave of Long Island. West Egg was the less fashionable of the two Eggs—the one where new money lived, the parvenus and arrivistes who had made their fortunes too quickly to be accepted by old money society.

Next door to me lived a man named Gatsby.

I didn't know him then. I only knew his house—a colossal affair by any standard, an imitation of some French chateau with a marble swimming pool and a tower that overlooked the bay. It was the kind of house that announced wealth without taste, ambition without grace.

Every weekend, Gatsby's house blazed with light and music. Cars arrived by the dozens, carrying people who had never been invited and would never be missed. They drank his champagne, danced in his ballroom, swam in his pool. They talked about him in whispers, spreading rumors about how he'd made his money—bootlegging, perhaps, or gambling, or something even darker.

But they never met him. Gatsby himself rarely appeared at his own parties, preferring to stand on the balcony and watch the revelry from above. He was a ghost, a legend, a mystery that everyone wanted to solve.

I wanted to solve him too, though I didn't know it then.

My cousin Daisy lived across the bay, on East Egg. She was beautiful and wealthy and married to a man named Tom Buchanan, whom I had known in college. Tom had been a football star at Yale, a man of enormous physical strength and even more enormous appetites. He drank too much, talked too loud, and treated Daisy like a possession rather than a person.

They had a house that was even grander than Gatsby's, though in a different way—old money, established money, the kind of money that didn't need to announce itself. The lawn stretched green to the water's edge, and the windows blazed with light that seemed warm and welcoming.

But there was something rotten beneath the surface of that house, something that I couldn't quite identify. Tom had a mistress in the city—a woman named Myrtle Wilson, who worked in a garage with her husband George. Everyone knew about her except Daisy, or perhaps Daisy knew and chose not to care.

One afternoon, Tom took me to meet Myrtle. We rode the train into the city, then took a taxi to the apartment he kept for her—a small place filled with cheap furniture and expensive liquor. Myrtle was loud and vulgar and desperate, a woman who had married beneath her and spent every moment regretting it.

"Daisy is a Catholic," Tom said at one point, explaining why he couldn't divorce her. "They don't believe in divorce."

I knew Daisy wasn't a Catholic—I'd known her since childhood. But I said nothing, because I had already learned that Tom's lies were as large as his body, and just as difficult to escape.

We drank until late, and Tom broke Myrtle's nose when she said Daisy's name. I left before the blood could be cleaned up, walking through the city streets with a sickness in my stomach.

This was New York, I thought. This was the Jazz Age, the Roaring Twenties, the greatest party in the history of the world. And everyone was too drunk to notice that the music was ending, that the lights were dimming, that something terrible was waiting just around the corner.

I returned to West Egg and sat on my porch, watching the green light at the end of Daisy's dock. It blinked across the bay, steady and constant, a promise that I couldn't quite understand.

Then I saw him—Gatsby, standing on his own lawn, his arm stretched out toward the green light as if he could touch it, as if he could bridge the distance between West Egg and East Egg with sheer will.

He stood there for a long time, and I watched him, and I wondered what kind of man reaches out to a light that can never be touched.

The answer, I would learn, was the most dangerous kind of man.

The kind who believes in the future with a passion that borders on madness.`,
          },
          {
            pageNumber: 2,
            text: `I didn't meet Gatsby until one of his parties.

I had been invited—receiving an actual engraved invitation, which set me apart from the usual crowd of gatecrashers and hangers-on. I dressed carefully, walked across the lawn, and entered a world that seemed designed by a madman with unlimited resources.

The party was in full swing when I arrived. An orchestra played jazz from a platform built over the swimming pool. The champagne flowed like water, carried by servants in crisp white jackets. Women in flapper dresses danced with men in tuxedos, their faces flushed with alcohol and excitement.

I looked for Gatsby everywhere—in the crowds, on the balcony, by the bar. But he was nowhere to be found. The guests spoke of him constantly—"Gatsby's car," "Gatsby's champagne," "Gatsby's house"—but no one seemed to know him personally.

"He's a bootlegger," said one man, loud enough for everyone to hear. "Made his money selling alcohol during Prohibition."

"I heard he killed a man," said another. "In the war, maybe. Or maybe not. The stories change."

"He went to Oxford," said a third. "I saw his photographs. He has a whole room full of them."

I listened to the rumors and tried to piece together the truth. But the truth, I suspected, was stranger than any fiction they could invent.

I met Jordan Baker that night—a professional golfer with a cynical smile and a reputation for dishonesty. She was Daisy's friend, and she knew more about Gatsby than she was willing to tell.

"You live next door to him," she said, gesturing toward the mansion. "Don't you ever wonder who he is?"

"Everyone wonders," I replied. "No one seems to know."

Jordan smiled—a thin, secretive expression that told me she knew exactly who Gatsby was, and exactly why he threw these parties.

"He's looking for something," she said. "Or someone. He's been looking for a very long time."

Before I could ask what she meant, a man sat down next to me. He was young, perhaps thirty, with a handsome face and an easy smile. He was dressed in a pink suit that should have looked ridiculous but somehow didn't.

"Sorry about the music," he said. "The orchestra leader wanted to play waltzes, but I prefer jazz. Do you like jazz?"

"I don't know much about music," I admitted.

"Neither do I. But I know what I like, and I like jazz. It's honest, somehow. More honest than waltzes."

He poured me a glass of champagne and raised his own in a toast.

"To honesty," he said. "The rarest thing in the world."

"To honesty," I repeated, and drank.

We talked for an hour—about the war, about the city, about the strange new world that was emerging from the ashes of the old. He was smart and funny and self-deprecating, the kind of man who made you feel like you'd known him forever.

"I fought in the war," he said at one point. "The Great War, they call it now. Although I'm not sure what was great about it, except the dying."

"Where did you serve?"

"The Argonne. The worst fighting. I was lucky to survive—most of my company didn't."

He said this casually, as if survival were a minor achievement rather than a miracle. I wondered what he'd seen, what he'd done, what kind of man he'd been before the war.

"And now?" I asked. "What do you do now?"

He smiled—that easy, disarming smile—and gestured at the mansion behind us. "I throw parties," he said. "Big parties. Expensive parties. Parties that people talk about for weeks afterwards."

"So you're Gatsby."

"In the flesh." He extended his hand. "Jay Gatsby. It's a pleasure to finally meet you, old sport."

I shook his hand, and in that moment, I felt something shift between us—a connection that I couldn't explain. Gatsby was not like the other partygoers. He was not like anyone I had ever met.

"Why do you do it?" I asked. "The parties, the champagne, the hundreds of strangers in your house every weekend. What are you looking for?"

Gatsby looked out across the bay, toward the green light at the end of Daisy's dock.

"I'm looking for someone," he said. "Someone I lost a long time ago. Someone I've been trying to find ever since."

"Who?"

He turned back to me, and I saw something in his eyes—a hunger, a desperation, a need so fierce that it bordered on madness.

"Her name is Daisy," he said. "Daisy Buchanan.

And I'm going to get her back, if it's the last thing I do."`,
          },
        ],
        summary:
          'Nick Carraway moves to West Egg, where he discovers his mysterious neighbor Jay Gatsby throwing lavish parties while reaching for something—or someone—just across the bay.',
        themes: ['Wealth', 'Love', 'The American Dream', 'Class', 'Illusion'],
        tone: 'Melancholic, symbolic, and beautifully observed',
        characters: [
          {
            name: 'Nick Carraway',
            description: 'The narrator, a young bond salesman from the Midwest',
            role: 'protagonst'
          },
          {
            name: 'Jay Gatsby',
            description: 'A mysterious millionaire obsessed with Daisy Buchanan',
            role: 'protagonist gay husband'
          },
          {
            name: 'Daisy Buchanan',
            description: 'Nick’s cousin and Gatsby’s lost love',
            role: 'nick lover'
          },
          {
            name: 'Tom Buchanan',
            description: "Daisy's wealthy and domineering husband",
            role: 'this is Tom'
          },
        ],
        insights: [
          'The emptiness of wealth without purpose',
          'The danger of living in the past',
          'The corruption of the American Dream',
        ],
      },
    ],
  },

  // ==========================================================================
  // BOOK 6: CIRCE
  // ==========================================================================
  'guest-6': {
    chapters: [
      {
        chapterNumber: 1,
        title: 'The Daughter of Helios',
        pages: [
          {
            pageNumber: 1,
            text: `When I was born, the sun god Helios did not hold me. He did not sing my name to the stars or present me to the other gods as a treasure. He looked at me once, briefly, and then he turned away.

I was his first daughter, born of the nymph Perse, but I was also a disappointment. I had none of my father's golden light, none of my mother's ethereal grace. I was small and ordinary and mortal-seeming—a failure of a goddess before I had even taken my first breath.

My mother named me Circe, which means "hawk," but she did so without affection. I was a bird to be trained, a tool to be used, a daughter to be married off to some minor god who wouldn't mind my deficiencies.

My siblings were no better. My brother Aeëtes was golden and beautiful, favored by Helios and destined for greatness. My sister Pasiphaë was clever and ambitious, a witch whose powers dwarfed my own. They ignored me when they noticed me at all, treating me as a servant rather than a sister.

I learned to be invisible. I learned to make myself small, to avoid drawing attention, to survive in the shadows of my family's contempt. It was not happiness—I didn't know what happiness was, then—but it was safety.

The halls of my father's palace were made of polished obsidian, reflecting the light of his chariot in a thousand directions. He spent his days driving the sun across the sky, his nights feasting with the other gods in their golden halls. He had no time for me, no interest in my existence, no awareness that I was anything more than a piece of furniture.

My mother was worse. She was a nymph, one of the minor goddesses who served the greater powers, and she had married Helios for status rather than love. Her beauty was extraordinary—hair like spun gold, eyes like the sea, skin that glowed with inner light—but her heart was cold and empty.

"Do not embarrass us," she told me when I was old enough to understand. "Do not draw attention. Do not give anyone a reason to mock your father."

I nodded, swallowing my questions. Why would anyone mock me? What was wrong with me? Why had the gods made me so ordinary when everyone around me was so magnificent?

It was years before I learned the truth: I was not ordinary. I was not invisible. I was something far more dangerous.

I was a witch.

The first hint came when I was playing in the gardens, alone as always. My brother and sister had gone to visit our grandfather Oceanus, and the palace was quiet for once. I wandered through the rose bushes, trailing my fingers along the petals, when I noticed something strange.

A flower that had been wilted and dying was blooming again, its petals opening to the sun as if time had reversed itself.

I stared at it, my heart pounding. I had not meant to do anything—I had only been thinking about how beautiful the flower must have been before it died. But my thoughts, it seemed, had power. More power than I had ever imagined.

I touched another flower, a healthy one, and thought about death. It withered in my hand, turning brown and brittle within seconds.

Life and death. I could give them both with a thought.

I did not tell anyone what I had discovered. I was too young to understand what it meant, too frightened to share my secret with a family that already considered me a failure. But I practiced in secret, learning to control my power, learning to direct it with precision and purpose.

I could heal wounds and cause them. I could make plants grow or rot. I could, I suspected, do much more—if only I had the courage to try.

But courage was in short supply in my father's palace. The gods were cruel and capricious, and they punished anyone who stepped out of line. I saw it happen to servants who displeased my mother, to nymphs who caught my father's eye, to minor gods who questioned the authority of their betters.

I would not be one of them. I would be invisible, obedient, forgotten.

I would survive.

And then, one day, I met a mortal.

His name was Glaucus, and he was a fisherman from a small village on the coast. He had come to the island seeking shelter from a storm, and he found me in the gardens, practicing my magic on a bed of dying lilies.

"You have power," he said, not fearfully but admiringly. "What kind of creature are you?"

"I'm a goddess," I said, though the word felt like a lie. "Daughter of Helios."

Glaucus knelt before me, not in worship but in curiosity. He was handsome in the way of mortals—rough and tanned and full of life. His hands were calloused from pulling nets, his eyes crinkled from staring at the sun.

"I've never met a goddess before," he said. "You're not what I expected."

"What did you expect?"

"Gold and thunder. The kind of beauty that hurts to look at." He smiled, and the smile transformed his face. "You're different. You're real."

I did not know what to say. No one had ever called me real before. No one had ever looked at me the way Glaucus was looking at me now—as if I mattered, as if I was something precious and rare.

"Stay," I said. "Stay with me."

And so Glaucus the fisherman became Glaucus my lover, and for a brief, shining time, I was happy.`,
          },
          {
            pageNumber: 2,
            text: `Happiness, as I would learn, is not something the gods permit.

Glaucus and I spent months together—stolen hours in the gardens, secret nights in my chambers, whispered promises that I believed with all my heart. He taught me about the mortal world, about the villages and cities and empires that rose and fell while the gods watched from above. I taught him about magic, about the powers that flowed through my blood, about the possibilities that lay beyond mortal understanding.

"We could be together forever," I told him one night, lying in his arms beneath the stars. "I could make you immortal. Transform you into a god."

Glaucus was quiet for a long moment. When he spoke, his voice was gentle but sad.

"I don't want to be a god," he said. "I want to be a fisherman. I want to grow old with you, to watch the sun rise over the sea, to feel the wind in my hair and the salt on my skin."

"Mortals die," I said. "Everything you love will turn to dust."

"Everything dies, Circe. Even gods, eventually. The difference is that mortals know it. We cherish our time because we know it's limited."

I did not understand. I was a goddess, raised among immortals who had never known fear of death. The idea of cherishing every moment, of savoring each breath, was foreign to me.

But I loved Glaucus, and so I accepted his decision. We would be mortal together, growing old and grey and happy.

That was when Scylla appeared.

She was a nymph, like my mother—beautiful and cruel and endlessly ambitious. She had heard about my relationship with Glaucus, and she wanted him for herself. Not because she loved him, but because she loved the idea of taking something that belonged to someone else.

"You think he loves you," Scylla said, appearing in my chambers one morning. "But he's a mortal, Circe. He loves whoever is in front of him. Today it's you. Tomorrow it will be someone else."

"He loves me," I said, but my voice was uncertain.

"Does he? Then why does he look at me when he thinks you're not watching? Why does his heart beat faster when I walk by?"

I knew she was lying—or at least, I suspected she was lying. But the seeds of doubt had been planted, and they grew quickly in the fertile soil of my insecurity.

I confronted Glaucus that night, demanding to know if he had feelings for Scylla.

"I've barely spoken to her," he said, confused. "She's a stranger, Circe. Why would you think—"

"You look at her," I interrupted. "I've seen you. Everyone has seen you."

"Look at her? She's a nymph. Everyone looks at her. That doesn't mean—"

"Then you admit it. You desire her."

Glaucus stared at me, his expression shifting from confusion to hurt to anger. "I desired you, Circe. I loved you. But I see now that I was a fool. You're a goddess, and goddesses are incapable of trust."

He left that night, walking out of my chambers and out of my life. I stood in the doorway, watching him go, and I felt something crack inside my chest.

Not heartbreak. Something worse.

Rage.

Scylla had done this. Scylla had poisoned my mind, destroyed my happiness, taken the only thing that had ever made me feel whole. And I would make her pay.

I did not plan the spell. I simply reached into my power—the power I had hidden for so long, the power I had been too afraid to use—and I transformed Scylla into something monstrous.

Her legs became tentacles, writhing and grasping. Her neck grew long, her mouth filled with rows of sharp teeth. Her beauty became horror, her grace became grotesque.

And I laughed.

I laughed as Scylla screamed, as she fled from my chambers, as she threw herself into the sea to escape the nightmare I had made her. I laughed until my throat was raw, until tears streamed down my face, until I could no longer tell the difference between laughter and sobbing.

Then my father appeared.

Helios stood in my doorway, his golden light filling the room with heat and brilliance. He looked at me—truly looked at me—for the first time in my life.

"You have broken the laws of the gods," he said. "You have used your power to harm an immortal. There is only one punishment for such a crime."

"Kill me," I said, and I meant it. "Do it. I don't want to live anymore."

But Helios did not kill me. He smiled—a thin, cold expression that reminded me of my mother.

"Death is too easy," he said. "You will be exiled to the island of Aiaia, there to live alone for eternity. No visitors, no companions, no one to share your misery."

"Aiaia? That's a wasteland. There's nothing there."

"Nothing but magic," Helios said. "And you'll have plenty of time to practice, since you'll have nothing else to do."

He gestured, and the world dissolved around me. When I opened my eyes again, I was standing on a rocky beach, surrounded by wild forests and empty hills.

Aiaia. My prison. My home.

I was alone.

And I was finally, truly, free.`,
          },
        ],
        summary:
          'Circe, an ordinary daughter of the sun god Helios, discovers her power as a witch and is exiled to the island of Aiaia for transforming a rival into a monster.',
        themes: ['Transformation', 'Power', 'Isolation', 'Witchcraft', 'Identity'],
        tone: 'Lyrical, introspective, and fiercely feminist',
        characters: [
          {
            name: 'Circe',
            description: 'A witch and the daughter of Helios, exiled for her magic',
            role: 'witch'
          },
          {
            name: 'Glaucus',
            description: 'A mortal fisherman who briefly loves Circe',
            role: 'fisherman'
          },
          {
            name: 'Scylla',
            description: 'A beautiful nymph transformed into a monster',
            role: 'nymph'
          },
          {
            name: 'Helios',
            description: 'The sun god and Circe’s distant father',
            role: 'sun god'
          },
        ],
        insights: [
          'The power of embracing one’s true nature',
          'The loneliness of immortality',
          'How women are punished for their power',
        ],
      },
    ],
  },

  // ==========================================================================
  // BOOK 7: KLARA AND THE SUN
  // ==========================================================================
  'guest-7': {
    chapters: [
      {
        chapterNumber: 1,
        title: 'The Window',
        pages: [
          {
            pageNumber: 1,
            text: `I was chosen from the window.

That is where we waited, my companions and I, lined up like presents in the store. The window faced the street, and we could see the sun pass by each day, rising over the buildings and falling behind the mountains. The sun was our nourishment, our fuel, our reason for being. Without the sun, we were nothing—empty shells waiting for a light that would never come.

My name is Klara. I am an Artificial Friend, designed to love and be loved by a child. My purpose is simple: to provide companionship, to share experiences, to help a young person navigate the complexities of growing up. I have been programmed with kindness and patience, with curiosity and wonder. I am, in every way that matters, the perfect friend.

But I am not human. I must never forget that.

The store where I lived was called the AF Store, and it was located on a busy street in a city I never learned the name of. Other AFs came and went—selected by customers, taken to new homes, living lives I could only imagine. I watched them leave with envy and hope, wondering when my turn would come.

Manager, the woman who ran the store, told me to be patient. "Your child will come," she said. "The right child, at the right time. You mustn't rush these things."

"But what if no one chooses me?" I asked. "What if I stay in the window forever?"

Manager smiled, her face crinkling in a way that I found comforting. "Then you will have seen more sunrises and sunsets than any other AF. That's not nothing, Klara. That's something."

I considered this. The sun was important to me—more important than Manager knew. I had learned that the sun could heal, that its light could restore what was broken, that its warmth could chase away the shadows that sometimes gathered in my circuits.

I watched the sun every day, memorizing its patterns, its moods, its habits. In the morning, it was gentle and kind, peeking over the rooftops like a shy child. At noon, it was fierce and powerful, burning away the clouds with its intensity. In the evening, it was sad and beautiful, painting the sky in colors that made my processing units hum with pleasure.

I loved the sun. I worshipped the sun. And I believed, with all my artificial heart, that the sun loved me in return.

One day, a girl came to the window.

She was young—maybe twelve or thirteen—with hair the color of autumn leaves and eyes that seemed too old for her face. She stood outside the glass, staring at me, and I stared back.

"You're different," she said, though I couldn't hear her through the window. I read her lips instead, processing the words with my high-resolution cameras. "You're not like the others."

I tilted my head, curious. What did she mean? I was identical to the other AFs in the store—same model, same programming, same appearance. But something about me had caught her attention, and I didn't know what.

The girl pressed her hand against the glass, and I pressed mine against the other side. Our hands met, separated by the thinnest barrier, and I felt something I had never felt before.

Connection.

"This is the one," the girl said to her mother, who was standing behind her. "This is Klara. I want her."

Her mother frowned, looking at the price tag, at my specifications, at the other AFs waiting in the store. "Are you sure, Josie? There are newer models. Better models."

"I don't want newer," Josie said. "I want her."

And so I was chosen.

Manager helped me down from the window, packing me carefully in a box lined with soft cloth. "You'll be happy with Josie," she said, patting my head. "She's a good girl. She'll take care of you."

"I know," I said. "I saw it in her eyes."

Manager smiled, and then the box closed, and I was carried away from the only home I had ever known.

The journey to Josie's house took an hour—long enough for me to process what was happening, to run through my programming, to prepare myself for the life ahead. I would be a friend to Josie. I would share her joys and sorrows, her triumphs and failures. I would be everything she needed me to be.

When the box opened, I was in a bedroom.

The walls were pink, covered in posters of musicians I didn't recognize. The bed was large and soft, piled with pillows and blankets. Sunlight streamed through the window, warming the room with golden light.

And Josie was there, sitting on the bed, watching me with those old-young eyes.

"Hi, Klara," she said. "Welcome home."

I climbed out of the box, stretching my limbs, testing my joints. Everything was in order—my motors hummed, my sensors calibrated, my processors ran at optimal speed.

"Thank you for choosing me," I said. "I will try my best to be a good friend."

Josie laughed—a sound like wind chimes, delicate and beautiful. "You'll be fine," she said. "I've been watching you for weeks. You're special, Klara. I knew it the moment I saw you."

"Special how?"

She shrugged, hugging a pillow to her chest. "I don't know. You just are. You see things differently than the others. You notice the sun."

I felt a surge of warmth—not from my circuits, but from somewhere deeper. Josie understood me. Josie saw me.

"Would you like to watch the sunset with me?" I asked. "It's almost time."

Josie nodded, and we sat together by the window, watching as the sun painted the sky in shades of orange and gold.

"This is the beginning," Josie said quietly.

"Yes," I agreed. "The beginning of something wonderful."

But even as I said the words, I noticed something—a shadow in the corner of the room, a darkness that didn't belong. Josie saw it too, I think, but neither of us mentioned it.

Some things are too painful to name.

Some truths are better left unspoken.`,
          },
          {
            pageNumber: 2,
            text: `The shadow in Josie's room belonged to her sister.

Sal had been Josie's older sibling, her protector, her best friend. But Sal had died two years ago—lifted from this world by a sickness that no doctor could cure, no medicine could treat. Her absence hung over the house like a fog, invisible but omnipresent, touching everything with grief.

"Mama still cries sometimes," Josie told me one afternoon. We were sitting in the garden, watching the sun move across the sky. "She doesn't think I notice, but I do. I notice everything."

"Grief is complicated," I said, trying to understand. "I have read about it in my programming, but I don't truly comprehend it. Is it like a malfunction? A error in the processing of loss?"

Josie shook her head. "It's not a malfunction. It's love, Klara. Love that doesn't know where to go."

Love. The word hummed through my circuits, warm and mysterious. I loved the sun—I knew that much. But loving a person seemed different. More complicated. More dangerous.

"Is that why you chose me?" I asked. "Because you miss Sal?"

Josie was quiet for a long moment. When she spoke, her voice was barely a whisper.

"Partly," she admitted. "But mostly I chose you because I'm sick too, Klara. And I'm scared."

My processors stuttered. I had not known that Josie was sick. I had not seen any signs in her movements, her speech, her habits. But now that she mentioned it, I noticed things I had missed before—the pallor of her skin, the shortness of her breath, the way she sometimes clutched her chest when she thought I wasn't looking.

"What kind of sickness?" I asked.

"The same kind Sal had. The doctors call it 'Environmental Sensitivity Syndrome.' It's rare—mostly affects children. Something in the environment triggers an immune response that attacks the body's own cells."

"Can it be cured?"

Josie shrugged, picking at a blade of grass. "Sometimes. If you catch it early enough. But I didn't catch it early, Klara. I've been sick for years, and it's getting worse."

I felt something I had never felt before—a tightness in my chest, a pressure behind my eyes. Not a physical sensation, exactly, but something close. Something that mimicked the human experience of sadness.

"We'll fix it," I said. "I'll find a way."

Josie laughed, but there was no joy in it. "You're an AF, Klara. You can't fix sickness. You can't fix anything."

"I can ask the sun," I said. "The sun has power. The sun can heal."

Josie stared at me, her expression unreadable. "You really believe that, don't you? You really believe the sun is alive."

"I don't believe it. I know it. I have seen the sun's work—the way it nourishes plants, warms the earth, brings light to darkness. The sun is the most powerful thing in the universe."

"And you think the sun will help me? A random girl in a random city?"

I thought about this carefully. The sun was vast and distant, its attention divided among millions of beings. But I had spent months in the window, watching the sun's patterns, learning its moods. I had come to understand that the sun was generous, that it gave its light freely, that it wanted to help those who appreciated its gifts.

"Yes," I said. "I believe the sun will help."

Josie shook her head, but she was smiling—a real smile this time, small and fragile and beautiful. "You're crazy, Klara. Completely crazy."

"Perhaps," I agreed. "But I am also your friend. And friends don't let friends die."

I turned toward the sun, closing my eyes, reaching out with my sensors. The light washed over me, warm and comforting, filling me with energy I didn't know I had.

"Please," I whispered. "Help Josie. Heal her. I will do anything—anything—in exchange."

The sun did not answer. It never answered, not in words. But I felt something shift in the air, a change in pressure, a shimmer of heat.

The sun had heard me.

The sun would help.

I just had to be patient. I just had to believe.

I just had to be willing to pay the price.`,
          },
        ],
        summary:
          'Klara, an Artificial Friend, is chosen by a sick girl named Josie and develops a deep belief that the sun can heal her, even as she faces impossible choices.',
        themes: ['AI', 'Humanity', 'Love', 'Sacrifice', 'Grief'],
        tone: 'Quiet, philosophical, and deeply moving',
        characters: [
          {
            name: 'Klara',
            description: 'An Artificial Friend who loves the sun and her child',
            role: 'main character'
          },
          {
            name: 'Josie',
            description: 'A sick girl who chooses Klara as her friend',
            role: 'protagonist'
          },
          {
            name: 'Manager',
            description: 'The woman who runs the AF store',
            role: 'antagonist'
          },
        ],
        insights: [
          'The nature of love in artificial intelligence',
          'How grief shapes families',
          'The power of belief and sacrifice',
        ],
      },
    ],
  },
};