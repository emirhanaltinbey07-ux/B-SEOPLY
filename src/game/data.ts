import {
  BoardTile,
  ChanceCard,
  CharacterOption,
  OptionLetter,
  PawnColorOption,
  PropertyAsset,
  QuestionCard,
} from './types';

export const TOTAL_GAME_SECONDS = 15 * 60; // 15 dakika
export const FINAL_PHASE_THRESHOLD_SECONDS = 5 * 60; // Son 5 dakika
export const INITIAL_TEAM_BP = 100; // Her takım tam 100 BP ile başlar
export const START_PASS_BONUS_BP = 50; // Başlangıca her dönüşte +50 BP
export const REWARD_TILE_BP = 10; // Ödül karesinde +10 BP
export const JAIL_BAIL_BP = 50; // Hapisten hemen çıkma bedeli: 50 BP
export const QUESTION_TIME_LIMIT_SECONDS = 20; // Her soru için 20 saniye süre
export const CORRECT_ANSWER_BP = 50; // Her doğru soru +50 BP
export const WRONG_ANSWER_BP = -25;
export const BANK_LOAN_PRINCIPAL = 50;
export const BANK_LOAN_REPAYMENT = 60;
export const BANK_BUYBACK_RATIO = 0.7; // Bankaya satışta %70
export const MAX_PEER_LOAN_RATIO = 1.2; // En fazla %120 geri ödeme
export const QUESTIONS_PER_TEAM = 7; // 20 soruluk havuz 3 takım arasında oynanır (takım başı maks. 7)

export const PAWN_COLORS: PawnColorOption[] = [
  { id: 'mavi', name: 'Boğaz Mavisi', hex: '#1464d6', darkHex: '#0d4599' },
  { id: 'turuncu', name: 'Gün Batımı Turuncusu', hex: '#ea6010', darkHex: '#a84208' },
  { id: 'yesil', name: 'Çamlıca Yeşili', hex: '#108e52', darkHex: '#0a6137' },
  { id: 'pembe', name: 'Erguvan Pembesi', hex: '#d62d81', darkHex: '#941c58' },
  { id: 'kirmizi', name: 'Lale Kırmızısı', hex: '#d42424', darkHex: '#8e1515' },
  { id: 'altin', name: 'Haliç Altını', hex: '#cc820a', darkHex: '#8a5604' },
];

export const CHARACTER_OPTIONS: CharacterOption[] = [
  {
    id: 'etken',
    name: 'Etken',
    role: 'Turuncu saçlı, beyaz tenli kız öğrenci',
    accentHex: '#f07427',
  },
  {
    id: 'edilgen',
    name: 'Edilgen',
    role: 'Siyah kısa saçlı erkek öğrenci',
    accentHex: '#1d6fd1',
  },
  {
    id: 'donuslu',
    name: 'Dönüşlü',
    role: 'Siyah uzun saçlı kız öğrenci',
    accentHex: '#1e9363',
  },
];

export const DEFAULT_TEAMS_SETUP = [
  { name: 'Boğaz Kartalları', colorId: 'turuncu', characterId: 'etken' as const },
  { name: 'Galata Kâşifleri', colorId: 'mavi', characterId: 'edilgen' as const },
  { name: 'Haliç Yıldızları', colorId: 'yesil', characterId: 'donuslu' as const },
];

/**
 * 24-Tile Monopoly Perimeter Track (Square 7x7 perimeter = 24 tiles):
 * - 1 Başlangıç (index 0)
 * - 11 İstanbul Lokasyonu (Üsküdar, Kız Kulesi, 15 Temmuz Şehitler Köprüsü, Ortaköy,
 *   Beşiktaş, Taksim, Galata Kulesi, Karaköy, Galata Köprüsü, Sultanahmet, Balat)
 * - 5 Soru Kartı Alanı
 * - 4 Ödül Alanı (+10 BP)
 * - 3 Hapis / Bekleme Alanı (1 tur bekle)
 *
 * Tile spacing = 3.2 units -> Square extends from -9.6 to +9.6 on X and Z!
 */
const S = 3.2;
function sidePos(side: 'south' | 'east' | 'north' | 'west', step: number): [number, number] {
  if (side === 'south') return [-9.6 + step * S, 9.6]; // step 0..6
  if (side === 'east') return [9.6, 9.6 - step * S]; // step 1..6
  if (side === 'north') return [9.6 - step * S, -9.6]; // step 1..6
  return [-9.6, -9.6 + step * S]; // step 1..5
}

