/**
 * sweden-housing-providers.js  (v2 — extended with small & private landlords)
 * ─────────────────────────────────────────────────────────────────────────────
 * Four tiers of housing providers for every location in Sweden:
 *
 *  1. MUNICIPAL      — kommunala bostadsbolag (allmännytta), queue-based
 *  2. LARGE_PRIVATE  — national private companies (Heimstaden, Rikshem etc.)
 *  3. SMALL_PRIVATE  — smaller local landlords, often NO queue at all
 *  4. AGGREGATORS    — sites that list thousands of private landlords per city
 *
 * USAGE
 * ─────
 *   import { getProviders, NATIONAL_PLATFORMS, AGGREGATOR_SITES } from './sweden-housing-providers.js';
 *
 *   const result = getProviders("Uppsala");
 *   // result.municipal        → kommunalt bostadsbolag
 *   // result.large_private    → Rikshem, Heimstaden etc. in that city
 *   // result.small_private    → local smaller landlords, often no queue
 *   // result.aggregators      → sites to find even more obscure landlords
 *   // result.national         → Blocket, Qasa, Samtrygg etc.
 *
 * PROVIDER OBJECT
 * ───────────────
 *   {
 *     name:        "Lundbergs Fastigheter",
 *     url:         "https://www.lundbergsfastigheter.se/bostad",
 *     type:        "small_private",
 *     hasQueue:    false,       // false = apply directly, no waiting years
 *     cities:      ["Linköping","Norrköping","Karlstad",...],
 *     description: "...",
 *     logo:        "https://www.google.com/s2/favicons?domain=lundbergsfastigheter.se&sz=64"
 *   }
 * ─────────────────────────────────────────────────────────────────────────────
 */

function p(name, url, type, hasQueue, cities, description) {
  const domain = url.replace(/https?:\/\/(www\.)?/, "").split("/")[0];
  return { name, url, type, hasQueue, cities: cities || [], description,
           logo: `https://www.google.com/s2/favicons?domain=${domain}&sz=64` };
}

// ─── TIER 1: NATIONAL PLATFORMS ──────────────────────────────────────────────
export const NATIONAL_PLATFORMS = [
  p("Bostadsförmedlingen Stockholm","https://bostad.stockholm.se",            "national",true, [],"Stockholmsregionens officiella bostadskö. Registrera dig tidigt — kötiden räknas från dag ett."),
  p("Boplats Göteborg",            "https://boplats.se",                      "national",true, [],"Göteborgs och västra Sveriges kommunala bostadskö."),
  p("Boplats Syd",                 "https://boplatssyd.se",                   "national",true, [],"Bostadskö för Malmö, Lund, Helsingborg och Skåne-kommuner."),
  p("Blocket Bostad",              "https://www.blocket.se/bostad",           "national",false,[],"Sveriges största andrahandssajt. Hela landet, gratis att söka."),
  p("Bostadsportal",               "https://bostadsportal.se",                "national",false,[],"Modern plattform för andrahandsuthyrning. Verifierade annonser."),
  p("Qasa",                        "https://qasa.se",                         "national",false,[],"Digital hyresplattform med verifierade hyresvärdar och digitala kontrakt."),
  p("Samtrygg",                    "https://www.samtrygg.se",                 "national",false,[],"Trygg andrahandsuthyrning med försäkring och juridisk hjälp."),
  p("Bostad Direkt",               "https://www.bostaddirekt.com",            "national",false,[],"Kommersiell förmedling av andrahandskontrakt. Även engelska annonser."),
  p("Hemnet Hyra",                 "https://www.hemnet.se/bostader/hyresratt","national",false,[],"Hyresrättsannonser på Sveriges ledande bostadssajt."),
  p("Hyrabostad.se",               "https://www.hyrabostad.se",               "national",false,[],"Stadsvisa guider med privata hyresvärdar — inkl. aktörer utan kösystem."),
];

