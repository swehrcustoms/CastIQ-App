export type GuideSeason = 'spring' | 'summer' | 'fall' | 'ice';

export interface BaitPick {
  lure: string;
  detail: string;
}

export interface SpeciesBaitPlan {
  id: string;
  label: string;
  note?: string;
  baits: BaitPick[];
}

const ORDER = [
  'walleye',
  'largemouth_bass',
  'smallmouth_bass',
  'northern_pike',
  'muskie',
  'crappie',
  'panfish',
  'yellow_perch',
  'white_bass',
  'catfish',
  'lake_trout',
  'stream_trout',
];

const PLANS: Record<GuideSeason, Record<string, SpeciesBaitPlan>> = {
  fall: {
    walleye: {
      id: 'walleye',
      label: 'Walleye and sauger',
      baits: [
        { lure: 'Jig and minnow', detail: 'Chartreuse or orange · drag points and breaks · 10–20 ft' },
        { lure: 'Shallow crankbait', detail: 'Firetiger or gold · cast wind-blown rock · 6–12 ft' },
        { lure: 'Jigging Rap', detail: 'Gold or chrome · vertical on schools · 15–25 ft' },
      ],
    },
    largemouth_bass: {
      id: 'largemouth_bass',
      label: 'Largemouth bass',
      baits: [
        { lure: 'Jig and craw', detail: 'Green pumpkin · pitch remaining green weeds and docks · 4–10 ft' },
        { lure: 'Spinnerbait', detail: 'White or chartreuse · slow-roll weed edges · 4–8 ft' },
        { lure: 'Swimbait', detail: 'Natural shad · follow baitfish on flats · 6–12 ft' },
      ],
    },
    smallmouth_bass: {
      id: 'smallmouth_bass',
      label: 'Smallmouth bass',
      baits: [
        { lure: 'Tube or ned rig', detail: 'Green pumpkin · drag rock and gravel · 8–18 ft' },
        { lure: 'Suspending jerkbait', detail: 'Natural perch · long pauses on points · 6–15 ft' },
        { lure: 'Blade bait', detail: 'Chrome · vertical when they school · 12–25 ft' },
      ],
    },
    northern_pike: {
      id: 'northern_pike',
      label: 'Northern pike',
      baits: [
        { lure: 'Spinnerbait', detail: 'Firetiger · burn the outside weed edge · 4–10 ft' },
        { lure: 'Soft swimbait', detail: 'Natural sucker · slow along cabbage · 6–14 ft' },
        { lure: 'Jerkbait', detail: 'White or perch · pause beside remaining weeds · 5–12 ft' },
      ],
    },
    muskie: {
      id: 'muskie',
      label: 'Muskie',
      note: 'Fall is the main muskie window. Finish every retrieve with a figure-8.',
      baits: [
        { lure: 'Large bucktail', detail: 'Black or perch · cast points and windward structure · 5–15 ft' },
        { lure: 'Glide bait', detail: 'Cisco or perch · long pauses on the first break · 8–18 ft' },
        { lure: 'Rubber bait', detail: 'Black and orange · slow over the weed edge · 6–16 ft' },
      ],
    },
    crappie: {
      id: 'crappie',
      label: 'Crappie',
      baits: [
        { lure: 'Small jig', detail: 'White or chartreuse · under docks and brush · 8–16 ft' },
        { lure: 'Minnow under a slip float', detail: 'Set the float at the school · 10–20 ft' },
        { lure: 'Small swimbait', detail: 'Pearl · cast the timber edge · 6–12 ft' },
      ],
    },
    panfish: {
      id: 'panfish',
      label: 'Sunfish',
      baits: [
        { lure: 'Tiny jig', detail: 'Pink, yellow, or waxworm · along docks · 4–10 ft' },
        { lure: 'Beetle spin', detail: 'White · slow along the remaining weeds · 3–8 ft' },
        { lure: 'Tungsten teardrop', detail: 'Glow or orange · vertical when they drop deeper · 8–15 ft' },
      ],
    },
    yellow_perch: {
      id: 'yellow_perch',
      label: 'Yellow perch',
      baits: [
        { lure: 'Small jig and minnow', detail: 'Yellow or orange · sand and mud flats · 12–25 ft' },
        { lure: 'Jigging spoon', detail: 'Silver · vertical on the school · 15–30 ft' },
        { lure: 'Small crankbait', detail: 'Perch pattern · troll the basin edge · 10–20 ft' },
      ],
    },
    white_bass: {
      id: 'white_bass',
      label: 'White bass and yellow bass',
      baits: [
        { lure: 'Small spoon', detail: 'Silver · cast to fish breaking on top' },
        { lure: 'Little jig', detail: 'White · drop under the school · 6–15 ft' },
        { lure: 'Shallow crankbait', detail: 'Shad · cover points where they herd bait' },
      ],
    },
    catfish: {
      id: 'catfish',
      label: 'Catfish',
      baits: [
        { lure: 'Cut bait', detail: 'Work holes, wood, and river bends · evening' },
        { lure: 'Nightcrawler', detail: 'Still presentations on mud flats' },
        { lure: 'Jig and craw', detail: 'Green pumpkin · along timber · 6–15 ft' },
      ],
    },
    lake_trout: {
      id: 'lake_trout',
      label: 'Lake trout',
      note: 'The inland summer season is closed. These are the baits to start with when the winter season opens in January.',
      baits: [
        { lure: 'Jigging spoon', detail: 'White or silver · vertical over the basin' },
        { lure: 'Tube jig', detail: 'White or natural · deadstick beside the spoon' },
        { lure: 'Live minnow', detail: 'Set just off the bottom on a tip-up' },
      ],
    },
    stream_trout: {
      id: 'stream_trout',
      label: 'Stream trout',
      note: 'Most inland trout streams are closed. Southeast Minnesota streams are catch-and-release through Oct. 15.',
      baits: [
        { lure: 'Inline spinner', detail: 'Silver or gold · swing through the tail of the pool' },
        { lure: 'Small spoon', detail: 'Natural · cast the deeper runs' },
        { lure: 'Bead-head nymph or worm', detail: 'Drift the seam · keep the presentation near the bottom' },
      ],
    },
  },
  spring: {
    walleye: {
      id: 'walleye',
      label: 'Walleye and sauger',
      baits: [
        { lure: 'Jig and minnow', detail: 'Chartreuse · shallow rocks and incoming current · 4–12 ft' },
        { lure: 'Hair jig', detail: 'Orange or black · slow on gravel · 3–8 ft' },
        { lure: 'Floater and leech', detail: 'Slip-float the warm shoreline · 4–10 ft' },
      ],
    },
    largemouth_bass: {
      id: 'largemouth_bass',
      label: 'Largemouth bass',
      baits: [
        { lure: 'Jig or creature bait', detail: 'Green pumpkin · pitch spawning flats and docks · 2–6 ft' },
        { lure: 'Spinnerbait', detail: 'White · slow along new weeds · 3–8 ft' },
        { lure: 'Soft stick bait', detail: 'Wacky rig, natural · sight fish when the water clears' },
      ],
    },
    smallmouth_bass: {
      id: 'smallmouth_bass',
      label: 'Smallmouth bass',
      baits: [
        { lure: 'Hair jig', detail: 'Brown or black · drag spawning gravel · 3–8 ft' },
        { lure: 'Tube', detail: 'Green pumpkin · hop rock transitions · 5–12 ft' },
        { lure: 'Suspending jerkbait', detail: 'Natural · pause on points as the water warms' },
      ],
    },
    northern_pike: {
      id: 'northern_pike',
      label: 'Northern pike',
      baits: [
        { lure: 'Spinnerbait', detail: 'Firetiger · shallow bays after the spawn · 3–8 ft' },
        { lure: 'Spoon', detail: 'Silver or red · cast the warm mud · 4–10 ft' },
        { lure: 'Dead bait under a float', detail: 'Sucker · hold on the weed edge' },
      ],
    },
    muskie: {
      id: 'muskie',
      label: 'Muskie',
      note: 'The harvest season opens the first Saturday in June. Until then this is a follow-up plan for the opener.',
      baits: [
        { lure: 'Smaller bucktail', detail: 'Black or natural · shallow weed edges' },
        { lure: 'Jerkbait', detail: 'Perch · warmer bays' },
        { lure: 'Topwater', detail: 'After the water settles in June' },
      ],
    },
    crappie: {
      id: 'crappie',
      label: 'Crappie',
      baits: [
        { lure: 'Small jig under a float', detail: 'Pink or chartreuse · shallow cane and docks · 3–8 ft' },
        { lure: 'Minnow', detail: 'Slip float just outside the spawning cover' },
        { lure: 'Tube', detail: 'White · pitch the brush once they move out' },
      ],
    },
    panfish: {
      id: 'panfish',
      label: 'Sunfish',
      baits: [
        { lure: 'Waxworm or tiny jig', detail: 'Pink or yellow · shallow weeds and docks · 2–6 ft' },
        { lure: 'Small float and worm', detail: 'Hold over the beds when they spawn' },
        { lure: 'Fly or beetle', detail: 'Slow along the first green weeds' },
      ],
    },
    yellow_perch: {
      id: 'yellow_perch',
      label: 'Yellow perch',
      baits: [
        { lure: 'Small jig and minnow', detail: 'Yellow · shallow flats after the spawn · 6–15 ft' },
        { lure: 'Lindy rig', detail: 'Minnow or leech · slow on sand' },
        { lure: 'Tiny spoon', detail: 'Silver · vertical if they are still bunched' },
      ],
    },
    white_bass: {
      id: 'white_bass',
      label: 'White bass and yellow bass',
      baits: [
        { lure: 'Small jig', detail: 'White · rivers and current breaks' },
        { lure: 'Inline spinner', detail: 'Silver · cast the shoreline' },
        { lure: 'Shallow crankbait', detail: 'Shad · cover points' },
      ],
    },
    catfish: {
      id: 'catfish',
      label: 'Catfish',
      baits: [
        { lure: 'Cut bait', detail: 'River holes as the water rises' },
        { lure: 'Nightcrawler', detail: 'Shallow mud on warm afternoons' },
        { lure: 'Dip bait', detail: 'Channel cats in current' },
      ],
    },
    lake_trout: {
      id: 'lake_trout',
      label: 'Lake trout',
      baits: [
        { lure: 'Spoon or stickbait', detail: 'White or silver · troll the near-shore basin in May' },
        { lure: 'Tube jig', detail: 'White · vertical over structure' },
        { lure: 'Live cisco or smelt imitation', detail: 'Match the bait in that lake' },
      ],
    },
    stream_trout: {
      id: 'stream_trout',
      label: 'Stream trout',
      note: 'The statewide stream season opens the second Saturday in April.',
      baits: [
        { lure: 'Worm or bead-head nymph', detail: 'Drift the seam' },
        { lure: 'Inline spinner', detail: 'Gold or silver · smaller water' },
        { lure: 'Small spoon', detail: 'Cast the deeper pools' },
      ],
    },
  },
  summer: {
    walleye: {
      id: 'walleye',
      label: 'Walleye and sauger',
      baits: [
        { lure: 'Bottom bouncer and crawler', detail: 'Gold blade · troll the break · 12–22 ft' },
        { lure: 'Slip bobber and leech', detail: 'Evenings on the weed edge · 8–16 ft' },
        { lure: 'Jigging Rap', detail: 'Chrome · vertical on the basin school · 18–28 ft' },
      ],
    },
    largemouth_bass: {
      id: 'largemouth_bass',
      label: 'Largemouth bass',
      baits: [
        { lure: 'Topwater frog or buzzbait', detail: 'Early and late over weeds and docks' },
        { lure: 'Texas-rig worm', detail: 'Green pumpkin · shade and weed pockets · 4–10 ft' },
        { lure: 'Deep crankbait', detail: 'Shad · the outside weed edge in the middle of the day' },
      ],
    },
    smallmouth_bass: {
      id: 'smallmouth_bass',
      label: 'Smallmouth bass',
      baits: [
        { lure: 'Drop shot', detail: 'Natural minnow · rock piles · 10–20 ft' },
        { lure: 'Tube', detail: 'Green pumpkin · drag the break' },
        { lure: 'Topwater', detail: 'Early on calm points, then move deeper' },
      ],
    },
    northern_pike: {
      id: 'northern_pike',
      label: 'Northern pike',
      baits: [
        { lure: 'Spoon', detail: 'Silver or firetiger · over the weed tops · 6–12 ft' },
        { lure: 'Large spinnerbait', detail: 'Chartreuse · weed pockets' },
        { lure: 'Soft swimbait', detail: 'Natural · the deep weed edge' },
      ],
    },
    muskie: {
      id: 'muskie',
      label: 'Muskie',
      baits: [
        { lure: 'Bucktail', detail: 'Black or natural · weed edges and points' },
        { lure: 'Topwater', detail: 'Calm mornings and evenings' },
        { lure: 'Large crankbait', detail: 'Perch · troll the first break · 8–16 ft' },
      ],
    },
    crappie: {
      id: 'crappie',
      label: 'Crappie',
      baits: [
        { lure: 'Small jig', detail: 'Chartreuse · the deep weed edge or basin · 12–20 ft' },
        { lure: 'Minnow', detail: 'Slip float at the depth you mark them' },
        { lure: 'Road-runner style jig', detail: 'White · cast the weedline at dawn' },
      ],
    },
    panfish: {
      id: 'panfish',
      label: 'Sunfish',
      baits: [
        { lure: 'Tiny jig', detail: 'Pink or yellow · weed pockets and docks · 4–8 ft' },
        { lure: 'Worm under a float', detail: 'Shallow shade in the evening' },
        { lure: 'Small popper or fly', detail: 'Calm evenings on the surface' },
      ],
    },
    yellow_perch: {
      id: 'yellow_perch',
      label: 'Yellow perch',
      baits: [
        { lure: 'Lindy rig and leech', detail: 'Basin edges · 15–25 ft' },
        { lure: 'Small jig', detail: 'Yellow · vertical on the school' },
        { lure: 'Tiny crankbait', detail: 'Perch · troll the mud-to-rock transition' },
      ],
    },
    white_bass: {
      id: 'white_bass',
      label: 'White bass and yellow bass',
      baits: [
        { lure: 'Small spoon', detail: 'Silver · cast to surface schools' },
        { lure: 'Jig', detail: 'White · count it down under the school' },
        { lure: 'Shallow crankbait', detail: 'Shad · points at dawn' },
      ],
    },
    catfish: {
      id: 'catfish',
      label: 'Catfish',
      baits: [
        { lure: 'Cut bait', detail: 'Night bites on flats and river bends' },
        { lure: 'Chicken liver or dip bait', detail: 'Channel cats in current' },
        { lure: 'Live bluegill where legal', detail: 'Flatheads on wood · check the local rule first' },
      ],
    },
    lake_trout: {
      id: 'lake_trout',
      label: 'Lake trout',
      note: 'Summer fish are deep. The inland season runs through Sept. 30.',
      baits: [
        { lure: 'Spoon or dodger and fly', detail: 'Troll the thermocline' },
        { lure: 'Jigging spoon', detail: 'White · vertical over the basin' },
        { lure: 'Tube', detail: 'Natural · deadstick near marked fish' },
      ],
    },
    stream_trout: {
      id: 'stream_trout',
      label: 'Stream trout',
      baits: [
        { lure: 'Dry fly or hopper', detail: 'Riffles in the evening' },
        { lure: 'Inline spinner', detail: 'Gold · deeper runs in bright sun' },
        { lure: 'Small crawler or nymph', detail: 'Drift the seam' },
      ],
    },
  },
  ice: {
    walleye: {
      id: 'walleye',
      label: 'Walleye and sauger',
      baits: [
        { lure: 'Jigging Rap or Rippin’ Rap', detail: 'Gold · aggressive lifts at dawn and dusk' },
        { lure: 'Spoon and a minnow head', detail: 'Chartreuse · deadstick in a second hole' },
        { lure: 'Live minnow on a plain hook', detail: 'Set just off the bottom on the break' },
      ],
    },
    largemouth_bass: {
      id: 'largemouth_bass',
      label: 'Largemouth bass',
      note: 'Ice harvest follows the open-water season. Catch-and-release is allowed outside the harvest window.',
      baits: [
        { lure: 'Small jigging spoon', detail: 'White · weed edges that stay green' },
        { lure: 'Plastic on a small jig', detail: 'Green pumpkin · subtle hops' },
        { lure: 'Live minnow', detail: 'Tip-up on the shallow edge of the basin' },
      ],
    },
    smallmouth_bass: {
      id: 'smallmouth_bass',
      label: 'Smallmouth bass',
      baits: [
        { lure: 'Blade bait', detail: 'Chrome · rock transitions' },
        { lure: 'Tube', detail: 'Green pumpkin · a slow drag' },
        { lure: 'Jigging spoon', detail: 'Natural · vertical on the break' },
      ],
    },
    northern_pike: {
      id: 'northern_pike',
      label: 'Northern pike',
      baits: [
        { lure: 'Tip-up and sucker', detail: 'Weed edges and shallow flats' },
        { lure: 'Large spoon', detail: 'Silver or red · jig it high in the water' },
        { lure: 'Dead bait under a quick-strike rig', detail: 'Check the zone size limit before you keep one' },
      ],
    },
    muskie: {
      id: 'muskie',
      label: 'Muskie',
      note: 'The muskie season is closed through the ice.',
      baits: [],
    },
    crappie: {
      id: 'crappie',
      label: 'Crappie',
      baits: [
        { lure: 'Tungsten jig and plastic', detail: 'Pink or white · the basin school' },
        { lure: 'Small spoon', detail: 'Glow · call them in, then switch to the jig' },
        { lure: 'Minnow on a plain hook', detail: 'Deadstick at the same depth' },
      ],
    },
    panfish: {
      id: 'panfish',
      label: 'Sunfish',
      baits: [
        { lure: 'Tungsten teardrop', detail: 'Pink, orange, or waxworm · weeds and the top of the basin' },
        { lure: 'Soft plastic larva', detail: 'Natural · a barely-there hop' },
        { lure: 'Euro larva or spike', detail: 'Tip the jig when the bite gets soft' },
      ],
    },
    yellow_perch: {
      id: 'yellow_perch',
      label: 'Yellow perch',
      baits: [
        { lure: 'Small spoon', detail: 'Gold or glow · aggressive jigging on the school' },
        { lure: 'Jig and minnow head', detail: 'Yellow · a second, quieter hole' },
        { lure: 'Tungsten jig', detail: 'Orange · once they slide under the hole' },
      ],
    },
    white_bass: {
      id: 'white_bass',
      label: 'White bass and yellow bass',
      baits: [
        { lure: 'Small spoon', detail: 'Silver · the river or reservoir basin' },
        { lure: 'Tungsten jig', detail: 'White · a short hop' },
        { lure: 'Minnow', detail: 'Deadstick under the spoon' },
      ],
    },
    catfish: {
      id: 'catfish',
      label: 'Catfish',
      note: 'Flathead harvest is closed from Dec. 1 through March. Channel catfish stay open.',
      baits: [
        { lure: 'Cut bait', detail: 'Set it on the bottom of a river hole' },
        { lure: 'Nightcrawler', detail: 'A plain hook and a light weight' },
        { lure: 'Small jig', detail: 'Work wood and current breaks' },
      ],
    },
    lake_trout: {
      id: 'lake_trout',
      label: 'Lake trout',
      baits: [
        { lure: 'Heavy spoon', detail: 'White · high lifts over the basin' },
        { lure: 'Tube jig', detail: 'White · deadstick in a second hole' },
        { lure: 'Live minnow', detail: 'Tip-up just off the bottom' },
      ],
    },
    stream_trout: {
      id: 'stream_trout',
      label: 'Stream trout',
      note: 'Most streams are closed. Designated trout lakes follow the winter lake season.',
      baits: [
        { lure: 'Small spoon', detail: 'Silver or gold · the basin of a designated trout lake' },
        { lure: 'Tungsten jig', detail: 'Natural · a subtle deadstick' },
        { lure: 'Small minnow', detail: 'Where live bait is legal on that lake' },
      ],
    },
  },
};