export const BOARD_TILES: BoardTile[] = [
  // SOUTH SIDE (0..6)
  {
    index: 0,
    type: 'start',
    id: 'baslangic',
    name: 'BAŞLANGIÇ',
    shortLabel: 'BAŞLANGIÇ',
    districtTag: 'Her Dönüş +50 BP',
    accentColor: '#e23b26',
    architectureNote: 'İstanbul şehir turunun başlangıç meydanı ve görkemli tak kapısı.',
    historicalFact: 'İlk çıkışta puan verilmez; parkuru tamamlayıp her dönüşte +50 BP kazanılır.',
    boardPos: sidePos('south', 0),
    landmarkPos: [-13.4, 13.4],
    landmarkRotY: Math.PI * 0.25,
    cameraFocusOffset: [-16.5, 13.5, 19.5],
  },
  {
    index: 1,
    type: 'location',
    id: 'uskudar',
    name: 'Üsküdar',
    shortLabel: 'Üsküdar',
    districtTag: 'Anadolu Kıyısı',
    accentColor: '#1d6fd1',
    architectureNote: 'Tarihî vapur iskelesi, sahil camii ve ahşap çay bahçesiyle Anadolu yakasının kalbi.',
    historicalFact: 'Osmanlı döneminde kervanların ve deniz yolcularının ilk buluşma noktasıydı.',
    boardPos: sidePos('south', 1),
    landmarkPos: [-6.4, 14.2],
    landmarkRotY: 0,
    cameraFocusOffset: [-8.5, 12.5, 22.0],
  },
  {
    index: 2,
    type: 'question',
    id: 'soru-alani-1',
    name: 'SORU KARTI',
    shortLabel: 'SORU KARTI',
    districtTag: 'Türkçe Görevi',
    accentColor: '#f27b1a',
    boardPos: sidePos('south', 2),
    cameraFocusOffset: [-4.0, 14.0, 22.0],
  },
  {
    index: 3,
    type: 'location',
    id: 'kiz-kulesi',
    name: 'Kız Kulesi',
    shortLabel: 'Kız Kulesi',
    districtTag: 'Boğaz Adacığı',
    accentColor: '#0d8a8a',
    architectureNote: 'Salacak açıklarındaki kayalık adacıkta yükselen sekizgen kaideli tarihî deniz feneri.',
    historicalFact: 'Antik çağdan günümüze gümrük istasyonu, fener ve gözetleme kulesi olarak kullanıldı.',
    boardPos: sidePos('south', 3),
    landmarkPos: [0.0, 14.5],
    landmarkRotY: 0,
    cameraFocusOffset: [0.0, 12.5, 23.0],
  },
  {
    index: 4,
    type: 'reward',
    id: 'odul-1',
    name: 'ÖDÜL',
    shortLabel: 'ÖDÜL +10 BP',
    districtTag: 'Hediye Karesi',
    accentColor: '#e6a817',
    boardPos: sidePos('south', 4),
    cameraFocusOffset: [4.0, 14.0, 22.0],
  },
  {
    index: 5,
    type: 'location',
    id: 'kopru',
    name: '15 Temmuz Şehitler Köprüsü',
    shortLabel: '15 Temmuz Köprüsü',
    districtTag: 'Kıtalar Arası',
    accentColor: '#d9483b',
    architectureNote: 'İki kıtayı çelik H-kuleler ve asma halatlarla birleştiren Boğaz köprüsü.',
    historicalFact: '1973’te açıldığında Avrupa ile Asya’yı karayoluyla birleştiren ilk köprü oldu.',
    boardPos: sidePos('south', 5),
    landmarkPos: [6.8, 14.4],
    landmarkRotY: 0,
    cameraFocusOffset: [9.0, 13.5, 23.0],
  },
  {
    index: 6,
    type: 'jail',
    id: 'hapis-1',
    name: 'HAPİS / BEKLE',
    shortLabel: 'HAPİS · 1 TUR',
    districtTag: 'Bekleme Alanı',
    accentColor: '#52606d',
    architectureNote: 'İstanbul Boğazı dinlenme ve bekleme iskelesi — burada 1 hareket turu beklenir.',
    boardPos: sidePos('south', 6),
    cameraFocusOffset: [16.5, 13.5, 19.5],
  },

  // EAST SIDE (7..11)
  {
    index: 7,
    type: 'location',
    id: 'ortakoy',
    name: 'Ortaköy',
    shortLabel: 'Ortaköy',
    districtTag: 'Sahil Meydanı',
    accentColor: '#d9881c',
    architectureNote: 'Neo-Barok Büyük Mecidiye Camii, ikiz minareleri ve kıyı meydanıyla ünlü.',
    historicalFact: '1854’te inşa edilen cami, Boğaz ışığını içeri alan kemerli pencereleriyle tanınır.',
    boardPos: sidePos('east', 1),
    landmarkPos: [14.4, 6.4],
    landmarkRotY: -Math.PI * 0.5,
    cameraFocusOffset: [22.0, 12.5, 9.5],
  },
  {
    index: 8,
    type: 'question',
    id: 'soru-alani-2',
    name: 'SORU KARTI',
    shortLabel: 'SORU KARTI',
    districtTag: 'Türkçe Görevi',
    accentColor: '#f27b1a',
    boardPos: sidePos('east', 2),
    cameraFocusOffset: [22.0, 14.0, 5.0],
  },
  {
    index: 9,
    type: 'location',
    id: 'besiktas',
    name: 'Beşiktaş',
    shortLabel: 'Beşiktaş',
    districtTag: 'Denizciler Meydanı',
    accentColor: '#2c5282',
    architectureNote: 'Dolmabahçe Saat Kulesi, Kartal Anıtı ve hareketli vapur iskelesiyle canlı kıyı semti.',
    historicalFact: 'Barbaros Hayreddin Paşa’nın donanmasını demirlediği tarihî kıyı alanı buradadır.',
    boardPos: sidePos('east', 3),
    landmarkPos: [14.5, 0.0],
    landmarkRotY: -Math.PI * 0.5,
    cameraFocusOffset: [22.5, 12.5, 2.0],
  },
  {
    index: 10,
    type: 'reward',
    id: 'odul-2',
    name: 'ÖDÜL',
    shortLabel: 'ÖDÜL +10 BP',
    districtTag: 'Hediye Karesi',
    accentColor: '#e6a817',
    boardPos: sidePos('east', 4),
    cameraFocusOffset: [22.0, 14.0, -4.0],
  },
  {
    index: 11,
    type: 'location',
    id: 'taksim',
    name: 'Taksim',
    shortLabel: 'Taksim',
    districtTag: 'İstiklal Caddesi',
    accentColor: '#c42d3a',
    architectureNote: 'Cumhuriyet Anıtı, nostaljik kırmızı İstiklal tramvayı ve tarihî Beyoğlu dokusu.',
    historicalFact: 'Adını Osmanlı döneminde çevre semtlere su dağıtılan (taksim edilen) maksemden alır.',
    boardPos: sidePos('east', 5),
    landmarkPos: [14.5, -6.4],
    landmarkRotY: -Math.PI * 0.5,
    cameraFocusOffset: [22.5, 13.0, -9.5],
  },

  // NORTH SIDE (12..18)
  {
    index: 12,
    type: 'jail',
    id: 'hapis-2',
    name: 'HAPİS / BEKLE',
    shortLabel: 'HAPİS · 1 TUR',
    districtTag: 'Bekleme Alanı',
    accentColor: '#52606d',
    boardPos: sidePos('east', 6),
    cameraFocusOffset: [16.5, 13.5, -18.5],
  },
  {
    index: 13,
    type: 'location',
    id: 'galata-kulesi',
    name: 'Galata Kulesi',
    shortLabel: 'Galata Kulesi',
    districtTag: 'Beyoğlu Tepesi',
    accentColor: '#9b4d3a',
    architectureNote: 'Silindirik taş gövdesi, kemerli seyir balkonu ve konik külahıyla İstanbul’un simgesi.',
    historicalFact: '1348 yılında inşa edilen kule, yüzyıllar boyunca gözlem kulesi olarak hizmet verdi.',
    boardPos: sidePos('north', 1),
    landmarkPos: [6.4, -14.4],
    landmarkRotY: Math.PI,
    cameraFocusOffset: [9.5, 14.5, -22.5],
  },
  {
    index: 14,
    type: 'question',
    id: 'soru-alani-3',
    name: 'SORU KARTI',
    shortLabel: 'SORU KARTI',
    districtTag: 'Türkçe Görevi',
    accentColor: '#f27b1a',
    boardPos: sidePos('north', 2),
    cameraFocusOffset: [4.0, 14.0, -22.0],
  },
  {
    index: 15,
    type: 'location',
    id: 'karakoy',
    name: 'Karaköy',
    shortLabel: 'Karaköy',
    districtTag: 'Tarihî Liman',
    accentColor: '#b76e22',
    architectureNote: 'Neoklasik taş hanları, kemerli pasajları ve tarihî liman caddesiyle ticaret merkezi.',
    historicalFact: 'Dünyanın en eski ikinci yeraltı raylı sistemi olan Tünel Karaköy’den başlar.',
    boardPos: sidePos('north', 3),
    landmarkPos: [0.0, -14.4],
    landmarkRotY: Math.PI,
    cameraFocusOffset: [0.0, 12.5, -22.5],
  },
  {
    index: 16,
    type: 'reward',
    id: 'odul-3',
    name: 'ÖDÜL',
    shortLabel: 'ÖDÜL +10 BP',
    districtTag: 'Hediye Karesi',
    accentColor: '#e6a817',
    boardPos: sidePos('north', 4),
    cameraFocusOffset: [-4.0, 14.0, -22.0],
  },
  {
    index: 17,
    type: 'location',
    id: 'galata-koprusu',
    name: 'Galata Köprüsü',
    shortLabel: 'Galata Köprüsü',
    districtTag: 'Haliç Geçidi',
    accentColor: '#1f7a8c',
    architectureNote: 'Çift katlı çelik kirişleri, yürüyüş kemerleri ve ışıklı lambalarıyla Haliç’in kalbi.',
    historicalFact: 'Tarihî Yarımada ile Beyoğlu’nu birbirine bağlayan köprü gün boyu vapurlara geçit verir.',
    boardPos: sidePos('north', 5),
    landmarkPos: [-6.4, -14.4],
    landmarkRotY: Math.PI,
    cameraFocusOffset: [-9.0, 12.5, -22.5],
  },
  {
    index: 18,
    type: 'jail',
    id: 'hapis-3',
    name: 'HAPİS / BEKLE',
    shortLabel: 'HAPİS · 1 TUR',
    districtTag: 'Bekleme Alanı',
    accentColor: '#52606d',
    boardPos: sidePos('north', 6),
    cameraFocusOffset: [-16.5, 13.5, -18.5],
  },

  // WEST SIDE (19..23)
  {
    index: 19,
    type: 'location',
    id: 'sultanahmet',
    name: 'Sultanahmet',
    shortLabel: 'Sultanahmet',
    districtTag: 'Tarihî Yarımada',
    accentColor: '#1a5f8a',
    architectureNote: 'Kademeli kubbeleri ve altı zarif minaresiyle Tarihî Yarımada siluetinin tacı.',
    historicalFact: 'İç mekânını süsleyen yirmi binden fazla İznik çinisi nedeniyle Mavi Cami olarak anılır.',
    boardPos: sidePos('west', 1),
    landmarkPos: [-14.5, -6.4],
    landmarkRotY: Math.PI * 0.5,
    cameraFocusOffset: [-22.5, 14.0, -9.0],
  },
  {
    index: 20,
    type: 'question',
    id: 'soru-alani-4',
    name: 'SORU KARTI',
    shortLabel: 'SORU KARTI',
    districtTag: 'Türkçe Görevi',
    accentColor: '#f27b1a',
    boardPos: sidePos('west', 2),
    cameraFocusOffset: [-22.0, 14.0, -3.5],
  },
  {
    index: 21,
    type: 'location',
    id: 'balat',
    name: 'Balat',
    shortLabel: 'Balat',
    districtTag: 'Renkli Cumbalar',
    accentColor: '#d45d36',
    architectureNote: 'Kademeli yokuşlara dizilmiş sarı, kırmızı, mavi ve yeşil renkli cumbalı tarihî evler.',
    historicalFact: 'Haliç kıyısındaki dar Arnavut kaldırımlı sokakları ve özgün mimarisiyle ünlüdür.',
    boardPos: sidePos('west', 3),
    landmarkPos: [-14.5, 0.0],
    landmarkRotY: Math.PI * 0.5,
    cameraFocusOffset: [-22.5, 12.5, 1.5],
  },
  {
    index: 22,
    type: 'reward',
    id: 'odul-4',
    name: 'ÖDÜL',
    shortLabel: 'ÖDÜL +10 BP',
    districtTag: 'Hediye Karesi',
    accentColor: '#e6a817',
    boardPos: sidePos('west', 4),
    cameraFocusOffset: [-22.0, 14.0, 5.0],
  },
  {
    index: 23,
    type: 'question',
    id: 'soru-alani-5',
    name: 'SORU KARTI',
    shortLabel: 'SORU KARTI',
    districtTag: 'Türkçe Görevi',
    accentColor: '#f27b1a',
    boardPos: sidePos('west', 5),
    cameraFocusOffset: [-22.0, 14.0, 9.5],
  },
];

