import {
  BoardTile,
  ChanceCard,
  CharacterOption,
  OptionLetter,
  PawnColorOption,
  PropertyAsset,
  QuestionCard,
} from './types';

export const INITIAL_TEAM_BP = 100; // Her takım tam 100 TL ile başlar
export const START_PASS_BONUS_BP = 50; // Başlangıca her dönüşte +50 TL
export const REWARD_TILE_BP = 10; // Ödül karesinde +10 TL
export const JAIL_BAIL_BP = 10; // Hapis / Bekleme karesinden çıkıp soru çözme ücreti: 10 TL
export const QUESTION_TIME_LIMIT_SECONDS = 120; // Her soru için 2 dakika (120 saniye) süre
export const CORRECT_ANSWER_BP = 50; // Her doğru soru +50 TL
export const WRONG_ANSWER_BP = -25;
export const BANK_LOAN_PRINCIPAL = 50;
export const BANK_LOAN_REPAYMENT = 60;
export const BANK_BUYBACK_RATIO = 0.7;
export const MAX_PEER_LOAN_RATIO = 1.2;
export const QUESTIONS_PER_TEAM = 7; // 20 soruluk havuz 3 takım arasında oynanır (7 + 7 + 6 = 20)

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
    name: 'Benzetme',
    role: 'Cesur Aslan Maskotu',
    accentHex: '#d97706',
  },
  {
    id: 'edilgen',
    name: 'Kişileştirme',
    role: 'Neşeli Bulut Maskotu',
    accentHex: '#0284c7',
  },
  {
    id: 'donuslu',
    name: 'Söz Ustası',
    role: 'Bilge Baykuş Maskotu',
    accentHex: '#0f766e',
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
    districtTag: 'Her Dönüş +50 TL',
    accentColor: '#e23b26',
    architectureNote: 'İstanbul oyun turumuzun başlangıç kapısı!',
    historicalFact: 'İlk çıkışta para verilmez; tahtayı dolaşıp her dönüşte +50 TL kazanırsın.',
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
    shortLabel: 'ÖDÜL +10 TL',
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
    name: 'BEKLEME KARESİ',
    shortLabel: 'BEKLE · 1 TUR',
    districtTag: 'Mola Alanı',
    accentColor: '#52606d',
    architectureNote: 'Boğaz kıyısında kısa bir mola! İstersen 10 TL verip hemen soruyu çöz, istersen 1 tur bekle.',
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
    shortLabel: 'ÖDÜL +10 TL',
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
    name: 'BEKLEME KARESİ',
    shortLabel: 'BEKLE · 1 TUR',
    districtTag: 'Mola Alanı',
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
    shortLabel: 'ÖDÜL +10 TL',
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
    name: 'BEKLEME KARESİ',
    shortLabel: 'BEKLE · 1 TUR',
    districtTag: 'Mola Alanı',
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
    shortLabel: 'ÖDÜL +10 TL',
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
  1: 'B',
  2: 'D',
  3: 'A',
  4: 'D',
  5: 'B',
  6: 'C',
  7: 'A',
  8: 'D',
  9: 'A',
  10: 'D',
  11: 'D',
  12: 'A',
  13: 'D',
  14: 'B',
  15: 'A',
  16: 'C',
  17: 'C',
  18: 'D',
  19: 'D',
  20: 'C',
};

/**
 * 5. SINIF TÜRKÇE · SÖZ SANATLARI (20 SORU)
 * 1–10: Kullanıcının gönderdiği 10 Kişileştirme sorusu ve resmî cevap anahtarı
 * 11–20: Kullanıcının gönderdiği 10 Benzetme sorusu ve resmî cevap anahtarı
 */