// ─── TIER 2: LARGE NATIONAL PRIVATE LANDLORDS ────────────────────────────────
export const LARGE_PRIVATE_LANDLORDS = [
  p("Heimstaden",       "https://www.heimstaden.com/sv/hyra-bostad",         "large_private",true, ["Stockholm","Göteborg","Malmö","Uppsala","Linköping","Örebro","Gävle","Sundsvall","Umeå"],"Sveriges största privata hyresvärd ~40 000 lägenheter. Eget kösystem, ofta kortare väntan."),
  p("Rikshem",          "https://www.rikshem.se/hitta-bostad",               "large_private",true, ["Stockholm","Göteborg","Malmö","Uppsala","Västerås","Örebro","Karlstad","Sundsvall","Luleå","Umeå","Gävle","Jönköping"],"~28 000 lägenheter i 30+ städer. Eget intresseregister."),
  p("Willhem",          "https://www.willhem.se/lediga-lagenheter",          "large_private",true, ["Stockholm","Göteborg","Borås","Helsingborg","Jönköping","Eskilstuna","Örebro","Gävle"],"~10 000 lägenheter. Egna kölistor per stad."),
  p("Stena Fastigheter","https://www.stenafastigheter.se/hyra-bostad",       "large_private",true, ["Stockholm","Göteborg","Malmö","Uppsala","Landskrona","Lomma"],"~26 000 bostäder i sex städer. Eget kösystem, kortare väntan."),
  p("Wallenstam",       "https://www.wallenstam.se/hyreslagenheter",         "large_private",true, ["Göteborg","Stockholm","Uppsala"],"Börsnoterat bolag med ~9 000 hyreslägenheter. Eget kösystem."),
  p("Balder",           "https://www.fastighetsbalder.se/lediga-objekt",     "large_private",true, ["Stockholm","Göteborg","Malmö","Uppsala","Helsingborg","Lund"],"Privat fastighetsbolag i storstäderna. Direktansökan."),
  p("Slättö",           "https://www.slatto.se/bostader",                    "large_private",true, ["Stockholm","Göteborg","Malmö","Uppsala","Örebro","Linköping","Norrköping","Helsingborg","Gävle","Sundsvall","Luleå"],"~8 000 lägenheter i Sverige och Finland. Kortare köer."),
  p("K2A Fastigheter",  "https://www.k2a.se/hyra-lagenhet",                 "large_private",true, ["Stockholm","Västerås","Uppsala","Örebro","Linköping","Norrköping","Gävle","Västervik"],"~5 000 lägenheter i universitets- och högskolestäder."),
  p("Skandia Fastigheter","https://www.skandiafastigheter.se/bostader",      "large_private",true, ["Stockholm","Göteborg","Malmö"],"Pensionsbolagens fastighetsbolag ~4 500 lägenheter."),
  p("Sveafastigheter",  "https://www.sveafastigheter.se/hyra",               "large_private",true, ["Stockholm","Göteborg","Uppsala","Örebro","Gävle"],"Privat fastighetsbolag i fem städer."),
  p("HSB",              "https://www.hsb.se/hyreslagenheter",                "large_private",true, ["Stockholm","Göteborg","Malmö","Uppsala","Örebro","Linköping","Lund","Gävle","Umeå","Luleå"],"Rikstäckande bostadskooperativ. Bosparare har förtur."),
  p("Lundbergs Fastigheter","https://www.lundbergsfastigheter.se/bostad",    "large_private",false,["Stockholm","Göteborg","Jönköping","Karlstad","Linköping","Norrköping","Södertälje","Eskilstuna","Örebro","Arvika"],"~7 000 lägenheter i 10 städer. INGET kösystem — skicka intresseanmälan direkt."),
  p("Botrygg",          "https://www.botrygg.se/lediga-lagenheter",          "large_private",false,["Linköping","Norrköping","Kalmar","Jönköping","Örebro","Växjö"],"~4 000 bostäder i mellersta Sverige. Inget kösystem."),
  p("Bostjärnan",       "https://www.bostjarnan.se",                         "large_private",false,["Göteborg","Västerås","Mölndal","Solna"],"Familjeägt bolag ~1 600 lägenheter. Direktansökan utan kö."),
  p("Diös Fastigheter", "https://www.dios.se/hyra-lagenhet",                 "large_private",false,["Sundsvall","Östersund","Gävle","Falun","Borlänge","Umeå","Luleå","Skellefteå"],"Norrländskt fastighetsbolag med bostäder i många städer. Direktansökan."),
];

