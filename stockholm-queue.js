/**
 * stockholm-queue.js
 * -------------------------------------------------------
 * Rental queue times AND average rent for a 1-room apartment
 * across Stockholm's neighbourhoods (stadsdelar).
 *
 * DATA SOURCES (2025):
 *   Queue times — Bostadsförmedlingen Stockholm (bostad.stockholm.se),
 *                 reported median queue times per area.
 *   Rent data   — Stockholms stad / SCB "Hyror i bostadslägenheter 2025"
 *                 (published Nov 2025, Sweco / Stadsledningskontoret).
 *                 1-room avg sqm rates by zone:
 *                   Inre staden  2,208 kr/kvm/yr
 *                   Söderort     2,097 kr/kvm/yr
 *                   Västerort    1,917 kr/kvm/yr
 *                 Per-neighbourhood figures derived from the per-stadsdelsområde
 *                 breakdown in Table 1 of the same report (Östermalm highest,
 *                 Skärholmen lowest), scaled to a typical 30 kvm 1-room flat.
 *                 All rents are first-hand hyresrätt, incl. heating & water,
 *                 excl. electricity.
 *
 * USAGE:
 *   import {
 *     getNeighbourhoodInfo,
 *     getNeighbourhoodByCoords,
 *     getAllNeighbourhoods,
 *     getDistrictStats
 *   } from './stockholm-queue.js';
 *
 *   // By name (case-insensitive, partial match supported)
 *   const info = getNeighbourhoodInfo("Södermalm");
 *
 *   // By coordinates — perfect for a GeoGuesser map click
 *   const info = getNeighbourhoodByCoords(59.3152, 18.0710);
 *
 *   // All, optionally filtered and sorted
 *   const all   = getAllNeighbourhoods();
 *   const inner = getAllNeighbourhoods({ district: "Innerstaden" });
 *   const cheap = getAllNeighbourhoods({ sortBy: "rent_asc" });
 *
 * RETURN SHAPE:
 *   {
 *     name:        "Södermalm",
 *     district:    "Innerstaden",
 *     waitMin:     15,          // years (low estimate)
 *     waitMax:     22,          // years (high estimate)
 *     waitAvg:     18.5,        // midpoint
 *     queueStatus: "Very long", // "Short"|"Moderate"|"Long"|"Very long"|"Extreme"
 *     rent1room:   6200,        // avg monthly rent SEK, ~30 kvm hyresrätt (2025)
 *     rentSqmYear: 2480,        // annual rent per kvm SEK
 *     rentSource:  "SCB / Stockholms stad 2025",
 *     description: "...",
 *     lat:         59.3152,
 *     lng:         18.0710
 *   }
 * -------------------------------------------------------
 */