export const QUESTION_CARDS: QuestionCard[] = [
  {
    number: 1,
    id: 'soru-1',
    topicTag: 'Kişileştirme',
    stem: 'Aşağıdakilerin hangisinde kişileştirme vardır?',
    options: [
      { letter: 'A', text: 'Yazarın imza günü bu pazar olacakmış.' },
      { letter: 'B', text: 'Küçük ceylan, bizi meraklı gözlerle izliyordu.' },
      { letter: 'C', text: 'Sabah yağmur yağdığı için evden geç çıktım.' },
      { letter: 'D', text: 'Babam, bozulan oyuncaklarımı tamir edecekmiş.' },
    ],
    correctAnswer: 'B',
    explanation:
      'B seçeneğinde insanlara özgü "meraklı gözlerle izleme" özelliği küçük ceylana verildiği için kişileştirme yapılmıştır.',
  },
  {
    number: 2,
    id: 'soru-2',
    topicTag: 'Kişileştirilen Varlık',
    quoteBlock:
      'Yemyeşil ormanın ortasından akan derenin yanındaki mağarada bilge bir ayı yaşıyordu.',
    stem: 'Bu cümlede kişileştirilen varlık aşağıdakilerden hangisidir?',
    options: [
      { letter: 'A', text: 'Orman' },
      { letter: 'B', text: 'Dere' },
      { letter: 'C', text: 'Mağara' },
      { letter: 'D', text: 'Ayı' },
    ],
    correctAnswer: 'D',
    explanation:
      'İnsanlara ait bir özellik olan "bilge olma" özelliği ayıya verildiği için bu cümlede kişileştirilen varlık ayıdır.',
  },
  {
    number: 3,
    id: 'soru-3',
    topicTag: 'Kişileştirilen Varlık',
    quoteBlock:
      'Bahçenin kenarındaki elma ağacının altında dinlenen köpek, arkadaşlarının ne yaptığını düşünüyordu.',
    stem: 'Bu cümlede kişileştirilen varlık aşağıdakilerden hangisidir?',
    options: [
      { letter: 'A', text: 'Köpek' },
      { letter: 'B', text: 'Bahçe' },
      { letter: 'C', text: 'Elma' },
      { letter: 'D', text: 'Ağaç' },
    ],
    correctAnswer: 'A',
    explanation:
      'İnsanlara özgü "arkadaşlarının ne yaptığını düşünme" özelliği köpeğe verildiği için kişileştirilen varlık köpektir.',
  },
  {
    number: 4,
    id: 'soru-4',
    topicTag: 'Metinde Kişileştirme',
    quoteBlock:
      '(I) Cumartesi sabahı erkenden uyanmıştım çünkü kuzenlerim gelecekti. (II) Kahvaltımı yaptıktan sonra evin bahçesine çıkıp beklemeye başladım. (III) Gece yola çıkan kuzenlerim birazdan burada olurlardı. (IV) Biraz sonra kuzenlerimin yorgun arabalarının bizim sokağa girdiğini gördüm.',
    stem: 'Bu metindeki numaralanmış cümlelerin hangisinde kişileştirme vardır?',
    options: [
      { letter: 'A', text: 'I' },
      { letter: 'B', text: 'II' },
      { letter: 'C', text: 'III' },
      { letter: 'D', text: 'IV' },
    ],
    correctAnswer: 'D',
    explanation:
      'IV. cümlede insana özgü "yorgun olma" özelliği cansız bir varlık olan arabaya ("yorgun arabalarının") verildiği için kişileştirme yapılmıştır.',
  },
  {
    number: 5,
    id: 'soru-5',
    topicTag: 'Kişileştirme',
    stem: 'Aşağıdakilerin hangisinde kişileştirme vardır?',
    options: [
      { letter: 'A', text: 'Abim ev almak için hazırlık yapıyordu.' },
      { letter: 'B', text: 'Ablamın kedisi bana küstü, yanıma gelmiyor.' },
      { letter: 'C', text: 'Öğleden sonra elektrik kesintisi olacak.' },
      { letter: 'D', text: 'Akşam yemeğinden sonra yola çıkacağız.' },
    ],
    correctAnswer: 'B',
    explanation:
      'B seçeneğinde insanlara özgü "küsmek" duygusu kediye verildiği için kişileştirme yapılmıştır.',
  },
  {
    number: 6,
    id: 'soru-6',
    topicTag: 'Kişileştirme Olmayan Cümle',
    stem: 'Aşağıdakilerin hangisinde kişileştirme yoktur?',
    options: [
      { letter: 'A', text: 'İsyan eden ağaçlar ormana insanların girmesini istemiyordu.' },
      { letter: 'B', text: 'Bir süre sonra güneş, bulutların arkasına saklanıp uyudu.' },
      { letter: 'C', text: 'Komşumuzun küçük oğlu her akşam bizim eve gelirdi.' },
      { letter: 'D', text: 'Bahçede yalnız kalan kirpi, bize çok usandığını söyledi.' },
    ],
    correctAnswer: 'C',
    explanation:
      'A’da ağaçlar (isyan etmek), B’de güneş (saklanıp uyumak), D’de kirpi (usanıp söylemek) kişileştirilmiştir. C seçeneğinde ise gerçek bir insandan söz edildiği için kişileştirme yoktur.',
  },
  {
    number: 7,
    id: 'soru-7',
    topicTag: 'Kişileştirilen Varlık',
    quoteBlock:
      'Hırçın rüzgâr şiddetini artırmış, ağaçların yapraklarını dökmeye başlamıştı. Bazı evlerin çatılarındaki kiremitler de rüzgârın hıncından nasibini almıştı. Biraz sonra yağmur başlayınca rüzgârın hırçınlığı da azaldı.',
    stem: 'Bu metinde kişileştirilen varlık aşağıdakilerden hangisidir?',
    options: [
      { letter: 'A', text: 'Rüzgâr' },
      { letter: 'B', text: 'Ağaç' },
      { letter: 'C', text: 'Kiremit' },
      { letter: 'D', text: 'Yağmur' },
    ],
    correctAnswer: 'A',
    explanation:
      'Metinde insanlara özgü "hırçınlık" ve "hınç" duyguları rüzgâra verildiği için kişileştirilen varlık rüzgârdır.',
  },
  {
    number: 8,
    id: 'soru-8',
    topicTag: 'Şiirde Kişileştirme',
    quoteBlock:
      'Hava bulutlanıp gök gürleyince\nBir yağmur başlar ya inceden ince\nBak o zaman topraktaki sevince',
    stem: 'Bu şiirde kişileştirilen varlık aşağıdakilerin hangisidir?',
    options: [
      { letter: 'A', text: 'Hava' },
      { letter: 'B', text: 'Gök' },
      { letter: 'C', text: 'Yağmur' },
      { letter: 'D', text: 'Toprak' },
    ],
    correctAnswer: 'D',
    explanation:
      'Şiirin son dizesinde insana ait "sevinme" duygusu toprağa ("topraktaki sevince") verildiği için kişileştirilen varlık topraktır.',
  },
  {
    number: 9,
    id: 'soru-9',
    topicTag: 'Kişileştirme',
    stem: 'Aşağıdaki cümlelerin hangisinde kişileştirme vardır?',
    options: [
      { letter: 'A', text: 'Bu bozuk yoldan tüm arabalar şikayetçiydi.' },
      { letter: 'B', text: 'Dolaba sakladığım dondurmayı kardeşim yemiş.' },
      { letter: 'C', text: 'Modern tarım yöntemleri kullanmaya başladık.' },
      { letter: 'D', text: 'Sınıf kitaplığından birkaç kitap alacağım.' },
    ],
    correctAnswer: 'A',
    explanation:
      'A seçeneğinde insanlara özgü "şikâyetçi olma" özelliği cansız varlıklar olan arabalara verildiği için kişileştirme yapılmıştır.',
  },
  {
    number: 10,
    id: 'soru-10',
    topicTag: 'Kişileştirme Olmayan Cümle',
    stem: 'Aşağıdakilerin hangisinde kişileştirme kullanılmamıştır?',
    options: [
      { letter: 'A', text: 'Sabahları kuşların neşeli şarkılarıyla uyanırım.' },
      { letter: 'B', text: 'Tavşan ile kaplumbağa yarış tarihinde anlaştı.' },
      { letter: 'C', text: 'Uyanık kirpi, arkadaşlarından önce gelmişti.' },
      { letter: 'D', text: 'Sandığın içinden fotoğraf albümünü çıkardı.' },
    ],
    correctAnswer: 'D',
    explanation:
      'A’da kuşlar (neşeli şarkı), B’de tavşan ile kaplumbağa (anlaşmak), C’de kirpi (uyanık olmak) kişileştirilmiştir. D seçeneğinde hiçbir varlığa insan özelliği verilmemiştir.',
  },
  {
    number: 11,
    id: 'soru-11',
    topicTag: 'Benzetme Olmayan Cümle',
    stem: 'Aşağıdaki cümlelerin hangisinde benzetme kullanılmamıştır?',
    options: [
      { letter: 'A', text: 'Altın kalpli çocuk sokak hayvanlarını unutmamış.' },
      { letter: 'B', text: 'Dün ana cadde, arı kovanı gibi kalabalıktı.' },
      { letter: 'C', text: 'Tamir ettiğim makine saat gibi işlemeye başladı.' },
      { letter: 'D', text: 'Öğleden sonra şiddetli bir kar yağışı başlamıştı.' },
    ],
    correctAnswer: 'D',
    explanation:
      'A’da çocuğun kalbi altına, B’de cadde arı kovanına, C’de makine saate benzetilmiştir. D seçeneğinde ise hiçbir benzetme yapılmamıştır.',
  },
  {
    number: 12,
    id: 'soru-12',
    topicTag: 'Benzeyen Varlık',
    quoteBlock:
      'Duvarları ve tavanı uzun bir kışın isleriyle kararmış bu yer odasında mahpus gibi duran bodur ve çirkin ocak, içindeki odunları sanki hiddetle yakıyor, bir an evvel yutmaya çalışıyordu.',
    stem: 'Bu cümledeki benzetmede benzeyen varlık aşağıdakilerden hangisidir?',
    options: [
      { letter: 'A', text: 'Ocak' },
      { letter: 'B', text: 'Duvar' },
      { letter: 'C', text: 'Oda' },
      { letter: 'D', text: 'Odun' },
    ],
    correctAnswer: 'A',
    explanation:
      'Cümlede "mahpus gibi duran bodur ve çirkin ocak" ifadesinde mahpusa benzetilen (benzeyen) varlık "ocak"tır.',
  },
  {
    number: 13,
    id: 'soru-13',
    topicTag: 'Kendisine Benzetilen',
    quoteBlock:
      'Dar kapısından başka aydınlık girecek hiçbir yeri olmayan dükkânında tek başına, gece gündüz kıvılcımlar saçarak çalışan Koca Ali, tıpkı kafese konmuş terbiyeli bir aslanı andırıyordu.',
    stem: 'Bu cümledeki benzetmede kendisine benzetilen varlık aşağıdakilerden hangisidir?',
    options: [
      { letter: 'A', text: 'Kapı' },
      { letter: 'B', text: 'Dükkân' },
      { letter: 'C', text: 'Kafes' },
      { letter: 'D', text: 'Aslan' },
    ],
    correctAnswer: 'D',
    explanation:
      'Cümlede Koca Ali (benzeyen), kafese konmuş terbiyeli bir "aslan"a (kendisine benzetilen) benzetilmiştir.',
  },
  {
    number: 14,
    id: 'soru-14',
    topicTag: 'Kendisine Benzetilen',
    quoteBlock:
      'Akdeniz’in kahramanlık yuvası sonsuz ufuklarına bakan küçük tepe, minimini bir çiçek ormanı gibiydi.',
    stem: 'Bu cümledeki benzetmede kendisine benzetilen varlık aşağıdakilerden hangisidir?',
    options: [
      { letter: 'A', text: 'Akdeniz' },
      { letter: 'B', text: 'Çiçek ormanı' },
      { letter: 'C', text: 'Tepe' },
      { letter: 'D', text: 'Ufuk' },
    ],
    correctAnswer: 'B',
    explanation:
      'Cümlede küçük tepe (benzeyen), minimini bir "çiçek ormanı"na (kendisine benzetilen) benzetilmiştir.',
  },
  {
    number: 15,
    id: 'soru-15',
    topicTag: 'Benzetme',
    stem: 'Aşağıdaki cümlelerin hangisinde benzetme yapılmıştır?',
    options: [
      { letter: 'A', text: 'Kar, her tarafı bembeyaz çarşaf gibi kapatmıştı.' },
      { letter: 'B', text: 'Otelin kapısından çıkınca gözleri kamaşmıştı.' },
      { letter: 'C', text: 'Biraz sonra elinde kalın bir sözlükle içeri girdi.' },
      { letter: 'D', text: 'Otobüs gelmeden biletimi alıp bir banka oturdum.' },
    ],
    correctAnswer: 'A',
    explanation:
      'A seçeneğinde her tarafı kapatan kar, bembeyaz olması yönüyle "gibi" edatı kullanılarak çarşafa benzetilmiştir.',
  },
  {
    number: 16,
    id: 'soru-16',
    topicTag: 'Benzetme Yönü',
    quoteBlock:
      'Küçük çocuk, zeytin gibi simsiyah gözlerini bize dikip aradığımız adamın burada oturmadığını söyledi.',
    stem: 'Bu metindeki benzetmede benzetme yönü aşağıdakilerden hangisidir?',
    options: [
      { letter: 'A', text: 'Çocuk' },
      { letter: 'B', text: 'Gözler' },
      { letter: 'C', text: 'Simsiyah' },
      { letter: 'D', text: 'Adam' },
    ],
    correctAnswer: 'C',
    explanation:
      'Metinde çocuğun gözleri (benzeyen), zeytine (kendisine benzetilen) "simsiyah" olma özelliği yönünden benzetilmiştir; bu nedenle benzetme yönü "simsiyah"tır.',
  },
  {
    number: 17,
    id: 'soru-17',
    topicTag: 'Benzeyen Varlık',
    quoteBlock:
      'Yavaşça beşiğe eğildi. Beşikte ağlayan çocuğa baktı. Sonra kürek gibi kocaman elleriyle bebeği beşikten kaldırdı. Biraz salladıktan sonra bebek susmuştu. Biberonu hazırlayıp bebeğe süt içirmeye başladı.',
    stem: 'Bu metindeki benzetmede benzeyen varlık aşağıdakilerden hangisidir?',
    options: [
      { letter: 'A', text: 'Beşik' },
      { letter: 'B', text: 'Çocuk' },
      { letter: 'C', text: 'El' },
      { letter: 'D', text: 'Kürek' },
    ],
    correctAnswer: 'C',
    explanation:
      'Metinde "kürek gibi kocaman elleriyle" ifadesinde küreğe benzetilen (benzeyen) varlık "el"dir.',
  },
  {
    number: 18,
    id: 'soru-18',
    topicTag: 'Şiirde Benzetme',
    quoteBlock:
      'Ufku tutuşturmadan fecrin ilk alevleri\nArkamızda kalıyor şehrin kenar evleri\nBulutların ardında gün yanmadan sönüyor\nHöyükler bir dağ gibi uzaktan görünüyor',
    stem: 'Bu şiirin kaçıncı dizesinde benzetme yapılmıştır?',
    options: [
      { letter: 'A', text: 'I' },
      { letter: 'B', text: 'II' },
      { letter: 'C', text: 'III' },
      { letter: 'D', text: 'IV' },
    ],
    correctAnswer: 'D',
    explanation:
      'Şiirin IV. dizesinde "Höyükler bir dağ gibi uzaktan görünüyor" denilerek höyükler "gibi" edatıyla dağa benzetilmiştir.',
  },
  {
    number: 19,
    id: 'soru-19',
    topicTag: 'Benzetme Olmayan Cümle',
    stem: 'Aşağıdakilerin hangisinde benzetme yoktur?',
    options: [
      { letter: 'A', text: 'Dışarıda kalan ekmekler taş gibi sert olmuştu.' },
      { letter: 'B', text: 'Buz gibi sudan kana kana içip yola devam ettik.' },
      { letter: 'C', text: 'Bu çocuk karınca gibi çalışkan ve güçlüydü.' },
      { letter: 'D', text: 'Beklediğimiz otobüs saatler sonra gelmişti.' },
    ],
    correctAnswer: 'D',
    explanation:
      'A’da ekmekler taşa, B’de su buza, C’de çocuk karıncaya benzetilmiştir. D seçeneğinde hiçbir benzetme yapılmamıştır.',
  },
  {
    number: 20,
    id: 'soru-20',
    topicTag: 'Benzetme',
    stem: 'Aşağıdaki cümlelerin hangisinde benzetme yapılmıştır?',
    options: [
      { letter: 'A', text: 'Evlerin duvarına kuşlar için yuvalar yapılmıştı.' },
      { letter: 'B', text: 'Akşam köyün sürüsü yolun başında göründü.' },
      { letter: 'C', text: 'Ağaçların yaprakları birer altın gibi parlıyordu.' },
      { letter: 'D', text: 'Bahçedeki kedi meraklı gözlerle bizi izliyordu.' },
    ],
    correctAnswer: 'C',
    explanation:
      'C seçeneğinde ağaçların yaprakları, parlaklığı yönünden "gibi" edatıyla altına benzetilmiştir. (D seçeneğinde ise kişileştirme vardır.)',
  },
];