/**
 * OFFICIAL TEACHER ANSWER KEY (1..20)
 * NEVER revealed to students before answering!
 */
export const OFFICIAL_ANSWER_KEY: Record<number, OptionLetter> = {
  1: 'D',
  2: 'A',
  3: 'C',
  4: 'C',
  5: 'D',
  6: 'D',
  7: 'A',
  8: 'D',
  9: 'B',
  10: 'A',
  11: 'A',
  12: 'D',
  13: 'C',
  14: 'B',
  15: 'A',
  16: 'D',
  17: 'C',
  18: 'A',
  19: 'B',
  20: 'C',
};

/**
 * THE EXACT, UNALTERED 20 TURKISH QUESTIONS PROVIDED BY THE USER.
 * ZERO extra questions, ZERO edited stems or options!
 */
export const QUESTION_CARDS: QuestionCard[] = [
  {
    number: 1,
    id: 'soru-1',
    topicTag: 'Özne & Nesne Çatısı',
    stem: '" Açıklamalar yetersiz bulundu " cümlesinin öznesine ve nesnesine göre çatı özelliği aşağıdakilerden hangisidir ?',
    options: [
      { letter: 'A', text: 'Etken - geçişli' },
      { letter: 'B', text: 'Etken - geçişsiz' },
      { letter: 'C', text: 'Edilgen - geçişli' },
      { letter: 'D', text: 'Edilgen - geçişsiz' },
    ],
    correctAnswer: 'D',
    explanation:
      '"bulundu" fiili -n edilgenlik ekini almıştır (sözde özne: Açıklamalar -> Edilgen) ve nesne alamadığı için geçişsizdir.',
  },
  {
    number: 2,
    id: 'soru-2',
    topicTag: 'Etken - Geçişli Özdeşlik',
    quoteBlock: '" Kadın pencereden seyrediyordu yaşananları "',
    stem: 'Yukarıdaki cümlenin çatı özelliği ile aynı olan cümle aşağıdakilerden hangisidir ?',
    options: [
      { letter: 'A', text: 'Tepki vermese de söylenenleri anlıyordu.' },
      { letter: 'B', text: 'Hareketsiz bir biçimde olduğu yerde duruyordu.' },
      { letter: 'C', text: 'Kendine doğru gelen araca bir süre baktı.' },
      { letter: 'D', text: 'O gün aklına geldikçe ağlıyordu.' },
    ],
    correctAnswer: 'A',
    explanation:
      '"seyrediyordu" etken ve geçişlidir ("yaşananları"). A seçeneğindeki "anlıyordu" da etken ve geçişlidir ("söylenenleri").',
  },
  {
    number: 3,
    id: 'soru-3',
    topicTag: 'Çatı Aranmayan Cümle',
    stem: 'Aşağıdaki cümlelerin hangisinde çatı özelliği aranmaz ?',
    options: [
      { letter: 'A', text: 'Yarın saat beş gibi oraya geleceğim.' },
      { letter: 'B', text: 'Saatlerdir amaçsızca oradan oraya yürüyorum.' },
      { letter: 'C', text: "Karadeniz'in en meşhur içeceği çaydır." },
      { letter: 'D', text: 'Kendisine yapılan iyiliklerin kıymetini anladı.' },
    ],
    correctAnswer: 'C',
    explanation:
      'Çatı özelliği yalnızca fiil cümlelerinde aranır. C seçeneğinin yüklemi olan "çaydır" isim soylu olduğu için çatı aranmaz.',
  },
  {
    number: 4,
    id: 'soru-4',
    topicTag: 'Geçişsiz Fiil',
    stem: 'Aşağıdaki cümlelerin hangisi nesne - yüklem ilişkisi açısından geçişsiz bir fiildir ?',
    options: [
      { letter: 'A', text: 'Bulduğu çeşme susuzluğunu giderdi.' },
      { letter: 'B', text: 'Kayıp kolyesini yatağın altında buldu.' },
      { letter: 'C', text: 'Bebek ilk kez bugün yürüdü.' },
      { letter: 'D', text: 'Sorulan soruların hepsini bildi.' },
    ],
    correctAnswer: 'C',
    explanation:
      'C seçeneğindeki "yürüdü" fiili "onu" sözcüğünü kabul etmez (nesne alamaz); dolayısıyla geçişsizdir.',
  },
  {
    number: 5,
    id: 'soru-5',
    topicTag: 'Dönüşlü Çatı',
    stem: 'Aşağıdaki cümlelerin hangisinde özne yaptığı işten kendisi etkilenmiştir.',
    options: [
      { letter: 'A', text: 'Ağaçlar baharın gelmesi ile budandı.' },
      { letter: 'B', text: 'Piknik alanına kocaman bir örtü serildi.' },
      { letter: 'C', text: 'Kalabalık uzun uğraşlar sonucu dağıtıldı.' },
      { letter: 'D', text: 'Evde düğüne hazırlanmak için süslendi.' },
    ],
    correctAnswer: 'D',
    explanation:
      'D seçeneğinde "süslendi" fiilinde süslenme işini yapan (gizli özne: o) aynı zamanda bu işten etkilenen durumdadır (dönüşlü).',
  },
  {
    number: 6,
    id: 'soru-6',
    topicTag: 'İşteş Çatı · Karşılıklı',
    stem: 'Aşağıdaki cümlelerin hangisinde bir işi karşılıklı yapma anlamı vardır ?',
    options: [
      { letter: 'A', text: "Annem ve babam bugün İstanbul ' a gidecek." },
      { letter: 'B', text: 'Kargalar karların üstünde simsiyah bir örtü oluşturdu.' },
      { letter: 'C', text: 'Beni anlamamak konusunda ısrar ediyordu.' },
      { letter: 'D', text: 'Yurt dışındaki kuzeni ile devamlı mektuplaşıyorlar.' },
    ],
    correctAnswer: 'D',
    explanation:
      'D seçeneğindeki "mektuplaşıyorlar" fiili -ş işteşlik ekiyle iki taraf arasında karşılıklı yapma anlamı taşır.',
  },
  {
    number: 7,
    id: 'soru-7',
    topicTag: 'Geçişsiz Fiil',
    stem: 'Aşağıdaki cümlelerden hangisinin yüklemi geçişsiz bir fiildir ?',
    options: [
      { letter: 'A', text: 'Tren karanlık tepelerin ardından geliyor.' },
      { letter: 'B', text: 'Aşağıdaki cümlelerin öznesini bulunuz.' },
      { letter: 'C', text: 'Odaya yayılmış elbiseleri topluyordu.' },
      { letter: 'D', text: 'Arabanın patlayan lastiğini değiştirmişler.' },
    ],
    correctAnswer: 'A',
    explanation:
      'A seçeneğindeki "geliyor" fiili nesne alamaz ("onu geliyor" anlamsızdır); bu nedenle geçişsiz bir fiildir.',
  },
  {
    number: 8,
    id: 'soru-8',
    topicTag: 'Sözde Özne / Edilgen',
    stem: 'Aşağıdaki cümlelerin hangisinde yükleme sorulan "kim ya da ne " sorusu yüklemde bildirilen işi yapanı göstermez ?',
    options: [
      { letter: 'A', text: 'Gözler her daim doğruyu anlatır.' },
      { letter: 'B', text: 'Gecenin derinliğinde fark edilemedi.' },
      { letter: 'C', text: 'Kitabın cildi iyice bozulmaya başlamıştı.' },
      { letter: 'D', text: 'Evimiz yeni baştan inşaa ediliyordu.' },
    ],
    correctAnswer: 'D',
    explanation:
      'D seçeneğinde "ne inşa ediliyordu?" sorusunun cevabı olan "Evimiz" işi yapan değil, işten etkilenen sözde öznedir.',
  },
  {
    number: 9,
    id: 'soru-9',
    topicTag: 'Dönüşlü Çatı',
    stem: 'Aşağıdaki cümlelerin hangisinde yüklemde bildirilen işi yapan özne aynı zamanda bu işten etkilenmiştir ?',
    options: [
      { letter: 'A', text: 'Saha maç için günler öncesinden hazırlandı.' },
      { letter: 'B', text: 'Adam işe gitmek için hazırlandı.' },
      { letter: 'C', text: 'Kutlama için yemekler hazırlandı.' },
      { letter: 'D', text: 'Boğa güreşler için hazırlandı.' },
    ],
    correctAnswer: 'B',
    explanation:
      'B seçeneğinde "Adam" hazırlanma işini kendisi yapmakta ve bu işten yine kendisi etkilenmektedir (dönüşlü çatı).',
  },
  {
    number: 10,
    id: 'soru-10',
    topicTag: 'Edilgen Çatı',
    stem: 'Aşağıdaki cümlelerin hangisinin yüklemi edilgen çatılı bir fiildir ?',
    options: [
      { letter: 'A', text: 'Kapılar ardı ardına yüzüme kapatıldı.' },
      { letter: 'B', text: 'Kuşlar neşe içerisinde gökyüzünde uçuyordu.' },
      { letter: 'C', text: 'Ağaçlar sonbaharda yapraklarını döküyordu.' },
      { letter: 'D', text: 'Kedi sobanın kenarına kıvrılıp yatmıştı.' },
    ],
    correctAnswer: 'A',
    explanation:
      'A seçeneğinde kapıları kimin kapattığı belli değildir; "kapatıldı" edilgen çatılı, "Kapılar" ise sözde öznedir.',
  },
  {
    number: 11,
    id: 'soru-11',
    topicTag: 'Geçişli Fiil',
    stem: 'Aşağıdaki cümlelerin hangisinde yüklem nesne alabilecek bir fiildir ?',
    options: [
      { letter: 'A', text: 'Annesini son zamanlarda çok üzmüştü.' },
      { letter: 'B', text: 'Yıllarca başarılı olabilmek için çalışıp çabaladı.' },
      { letter: 'C', text: 'Sokak her günün aksine o gün ıssızdı.' },
      { letter: 'D', text: 'Arabada hiç sıkılmadan saatlerce otururdu.' },
    ],
    correctAnswer: 'A',
    explanation:
      'A seçeneğindeki "üzmüştü" fiili "kimi üzmüştü?" sorusuna "Annesini" nesnesiyle yanıt verir; geçişlidir.',
  },
  {
    number: 12,
    id: 'soru-12',
    topicTag: 'Nesne - Özne İlişkisi',
    quoteBlock:
      '"Can kafeste durmaz uçar\nDünya bir han, konan göçer\nAy dolanır yıllar geçer\nDostlar beni hatırlasın"',
    stem: 'Yukarıdaki dörtlükte aşağıdaki fiillerden hangisi nesne - özne ilişkisi açısından diğerlerinden farklıdır ?',
    options: [
      { letter: 'A', text: 'Uçar' },
      { letter: 'B', text: 'Göçer' },
      { letter: 'C', text: 'Geçer' },
      { letter: 'D', text: 'Hatırlasın' },
    ],
    correctAnswer: 'D',
    explanation:
      '"Uçar", "göçer" ve "geçer" geçişsizdir; "Hatırlasın" fiili "beni hatırlasın" şeklinde nesne aldığı için geçişlidir.',
  },
  {
    number: 13,
    id: 'soru-13',
    topicTag: 'Çatı Özdeşliği',
    quoteBlock: '"Çocuğun moraran ellerini hepimiz gördük."',
    stem: 'Aşağıdaki cümlelerden hangisi çatı bakımından yukarıdaki cümle ile özdeştir ?',
    options: [
      { letter: 'A', text: 'Bir anda koşarak yanıma geldi.' },
      { letter: 'B', text: 'Boş sandalyelerden birine oturdu.' },
      { letter: 'C', text: 'Kızağın demirlerini kısa sürede yeniledik.' },
      { letter: 'D', text: 'Anlatılanları duyunca bir süre sustu.' },
    ],
    correctAnswer: 'C',
    explanation:
      'Örnek cümledeki "gördük" etken-geçişlidir. C seçeneğindeki "yeniledik" de etken-geçişli olarak özdeştir.',
  },
  {
    number: 14,
    id: 'soru-14',
    topicTag: 'İşteş Çatı · Karşılıklı',
    stem: 'Aşağıdaki cümlelerin hangisinde yüklemde bildirilen işi "karşılıklı yapma " anlamı vardır ?',
    options: [
      { letter: 'A', text: 'Kontrolsüz gelen aracı gören yayalar kaçıştı.' },
      { letter: 'B', text: 'Karşıdan gelen adamla selamlaştı.' },
      { letter: 'C', text: 'Rüzgar başlayınca polenler havada uçuştu.' },
      { letter: 'D', text: 'Komik manzara karşısında herkes gülüştü.' },
    ],
    correctAnswer: 'B',
    explanation:
      'B seçeneğindeki "selamlaştı" fiili iki kişinin karşılıklı gerçekleştirdiği bir eylemdir; diğerleri birlikte yapmadır.',
  },
  {
    number: 15,
    id: 'soru-15',
    topicTag: 'Edilgen Çatı',
    stem: 'Aşağıdaki cümlelerin hangisinde edilgen çatılı bir fiil kullanılmıştır ?',
    options: [
      { letter: 'A', text: 'Bahçedeki güller bir bir sulandı.' },
      { letter: 'B', text: 'Dakikalarca odanın içinde dolandı.' },
      { letter: 'C', text: 'Misafirler kalorifer yanınca ısındı.' },
      { letter: 'D', text: 'Bu zor işi bitirince iki gün dinlendi.' },
    ],
    correctAnswer: 'A',
    explanation:
      'A seçeneğinde sulama işini yapan belli değildir; "Bahçedeki güller" sözde özne, "sulandı" edilgen çatılıdır.',
  },
  {
    number: 16,
    id: 'soru-16',
    topicTag: 'Edilgen - Geçişsiz Fiil',
    stem: 'Aşağıdaki cümlelerden hangisinin yüklemi öznesine göre edilgen, nesnesine göre geçişsizdir ?',
    options: [
      { letter: 'A', text: 'Yarın seni okulun önünde bekliyoruz.' },
      { letter: 'B', text: 'Dükkanı kapatırken yeri kontrol ettik.' },
      { letter: 'C', text: 'Yaşım ilerledikçe onu daha da anlıyorum.' },
      { letter: 'D', text: 'Kapanan yollar gayretli çalışmalarla açıldı.' },
    ],
    correctAnswer: 'D',
    explanation:
      'D seçeneğindeki "açıldı" fiili -l edilgenlik ekini almıştır (sözde özne: Kapanan yollar → Edilgen) ve nesne alamadığı için geçişsizdir.',
  },
  {
    number: 17,
    id: 'soru-17',
    topicTag: 'Özne - Yüklem İlişkisi',
    stem: 'Aşağıdaki cümlelerden hangisi özne - yüklem ilişkisi açısından diğerlerinden farklıdır?',
    options: [
      { letter: 'A', text: 'Söylediklerimize bir tek o alındı.' },
      { letter: 'B', text: 'Hülya bu sözlere çok kırıldı.' },
      { letter: 'C', text: 'Radyoda eski bir şarkı çalındı.' },
      { letter: 'D', text: 'Sebepsiz yere bize darıldı.' },
    ],
    correctAnswer: 'C',
    explanation:
      'A, B ve D seçeneklerindeki yüklemler (alındı, kırıldı, darıldı) dönüşlü çatılıdır; C seçeneğindeki "çalındı" fiili ise işi yapan belli olmadığı için edilgen çatılıdır.',
  },
  {
    number: 18,
    id: 'soru-18',
    topicTag: 'Edilgen vs Dönüşlü Çatı',
    stem: 'Aşağıdaki cümlelerin hangisinde edilgen çatılı bir fiil kullanılmamıştır?',
    options: [
      { letter: 'A', text: 'Katılımcılardan biri açık artırmadan çekildi.' },
      { letter: 'B', text: 'Adaletli bir seçim için kura çekildi.' },
      { letter: 'C', text: 'Dolma yapılacak etler çekildi.' },
      { letter: 'D', text: 'Yol kenarına park eden araçlar çekildi.' },
    ],
    correctAnswer: 'A',
    explanation:
      'A seçeneğinde "Katılımcılardan biri" çekilme işini kendisi yapıp bu işten kendisi etkilendiği için fiil dönüşlüdür; B, C ve D seçeneklerinde "çekildi" edilgen çatılıdır.',
  },
  {
    number: 19,
    id: 'soru-19',
    topicTag: 'Oldurgan Fiil',
    stem: 'Aşağıdaki cümlelerin hangisinde geçişsiz bir fiil aldığı ek ile geçişli hale gelmiştir ?',
    options: [
      { letter: 'A', text: 'Bahçeyi işçilere sulattı.' },
      { letter: 'B', text: 'Gereksiz konuşan adamı susturdu.' },
      { letter: 'C', text: 'Çocuğu anaokuluna verdirdi.' },
      { letter: 'D', text: 'Görevliye haddini bildirdi.' },
    ],
    correctAnswer: 'B',
    explanation:
      'B seçeneğinde geçişsiz olan "sus-" fiili -tur ekini alarak "adamı susturdu" biçiminde nesne alabilen (geçişli / oldurgan) bir fiile dönüşmüştür.',
  },
  {
    number: 20,
    id: 'soru-20',
    topicTag: 'Ettirgen Fiil',
    stem: 'Aşağıdaki cümlelerin hangisinde geçişli fiile gelen ek cümleye " başkasına yaptırma " anlamı katmıştır ?',
    options: [
      { letter: 'A', text: 'En çok da kırmızı gülleri seviyordu.' },
      { letter: 'B', text: 'Babasını hiçbir zaman üzmüyordu.' },
      { letter: 'C', text: 'Kapıyı tamirciye yaptırdılar.' },
      { letter: 'D', text: 'Evi özenle bir gün boyu temizledi.' },
    ],
    correctAnswer: 'C',
    explanation:
      'C seçeneğinde geçişli olan "yap-" fiili -tır ekini alarak eylemi tamirciye, yani başkasına yaptırma (ettirgen) anlamı kazanmıştır.',
  },
];