// ─── TIER 3: SMALL / LOCAL PRIVATE LANDLORDS (per city) ──────────────────────
// These are "harder to find" — smaller operators, often no queue at all.
const SMALL_PRIVATE = {
  "Stockholm": [
    p("Einar Mattsson",    "https://www.einarmattsson.se/hyreslagenheter",    "small_private",false,["Stockholm"],"Familjebolag ~3 000 lägenheter i Stockholm. Eget intresseregister, ingen kommunal kö."),
    p("SKB (Kooperativ)",  "https://www.skb.org/bo-hos-skb/lediga-lagenheter","small_private",true, ["Stockholm"],"Kooperativ hyresrätt. Kötid ~10 år men stabila livstidskontrakt. Registrera dig nu."),
    p("Stadsholmen",       "https://www.stadsholmen.se/hyra-lagenhet",        "small_private",true, ["Stockholm"],"Kulturhistoriska fastigheter i Stockholm ~1 600 bostäder."),
    p("Bygg-Göta",         "https://www.bygggota.se",                         "small_private",false,["Stockholm"],"Familjeägt bolag med lägenheter i Stockholms förorter. Direktansökan."),
  ],
  "Göteborg": [
    p("SGS Studentbostäder","https://www.sgsstudentbostader.se",              "small_private",true, ["Göteborg"],"Studentbostäder vid GU och Chalmers. Kräver studentstatus."),
    p("Chalmers Studenthem","https://www.chalmersstudenthem.se",              "small_private",true, ["Göteborg"],"Studentbostäder vid Chalmers. Kräver studentstatus."),
    p("Bostjärnan Göteborg","https://www.bostjarnan.se",                      "small_private",false,["Göteborg","Mölndal"],"Familjeägt privat bolag. Direktansökan utan kö."),
  ],
  "Gothenburg – inner": [
    p("SGS Studentbostäder","https://www.sgsstudentbostader.se",              "small_private",true, ["Göteborg"],"Studentbostäder vid GU och Chalmers."),
    p("Chalmers Studenthem","https://www.chalmersstudenthem.se",              "small_private",true, ["Göteborg"],"Studentbostäder vid Chalmers."),
    p("Bostjärnan Göteborg","https://www.bostjarnan.se",                      "small_private",false,["Göteborg"],"Familjeägt privat bolag. Direktansökan utan kö."),
  ],
  "Gothenburg – suburbs": [
    p("Bostjärnan Göteborg","https://www.bostjarnan.se",                      "small_private",false,["Göteborg"],"Familjeägt privat bolag med lägenheter i förorterna."),
  ],
  "Malmö": [
    p("Trianon",           "https://www.trianon.se/hyra-bostad",              "small_private",false,["Malmö","Stockholm"],"Noterat fastighetsbolag med fokus på Malmö. Direktansökan."),
    p("Rosengård Fastighets AB","https://www.rfast.se",                       "small_private",false,["Malmö"],"Privat bolag i Rosengård. Direktansökan."),
  ],
  "Uppsala": [
    p("Studentstaden",     "https://www.studentstaden.se",                   "small_private",true, ["Uppsala"],"Studentbostäder i Uppsala. Kräver aktiv studentstatus vid UU eller SLU."),
    p("Kungsängen Fastigheter","https://www.kungsangenfastigheter.se",        "small_private",false,["Uppsala"],"Lokal privat hyresvärd i Uppsala. Direktansökan."),
  ],
  "Lund": [
    p("AF Bostäder",       "https://www.afbostader.se",                      "small_private",true, ["Lund"],"Studentbostäder vid LTH/LU. Kräver studentstatus."),
    p("HSB Lund",          "https://www.hsb.se/skane/hyra/lediga-lagenheter","small_private",false,["Lund"],"HSB:s hyreslägenheter i Lund. Direktansökan."),
  ],
  "Linköping": [
    p("Lindstrands Bygg",  "https://www.lindstrandsbygg.se",                 "small_private",false,["Linköping"],"~300 lägenheter i Vasastaden. Ring direkt — ingen kö."),
    p("RE Fastigheter",    "https://www.refastigheter.se",                   "small_private",false,["Linköping"],"Stor privat hyresvärd i Tannefors. Inga köpoäng."),
    p("Centrumförvaltning","https://www.centrumforvaltning.se",              "small_private",false,["Linköping","Norrköping"],"~350 lägenheter i innerstaden. Skicka intresseanmälan."),
    p("LBB Fastighets AB", "https://www.lbb-fastighet.se",                  "small_private",false,["Linköping"],"~180 lägenheter i Gottfridsberg och innerstaden."),
    p("Länsförsäkringar Östgöta Fast.","https://www.lfofast.se",             "small_private",false,["Linköping"],"~500 lägenheter i Vasastaden. Lediga publiceras varje vardag."),
    p("Lindstén CityFastigheter","https://www.lindstens.se",                 "small_private",false,["Linköping"],"~130 lägenheter i innerstaden. Direktansökan."),
  ],
  "Norrköping": [
    p("Ståhl Fastigheter", "https://www.stahlfastigheter.se",                "small_private",false,["Norrköping"],"Lokalt privat fastighetsbolag. Direktansökan."),
    p("Centrumförvaltning","https://www.centrumforvaltning.se",              "small_private",false,["Norrköping","Linköping"],"Privat bolag utan kösystem."),
  ],
  "Örebro": [
    p("Scandinavian Property Group","https://www.spgfastigheter.se",         "small_private",false,["Örebro"],"Lokal privat hyresvärd i Örebro. Direktansökan."),
  ],
  "Västerås": [
    p("Bostjärnan Västerås","https://www.bostjarnan.se",                     "small_private",false,["Västerås"],"Familjeägt bolag ~900 lägenheter i Västerås. Direktansökan, ingen kö."),
    p("Aros Bostad",       "https://www.arosbostadsgruppen.se",              "small_private",false,["Västerås","Eskilstuna"],"Privat fastighetsbolag i Mälardalen. Direktansökan."),
  ],
  "Eskilstuna": [
    p("Aros Bostad",       "https://www.arosbostadsgruppen.se",              "small_private",false,["Eskilstuna","Västerås"],"Privat fastighetsbolag i Mälardalen. Direktansökan."),
  ],
  "Umeå": [
    p("Studentbostäder i Umeå (SBUF)","https://www.sbuf.se",                "small_private",true, ["Umeå"],"Studentbostäder vid UmU. Kräver studentstatus."),
    p("Nolia Fastigheter", "https://www.noliafastigheter.se",                "small_private",false,["Umeå"],"Lokal privat hyresvärd i Umeå. Direktansökan."),
  ],
  "Skellefteå": [
    p("Balticgruppen",     "https://www.balticgruppen.se/bostader",          "small_private",false,["Skellefteå","Luleå"],"Lokalt privat fastighetsbolag. Direktansökan."),
  ],
  "Luleå": [
    p("Balticgruppen",     "https://www.balticgruppen.se/bostader",          "small_private",false,["Luleå","Skellefteå"],"Lokalt privat fastighetsbolag i norra Sverige. Direktansökan."),
  ],
  "Sundsvall": [
    p("MHS Bostäder",      "https://www.mhsbostader.se",                     "small_private",false,["Sundsvall"],"Privat fastighetsbolag. Inget kösystem — direktansökan."),
  ],
  "Gävle": [
    p("Gävle Fastigheter", "https://www.gavlefastigheter.se",                "small_private",false,["Gävle"],"Lokal privat hyresvärd i Gävle. Direktansökan."),
  ],
  "Helsingborg": [
    p("Wihlborgs",         "https://www.wihlborgs.se/hyra-bostad",           "small_private",false,["Helsingborg","Malmö","Lund"],"Börsnoterat bolag med bostäder och lokaler. Direktansökan."),
  ],
  "Karlstad": [
    p("Linden Fastigheter","https://www.lindenfastigheter.se",               "small_private",false,["Karlstad"],"Lokal privat hyresvärd. Direktansökan."),
  ],
};