/**
 * İstanbul İlçe Kartları (En çok ilçe alan takım SÖZOPLY şampiyonu olur!)
 */
export const PROPERTY_ASSETS: PropertyAsset[] = [
  {
    id: 'kucuk-arsa',
    name: 'Eyüpsultan İlçesi',
    kind: 'emlak',
    price: 40,
    districtTileIndex: 21, // Haliç yakını
    marketInfo: 'Haliç kıyısında teleferiği, yeşil tepeleri ve tarihî sokaklarıyla güzel bir İstanbul ilçesi.',
    color: '#2e7d5b',
  },
  {
    id: 'karakoy-dukkani',
    name: 'Bakırköy İlçesi',
    kind: 'emlak',
    price: 55,
    districtTileIndex: 15, // Karaköy yakını
    marketInfo: 'Geniş parkları, bisiklet yolları ve masmavi sahiliyle çok sevilen bir İstanbul ilçesi.',
    color: '#b76e22',
  },
  {
    id: 'balat-tarihi-evi',
    name: 'Fatih İlçesi',
    kind: 'emlak',
    price: 65,
    districtTileIndex: 21, // Balat / Fatih
    marketInfo: 'Renkli evleri, tarihî camileri ve müzeleriyle İstanbul’un kalbindeki ilçe.',
    color: '#d45d36',
  },
  {
    id: 'galata-dairesi',
    name: 'Beyoğlu İlçesi',
    kind: 'emlak',
    price: 75,
    districtTileIndex: 13, // Galata Kulesi / Beyoğlu
    marketInfo: 'Galata Kulesi ve kırmızı nostaljik tramvayıyla ünlü, cıvıl cıvıl İstanbul ilçesi.',
    color: '#9b4d3a',
  },
  {
    id: 'istanbul-kafe',
    name: 'Beşiktaş İlçesi',
    kind: 'emlak',
    price: 85,
    districtTileIndex: 9, // Beşiktaş
    marketInfo: 'Vapur iskelesi, Ortaköy meydanı ve Boğaz manzarasıyla neşeli sahil ilçesi.',
    color: '#0d8a8a',
  },
  {
    id: 'taksim-magazasi',
    name: 'Kadıköy İlçesi',
    kind: 'emlak',
    price: 95,
    districtTileIndex: 11, // Taksim
    marketInfo: 'Anadolu yakasında kitapçıları, parkları ve sahil yürüyüş yollarıyla ünlü ilçe.',
    color: '#c42d3a',
  },
  {
    id: 'uskudar-yalisi',
    name: 'Üsküdar İlçesi',
    kind: 'emlak',
    price: 105,
    districtTileIndex: 1, // Üsküdar
    marketInfo: 'Kız Kulesi’ne karşı martıları izleyebileceğin, Anadolu yakasının tarihî sahil ilçesi.',
    color: '#1d6fd1',
  },
  {
    id: 'ortakoy-butik-otel',
    name: 'Sarıyer İlçesi',
    kind: 'emlak',
    price: 115,
    districtTileIndex: 7, // Ortaköy
    marketInfo: 'Yemyeşil ormanları, köprü manzarası ve serin Boğaz rüzgârıyla ünlü ilçe.',
    color: '#d9881c',
  },
  {
    id: 'sultanahmet-konagi',
    name: 'Adalar İlçesi',
    kind: 'emlak',
    price: 125,
    districtTileIndex: 19, // Sultanahmet
    marketInfo: 'Marmara Denizi’nin ortasında çam ağaçları ve bisiklet yollarıyla dolu huzurlu ilçe.',
    color: '#1a5f8a',
  },
  {
    id: 'bogaz-manzarali-villa',
    name: 'Beykoz İlçesi',
    kind: 'emlak',
    price: 135,
    districtTileIndex: 5, // 15 Temmuz Köprüsü yakını
    marketInfo: 'Boğaz’ın iki kıyısını izleyen yemyeşil koruları ve temiz havasıyla ünlü İstanbul ilçesi.',
    color: '#0c6b9a',
  },
];

