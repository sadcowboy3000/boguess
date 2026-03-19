/**
 * sweden-queue.js
 * -------------------------------------------------------
 * Rental apartment queue data for all 290 Swedish municipalities.
 * 
 * USAGE:
 *   import { getQueueInfo, getQueueByCoords, getAllMunicipalities } from './sweden-queue.js';
 *
 *   // By name (case-insensitive, partial match supported)
 *   const info = getQueueInfo("Uppsala");
 *
 *   // By coordinates
 *   const info = getQueueByCoords(59.8586, 17.6389);
 *
 *   // Get all municipalities (optionally filtered by region)
 *   const all = getAllMunicipalities();
 *   const skane = getAllMunicipalities({ region: "Skåne" });
 *   const sorted = getAllMunicipalities({ sortBy: "wait_desc" });
 *
 * RETURN SHAPE:
 *   {
 *     name: "Uppsala",
 *     region: "Uppsala",
 *     waitMin: 3,          // years (low estimate)
 *     waitMax: 8,          // years (high estimate)
 *     waitAvg: 5.5,        // years (midpoint)
 *     status: "Moderate",  // "Very short" | "Short" | "Moderate" | "Long" | "Very long"
 *     description: "...",
 *     agency: "Uppsala Bostadsförmedling",
 *     lat: 59.8586,
 *     lng: 17.6389
 *   }
 *
 * DATA SOURCES:
 *   - Known cities: Bostadsförmedlingen Stockholm, Boplats Göteborg, Boplats Syd,
 *     and individual municipal housing agencies (2024-2025 reported figures).
 *   - Remaining municipalities: estimated from Boverket Bostadsmarknadsenkäten 2025
 *     and Sveriges Allmännytta county-level data.
 * -------------------------------------------------------
 */