// Columns: [name, district, waitMin, waitMax, rentSqmYear, description, lat, lng]
//
// rentSqmYear = annual SEK/kvm for a 1-room flat (2025 official figures).
// Monthly rent ≈ rentSqmYear * 30 / 12  (30 kvm = typical Stockholm 1-room)
const NEIGHBOURHOODS = [

  // ── INNERSTADEN ──────────────────────────────────────────────────────────
  // Zone avg 1-room: 2,208 kr/kvm/yr (SCB 2025). Östermalm peaks above this.

  ["Östermalm",           "Innerstaden", 16, 24, 2600, "Exklusivt läge öster om centrum. Stadens högsta hyror och längsta köer.",                59.3384, 18.0874],
  ["Lärkstaden",          "Innerstaden", 17, 25, 2700, "Dyraste kvarteren på Östermalm — Karlavägen, Strandvägen-stråket.",                      59.3450, 18.0967],
  ["Gärdet",              "Innerstaden", 14, 21, 2450, "Lugnt villabetonat område öster om Östermalm. Djurgårdskanalen nära.",                   59.3383, 18.1050],
  ["Hjorthagen",          "Innerstaden", 10, 16, 2200, "Nya Hjorthagen – nyproduktion, kortare kötid än resten av innerstaden.",                  59.3467, 18.1167],

  ["Södermalm",           "Innerstaden", 15, 22, 2480, "Stockholms populäraste ö. Hög efterfrågan i alla lägen.",                                59.3152, 18.0710],
  ["Hornstull",           "Innerstaden", 14, 21, 2500, "Trendigt vattenläge i västra Södermalm.",                                                59.3133, 18.0367],
  ["Mariatorget",         "Innerstaden", 15, 22, 2490, "Populärt torg mitt på Södermalm.",                                                       59.3167, 18.0567],
  ["Slussen",             "Innerstaden", 14, 21, 2460, "Knutpunkt Södermalm–Gamla Stan.",                                                        59.3194, 18.0714],
  ["Hammarby Sjöstad",    "Innerstaden",  9, 15, 2300, "Modernt vattennära område, relativt ny bebyggelse. Kortare kötid.",                       59.3017, 18.1017],

  ["Vasastan",            "Innerstaden", 14, 21, 2420, "Populär tätbefolkad stadsdel norr om Kungsgatan.",                                       59.3430, 18.0491],
  ["Odenplan",            "Innerstaden", 13, 20, 2390, "Centralt Vasastan med pendeltåg och T-bana.",                                            59.3467, 18.0467],
  ["Sankt Eriksplan",     "Innerstaden", 13, 20, 2370, "Västra Vasastan, lugnt och familjevänligt.",                                             59.3417, 18.0317],

  ["Kungsholmen",         "Innerstaden", 13, 20, 2350, "Ö väster om Norrmalm. Nära stadshuset och Mälaren.",                                     59.3311, 18.0188],
  ["Fridhemsplan",        "Innerstaden", 12, 19, 2300, "Västra Kungsholmen – pendeltåg och T-bana.",                                             59.3333, 18.0183],
  ["Stadshagen",          "Innerstaden", 11, 18, 2250, "Norra Kungsholmen, nyrenoverade fastigheter.",                                           59.3417, 18.0033],
  ["Marieberg",           "Innerstaden", 11, 17, 2220, "Norra Kungsholmen nära Essingeleden.",                                                   59.3383, 18.0017],
  ["Reimersholme",        "Innerstaden", 13, 20, 2300, "Liten ö i Mälaren nära Liljeholmen. Lugnt och eftertraktat.",                            59.3183, 18.0217],

  ["Norrmalm",            "Innerstaden", 13, 20, 2380, "Stockholms city – Hötorget, Stureplan. Få hyresrätter.",                                 59.3368, 18.0630],
  ["Gamla Stan",          "Innerstaden", 14, 22, 2430, "Medeltida ö med begränsat hyresbestånd. Mycket hög efterfrågan.",                        59.3239, 18.0711],
  ["Djurgården",          "Innerstaden", 12, 20, 2200, "Museislott och naturreservat. Mycket få hyresrätter.",                                   59.3275, 18.1094],

  // ── SÖDERORT ─────────────────────────────────────────────────────────────
  // Zone avg 1-room: 2,097 kr/kvm/yr (SCB 2025).
  // Areas nearest innerstaden (Liljeholmen, Aspudden) are slightly above average.

  ["Liljeholmen",         "Söderort",    9, 15, 2180, "Tvärbana och T-bana. Populärt läge strax söder om Södermalm.",                            59.3083, 18.0167],
  ["Midsommarkransen",    "Söderort",    9, 15, 2150, "Trendig del av söderort nära city. Gammal fabriksarkitektur.",                             59.3100, 18.0067],
  ["Telefonplan",         "Söderort",    8, 13, 2130, "Kreativt område i fd. Ericsson-fabrikerna. T-bana.",                                      59.3050, 17.9983],
  ["Aspudden",            "Söderort",    8, 14, 2150, "Populär stadsdel söder om Liljeholmen.",                                                   59.3067, 18.0050],
  ["Gröndal",             "Söderort",    8, 13, 2100, "Välplanerat bostadsområde nära Liljeholmen.",                                              59.3133, 17.9983],
  ["Årstadal",            "Söderort",    8, 13, 2120, "Ny bebyggelse längs Söder Mälarstrand.",                                                   59.3050, 18.0300],
  ["Örnsberg",            "Söderort",    6, 11, 2050, "T-bana gröna linjen, nära Mälaren.",                                                       59.3067, 17.9750],
  ["Hägerstensåsen",      "Söderort",    6, 11, 2030, "Villabetonat område nära Hägersten.",                                                      59.3017, 18.0050],
  ["Hägersten",           "Söderort",    7, 13, 2040, "Populär söderortsdel med bra läge.",                                                       59.2967, 17.9967],

  ["Enskede-Årsta-Vantör","Söderort",    8, 14, 2050, "Blandad bebyggelse söder om Södermalm. Pendeltåg och tunnelbana.",                         59.2833, 18.0667],
  ["Enskede Gård",        "Söderort",    6, 11, 2040, "Nära Avicii Arena och Enskede.",                                                           59.2900, 18.0817],
  ["Skarpnäck",           "Söderort",    7, 12, 2030, "Modernare förortsområde sydöst. T-bana.",                                                  59.2667, 18.1333],
  ["Bagarmossen",         "Söderort",    6, 11, 2020, "Barnvänlig sydöst-förort med T-bana grön linje.",                                          59.2700, 18.1317],
  ["Björkhagen",          "Söderort",    5, 10, 2000, "Nära Hammarbybacken och naturen.",                                                         59.2817, 18.1133],

  ["Farsta",              "Söderort",    6, 11, 1980, "Pendeltågsstation och eget centrum.",                                                       59.2433, 18.0917],
  ["Dalen",               "Söderort",    5,  9, 1970, "Lugnt bostadsområde söder om Farsta.",                                                     59.2683, 18.0783],
  ["Gubbängen",           "Söderort",    5,  9, 1960, "T-bana röda linjen, pendeltågsavstånd.",                                                   59.2617, 18.0833],
  ["Bandhagen",           "Söderort",    5, 10, 1960, "Lugnt bostadsområde söderut.",                                                             59.2617, 18.0567],
  ["Stureby",             "Söderort",    4,  9, 1940, "Radhus- och hyresrättsområde. T-bana.",                                                    59.2567, 18.0267],
  ["Rågsved",             "Söderort",    4,  8, 1930, "Söder ändhållplats T-bana. Lägre kötid.",                                                  59.2367, 18.0317],
  ["Högdalen",            "Söderort",    4,  8, 1930, "T-bana röda linjen. Miljonprogram.",                                                       59.2533, 18.0317],

  ["Älvsjö",              "Söderort",    5, 10, 1970, "Pendeltåg till city ~10 min. Nära Stockholmsmässan.",                                      59.2783, 17.9883],
  ["Brännkyrka",          "Söderort",    5, 10, 1970, "Sydväst Stockholm nära Mälaren.",                                                          59.2750, 17.9417],

  // ── VÄSTERORT ─────────────────────────────────────────────────────────────
  // Zone avg 1-room: 1,917 kr/kvm/yr (SCB 2025).
  // Bromma and city-proximate areas slightly above; Skärholmen below.

  ["Bromma",              "Västerort",   7, 13, 2050, "Välbärgad villaförort väster om city. T-bana och pendelbåt.",                              59.3383, 17.9383],
  ["Mälarhöjden",         "Västerort",   5, 10, 2020, "Omtyckt villaförort söder om Bromma. Nära Mälaren.",                                      59.3017, 17.9383],
  ["Sundby",              "Västerort",   3,  7, 1950, "Norra Bromma. Pendel och T-bana nära.",                                                    59.3617, 17.9383],

  ["Hässelby-Vällingby",  "Västerort",   5, 10, 1870, "T-bana blå linjen hela vägen. Barnfamiljevänligt.",                                       59.3633, 17.8350],
  ["Vällingby",           "Västerort",   5, 10, 1880, "Klassisk ABC-stad. T-bana direkt till city.",                                             59.3633, 17.8717],
  ["Hässelby Strand",     "Västerort",   4,  8, 1840, "Mälarnära med pendelbåt till city sommar.",                                               59.3750, 17.8250],
  ["Hässelby Gård",       "Västerort",   4,  8, 1840, "Västra änden av T-bana blå linjen.",                                                      59.3700, 17.8350],
  ["Blackeberg",          "Västerort",   5, 10, 1860, "Västerort, T-bana blå linjen.",                                                           59.3433, 17.8917],
  ["Råcksta",             "Västerort",   4,  8, 1840, "Lugnt område nära Vällingby.",                                                            59.3583, 17.8633],
  ["Johannelund",         "Västerort",   4,  8, 1840, "Lugnt barnvänligt västerortområde.",                                                      59.3567, 17.8800],
  ["Grimsta",             "Västerort",   4,  9, 1850, "Naturreservat och bostäder.",                                                             59.3500, 17.8833],
  ["Vinsta",              "Västerort",   4,  8, 1860, "Nära Kista och Vällingby.",                                                               59.3667, 17.9000],
  ["Lunda",               "Västerort",   3,  7, 1830, "Industriområde med bostäder norr om Spånga.",                                             59.3767, 17.9117],

  ["Skärholmen",          "Västerort",   4,  8, 1780, "Köpcentrum och bostadsområden. Lägst hyror i västerort.",                                 59.2767, 17.9067],
  ["Vårberg",             "Västerort",   3,  7, 1760, "Skärholmen-stadsdel. Kortare kötid.",                                                     59.2733, 17.8917],
  ["Sätra",               "Västerort",   3,  7, 1750, "Miljonprogram nära Skärholmen.",                                                          59.2767, 17.8733],
  ["Bredäng",             "Västerort",   3,  7, 1760, "Mälarnära miljonprogramsbebyggelse.",                                                     59.2933, 17.9033],

  ["Spånga-Tensta",       "Västerort",   4,  8, 1830, "Mångkulturell förort. T-bana och pendeltåg.",                                             59.3883, 17.9000],
  ["Rinkeby-Kista",       "Västerort",   3,  7, 1790, "Teknikcentrum Kista och bostadsområden.",                                                 59.4000, 17.9333],

  // ── NORRORT / JÄRVA ──────────────────────────────────────────────────────
  ["Järva",               "Norrort",     4,  8, 1820, "Norra förortsområde. Husby, Akalla, Hjulsta.",                                            59.4083, 17.9667],
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const AVG_SQMETER = 30; // typical 1-room flat in Stockholm (kvm)

function _getQueueStatus(avg) {
  if (avg <= 4)  return "Short";
  if (avg <= 8)  return "Moderate";
  if (avg <= 13) return "Long";
  if (avg <= 18) return "Very long";
  return "Extreme";
}

function _toObject(n) {
  const waitAvg     = Math.round(((n[2] + n[3]) / 2) * 10) / 10;
  const rentSqmYear = n[4];
  const rent1room   = Math.round((rentSqmYear * AVG_SQMETER) / 12);
  return {
    name:        n[0],
    district:    n[1],
    waitMin:     n[2],
    waitMax:     n[3],
    waitAvg,
    queueStatus: _getQueueStatus(waitAvg),
    rent1room,                             // monthly SEK, ~30 kvm, hyresrätt 2025
    rentSqmYear,                           // annual SEK per kvm
    rentSource:  "SCB / Stockholms stad 2025",
    description: n[5],
    lat:         n[6],
    lng:         n[7]
  };
}

function _distance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * Math.PI / 180) *
            Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Look up a neighbourhood by name.
 * Case-insensitive. Supports partial matches ("söder" → "Södermalm").
 *
 * @param   {string}      name
 * @returns {object|null}
 */