/**
 * Istanbul Real Estate Market (ONLY Gayrimenkul / Emlak — Vehicles removed per user request!).
 */
export const PROPERTY_ASSETS: PropertyAsset[] = [
  {
    id: 'kucuk-arsa',
    name: 'Küçük Arsa',
    kind: 'emlak',
    price: 40,
    districtTileIndex: 19, // Sultanahmet yakını
    marketInfo: 'Tarihî Yarımada çevresinde yüksek değerli imarlı İstanbul arsası.',
    color: '#2e7d5b',
  },
  {
    id: 'karakoy-dukkani',
    name: 'Karaköy Dükkânı',
    kind: 'emlak',
    price: 55,
    districtTileIndex: 15, // Karaköy
    marketInfo: 'Karaköy liman caddesinde tarihî kemerli işlek köşe dükkânı.',
    color: '#b76e22',
  },
  {
    id: 'balat-tarihi-evi',
    name: 'Balat Tarihî Evi',
    kind: 'emlak',
    price: 65,
    districtTileIndex: 21, // Balat
    marketInfo: 'Haliç manzaralı, renkli cumbalı restore edilmiş tarihî Balat evi.',
    color: '#d45d36',
  },
  {
    id: 'galata-dairesi',
    name: 'Galata Dairesi',
    kind: 'emlak',
    price: 75,
    districtTileIndex: 13, // Galata Kulesi
    marketInfo: 'Galata Kulesi’ne bakan yüksek tavanlı, balkonlu tarihî apartman dairesi.',
    color: '#9b4d3a',
  },
  {
    id: 'istanbul-kafe',
    name: 'Beşiktaş Sahil Kafesi',
    kind: 'emlak',
    price: 90,
    districtTileIndex: 9, // Beşiktaş
    marketInfo: 'Beşiktaş sahilinde gün boyu canlı, Boğaz esintili mülk kafe.',
    color: '#0d8a8a',
  },
  {
    id: 'taksim-magazasi',
    name: 'Taksim Mağazası',
    kind: 'emlak',
    price: 110,
    districtTileIndex: 11, // Taksim
    marketInfo: 'İstiklal Caddesi üzerinde tramvay yoluna cepheli prestijli mağaza mülkü.',
    color: '#c42d3a',
  },
  {
    id: 'uskudar-yalisi',
    name: 'Üsküdar Yalısı',
    kind: 'emlak',
    price: 120,
    districtTileIndex: 1, // Üsküdar
    marketInfo: 'Anadolu kıyısında Kız Kulesi manzaralı tarihî ahşap Boğaz yalısı.',
    color: '#1d6fd1',
  },
  {
    id: 'ortakoy-butik-otel',
    name: 'Ortaköy Butik Oteli',
    kind: 'emlak',
    price: 130,
    districtTileIndex: 7, // Ortaköy
    marketInfo: 'Ortaköy meydanında Boğaz esintili, taş cepheli butik otel mülkü.',
    color: '#d9881c',
  },
  {
    id: 'sultanahmet-konagi',
    name: 'Sultanahmet Konağı',
    kind: 'emlak',
    price: 140,
    districtTileIndex: 19, // Sultanahmet
    marketInfo: 'Tarihî Yarımada’nın kalbinde avlulu, özgün Osmanlı konağı.',
    color: '#1a5f8a',
  },
  {
    id: 'bogaz-manzarali-villa',
    name: 'Boğaz Manzaralı Villa',
    kind: 'emlak',
    price: 150,
    districtTileIndex: 5, // 15 Temmuz Köprüsü yakını
    marketInfo: 'Boğaz Köprüsü’nü panoramik gören geniş bahçeli seçkin villa.',
    color: '#0c6b9a',
  },
];