const MUNICIPALITIES = [
  // [name, region, waitMin, waitMax, description, agency, lat, lng]
  ["Botkyrka","Stockholm",3,8,"Pendlingskommun nära Stockholm","Botkyrkabyggen",59.2000,17.8333],
  ["Danderyd","Stockholm",6,14,"Välbärgad förort nära Stockholm city","Lokala förmedlare",59.4000,18.0333],
  ["Ekerö","Stockholm",2,6,"Pendlingskommun, öar i Mälaren","Ekerö Bostäder",59.2833,17.8000],
  ["Haninge","Stockholm",2,6,"Pendlingskommun söder om Stockholm","Haninge Bostäder",59.1667,18.1500],
  ["Huddinge","Stockholm",3,8,"Stor pendlingskommun, SL-pendel","Huge Fastigheter",59.2333,17.9833],
  ["Järfälla","Stockholm",2,6,"Pendlingskommun, pendeltåg","Järfällahus",59.4333,17.8333],
  ["Lidingö","Stockholm",5,12,"Välbärgad ö nära Stockholm","Lidingöhem",59.3667,18.1500],
  ["Nacka","Stockholm",3,8,"Populär pendlingskommun","Nacka Bostäder",59.3167,18.1667],
  ["Norrtälje","Stockholm",1,4,"Kustkommun norr om Stockholm","Norrtälje Kommunhus",59.7667,18.7000],
  ["Nykvarn","Stockholm",1,3,"Liten pendlingskommun","Nykvarns Fastighetsbolag",59.1833,17.4333],
  ["Nynäshamn","Stockholm",1,4,"Hamnstad söder om Stockholm","Nynäshamns Bostäder",58.9000,17.9500],
  ["Salem","Stockholm",2,5,"Liten söderort-pendlare","Salems Bostäder",59.2000,17.7667],
  ["Sigtuna","Stockholm",2,5,"Historisk stad, Arlanda nära","Sigtunahem",59.6167,17.7167],
  ["Sollentuna","Stockholm",3,7,"Populär pendlingskommun norrut","Sollentuna Hem",59.4333,17.9500],
  ["Solna","Stockholm",6,14,"Tät, central satellitstad","Signalisten",59.3667,18.0000],
  ["Stockholm – innerstad","Stockholm",12,22,"Södermalm, Östermalm, Kungsholmen m.fl.","Bostadsförmedlingen Stockholm",59.3326,18.0649],
  ["Stockholm – ytterstad","Stockholm",5,12,"Farsta, Vällingby, Hässelby m.fl.","Bostadsförmedlingen Stockholm",59.3500,17.9500],
  ["Sundbyberg","Stockholm",5,12,"Tätt och centralt","Förvaltaren",59.3667,17.9667],
  ["Södertälje","Stockholm",1,4,"Industri- och pendlingsstad","Telge Bostäder",59.1955,17.6253],
  ["Tyresö","Stockholm",3,8,"Populär pendlingskommun söderut","Tyresö Bostäder",59.2500,18.2333],
  ["Täby","Stockholm",4,10,"Välbärgad norrort","Täby Fastigheter",59.4833,18.0667],
  ["Upplands Väsby","Stockholm",2,5,"Pendlingskommun norr om Stockholm","Väsbyhem",59.5167,17.9333],
  ["Upplands-Bro","Stockholm",2,5,"Pendlingskommun västerut","Upplands-Bro Bostäder",59.5333,17.6333],
  ["Vallentuna","Stockholm",2,5,"Pendlingskommun nordöst","Vallentuna Fastigheter",59.5333,18.0833],
  ["Vaxholm","Stockholm",3,7,"Skärgårdskommun","Vaxholms Stad",59.4000,18.3333],
  ["Värmdö","Stockholm",2,6,"Skärgårdskommun öster om Stockholm","Värmdö Bostäder",59.3167,18.5000],
  ["Österåker","Stockholm",2,5,"Pendlingskommun nordöst","Österåkershem",59.4833,18.3000],
  ["Enköping","Uppsala",1,3,"Mellanstor stad, pendel till Stockholm","Enköpings Hyresbostäder",59.6333,17.0833],
  ["Heby","Uppsala",0.5,2,"Liten landsbygdskommun","Lokalt bostadsbolag",59.9333,16.8667],
  ["Håbo","Uppsala",1,3,"Pendlingskommun nära Uppsala","Håbo Bostäder",59.5500,17.5333],
  ["Knivsta","Uppsala",2,5,"Snabbväxande pendlingskommun","Knivsta Bostäder",59.7167,17.7833],
  ["Tierp","Uppsala",0.5,2,"Lantlig nordlig Uppsalakommun","Tierps Bostäder",60.3500,17.5167],
  ["Uppsala","Uppsala",3,8,"Universitets- och residensstad","Uppsala Bostadsförmedling",59.8586,17.6389],
  ["Älvkarleby","Uppsala",0.5,2,"Liten kustkommun","Lokalt bostadsbolag",60.5667,17.4500],
  ["Östhammar","Uppsala",0.5,2,"Kust- och skärgårdskommun","Östhammars Fastigheter",60.2500,18.3667],
  ["Eskilstuna","Södermanland",1,3,"Stor industristad","Eskilstunahem",59.3711,16.5099],
  ["Flen","Södermanland",0.5,1.5,"Liten landsbygdskommun","Flens Bostäder",59.0583,16.5833],
  ["Gnesta","Södermanland",0.5,2,"Liten pendlingskommun","Gnesta Bostäder",59.0500,17.3167],
  ["Katrineholm","Södermanland",0.5,2,"Knutpunkt i Södermanland","Katrineholms Bostäder",59.0000,16.2000],
  ["Nyköping","Södermanland",1,3,"Residensstad med hamn","Nyköpingshem",58.7531,17.0075],
  ["Oxelösund","Södermanland",0.5,1.5,"Liten industristad vid kusten","Oxelösunds Fastigheter",58.6667,17.1000],
  ["Strängnäs","Södermanland",1,3,"Historisk stad vid Mälaren","Strängnäs Bostäder",59.3833,17.0333],
  ["Trosa","Södermanland",0.5,2,"Liten kuststad","Trosa Bostäder",58.8933,17.5500],
  ["Vingåker","Södermanland",0.5,1.5,"Liten landsbygdskommun","Lokalt bostadsbolag",59.0500,15.8667],
  ["Boxholm","Östergötland",0.5,1.5,"Liten industrikommun","Lokalt bostadsbolag",58.1833,15.0500],
  ["Finspång","Östergötland",0.5,2,"Industri- och skogskommun","Finspångs Hyresbostäder",58.7083,15.7667],
  ["Kinda","Östergötland",0.5,1.5,"Landsbygdskommun","Kinda Bostäder",57.9833,15.6333],
  ["Linköping","Östergötland",2,5,"Stor universitets- och teknikstad","Stångåstaden",58.4108,15.6214],
  ["Mjölby","Östergötland",1,3,"Mellanstor stad sydväst om Linköping","Mjölby Bostäder",58.3250,15.1333],
  ["Motala","Östergötland",1,3,"Stad vid Vättern","Motalabostäder",58.5383,15.0383],
  ["Norrköping","Östergötland",2,5,"Stor industristad, textilhistoria","Hyresbostäder i Norrköping",58.5942,16.1826],
  ["Söderköping","Östergötland",0.5,2,"Liten historisk stad","Söderköpings Bostäder",58.4833,16.3333],
  ["Vadstena","Östergötland",0.5,2,"Liten klosterstad vid Vättern","Vadstena Bostäder",58.4483,14.8883],
  ["Valdemarsvik","Östergötland",0.5,1.5,"Liten kustkommun","Lokalt bostadsbolag",58.2000,16.6000],
  ["Ydre","Östergötland",0.5,1,"Liten landsbygdskommun","Lokalt bostadsbolag",57.8500,15.2500],
  ["Åtvidaberg","Östergötland",0.5,1.5,"Liten industrikommun","Åtvidabergs Bostäder",58.2000,16.0000],
  ["Ödeshög","Östergötland",0.5,1,"Liten landsbygdskommun","Lokalt bostadsbolag",58.2333,14.6667],
  ["Aneby","Jönköping",0.5,1,"Liten landsbygdskommun","Lokalt bostadsbolag",57.8333,14.8167],
  ["Eksjö","Jönköping",0.5,2,"Vacker trästad","Eksjöbostäder",57.6667,14.9667],
  ["Gislaved","Jönköping",0.5,2,"Gummistadskommun","Gislavedsbostäder",57.3000,13.5333],
  ["Gnosjö","Jönköping",0.5,1.5,"Liten industrikommun","Lokalt bostadsbolag",57.3583,13.7333],
  ["Habo","Jönköping",1,3,"Pendlingskommun nära Jönköping","Habo Bostäder",57.9167,14.0833],
  ["Jönköping","Jönköping",2,5,"Stor handelsstad vid Vättern","Vätterhem",57.7826,14.1618],
  ["Mullsjö","Jönköping",0.5,1.5,"Liten kommun","Mullsjö Bostäder",57.9167,13.8833],
  ["Nässjö","Jönköping",0.5,2,"Mellanstor stad, järnvägsknut","Nässjöhem",57.6533,14.6983],
  ["Sävsjö","Jönköping",0.5,1.5,"Liten landsbygdskommun","Lokalt bostadsbolag",57.4000,14.6667],
  ["Tranås","Jönköping",0.5,2,"Möbelstaden","Tranåsbostäder",58.0333,14.9833],
  ["Vaggeryd","Jönköping",0.5,2,"Pendlingskommun","Vaggerydsbostäder",57.4967,14.1450],
  ["Vetlanda","Jönköping",0.5,2,"Mellanstor landsbygdsstad","Vetlandabostäder",57.4267,15.0800],
  ["Värnamo","Jönköping",1,2,"Handelsstad i Småland","Värnamo Bostads AB",57.1833,14.0333],
  ["Alvesta","Kronoberg",0.5,2,"Järnvägsknut i Kronoberg","Alvestabostäder",56.9000,14.5500],
  ["Lessebo","Kronoberg",0.5,1.5,"Liten glasbrukskommun","Lokalt bostadsbolag",56.7500,15.2667],
  ["Ljungby","Kronoberg",0.5,2,"Mellanstor handelsstad","Ljungbybostäder",56.8333,13.9333],
  ["Markaryd","Kronoberg",0.5,1.5,"Gränskommun mot Skåne","Lokalt bostadsbolag",56.4667,13.5833],
  ["Tingsryd","Kronoberg",0.5,1.5,"Sjörik landsbygdskommun","Tingsryds Bostäder",56.5333,14.9667],
  ["Uppvidinge","Kronoberg",0.5,1.5,"Liten landsbygdskommun","Lokalt bostadsbolag",57.0000,15.3333],
  ["Växjö","Kronoberg",2,5,"Universitetsstad, Europas grönaste","Växjöbostäder",56.8777,14.8094],
  ["Älmhult","Kronoberg",0.5,2,"IKEA:s hemstad","Älmhultsbostäder",56.5500,14.1333],
  ["Borgholm","Kalmar",0.5,2,"Öland, turiststad","Lokalt bostadsbolag",56.8833,16.6500],
  ["Emmaboda","Kalmar",0.5,1.5,"Glasbrukskommun","Lokalt bostadsbolag",56.6333,15.5333],
  ["Hultsfred","Kalmar",0.5,1.5,"Liten landsbygdskommun","Lokalt bostadsbolag",57.4833,15.8333],
  ["Högsby","Kalmar",0.5,1,"Liten landsbygdskommun","Lokalt bostadsbolag",57.1667,16.0167],
  ["Kalmar","Kalmar",2,5,"Universitets- och residensstad","Kalmarhem",56.6634,16.3566],
  ["Mönsterås","Kalmar",0.5,1.5,"Kustkommun","Mönsteråsbostäder",57.0333,16.4500],
  ["Mörbylånga","Kalmar",0.5,2,"Ölandsbro-kommun","Lokalt bostadsbolag",56.5167,16.3833],
  ["Nybro","Kalmar",0.5,2,"Glasriket","Nybrobostäder",56.7500,15.9000],
  ["Oskarshamn","Kalmar",0.5,2,"Hamnstad med kärnkraft","Oskarshamnshem",57.2650,16.4483],
  ["Torsås","Kalmar",0.5,1,"Liten landsbygdskommun","Lokalt bostadsbolag",56.4167,15.9833],
  ["Vimmerby","Kalmar",0.5,2,"Astrid Lindgrens hemstad","Vimmerbybostäder",57.6667,15.8500],
  ["Västervik","Kalmar",0.5,2,"Skärgårdsstad","Västerviksbostäder",57.7583,16.6417],
  ["Gotland","Gotland",8,15,"Ö med begränsat bostadsbestånd","Gotlandshem",57.4684,18.4867],
  ["Karlshamn","Blekinge",0.5,2,"Hamnstad i Blekinge","Karlshamnsbostäder",56.1667,14.8667],
  ["Karlskrona","Blekinge",1,3,"Marinstad, UNESCO världsarv","Karlskronahem",56.1608,15.5861],
  ["Olofström","Blekinge",0.5,1.5,"Industrikommun (Volvo)","Lokalt bostadsbolag",56.2833,14.5333],
  ["Ronneby","Blekinge",0.5,2,"Kurortstad","Ronneby Miljö och Teknik",56.2083,15.2750],
  ["Sölvesborg","Blekinge",0.5,2,"Liten kuststad","Lokalt bostadsbolag",56.0500,14.5833],
  ["Bjuv","Skåne",1,3,"Pendlingskommun norra Skåne","Lokalt bostadsbolag",56.0833,12.9167],
  ["Bromölla","Skåne",0.5,2,"Liten industrikommun","Lokalt bostadsbolag",56.0667,14.4667],
  ["Burlöv","Skåne",2,5,"Pendlingskommun nära Malmö","Burlövsbostäder",55.7333,13.1000],
  ["Båstad","Skåne",0.5,2,"Turistkommun med tennistraditioner","Lokalt bostadsbolag",56.4167,12.8500],
  ["Eslöv","Skåne",1,3,"Mellanstor stad i Skåne","Eslövsbostäder",55.8333,13.3000],
  ["Helsingborg","Skåne",1,4,"Stor kuststad mot Danmark","Helsingborgshem",56.0465,12.6945],
  ["Hässleholm","Skåne",1,3,"Järnvägsknut i norra Skåne","Hässleholmshem",56.1583,13.7667],
  ["Höganäs","Skåne",1,3,"Krukmakeristad vid kusten","Höganäsbostäder",56.2000,12.5500],
  ["Hörby","Skåne",0.5,2,"Landsbygdskommun","Lokalt bostadsbolag",55.8500,13.6667],
  ["Höör","Skåne",0.5,2,"Liten pendlingskommun","Lokalt bostadsbolag",55.9333,13.5333],
  ["Klippan","Skåne",0.5,2,"Industri- och pendlingskommun","Lokalt bostadsbolag",56.1333,13.1333],
  ["Kristianstad","Skåne",1,4,"Residensstad i Skåne","Kristianstadsbyggen",56.0333,14.1500],
  ["Kävlinge","Skåne",2,5,"Pendlingskommun nära Malmö","Kävlinge Bostäder",55.7917,13.1083],
  ["Landskrona","Skåne",1,3,"Hamnstad, genomgångspunkt","Landskronahem",55.8706,12.8300],
  ["Lomma","Skåne",2,5,"Välbärgad pendlingskommun","Lomma Bostäder",55.6667,13.0667],
  ["Lund","Skåne",3,6,"Universitetsstad, hög efterfrågan","LKF",55.7047,13.1910],
  ["Malmö","Skåne",2,4,"Tredje storstad, Öresundsbron","Boplats Syd",55.6050,13.0038],
  ["Osby","Skåne",0.5,2,"Liten landsbygdskommun","Lokalt bostadsbolag",56.3667,13.9833],
  ["Perstorp","Skåne",0.5,1.5,"Liten industrikommun","Lokalt bostadsbolag",56.1333,13.3833],
  ["Simrishamn","Skåne",0.5,2,"Österlenkommun","Simrishamnsbostäder",55.5583,14.3583],
  ["Sjöbo","Skåne",0.5,2,"Landsbygdskommun","Lokalt bostadsbolag",55.6333,13.7000],
  ["Skurup","Skåne",0.5,2,"Pendlingskommun","Skurupsbostäder",55.4783,13.5000],
  ["Staffanstorp","Skåne",1,4,"Pendlingskommun nära Malmö","Staffanstorpshus",55.6417,13.2083],
  ["Svalöv","Skåne",0.5,2,"Lantlig nordväst Skåne","Lokalt bostadsbolag",55.9167,13.1000],
  ["Svedala","Skåne",1,3,"Pendlingskommun","Svedalabostäder",55.5083,13.2333],
  ["Tomelilla","Skåne",0.5,2,"Landsbygdskommun","Lokalt bostadsbolag",55.5417,13.9500],
  ["Trelleborg","Skåne",1,3,"Hamnstad mot Tyskland","Trelleborg Bostäder",55.3753,13.1575],
  ["Vellinge","Skåne",1,4,"Välbärgad pendlingskommun","Vellinge Bostäder",55.4667,13.0167],
  ["Ystad","Skåne",1,3,"Kuststad, Wallander-stad","Ystadbostäder",55.4292,13.8219],
  ["Åstorp","Skåne",0.5,2,"Pendlingskommun norra Skåne","Lokalt bostadsbolag",56.1333,12.9500],
  ["Ängelholm","Skåne",1,3,"Sommar- och pendlingsstad","Ängelholmshem",56.2433,12.8619],
  ["Örkelljunga","Skåne",0.5,1.5,"Liten industrikommun","Lokalt bostadsbolag",56.2833,13.2833],
  ["Östra Göinge","Skåne",0.5,1.5,"Landsbygdskommun","Lokalt bostadsbolag",56.2667,14.1167],
  ["Falkenberg","Halland",1,3,"Kuststad med sommarturism","Falkenbergsbostäder",56.9058,12.4917],
  ["Halmstad","Halland",2,5,"Residensstad, universitetsstad","Halmstads Fastighets AB",56.6744,12.8578],
  ["Hylte","Halland",0.5,2,"Industrikommun (SCA)","Lokalt bostadsbolag",56.9833,13.2333],
  ["Kungsbacka","Halland",3,8,"Välbärgad pendlingskommun mot Gbg","Kungsbacka Fastighets AB",57.4883,12.0764],
  ["Laholm","Halland",0.5,2,"Liten kust- och landsbygdsstad","Laholmshem",56.5167,13.0333],
  ["Varberg","Halland",2,5,"Populär kuststad","Varbergs Bostads AB",57.1058,12.2511],
  ["Ale","Västra Götaland",2,5,"Pendlingskommun norr om Gbg","Alebyggen",57.9333,12.0500],
  ["Alingsås","Västra Götaland",1,4,"Mellanstor stad öster om Gbg","Alingsåshem",57.9283,12.5331],
  ["Bengtsfors","Västra Götaland",0.5,1.5,"Liten gränskommun","Lokalt bostadsbolag",59.0333,12.2333],
  ["Bollebygd","Västra Götaland",1,3,"Pendlingskommun","Lokalt bostadsbolag",57.6667,12.5833],
  ["Borås","Västra Götaland",2,5,"Stor textilstad","Bostäder i Borås",57.7210,12.9400],
  ["Dals-Ed","Västra Götaland",0.5,1,"Liten gränskommun","Lokalt bostadsbolag",58.9167,11.9333],
  ["Essunga","Västra Götaland",0.5,1.5,"Liten landsbygdskommun","Lokalt bostadsbolag",58.1833,12.6333],
  ["Falköping","Västra Götaland",1,3,"Mellanstor stad vid Billingen","Falbygdens Bostäder",58.1742,13.5528],
  ["Färgelanda","Västra Götaland",0.5,1.5,"Liten landsbygdskommun","Lokalt bostadsbolag",58.5667,12.0000],
  ["Gothenburg – inner","Västra Götaland",5,10,"Innerstad: Haga, Linnéstan, Majorna","Boplats Göteborg",57.7089,11.9746],
  ["Gothenburg – suburbs","Västra Götaland",2,5,"Ytterstad: Angered, Frölunda m.fl.","Boplats Göteborg",57.6500,11.9000],
  ["Grästorp","Västra Götaland",0.5,1.5,"Liten landsbygdskommun","Lokalt bostadsbolag",58.3333,12.6667],
  ["Gullspång","Västra Götaland",0.5,1,"Liten kommun","Lokalt bostadsbolag",58.9833,14.0833],
  ["Götene","Västra Götaland",0.5,2,"Liten stad","Götenebostäder",58.5333,13.4833],
  ["Herrljunga","Västra Götaland",0.5,1.5,"Landsbygdskommun","Lokalt bostadsbolag",58.0833,13.0167],
  ["Hjo","Västra Götaland",0.5,2,"Trästadsidyll vid Vättern","Hjo Bostäder",58.3000,14.2833],
  ["Härryda","Västra Götaland",2,6,"Pendlingskommun nära Gbg och Arlanda","Härrydabostäder",57.6667,12.2167],
  ["Karlsborg","Västra Götaland",0.5,1.5,"Liten militärstad","Lokalt bostadsbolag",58.5333,14.5000],
  ["Kungälv","Västra Götaland",2,5,"Pendlingskommun norr om Gbg","Kungälvsbostäder",57.8717,11.9764],
  ["Lerum","Västra Götaland",2,5,"Populär pendlingskommun","Lerums Bostäder",57.7667,12.2667],
  ["Lidköping","Västra Götaland",1,3,"Stad vid Vänern","Lidköpingshem",58.5050,13.1572],
  ["Lilla Edet","Västra Götaland",0.5,2,"Pendlingskommun","Lokalt bostadsbolag",58.1333,12.1333],
  ["Lysekil","Västra Götaland",0.5,2,"Fiskeristad vid kusten","Lysekilsbostäder",58.2750,11.4350],
  ["Mariestad","Västra Götaland",0.5,2,"Vänerstadskommun","Mariestadshem",58.7083,13.8250],
  ["Mark","Västra Götaland",1,3,"Pendlingskommun söder om Gbg","Marks Bostads AB",57.5167,12.7000],
  ["Mellerud","Västra Götaland",0.5,1.5,"Dalslandskommun vid Vänern","Lokalt bostadsbolag",58.7000,12.4667],
  ["Munkedal","Västra Götaland",0.5,1.5,"Liten kustkommun","Lokalt bostadsbolag",58.4667,11.6833],
  ["Mölndal","Västra Götaland",3,8,"Tät pendlingskommun söder om Gbg","Mölndalsbostäder",57.6558,12.0136],
  ["Orust","Västra Götaland",0.5,2,"Skärgårdskommun","Lokalt bostadsbolag",58.1333,11.6667],
  ["Partille","Västra Götaland",2,6,"Tät pendlingskommun öster om Gbg","Partillebo",57.7333,12.1000],
  ["Skara","Västra Götaland",0.5,2,"Historisk biskopsstad","Skarabostäder",58.3867,13.4383],
  ["Skövde","Västra Götaland",1,3,"Militär- och industristad","Skövdebostäder",58.3911,13.8456],
  ["Sotenäs","Västra Götaland",0.5,2,"Kustkommun, räkor","Lokalt bostadsbolag",58.4333,11.5167],
  ["Stenungsund","Västra Götaland",1,3,"Petrokemikommun vid kusten","Stenungsundshem",58.0833,11.8167],
  ["Strömstad","Västra Götaland",0.5,2,"Gränsstad mot Norge","Strömstadsbostäder",58.9333,11.1667],
  ["Svenljunga","Västra Götaland",0.5,1.5,"Liten landsbygdskommun","Lokalt bostadsbolag",57.4833,13.1167],
  ["Tanum","Västra Götaland",0.5,2,"Bohuslänskommun, hällristningar","Tanumsbostäder",58.7167,11.3333],
  ["Tibro","Västra Götaland",0.5,1.5,"Möbelindustrikommun","Lokalt bostadsbolag",58.4167,14.1667],
  ["Tidaholm","Västra Götaland",0.5,1.5,"Liten stad","Tidaholmsbostäder",58.1833,13.9500],
  ["Tjörn","Västra Götaland",0.5,2,"Skärgårdskommun","Tjörns Bostads AB",58.0000,11.6500],
  ["Tranemo","Västra Götaland",0.5,1.5,"Landsbygdskommun","Lokalt bostadsbolag",57.4833,13.3500],
  ["Trollhättan","Västra Götaland",1,4,"Industri- och filmstaden","Trollhättans Stad Bostäder",58.2836,12.2886],
  ["Töreboda","Västra Götaland",0.5,1.5,"Liten landsbygdskommun","Lokalt bostadsbolag",58.7000,14.1167],
  ["Uddevalla","Västra Götaland",1,4,"Stad vid Byfjorden","Uddevallahem",58.3489,11.9383],
  ["Ulricehamn","Västra Götaland",0.5,2,"Mellanstor stad","Ulricehamnsbostäder",57.7933,13.4183],
  ["Vara","Västra Götaland",0.5,1.5,"Jordbrukskommun","Lokalt bostadsbolag",58.2667,12.9500],
  ["Vårgårda","Västra Götaland",0.5,2,"Pendlingskommun","Lokalt bostadsbolag",58.0333,12.8000],
  ["Vänersburg","Västra Götaland",1,3,"Stad vid Vänersborgsviken","Vänersborgsbostäder",58.3800,12.3231],
  ["Åmål","Västra Götaland",0.5,2,"Stad vid Vänerstranden","Åmålsbostäder",59.0500,12.7000],
  ["Öckerö","Västra Götaland",1,4,"Skärgårdskommun, färja till Gbg","Öckerö Bostäder",57.7167,11.6500],
  ["Arvika","Värmland",0.5,2,"Stor landsbygdsstad","Arvikabostäder",59.6556,12.5897],
  ["Eda","Värmland",0.5,1.5,"Gränskommun mot Norge","Lokalt bostadsbolag",59.8667,12.2000],
  ["Filipstad","Värmland",0.5,1.5,"Liten bergslagsstad","Filipstadsbostäder",59.7133,14.1667],
  ["Forshaga","Värmland",0.5,2,"Pendlingskommun nära Karlstad","Lokalt bostadsbolag",59.5333,13.4833],
  ["Grums","Värmland",0.5,1.5,"Industrikommun","Lokalt bostadsbolag",59.3500,13.1000],
  ["Hagfors","Värmland",0.5,1.5,"Bergslagskommun","Hagforsbostäder",60.0333,13.6500],
  ["Hammarö","Värmland",1,3,"Pendlingskommun nära Karlstad","Hammarö Bostads AB",59.3167,13.5167],
  ["Karlstad","Värmland",2,5,"Residensstad, universitetsstad","Karlstads Bostads AB",59.3793,13.5036],
  ["Kil","Värmland",0.5,2,"Pendlingskommun","Kilsbostäder",59.5000,13.3167],
  ["Kristinehamn","Värmland",0.5,2,"Stad vid Vänern","Kristinehamns Bostads AB",59.3100,14.1056],
  ["Munkfors","Värmland",0.5,1,"Liten industrikommun","Lokalt bostadsbolag",59.8333,13.5333],
  ["Storfors","Värmland",0.5,1,"Liten industrikommun","Lokalt bostadsbolag",59.5333,14.2667],
  ["Sunne","Värmland",0.5,2,"Selma Lagerlöf-land","Sunnebostäder",59.8333,13.1333],
  ["Säffle","Värmland",0.5,2,"Stad vid Byälven","Säfflebostäder",59.1333,12.9167],
  ["Torsby","Värmland",0.5,1.5,"Värmländsk turistkommun","Torsbybostäder",60.1333,13.0000],
  ["Årjäng","Värmland",0.5,1.5,"Gränskommun","Lokalt bostadsbolag",59.3833,12.1333],
  ["Degerfors","Örebro",0.5,1.5,"Industrikommun","Lokalt bostadsbolag",59.2333,14.4333],
  ["Hallsberg","Örebro",0.5,2,"Järnvägsknut","Hallsbergs Bostäder",59.0667,15.1000],
  ["Hällefors","Örebro",0.5,1,"Liten bergslagskommun","Lokalt bostadsbolag",59.7833,14.5167],
  ["Karlskoga","Örebro",0.5,2,"Industristad (Nobel/Bofors)","Karlskogahem",59.3267,14.5244],
  ["Kumla","Örebro",1,3,"Pendlingskommun nära Örebro","Kumla Bostäder",59.1167,15.1333],
  ["Laxå","Örebro",0.5,1.5,"Liten landsbygdskommun","Lokalt bostadsbolag",58.9833,14.6167],
  ["Lekeberg","Örebro",0.5,2,"Pendlingskommun","Lokalt bostadsbolag",59.1000,14.9333],
  ["Lindesberg","Örebro",0.5,2,"Mellanstor bergslagsstad","Lindesbergs Bostäder",59.5833,15.2333],
  ["Ljusnarsberg","Örebro",0.5,1,"Liten bergslagskommun","Lokalt bostadsbolag",59.9167,14.9333],
  ["Nora","Örebro",0.5,2,"Historisk bergslagsstad","Nora Bostäder",59.5167,15.0333],
  ["Örebro","Örebro",1,3,"Stor universitetsstad, förbättrad marknad","ÖrebroBostäder",59.2741,15.2066],
  ["Arboga","Västmanland",0.5,2,"Mellanstor stad","Arbogabostäder",59.3933,15.8417],
  ["Fagersta","Västmanland",0.5,2,"Industristad","Fagersta Storfors Fastigheter",60.0000,15.7833],
  ["Hallstahammar","Västmanland",0.5,2,"Industrikommun","Hallstahammarbostäder",59.6167,16.2167],
  ["Kungsör","Västmanland",0.5,1.5,"Pendlingskommun vid Mälaren","Kungsörsbostäder",59.4167,16.1000],
  ["Köping","Västmanland",0.5,2,"Industristad vid Mälaren","Köpings Bostads AB",59.5133,15.9883],
  ["Norberg","Västmanland",0.5,1.5,"Liten bergslagskommun","Lokalt bostadsbolag",60.0667,15.9167],
  ["Sala","Västmanland",0.5,2,"Mellanstor bergslagsstad","Salabostäder",59.9167,16.6000],
  ["Skinnskatteberg","Västmanland",0.5,1,"Liten bergslagskommun","Lokalt bostadsbolag",59.8333,15.7000],
  ["Surahammar","Västmanland",0.5,1.5,"Industrikommun","Surahammars Bostäder",59.7167,16.2167],
  ["Västerås","Västmanland",1,3,"Stor industristad, förbättrad marknad","Mimer",59.6099,16.5448],
  ["Avesta","Dalarna",0.5,2,"Bergslagsstad","Avestabostäder",60.1433,16.1683],
  ["Borlänge","Dalarna",1,3,"Stor industristad","Tunabyggen",60.4858,15.4369],
  ["Falun","Dalarna",1,3,"Residensstad, Kopparberget","Faluhem",60.6065,15.6355],
  ["Gagnef","Dalarna",0.5,2,"Dalälvens dalgångskommun","Lokalt bostadsbolag",60.5833,15.0833],
  ["Hedemora","Dalarna",0.5,2,"Liten bergslagsstad","Hedemora Bostäder",60.2833,15.9833],
  ["Leksand","Dalarna",0.5,2,"Turistkommun i Siljansbygden","Leksandsbostäder",60.7333,14.9833],
  ["Ludvika","Dalarna",0.5,2,"Industristad (ABB)","Lufast",60.1483,15.1856],
  ["Malung-Sälen","Dalarna",0.5,2,"Fjällskidort","Lokalt bostadsbolag",60.6833,13.7167],
  ["Mora","Dalarna",0.5,2,"Turiststad, Vasaloppet","Moraparken Bostäder",61.0000,14.5500],
  ["Orsa","Dalarna",0.5,1.5,"Liten landsbygdskommun","Lokalt bostadsbolag",61.1167,14.6167],
  ["Rättvik","Dalarna",0.5,2,"Turistkommun vid Siljan","Rättviksbostäder",60.8833,15.1167],
  ["Smedjebacken","Dalarna",0.5,1.5,"Industrikommun","Lokalt bostadsbolag",60.1333,15.4167],
  ["Säter","Dalarna",0.5,1.5,"Liten stad","Säterbostäder",60.3500,15.7500],
  ["Vansbro","Dalarna",0.5,1.5,"Liten landsbygdskommun","Lokalt bostadsbolag",60.4667,14.2167],
  ["Älvdalen","Dalarna",0.5,1.5,"Glesbygdskommun","Lokalt bostadsbolag",61.2333,14.0333],
  ["Bollnäs","Gävleborg",0.5,2,"Mellanstor stad","Bollnäshem",61.3483,16.3933],
  ["Gävle","Gävleborg",1,3,"Residensstad, hamnstad","Gavlegårdarna",60.6749,17.1413],
  ["Hofors","Gävleborg",0.5,1.5,"Industrikommun","Lokalt bostadsbolag",60.5500,16.2833],
  ["Hudiksvall","Gävleborg",0.5,2,"Kuststad","Hudiksvallsbostäder",61.7283,17.1067],
  ["Ljusdal","Gävleborg",0.5,2,"Stor skogskommun","Ljusdals Bostads AB",61.8267,16.0817],
  ["Nordanstig","Gävleborg",0.5,1.5,"Kustkommun","Lokalt bostadsbolag",62.0000,17.3333],
  ["Ockelbo","Gävleborg",0.5,1.5,"Liten skogskommun","Lokalt bostadsbolag",60.8833,16.7167],
  ["Ovanåker","Gävleborg",0.5,1.5,"Hälsingekommun","Lokalt bostadsbolag",61.3500,15.9833],
  ["Sandviken","Gävleborg",0.5,2,"Industristad (SSAB)","Sandvikenhus",60.6167,16.7667],
  ["Söderhamn","Gävleborg",0.5,2,"Kuststad i Gävleborg","Söderhamnshem",61.3000,17.0667],
  ["Härnösand","Västernorrland",0.5,2,"Residensstad","Härnösandsbostäder",62.6317,17.9383],
  ["Kramfors","Västernorrland",0.5,1.5,"Kustkommun","Lokalt bostadsbolag",62.9333,17.7833],
  ["Sollefteå","Västernorrland",0.5,1.5,"Landsbygdskommun","Sollefteåbostäder",63.1667,17.2667],
  ["Sundsvall","Västernorrland",1,3,"Stor hamnstad","Mitthem",62.3908,17.3069],
  ["Timrå","Västernorrland",0.5,2,"Pendlingskommun nära Sundsvall","Timrå Bostäder",62.4833,17.3333],
  ["Ånge","Västernorrland",0.5,1.5,"Liten inlandskommun","Lokalt bostadsbolag",62.5167,15.6667],
  ["Örnsköldsvik","Västernorrland",0.5,2,"Industristad (SCA)","Övikshem",63.2908,18.7153],
  ["Berg","Jämtland",0.5,1.5,"Fjällkommun","Lokalt bostadsbolag",63.0000,14.0000],
  ["Bräcke","Jämtland",0.5,1,"Liten glesbygdskommun","Lokalt bostadsbolag",62.7500,15.4333],
  ["Härjedalen","Jämtland",0.5,1.5,"Fjällkommun (Funäsdalen, Vemdalen)","Lokalt bostadsbolag",62.3333,13.6667],
  ["Krokom","Jämtland",0.5,2,"Pendlingskommun nära Östersund","Krokombostäder",63.3333,14.4667],
  ["Ragunda","Jämtland",0.5,1,"Liten landsbygdskommun","Lokalt bostadsbolag",63.1167,16.3833],
  ["Strömsund","Jämtland",0.5,1.5,"Stor men gles inlandskommun","Strömdalsbostäder",63.8500,15.5500],
  ["Åre","Jämtland",0.5,3,"Alpin skidindustri, hög säsongsvariaton","Årebostäder",63.3983,13.0817],
  ["Östersund","Jämtland",1,3,"Residensstad, universitetsstad","Östersundshem",63.1792,14.6357],
  ["Bjurholm","Västerbotten",0.5,1,"Liten landsbygdskommun","Lokalt bostadsbolag",63.9333,19.2167],
  ["Dorotea","Västerbotten",0.5,1,"Liten glesbygdskommun","Lokalt bostadsbolag",64.2667,16.4000],
  ["Lycksele","Västerbotten",0.5,2,"Lapplandsstaden","Lyckselebostäder",64.5983,18.6717],
  ["Malå","Västerbotten",0.5,1,"Liten glesbygdskommun","Lokalt bostadsbolag",65.1833,18.7500],
  ["Nordmaling","Västerbotten",0.5,1.5,"Pendlingskommun","Lokalt bostadsbolag",63.5667,19.5000],
  ["Norsjö","Västerbotten",0.5,1,"Liten skogskommun","Lokalt bostadsbolag",64.9167,19.4833],
  ["Robertsfors","Västerbotten",0.5,1.5,"Kustkommun","Lokalt bostadsbolag",64.2000,20.8500],
  ["Skellefteå","Västerbotten",1,3,"Gruvstad, batterifabrik (Northvolt)","Skebo",64.7500,20.9500],
  ["Sorsele","Västerbotten",0.5,1,"Liten glesbygdskommun","Lokalt bostadsbolag",65.5333,17.5333],
  ["Storuman","Västerbotten",0.5,1.5,"Lapplandsinland","Lokalt bostadsbolag",65.1000,17.1167],
  ["Umeå","Västerbotten",1,4,"Stor universitetsstad i norr","Bostaden",63.8258,20.2630],
  ["Vilhelmina","Västerbotten",0.5,1.5,"Lapplandsstaden","Lokalt bostadsbolag",64.6333,16.6667],
  ["Vindeln","Västerbotten",0.5,1.5,"Liten skogskommun","Lokalt bostadsbolag",64.2000,19.7167],
  ["Vännäs","Västerbotten",0.5,2,"Pendlingskommun nära Umeå","Lokalt bostadsbolag",63.9167,19.7667],
  ["Åsele","Västerbotten",0.5,1,"Liten glesbygdskommun","Lokalt bostadsbolag",64.1667,17.3500],
  ["Arjeplog","Norrbotten",0.5,1.5,"Silverstaden, testkörsning av bilar","Lokalt bostadsbolag",66.0500,17.8833],
  ["Arvidsjaur","Norrbotten",0.5,2,"Sameby och militärkommun","Lokalt bostadsbolag",65.5917,19.1750],
  ["Boden","Norrbotten",0.5,2,"Militärstad","Bodenbostäder",65.8258,21.6881],
  ["Gällivare","Norrbotten",0.5,3,"Gruvstad (LKAB)","Gällivarebostäder",67.1333,20.6500],
  ["Haparanda","Norrbotten",0.5,2,"Gränsstad mot Finland","Haparandabostäder",65.8333,24.1333],
  ["Jokkmokk","Norrbotten",0.5,1.5,"Sameby, kulturkommun","Lokalt bostadsbolag",66.6000,19.8333],
  ["Kalix","Norrbotten",0.5,2,"Kustkommun","Kalixbostäder",65.8533,23.1500],
  ["Kiruna","Norrbotten",0.5,3,"Gruvstad under flytt (LKAB)","Kirunabostäder",67.8558,20.2253],
  ["Luleå","Norrbotten",1,4,"Residensstad, stålverk, SSAB","LuleBo",65.5848,22.1547],
  ["Pajala","Norrbotten",0.5,1.5,"Tornedalskommun","Lokalt bostadsbolag",67.2167,23.3667],
  ["Piteå","Norrbotten",0.5,2,"Stad vid Bottenviken","Piteåbostäder",65.3167,21.5000],
  ["Älvsbyn","Norrbotten",0.5,1.5,"Liten landsbygdskommun","Lokalt bostadsbolag",65.6833,21.0000],
  ["Överkalix","Norrbotten",0.5,1,"Liten glesbygdskommun","Lokalt bostadsbolag",66.3333,22.8333],
  ["Övertorneå","Norrbotten",0.5,1,"Tornedalskommun","Lokalt bostadsbolag",66.3833,23.6500]
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function _getStatus(avg) {
  if (avg <= 1.5) return "Very short";
  if (avg <= 3)   return "Short";
  if (avg <= 6)   return "Moderate";
  if (avg <= 10)  return "Long";
  return "Very long";
}

function _toObject(m) {
  const waitAvg = Math.round((m[2] + (m[3] - m[2]) * 0.25) * 10) / 10;
  return {
    name:        m[0],
    region:      m[1],
    waitMin:     m[2],
    waitMax:     m[3],
    waitAvg,
    status:      _getStatus(waitAvg),
    description: m[4],
    agency:      m[5],
    lat:         m[6],
    lng:         m[7]
  };
}

function _distance(lat1, lng1, lat2, lng2) {
  // Haversine formula (returns km)
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) ** 2 +
            Math.cos(lat1 * Math.PI / 180) *
            Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Look up queue info by municipality name.
 * Case-insensitive. Supports partial matches.
 * Returns the best match, or null if nothing found.
 *
 * @param {string} name  e.g. "Uppsala", "göteborg", "sthlm inner"
 * @returns {object|null}
 */
export function getQueueInfo(name) {
  const q = name.toLowerCase().trim();
  // Exact match first
  let m = MUNICIPALITIES.find(x => x[0].toLowerCase() === q);
  // Then partial match
  if (!m) m = MUNICIPALITIES.find(x => x[0].toLowerCase().includes(q));
  return m ? _toObject(m) : null;
}

/**
 * Find the closest municipality to a lat/lng coordinate.
 * Useful when your GeoGuesser gives you a map click.
 *
 * @param {number} lat
 * @param {number} lng
 * @param {number} [maxDistanceKm=80]  Return null if closest is further than this
 * @returns {object|null}
 */
export function getQueueByCoords(lat, lng, maxDistanceKm = 80) {
  let best = null;
  let bestDist = Infinity;
  for (const m of MUNICIPALITIES) {
    const d = _distance(lat, lng, m[6], m[7]);
    if (d < bestDist) { bestDist = d; best = m; }
  }
  if (!best || bestDist > maxDistanceKm) return null;
  return { ..._toObject(best), distanceKm: Math.round(bestDist) };
}

/**
 * Get all municipalities, with optional filtering and sorting.
 *
 * @param {object} options
 * @param {string}  [options.region]    Filter by region/län name
 * @param {string}  [options.status]    Filter by status: "Very short"|"Short"|"Moderate"|"Long"|"Very long"
 * @param {string}  [options.sortBy]    "name" | "wait_asc" | "wait_desc"
 * @returns {object[]}
 */
export function getAllMunicipalities({ region, status, sortBy = "name" } = {}) {
  let results = MUNICIPALITIES.map(_toObject);
  if (region) results = results.filter(m => m.region.toLowerCase() === region.toLowerCase());
  if (status) results = results.filter(m => m.status === status);
  if (sortBy === "name")       results.sort((a, b) => a.name.localeCompare(b.name, "sv"));
  if (sortBy === "wait_asc")   results.sort((a, b) => a.waitAvg - b.waitAvg);
  if (sortBy === "wait_desc")  results.sort((a, b) => b.waitAvg - a.waitAvg);
  return results;
}

/**
 * Get all unique region names.
 * @returns {string[]}
 */
export function getRegions() {
  return [...new Set(MUNICIPALITIES.map(m => m[1]))].sort((a, b) => a.localeCompare(b, "sv"));
}