/**
 * Ödül ya da Ceza Kartları (Şans Kartları)
 */
export const CHANCE_CARDS: ChanceCard[] = [
  {
    id: 'emlak-indirimi-25',
    title: '25 TL İlçe İndirimi',
    kind: 'sans',
    description: 'Harika haber! Bir sonraki ilçe kartını alırken 25 TL indirim kazandınız.',
    effectType: 'property_discount',
    value: 25,
  },
  {
    id: 'super-emlak-indirimi-35',
    title: '35 TL Süper İlçe İndirimi',
    kind: 'sans',
    description: 'Büyük fırsat! Bir sonraki ilçe kartını alırken tam 35 TL indirim kazandınız.',
    effectType: 'property_discount',
    value: 35,
  },
  {
    id: 'bogaz-bonusu-30',
    title: '+30 TL Boğaz Ödülü',
    kind: 'sans',
    description: 'İstanbul gezisinde sürpriz hediye! Takımına hemen +30 TL eklendi.',
    effectType: 'gain_bp',
    value: 30,
  },
  {
    id: 'istanbul-yatirim-50',
    title: '+50 TL Süper Ödül',
    kind: 'sans',
    description: 'Çok başarılısın! Takımının kasasına hemen +50 TL ödül eklendi.',
    effectType: 'gain_bp',
    value: 50,
  },
  {
    id: 'sansli-emlak-firsati',
    title: 'Ekstra İlçe Fırsatı',
    kind: 'sans',
    description: 'Şans senden yana! Hemen fazladan bir İlçe Kartı çekme hakkı kazandın.',
    effectType: 'bonus_property_draw',
  },
  {
    id: 'vapur-bonusu',
    title: 'Vapur Gezisi · 1 Zar Daha',
    kind: 'sans',
    description: 'Vapur seni hızlıca ilerletti! Bir kez daha zar atma hakkı kazandın.',
    effectType: 'extra_roll',
  },
  {
    id: 'ceza-bogaz-koprusu-25',
    title: 'Köprü Cezası (-25 TL)',
    kind: 'ceza',
    description: 'Eyvah! Köprü geçiş cezası çıktı. Takımından 25 TL eksildi.',
    effectType: 'lose_bp',
    value: 25,
  },
  {
    id: 'ceza-trafik-25',
    title: 'Trafik Cezası (-25 TL)',
    kind: 'ceza',
    description: 'Eyvah! Şehir içinde trafik cezası çıktı. Takımından 25 TL eksildi.',
    effectType: 'lose_bp',
    value: 25,
  },
  {
    id: 'ceza-belediye-vergisi-25',
    title: 'Park Cezası (-25 TL)',
    kind: 'ceza',
    description: 'Eyvah! Hatalı park cezası çıktı. Takımından 25 TL eksildi.',
    effectType: 'lose_bp',
    value: 25,
  },
];