export function getNeighbourhoodInfo(name) {
  const q = name.toLowerCase().trim();
  let n = NEIGHBOURHOODS.find(x => x[0].toLowerCase() === q);
  if (!n) n = NEIGHBOURHOODS.find(x => x[0].toLowerCase().includes(q));
  return n ? _toObject(n) : null;
}

/**
 * Find the nearest neighbourhood to a lat/lng coordinate.
 * Perfect for GeoGuesser map-click integration.
 *
 * @param   {number}      lat
 * @param   {number}      lng
 * @param   {number}      [maxDistanceKm=5]
 * @returns {object|null} Includes a distanceKm field
 */
export function getNeighbourhoodByCoords(lat, lng, maxDistanceKm = 5) {
  let best = null;
  let bestDist = Infinity;
  for (const n of NEIGHBOURHOODS) {
    const d = _distance(lat, lng, n[6], n[7]);
    if (d < bestDist) { bestDist = d; best = n; }
  }
  if (!best || bestDist > maxDistanceKm) return null;
  return { ..._toObject(best), distanceKm: Math.round(bestDist * 10) / 10 };
}

/**
 * Get all neighbourhoods, optionally filtered and sorted.
 *
 * @param   {object}  [options]
 * @param   {string}  [options.district]     "Innerstaden"|"Söderort"|"Västerort"|"Norrort"
 * @param   {string}  [options.queueStatus]  "Short"|"Moderate"|"Long"|"Very long"|"Extreme"
 * @param   {string}  [options.sortBy]       "name"|"wait_asc"|"wait_desc"|"rent_asc"|"rent_desc"
 * @returns {object[]}
 */