/**
 * Bonus, İndirim ve Sürpriz Ceza Kartları
 * (Yalnızca doğru bilen takımlara isteğe bağlı olarak sunulur!)
 */
export const CHANCE_CARDS: ChanceCard[] = [
  {
    id: 'emlak-indirimi-25',
    title: '%25 Emlak İndirimi',
    kind: 'sans',
    description: 'İstanbul Emlak Teşviki! Bir sonraki gayrimenkul alımında tam %25 indirim kazandın.',
    effectType: 'property_discount',
    value: 0.25,
  },
  {
    id: 'super-emlak-indirimi-35',
    title: '%35 Süper Emlak İndirimi',
    kind: 'sans',
    description: 'Boğaz Fırsat Günü! Bir sonraki gayrimenkul alımında %35 büyük indirim kazandın.',
    effectType: 'property_discount',
    value: 0.35,
  },
  {
    id: 'bogaz-bonusu-30',
    title: '+30 BP Boğaz Bonusu',
    kind: 'sans',
    description: 'İstanbul kültür turu ödülü! Takım kasasına anında +30 BP bonus eklendi.',
    effectType: 'gain_bp',
    value: 30,
  },
  {
    id: 'istanbul-yatirim-50',
    title: '+50 BP Yatırım Bonusu',
    kind: 'sans',
    description: 'Şehirdeki girişimin büyük ilgi gördü! Takım kasasına +50 BP bonus eklendi.',
    effectType: 'gain_bp',
    value: 50,
  },
  {
    id: 'sansli-emlak-firsati',
    title: 'Özel Emlak Fırsatı',
    kind: 'sans',
    description: 'Şans senden yana! Ekstra bir Emlak Kartı çekme hakkı kazandın.',
    effectType: 'bonus_property_draw',
  },
  {
    id: 'vapur-bonusu',
    title: 'Vapur Seferi · Ekstra Zar',
    kind: 'sans',
    description: 'Şehir Hatları vapuru rüzgârı arkasına aldı! Ekstra bir zar atma hakkı kazandın.',
    effectType: 'extra_roll',
  },
  {
    id: 'ceza-bogaz-koprusu-25',
    title: 'Sürpriz Ceza (-25 BP)',
    kind: 'ceza',
    description: 'Boğaz Köprüsü hızlı geçiş cezası! Takım kasasından 25 BP silindi.',
    effectType: 'lose_bp',
    value: 25,
  },
  {
    id: 'ceza-trafik-25',
    title: 'Trafik Cezası (-25 BP)',
    kind: 'ceza',
    description: 'Hatalı park ve şehir içi trafik cezası! Takım kasasından 25 BP silindi.',
    effectType: 'lose_bp',
    value: 25,
  },
  {
    id: 'ceza-belediye-vergisi-25',
    title: 'Şehir Bakım Cezası (-25 BP)',
    kind: 'ceza',
    description: 'İstanbul belediye bakım ve düzenleme kesintisi! Takım kasasından 25 BP silindi.',
    effectType: 'lose_bp',
    value: 25,
  },
];