// ─── TIER 4: AGGREGATOR SITES ────────────────────────────────────────────────
// These sites list thousands of landlords per city, including micro-operators
// with 5–20 apartments that never advertise elsewhere.
export const AGGREGATOR_SITES = [
  p("Ledigalagenheter.org",      "https://ledigalagenheter.org",                                      "aggregator",false,[],"Gratis lista med privata hyresvärdar per stad — inkl. mycket små aktörer med egna intresseregister. Sök din stad i menyn."),
  p("Hyresvärdar.com",           "https://xn--hyresvrdar-v5a.com",                                    "aggregator",false,[],"Listor med kontaktinfo till privata hyresvärdar i hela Sverige. Gratis. Bra för att hitta aktörer utan hemsida."),
  p("Hyresvardslistan.se",       "https://hyresvardslistan.se",                                       "aggregator",false,[],"Alla privata hyresvärdar med direktkontakt — kontakta dem utan kö."),
  p("Hyresmäklaren.se",          "https://www.hyresmaklaren.se/hyresvardar",                          "aggregator",false,[],"3 500+ hyresvärdar i Sverige. Gratis lista med hemsidor och telefonnummer."),
  p("Hyresgästföreningen — Hyresvärdar","https://www.hyresgastforeningen.se/om-oss/hyresvardar/hyresvardar/","aggregator",false,[],"Hyresgästföreningens lista med privata och kommunala hyresvärdar. Kontaktuppgifter per stad."),
  p("Hyresgästföreningen Stockholm","https://www.hyresgastforeningen.se/om-oss/hyresvardar/hyresvardar-i-stockholm/","aggregator",false,["Stockholm"],"Lista med Stockholms privata hyresvärdar och kontaktinfo."),
  p("Hyresgästföreningen Göteborg","https://www.hyresgastforeningen.se/om-oss/hyresvardar/hyresvardar-i-goteborg/","aggregator",false,["Göteborg"],"Lista med Göteborgs privata hyresvärdar."),
  p("Lägenheter24.se",           "https://www.lagenheter24.se",                                       "aggregator",false,[],"Bevakningstjänst — få e-post direkt när en matchande lägenhet annonseras av privata hyresvärdar."),
  p("Privatahyresvärdar.nu",     "https://xn--privatahyresvrdar-2qb.nu",                              "aggregator",false,[],"Beställbara listor med ALLA privata hyresvärdar per stad, inkl. de som inte syns online. Bra för direktkontakt."),
  p("Facebook — Hyra bostad",    "https://www.facebook.com/groups/",                                  "aggregator",false,[],"Sök 'Hyra bostad [stad]' eller 'Lägenhet [stad]' på Facebook. Privatpersoner och mikrohyresvärdar annonserar här — ofta snabbaste vägen."),
];

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC API
// ─────────────────────────────────────────────────────────────────────────────