export function guideSeason(date = new Date()): GuideSeason {
  const month = date.getMonth() + 1;
  if (month === 12 || month <= 2) return 'ice';
  if (month <= 4) return 'spring';
  if (month <= 8) return 'summer';
  return 'fall';
}

export function seasonLabel(season: GuideSeason): string {
  if (season === 'ice') return 'Ice season';
  if (season === 'spring') return 'Spring';
  if (season === 'summer') return 'Summer';
  return 'Fall';
}

export function baitSpeciesId(value: string): string | null {
  const key = value.toLowerCase();
  if (key.includes('musk')) return 'muskie';
  if (key.includes('walleye') || key.includes('sauger') || key.includes('saugeye')) return 'walleye';
  if (key.includes('smallmouth')) return 'smallmouth_bass';
  if (key.includes('largemouth')) return 'largemouth_bass';
  if (key.includes('rock bass') || key.includes('white bass') || key.includes('yellow bass')) return 'white_bass';
  if (key.includes('crappie')) return 'crappie';
  if (key.includes('perch')) return 'yellow_perch';
  if (key.includes('bluegill') || key.includes('sunfish') || key.includes('pumpkinseed') || key.includes('panfish') || key.includes('warmouth')) {
    return 'panfish';
  }
  if (key.includes('pike') || key.includes('northern')) return 'northern_pike';
  if (key.includes('brook') || key.includes('brown trout') || key.includes('rainbow') || key.includes('splake') || key.includes('stream trout')) {
    return 'stream_trout';
  }
  if (key.includes('trout')) return 'lake_trout';
  if (key.includes('catfish')) return 'catfish';
  if (key.includes('bass')) return 'largemouth_bass';
  return null;
}

export function speciesMatchesBait(value: string, selected: string): boolean {
  if (!selected || selected === 'all') return true;
  const id = baitSpeciesId(value);
  if (!id) return false;
  if (selected === 'largemouth_bass') return id === 'largemouth_bass' || id === 'smallmouth_bass';
  if (selected === 'lake_trout') return id === 'lake_trout' || id === 'stream_trout';
  return id === selected;
}

export function plansForSpecies(speciesPresent: string[], season: GuideSeason, selected = 'all'): SpeciesBaitPlan[] {
  const catalog = PLANS[season];
  const ids = new Set<string>();
  for (const species of speciesPresent) {
    if (!speciesMatchesBait(species, selected)) continue;
    const id = baitSpeciesId(species);
    if (id && catalog[id]) ids.add(id);
  }
  return ORDER.filter((id) => ids.has(id)).map((id) => catalog[id]);
}