export const SOZ_SANATLARI_SUMMARY = [
  {
    group: 'Söz Sanatları · 1. Bölüm',
    name: '1. Benzetme',
    rule: 'Sözün etkisini arttırmak veya anlatımı güçlendirmek için aralarında ilgi bulunan iki kavram ya da varlıktan, zayıf olanın güçlü olana benzetilmesidir.',
    example: 'Yaptığı poğaçalar kaya gibi sert olmuştu. / Babaannemin pamuk gibi yumuşacık elleri vardı.',
  },
  {
    group: 'Benzetme Ögeleri · 1. ve 2. Öge',
    name: 'Benzeyen ve Kendisine Benzetilen',
    rule: 'Benzetmede zayıf olan öge "benzeyen", güçlü olan öge "kendisine benzetilen"dir. Benzetmenin olabilmesi için dört unsurun tamamının olmasına gerek yoktur.',
    example: 'Ayşe teyzenin zeytin gibi simsiyah gözleri vardı. (Benzeyen: Ayşe teyzenin gözleri · Kendisine Benzetilen: zeytin)',
  },
  {
    group: 'Benzetme Ögeleri · 3. ve 4. Öge',
    name: 'Benzetme Yönü ve Benzetme Edatı',
    rule: 'İki varlık arasındaki ortak özellik "benzetme yönü", benzetme ilgisi kuran sözcük ise "benzetme edatı"dır.',
    example: 'Kaya gibi sağlam bir bisiklet almış kardeşine. (Benzetme Yönü: sağlamlık · Benzetme Edatı: gibi)',
  },
  {
    group: 'Söz Sanatları · 2. Bölüm',
    name: '2. Kişileştirme',
    rule: 'İnsan dışındaki canlı ve cansız varlıklara insana ait özelliklerin verilmesiyle yapılan söz sanatıdır.',
    example: 'Güneş, bu sabah sımsıcak gülümsüyordu bizlere. / Kalemim dertli dertli bana bakıyor.',
  },
];

export const FIILDE_CATI_SUMMARY = SOZ_SANATLARI_SUMMARY;