function _buildMunicipalFallback(name) {
  const slug = name.toLowerCase()
    .replace(/å/g,"a").replace(/ä/g,"a").replace(/ö/g,"o")
    .replace(/\s+/g,"").replace(/[^a-z0-9-]/g,"");
  return [p(`${name} Bostäder`, `https://www.${slug}.se/bo-och-bygga/hyra-bostad`,
    "municipal", true, [name],
    `Kommunens lokala bostadsbolag. Besök kommunens hemsida för aktuella lediga lägenheter.`)];
}

const MUNICIPAL_PROVIDERS = {
  "Stockholm – innerstad": [p("Bostadsförmedlingen Stockholm","https://bostad.stockholm.se","municipal",true,["Stockholm"],"Officiell kö för hela Stockholmsregionen."),p("Stockholmshem","https://www.stockholmshem.se","municipal",true,["Stockholm"],"~27 000 lägenheter i Stockholms stad."),p("Svenska Bostäder","https://www.svenskabostader.se","municipal",true,["Stockholm"],"Kommunalt bolag med lägenheter i Stockholms stad."),p("Familjebostäder","https://www.familjebostader.se","municipal",true,["Stockholm"],"Kommunalt bolag med fokus på familjelägenheter.")],
  "Stockholm – ytterstad": [p("Bostadsförmedlingen Stockholm","https://bostad.stockholm.se","municipal",true,["Stockholm"],"Officiell kö."),p("Stockholmshem","https://www.stockholmshem.se","municipal",true,["Stockholm"],"Stort kommunalt bolag med lägenheter i ytterstad.")],
  "Botkyrka":[p("Botkyrkabyggen","https://www.botkyrkabyggen.se","municipal",true,["Botkyrka"],"Kommunalt bostadsbolag. ~11 000 hyresrätter.")],
  "Nacka":[p("Nacka Bostäder","https://www.nackabostader.se","municipal",true,["Nacka"],"Kommunalt bostadsbolag i Nacka.")],
  "Sollentuna":[p("Sollentuna Hem","https://www.sollentunahem.se","municipal",true,["Sollentuna"],"Kommunalt bostadsbolag.")],
  "Solna":[p("Signalisten","https://www.signalisten.se","municipal",true,["Solna"],"Kommunalt bostadsbolag ~5 000 lägenheter.")],
  "Huddinge":[p("Huge Fastigheter","https://www.huge.se","municipal",true,["Huddinge"],"Kommunalt bostadsbolag ~8 000 lägenheter.")],
  "Järfälla":[p("Järfällahus","https://www.jarfallahus.se","municipal",true,["Järfälla"],"Kommunalt bostadsbolag.")],
  "Sundbyberg":[p("Förvaltaren","https://www.forvaltaren.se","municipal",true,["Sundbyberg"],"Kommunalt bostadsbolag.")],
  "Södertälje":[p("Telge Bostäder","https://www.telgebostader.se","municipal",true,["Södertälje"],"Kommunalt bostadsbolag ~7 000 lägenheter.")],
  "Sigtuna":[p("Sigtunahem","https://www.sigtunahem.se","municipal",true,["Sigtuna"],"Kommunalt bostadsbolag i Sigtuna och Märsta.")],
  "Uppsala":[p("Uppsalahem","https://www.uppsalahem.se","municipal",true,["Uppsala"],"Kommunalt bostadsbolag ~15 000 lägenheter.")],
  "Eskilstuna":[p("Eskilstunahem","https://www.eskilstunahem.se","municipal",true,["Eskilstuna"],"Kommunalt bostadsbolag ~13 000 lägenheter.")],
  "Nyköping":[p("Nyköpingshem","https://www.nykopingshem.se","municipal",true,["Nyköping"],"Kommunalt bostadsbolag.")],
  "Linköping":[p("Stångåstaden","https://www.stangastaden.se","municipal",true,["Linköping"],"Kommunalt bostadsbolag ~18 000 lägenheter.")],
  "Norrköping":[p("Hyresbostäder i Norrköping","https://www.hyresbostader.se","municipal",true,["Norrköping"],"Kommunalt bostadsbolag.")],
  "Jönköping":[p("Vätterhem","https://www.vatterhem.se","municipal",true,["Jönköping"],"Kommunalt bostadsbolag ~14 000 lägenheter.")],
  "Växjö":[p("Växjöbostäder","https://www.vaxjobostader.se","municipal",true,["Växjö"],"Kommunalt bostadsbolag.")],
  "Kalmar":[p("Kalmarhem","https://www.kalmarhem.se","municipal",true,["Kalmar"],"Kommunalt bostadsbolag.")],
  "Gotland":[p("Gotlandshem","https://www.gotlandshem.se","municipal",true,["Gotland"],"Kommunalt bostadsbolag. Begränsat bestånd — lång kötid.")],
  "Karlskrona":[p("Karlskronahem","https://www.karlskronahem.se","municipal",true,["Karlskrona"],"Kommunalt bostadsbolag.")],
  "Malmö":[p("Boplats Syd","https://boplatssyd.se","municipal",true,["Malmö"],"Kommunal bostadskö för Malmö."),p("MKB Fastighets AB","https://www.mkb.se","municipal",true,["Malmö"],"Malmös kommunala bostadsbolag ~24 000 lägenheter.")],
  "Lund":[p("Boplats Syd","https://boplatssyd.se","municipal",true,["Lund"],"Bostadskö för Lund."),p("LKF","https://www.lkf.se","municipal",true,["Lund"],"Lunds kommunala fastighetsbolag ~8 000 lägenheter.")],
  "Helsingborg":[p("Boplats Syd","https://boplatssyd.se","municipal",true,["Helsingborg"],"Bostadskö."),p("Helsingborgshem","https://www.helsingborgshem.se","municipal",true,["Helsingborg"],"Kommunalt bostadsbolag ~13 000 lägenheter.")],
  "Halmstad":[p("Halmstads Fastighets AB","https://www.hfab.se","municipal",true,["Halmstad"],"Kommunalt bostadsbolag ~10 000 lägenheter.")],
  "Varberg":[p("Varbergs Bostads AB","https://www.varbergsbostadsab.se","municipal",true,["Varberg"],"Kommunalt bostadsbolag.")],
  "Gothenburg – inner":[p("Boplats Göteborg","https://boplats.se","municipal",true,["Göteborg"],"Göteborgs officiella bostadskö."),p("Poseidon","https://www.poseidon.goteborg.se","municipal",true,["Göteborg"],"Kommunalt bolag med lägenheter i innerstaden.")],
  "Gothenburg – suburbs":[p("Boplats Göteborg","https://boplats.se","municipal",true,["Göteborg"],"Göteborgs bostadskö."),p("Bostadsbolaget","https://www.bostadsbolaget.se","municipal",true,["Göteborg"],"Kommunalt bolag med fokus på förorter.")],
  "Borås":[p("Bostäder i Borås","https://www.bostader.boras.se","municipal",true,["Borås"],"Kommunalt bostadsbolag ~10 000 lägenheter.")],
  "Skövde":[p("Skövdebostäder","https://www.skovdebostader.se","municipal",true,["Skövde"],"Kommunalt bostadsbolag.")],
  "Trollhättan":[p("Trollhättans Stads Bostäder","https://www.tstab.se","municipal",true,["Trollhättan"],"Kommunalt bostadsbolag.")],
  "Karlstad":[p("Karlstads Bostads AB","https://www.kbab.se","municipal",true,["Karlstad"],"Kommunalt bostadsbolag ~10 000 lägenheter.")],
  "Örebro":[p("ÖrebroBostäder","https://www.orebrobostader.se","municipal",true,["Örebro"],"Kommunalt bostadsbolag ~15 000 lägenheter.")],
  "Västerås":[p("Mimer","https://www.mimer.nu","municipal",true,["Västerås"],"Kommunalt bostadsbolag ~14 000 lägenheter.")],
  "Falun":[p("Faluhem","https://www.faluhem.se","municipal",true,["Falun"],"Kommunalt bostadsbolag.")],
  "Borlänge":[p("Tunabyggen","https://www.tunabyggen.se","municipal",true,["Borlänge"],"Kommunalt bostadsbolag.")],
  "Gävle":[p("Gavlegårdarna","https://www.gavlegardarna.se","municipal",true,["Gävle"],"Kommunalt bostadsbolag ~13 000 lägenheter.")],
  "Sundsvall":[p("Mitthem","https://www.mitthem.se","municipal",true,["Sundsvall"],"Kommunalt bostadsbolag ~10 000 lägenheter.")],
  "Östersund":[p("Östersundshem","https://www.ostersundshem.se","municipal",true,["Östersund"],"Kommunalt bostadsbolag ~7 000 lägenheter.")],
  "Umeå":[p("Bostaden","https://www.bostaden.umea.se","municipal",true,["Umeå"],"Kommunalt bostadsbolag ~12 000 lägenheter.")],
  "Skellefteå":[p("Skebo","https://www.skebo.se","municipal",true,["Skellefteå"],"Kommunalt bostadsbolag. Snabbväxande stad.")],
  "Luleå":[p("LuleBo","https://www.lulebo.se","municipal",true,["Luleå"],"Kommunalt bostadsbolag ~10 000 lägenheter.")],
  "Kiruna":[p("Kirunabostäder","https://www.kirunabostader.se","municipal",true,["Kiruna"],"Kommunalt bostadsbolag. Stad under flytt pga LKAB.")],
};