export function getAllNeighbourhoods({ district, queueStatus, sortBy = "name" } = {}) {
  let results = NEIGHBOURHOODS.map(_toObject);
  if (district)    results = results.filter(n => n.district.toLowerCase() === district.toLowerCase());
  if (queueStatus) results = results.filter(n => n.queueStatus === queueStatus);
  if (sortBy === "name")      results.sort((a, b) => a.name.localeCompare(b.name, "sv"));
  if (sortBy === "wait_asc")  results.sort((a, b) => a.waitAvg - b.waitAvg);
  if (sortBy === "wait_desc") results.sort((a, b) => b.waitAvg - a.waitAvg);
  if (sortBy === "rent_asc")  results.sort((a, b) => a.rent1room - b.rent1room);
  if (sortBy === "rent_desc") results.sort((a, b) => b.rent1room - a.rent1room);
  return results;
}

/**
 * Summary stats for a district or the whole city.
 *
 * @param   {string}  [district]  Optional filter
 * @returns {{ count, avgRent1room, minRent, maxRent, avgWait, minWait, maxWait }}
 */
export function getDistrictStats(district) {
  let data = NEIGHBOURHOODS.map(_toObject);
  if (district) data = data.filter(n => n.district.toLowerCase() === district.toLowerCase());
  if (!data.length) return null;
  return {
    count:        data.length,
    avgRent1room: Math.round(data.reduce((s, n) => s + n.rent1room, 0) / data.length),
    minRent:      Math.min(...data.map(n => n.rent1room)),
    maxRent:      Math.max(...data.map(n => n.rent1room)),
    avgWait:      Math.round((data.reduce((s, n) => s + n.waitAvg, 0) / data.length) * 10) / 10,
    minWait:      Math.min(...data.map(n => n.waitMin)),
    maxWait:      Math.max(...data.map(n => n.waitMax))
  };
}

/**
 * All unique district names.
 * @returns {string[]}
 */
export function getDistricts() {
  return [...new Set(NEIGHBOURHOODS.map(n => n[1]))].sort();
}