export const FIILDE_CATI_SUMMARY = [
  {
    group: 'Özne - Yüklem İlişkisi',
    name: 'Etken Fiil',
    rule: 'İşi yapan gerçek veya gizli özne bellidir; fiil -l/-n edilgenlik eki almaz.',
    example: 'Çocuğun moraran ellerini hepimiz gördük. (Soru 13)',
  },
  {
    group: 'Özne - Yüklem İlişkisi',
    name: 'Edilgen Fiil',
    rule: 'İşi yapan belli değildir; fiil -l/-n eki alır, işten etkilenen öge sözde öznedir.',
    example: 'Açıklamalar yetersiz bulundu. / Bahçedeki güller bir bir sulandı. (Soru 1, 10, 15)',
  },
  {
    group: 'Özne - Yüklem İlişkisi',
    name: 'Dönüşlü Fiil',
    rule: 'Fiil -l/-n eki alır fakat işi yapan da işten etkilenen de aynı gerçek öznedir.',
    example: 'Evde düğüne hazırlanmak için süslendi. / Adam işe gitmek için hazırlandı. (Soru 5, 9)',
  },
  {
    group: 'Özne - Yüklem İlişkisi',
    name: 'İşteş Fiil',
    rule: 'Fiil -ş eki alır; eylem karşılıklı (mektuplaşıyorlar, selamlaştı) veya birlikte (kaçıştı, gülüştü) yapılır.',
    example: 'Karşıdan gelen adamla selamlaştı. (Soru 6, 14)',
  },
  {
    group: 'Nesne - Yüklem İlişkisi',
    name: 'Geçişli Fiil',
    rule: 'Nesne alabilen fiillerdir ("onu" sözcüğü veya "neyi/kimi?" sorusuyla uyumludur).',
    example: 'Annesini son zamanlarda çok üzmüştü. / Dostlar beni hatırlasın. (Soru 2, 11, 12)',
  },
  {
    group: 'Nesne - Yüklem İlişkisi',
    name: 'Geçişsiz Fiil & İsim Cümlesi',
    rule: 'Nesne alamayan fiiller geçişsizdir (yürüdü, geliyor, uçar). İsim cümlelerinde (çaydır) çatı özelliği aranmaz!',
    example: 'Bebek ilk kez bugün yürüdü. / Karadeniz’in en meşhur içeceği çaydır. (Soru 3, 4, 7)',
  },
];