/**
 * Get all housing providers for a location, split into four tiers.
 *
 * @param {string} municipalityName  e.g. "Uppsala", "Gothenburg – inner", "Malmö"
 * @returns {{
 *   municipal:     object[],   // kommunalt bostadsbolag
 *   large_private: object[],   // Rikshem, Heimstaden etc. active in this city
 *   small_private: object[],   // local smaller landlords, often no queue
 *   aggregators:   object[],   // sites to find obscure landlords
 *   national:      object[]    // Blocket, Qasa, Samtrygg etc.
 * }}
 */
export function getProviders(municipalityName) {
  const name = municipalityName.toLowerCase().trim();

  const municipalKey = Object.keys(MUNICIPAL_PROVIDERS).find(k => k.toLowerCase() === name);
  const municipal = municipalKey ? MUNICIPAL_PROVIDERS[municipalKey] : _buildMunicipalFallback(municipalityName);

  const large_private = LARGE_PRIVATE_LANDLORDS.filter(lp =>
    lp.cities.length === 0 ||
    lp.cities.some(c => c.toLowerCase() === name || name.includes(c.toLowerCase()))
  );

  const smallKey = Object.keys(SMALL_PRIVATE).find(
    k => k.toLowerCase() === name || name.includes(k.toLowerCase())
  );
  const small_private = smallKey ? SMALL_PRIVATE[smallKey] : [];

  const aggregators = AGGREGATOR_SITES.filter(a =>
    a.cities.length === 0 ||
    a.cities.some(c => c.toLowerCase() === name || name.includes(c.toLowerCase()))
  );

  return { municipal, large_private, small_private, aggregators, national: NATIONAL_PLATFORMS };
}

/** Get only the "hidden" providers — small private + aggregators. */
export function getHiddenProviders(municipalityName) {
  const { small_private, aggregators } = getProviders(municipalityName);
  return { small_private, aggregators };
}

/** Get all large national private landlords active in a city. */
export function getLargePrivate(municipalityName) {
  return getProviders(municipalityName).large_private;
}

/** List all cities that have explicit small_private data. */
export function getCitiesWithSmallPrivateData() {
  return Object.keys(SMALL_PRIVATE).sort((a,b) => a.localeCompare(b,"sv"));
}
