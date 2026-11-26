export type LessonTopicId = 'benzetme' | 'benzetme_ogeleri' | 'kisilestirme';

export type BenzetmeElementKey =
  | 'benzeyen'
  | 'kendisine_benzetilen'
  | 'benzetme_yonu'
  | 'benzetme_edati';

export interface BenzetmeExampleItem {
  number: string;
  sentence: string;
  imagePath: string;
  imageAlt: string;
  kidExplanation: string;
  benzeyen: string;
  kendisineBenzetilen: string;
  benzetmeYonu: string;
  benzetmeEdati: string;
}

export interface FourElementsExample {
  number: string;
  sentence: string;
  imagePath: string;
  imageAlt: string;
  kidExplanation: string;
  segments: {
    text: string;
    element?: BenzetmeElementKey;
  }[];
  elements: Record<BenzetmeElementKey, string>;
}

export interface KisilestirmeExampleItem {
  number: string;
  sentence: string;
  imagePath: string;
  imageAlt: string;
  kidExplanation: string;
  varlik: string;
  insanOzelligi: string;
}

export interface LessonSlideMeta {
  id: LessonTopicId;
  stepNumber: number;
  shortLabel: string;
  title: string;
  subtitle: string;
  accentHex: string;
  accentSoftBg: string;
  accentBorder: string;
}

export const LESSON_TOPICS: LessonSlideMeta[] = [
  {
    id: 'benzetme',
    stepNumber: 1,
    shortLabel: '1. Benzetme',
    title: '1. Benzetme',
    subtitle: 'Bir varlığı başka bir varlığa benzetmek',
    accentHex: '#6d44a6',
    accentSoftBg: '#f5f0fb',
    accentBorder: '#d8c7ef',
  },
  {
    id: 'benzetme_ogeleri',
    stepNumber: 2,
    shortLabel: 'Benzetmenin 4 Ögesi',
    title: 'Benzetmenin dört ögesi vardır:',
    subtitle: 'Benzeyen, benzetilen, yön ve edat',
    accentHex: '#0d94b2',
    accentSoftBg: '#eef8fb',
    accentBorder: '#bae3ee',
  },
  {
    id: 'kisilestirme',
    stepNumber: 3,
    shortLabel: '2. Kişileştirme',
    title: '2. Kişileştirme',
    subtitle: 'İnsan dışındaki varlıklara insan özelliği vermek',
    accentHex: '#d81b75',
    accentSoftBg: '#fdf0f6',
    accentBorder: '#f2bfd8',
  },
];

export const BENZETME_ELEMENT_LABELS: Record<
  BenzetmeElementKey,
  {
    label: string;
    questionHint: string;
    colorHex: string;
    bgHex: string;
    borderHex: string;
    hint: string;
  }
> = {
  benzeyen: {
    label: 'Benzeyen',
    questionHint: 'Neyi benzettik?',
    colorHex: '#6d44a6',
    bgHex: '#f5f0fb',
    borderHex: '#cdb6ec',
    hint: 'Özelliği daha az olan varlık',
  },
  kendisine_benzetilen: {
    label: 'Kendisine Benzetilen',
    questionHint: 'Neye benzettik?',
    colorHex: '#d81b75',
    bgHex: '#fdf0f6',
    borderHex: '#f0b6d3',
    hint: 'Özelliği çok güçlü olan varlık',
  },
  benzetme_yonu: {
    label: 'Benzetme Yönü',
    questionHint: 'Hangi özelliği benziyor?',
    colorHex: '#0d94b2',
    bgHex: '#eef8fb',
    borderHex: '#a9dce9',
    hint: 'İki varlığın ortak özelliği',
  },
  benzetme_edati: {
    label: 'Benzetme Edatı',
    questionHint: 'Hangi kelimeyle benzettik?',
    colorHex: '#c96210',
    bgHex: '#fff5ec',
    borderHex: '#f4cba3',
    hint: 'Benzetmeyi kuran kelime (gibi, kadar vb.)',
  },
};

export const BENZETME_SLIDE = {
  title: '1. Benzetme',
  definition:
    'Sözün etkisini arttırmak veya anlatımı güçlendirmek için aralarında ilgi bulunan iki kavram ya da varlıktan, zayıf olanın güçlü olana benzetilmesidir.',
  kidSummary:
    'Kısaca: Bir şeyin özelliğini daha iyi anlatmak için onu o özelliği çok güçlü olan başka bir şeye benzetiriz.',
  examples: [
    {
      number: '01',
      sentence: 'Yaptığı poğaçalar kaya gibi sert olmuştu.',
      imagePath: '/assets/lesson/pogaca_kaya.jpg',
      imageAlt: 'Kaya gibi çok sert olmuş poğaçalar çizimi',
      kidExplanation: 'Poğaçalar çok sert olduğu için sertliğiyle bilinen kayaya benzetilmiştir.',
      benzeyen: 'poğaçalar',
      kendisineBenzetilen: 'kaya',
      benzetmeYonu: 'sert',
      benzetmeEdati: 'gibi',
    },
    {
      number: '02',
      sentence: 'Küçük kızın denizi andıran gözleri buğulanmıştı.',
      imagePath: '/assets/lesson/deniz_gozler.jpg',
      imageAlt: 'Mavi denizi andıran gözlü küçük kız çizimi',
      kidExplanation: 'Küçük kızın mavi ve derin gözleri uçsuz bucaksız denize benzetilmiştir.',
      benzeyen: 'gözleri',
      kendisineBenzetilen: 'deniz',
      benzetmeYonu: 'rengi / derinliği',
      benzetmeEdati: 'andıran',
    },
    {
      number: '03',
      sentence: 'Kuru bir yaprak gibi savruluyoruz.',
      imagePath: '/assets/lesson/kuru_yaprak.jpg',
      imageAlt: 'Rüzgârda savrulan kuru sonbahar yaprağı çizimi',
      kidExplanation: 'Rüzgârda bir oraya bir buraya savrulma durumu kuru bir yaprağa benzetilmiştir.',
      benzeyen: 'biz',
      kendisineBenzetilen: 'kuru bir yaprak',
      benzetmeYonu: 'savrulmak',
      benzetmeEdati: 'gibi',
    },
    {
      number: '04',
      sentence: 'Ahmet, tilki gibi kurnaz bir çocuktur.',
      imagePath: '/assets/lesson/tilki_kurnaz.jpg',
      imageAlt: 'Kurnaz tilki gibi düşünen Ahmet çizimi',
      kidExplanation: 'Ahmet’in kurnaz ve zeki olması, kurnazlığıyla ünlü tilkiye benzetilmiştir.',
      benzeyen: 'Ahmet',
      kendisineBenzetilen: 'tilki',
      benzetmeYonu: 'kurnaz',
      benzetmeEdati: 'gibi',
    },
    {
      number: '05',
      sentence: 'Babaannemin pamuk gibi yumuşacık elleri vardı.',
      imagePath: '/assets/lesson/pamuk_eller.jpg',
      imageAlt: 'Pamuk gibi yumuşacık babaanne elleri çizimi',
      kidExplanation: 'Babaannenin sıcacık ve yumuşacık elleri yumuşak pamuğa benzetilmiştir.',
      benzeyen: 'babaannemin elleri',
      kendisineBenzetilen: 'pamuk',
      benzetmeYonu: 'yumuşacık',
      benzetmeEdati: 'gibi',
    },
    {
      number: '06',
      sentence: 'Bu köy cennet gibi bir yerdi.',
      imagePath: '/assets/lesson/cennet_koy.jpg',
      imageAlt: 'Çiçekli, yemyeşil ve huzurlu köy çizimi',
      kidExplanation: 'Köyün eşsiz güzelliği ve huzuru cennete benzetilmiştir.',
      benzeyen: 'bu köy',
      kendisineBenzetilen: 'cennet',
      benzetmeYonu: 'güzelliği / huzuru',
      benzetmeEdati: 'gibi',
    },
    {
      number: '07',
      sentence: 'Karınca gibi çalışkan olanlar mükâfatını alır.',
      imagePath: '/assets/lesson/karinca_caliskan.jpg',
      imageAlt: 'Durmadan çalışan karıncalar çizimi',
      kidExplanation: 'Çok çalışan insanlar, durmadan çalışan karıncalara benzetilmiştir.',
      benzeyen: 'çalışkan olanlar',
      kendisineBenzetilen: 'karınca',
      benzetmeYonu: 'çalışkan',
      benzetmeEdati: 'gibi',
    },
  ] as BenzetmeExampleItem[],
};

export const BENZETME_FOUR_ELEMENTS_SLIDE = {
  title: 'Benzetmenin dört ögesi vardır:',
  importantNote:
    'Benzetmenin olabilmesi için bu dört unsurun tamamının olmasına gerek yoktur.',
  examples: [
    {
      number: '01',
      sentence: 'Ayşe teyzenin zeytin gibi simsiyah gözleri vardı.',
      imagePath: '/assets/lesson/zeytin_gozler.jpg',
      imageAlt: 'Zeytin gibi simsiyah gözleri olan güler yüzlü Ayşe teyze çizimi',
      kidExplanation: 'Ayşe teyzenin gözleri siyah ve parlak olduğu için zeytine benzetilmiştir.',
      segments: [
        { text: 'Ayşe teyzenin', element: 'benzeyen' },
        { text: ' ' },
        { text: 'zeytin', element: 'kendisine_benzetilen' },
        { text: ' ' },
        { text: 'gibi', element: 'benzetme_edati' },
        { text: ' ' },
        { text: 'simsiyah', element: 'benzetme_yonu' },
        { text: ' ' },
        { text: 'gözleri', element: 'benzeyen' },
        { text: ' vardı.' },
      ],
      elements: {
        benzeyen: 'Ayşe teyzenin gözleri',
        kendisine_benzetilen: 'zeytin',
        benzetme_yonu: 'simsiyah',
        benzetme_edati: 'gibi',
      },
    },
    {
      number: '02',
      sentence: 'Kaya gibi sağlam bir bisiklet almış kardeşine.',
      imagePath: '/assets/lesson/kaya_bisiklet.jpg',
      imageAlt: 'Kaya gibi sağlam bisiklete binen mutlu çocuk çizimi',
      kidExplanation: 'Bisiklet çok dayanıklı olduğu için sağlamlığıyla bilinen kayaya benzetilmiştir.',
      segments: [
        { text: 'Kaya', element: 'kendisine_benzetilen' },
        { text: ' ' },
        { text: 'gibi', element: 'benzetme_edati' },
        { text: ' ' },
        { text: 'sağlam', element: 'benzetme_yonu' },
        { text: ' bir ' },
        { text: 'bisiklet', element: 'benzeyen' },
        { text: ' almış kardeşine.' },
      ],
      elements: {
        benzeyen: 'bisiklet',
        kendisine_benzetilen: 'kaya',
        benzetme_yonu: 'sağlamlık',
        benzetme_edati: 'gibi',
      },
    },
  ] as FourElementsExample[],
};

export const KISILESTIRME_SLIDE = {
  title: '2. Kişileştirme',
  definition:
    'İnsan dışındaki canlı ve cansız varlıklara insana ait özelliklerin verilmesiyle yapılan söz sanatıdır.',
  kidSummary:
    'Kısaca: Güneş, çiçek, kalem, hayvan gibi insan dışındaki varlıklara tıpkı bir insanmış gibi gülme, sevinme, üzülme, selam verme özellikleri vermektir.',
  examples: [
    {
      number: '01',
      sentence: 'Güneş, bu sabah sımsıcak gülümsüyordu bizlere.',
      imagePath: '/assets/lesson/gulumseyen_gunes.jpg',
      imageAlt: 'Sabah gökyüzünde sımsıcak gülümseyen güneş çizimi',
      kidExplanation: 'Gülümsemek insanlara ait bir özelliktir; burada güneşe verilmiştir.',
      varlik: 'Güneş',
      insanOzelligi: 'gülümsemek',
    },
    {
      number: '02',
      sentence: 'Küçük serçenin neşeli şarkıları her sabah beni dinlendirir.',
      imagePath: '/assets/lesson/sarki_serce.jpg',
      imageAlt: 'Dalda neşeyle şarkı söyleyen küçük serçe çizimi',
      kidExplanation: 'Neşeli şarkılar söylemek insana ait bir özelliktir; küçük serçeye verilmiştir.',
      varlik: 'Küçük serçe',
      insanOzelligi: 'neşeli şarkılar söylemek',
    },
    {
      number: '03',
      sentence: 'Yağmurun yağmasıyla toprağın sevinci katlandı.',
      imagePath: '/assets/lesson/sevinen_toprak.jpg',
      imageAlt: 'Yağmurla birlikte sevinen ve çiçek açan toprak çizimi',
      kidExplanation: 'Sevinmek insanların duygusudur; yağmura kavuşan toprağa verilmiştir.',
      varlik: 'Toprak',
      insanOzelligi: 'sevinmek',
    },
    {
      number: '04',
      sentence: 'Yaşlı ve yorgun dere artık köyümüzü terk ediyordu.',
      imagePath: '/assets/lesson/yorgun_dere.jpg',
      imageAlt: 'Köyden yavaşça uzaklaşan yaşlı ve yorgun dere çizimi',
      kidExplanation: 'Yorulmak ve bir yeri terk etmek insan özelliğidir; burada dereye verilmiştir.',
      varlik: 'Dere',
      insanOzelligi: 'yaşlı ve yorgun olmak, terk etmek',
    },
    {
      number: '05',
      sentence: 'Aynalar yüzüme dik dik bakmayın.',
      imagePath: '/assets/lesson/bakan_ayna.jpg',
      imageAlt: 'Şaşkın ve ciddi bakışlı sihirli ayna çizimi',
      kidExplanation: 'Dik dik bakmak insan davranışıdır; cansız olan aynalara verilmiştir.',
      varlik: 'Aynalar',
      insanOzelligi: 'dik dik bakmak',
    },
    {
      number: '06',
      sentence: 'Güneş tüm doğaya selam verdi.',
      imagePath: '/assets/lesson/selam_gunes.jpg',
      imageAlt: 'Doğaya el sallayıp selam veren neşeli güneş çizimi',
      kidExplanation: 'Selam vermek insanlara özgüdür; burada güneşe bu özellik verilmiştir.',
      varlik: 'Güneş',
      insanOzelligi: 'selam vermek',
    },
    {
      number: '07',
      sentence: 'Bahçedeki tüm çiçekler hasretle yolunu gözlüyordu.',
      imagePath: '/assets/lesson/bekleyen_cicek.jpg',
      imageAlt: 'Bahçede özlemle yolu gözleyen sevimli çiçekler çizimi',
      kidExplanation: 'Özlem duymak ve birinin yolunu gözlemek insan özelliğidir; çiçeklere verilmiştir.',
      varlik: 'Çiçekler',
      insanOzelligi: 'hasretle yol gözlemek',
    },
    {
      number: '08',
      sentence: 'Kalemim dertli dertli bana bakıyor.',
      imagePath: '/assets/lesson/dertli_kalem.jpg',
      imageAlt: 'Defter üstünde üzgün ve dertli bakan kalem çizimi',
      kidExplanation: 'Dertli olmak ve üzgün bakmak insan özelliğidir; cansız kaleme verilmiştir.',
      varlik: 'Kalemim',
      insanOzelligi: 'dertli dertli bakmak',
    },
  ] as KisilestirmeExampleItem[],
};

export interface SentenceCheckActivityItem {
  number: number;
  sentence: string;
  isCorrect: boolean;
  explanation: string;
}

export interface SentenceCheckActivity {
  code: string;
  title: string;
  instruction: string;
  positiveLabel: string;
  negativeLabel: string;
  items: SentenceCheckActivityItem[];
}

export interface BenzetmeTableRow {
  number: number;
  sentence: string;
  benzeyen: string;
  benzetilen: string;
  acceptedBenzeyen: string[];
  acceptedBenzetilen: string[];
  explanation: string;
}

export interface BenzetmeElementsTableActivity {
  code: string;
  title: string;
  instruction: string;
  rows: BenzetmeTableRow[];
}

export const BENZETME_ACTIVITY_A: SentenceCheckActivity = {
  code: 'A',
  title: 'Benzetme Etkinliği',
  instruction: 'A) Aşağıdaki cümlelerden benzetme sanatı kullanılanları işaretleyiniz.',
  positiveLabel: 'Benzetme var',
  negativeLabel: 'Benzetme yok',
  items: [
    {
      number: 1,
      sentence: 'Sinirlenen adam aslan gibi kükredi.',
      isCorrect: true,
      explanation: 'Benzetme var: Sinirlenen adam, kükremesi yönüyle aslana benzetilmiştir.',
    },
    {
      number: 2,
      sentence: 'Güneş gibi parlayan saçlarıyla ortalıkta dolaşıyordu.',
      isCorrect: true,
      explanation: 'Benzetme var: Parlayan saçlar, parlaklığı yönüyle güneşe benzetilmiştir.',
    },
    {
      number: 3,
      sentence: 'Olanları duyunca ben de çok şaşırdım.',
      isCorrect: false,
      explanation: 'Benzetme yok: Sadece şaşırma duygusu anlatılmıştır.',
    },
    {
      number: 4,
      sentence: 'Denizi andıran gözleriyle onları süzdü.',
      isCorrect: true,
      explanation: 'Benzetme var: Gözler, rengi ve derinliği yönüyle denize benzetilmiştir.',
    },
    {
      number: 5,
      sentence: 'Pazardan aldığım biber zehir gibi acı çıktı.',
      isCorrect: true,
      explanation: 'Benzetme var: Biber, çok acı olması yönüyle zehire benzetilmiştir.',
    },
    {
      number: 6,
      sentence: 'Korkudan karşımda mum gibi durdu.',
      isCorrect: true,
      explanation: 'Benzetme var: Kıpırdamadan durması yönüyle muma benzetilmiştir.',
    },
    {
      number: 7,
      sentence: 'İki adım atacak hâli kalmamıştı.',
      isCorrect: false,
      explanation: 'Benzetme yok: Çok yorgun olma durumu anlatılmıştır.',
    },
    {
      number: 8,
      sentence: 'Kar manzarası, kartpostalı andırdı.',
      isCorrect: true,
      explanation: 'Benzetme var: Kar manzarası, güzelliği yönüyle kartpostala benzetilmiştir.',
    },
  ],
};

export const BENZETME_ELEMENTS_ACTIVITY_D: BenzetmeElementsTableActivity = {
  code: 'D',
  title: 'Benzetme Unsurları Tablosu',
  instruction: 'D) Aşağıdaki tabloda verilen cümlelerde benzetme unsurlarını yazınız.',
  rows: [
    {
      number: 1,
      sentence: 'Bulutlar pamuk gibi geçiyordu.',
      benzeyen: 'bulutlar',
      benzetilen: 'pamuk',
      acceptedBenzeyen: ['bulutlar', 'bulut'],
      acceptedBenzetilen: ['pamuk'],
      explanation: 'Bulutlar yumuşak görünüşüyle pamuğa benzetilmiştir.',
    },
    {
      number: 2,
      sentence: 'Zaman su gibi hızlı akıp geçti.',
      benzeyen: 'zaman',
      benzetilen: 'su',
      acceptedBenzeyen: ['zaman'],
      acceptedBenzetilen: ['su'],
      explanation: 'Zaman, hızlı akıp gitmesi yönüyle suya benzetilmiştir.',
    },
    {
      number: 3,
      sentence: 'Leman’ın kaşları kalemi andırıyordu.',
      benzeyen: 'Leman’ın kaşları',
      benzetilen: 'kalem',
      acceptedBenzeyen: ["leman'ın kaşları", 'lemanın kaşları', 'kaşları', 'kaşlar', 'kaş'],
      acceptedBenzetilen: ['kalem', 'kalemi'],
      explanation: 'Leman’ın kaşları ince ve düzgün şekliyle kaleme benzetilmiştir.',
    },
    {
      number: 4,
      sentence: 'Onu saatlerce beklemekten ayaklarım davul gibi şişti.',
      benzeyen: 'ayaklar',
      benzetilen: 'davul',
      acceptedBenzeyen: ['ayaklar', 'ayaklarım', 'ayak'],
      acceptedBenzetilen: ['davul'],
      explanation: 'Ayaklar, çok şişmesi yönüyle davula benzetilmiştir.',
    },
    {
      number: 5,
      sentence: 'Ben bir ceviz ağacıyım Gülhane Parkı’nda.',
      benzeyen: 'ben',
      benzetilen: 'ceviz ağacı',
      acceptedBenzeyen: ['ben', 'şair', 'insan'],
      acceptedBenzetilen: ['ceviz ağacı', 'bir ceviz ağacı', 'ceviz ağacıyım', 'ağaç'],
      explanation: 'Konuşan kişi (“ben”), kendisini bir ceviz ağacına benzetmiştir.',
    },
    {
      number: 6,
      sentence: 'Taş kalpli genç konuşmaya başladı.',
      benzeyen: 'gencin kalbi',
      benzetilen: 'taş',
      acceptedBenzeyen: ['gencin kalbi', 'kalp', 'kalbi', 'kalpli', 'genç'],
      acceptedBenzetilen: ['taş'],
      explanation: 'Gencin kalbi, sertliği ve acımasızlığı yönüyle taşa benzetilmiştir.',
    },
    {
      number: 7,
      sentence: 'Onun palet ayaklarına uygun ayakkabı bulamadık.',
      benzeyen: 'ayaklar',
      benzetilen: 'palet',
      acceptedBenzeyen: ['ayaklar', 'ayakları', 'onun ayakları', 'ayak', 'ayaklarına'],
      acceptedBenzetilen: ['palet'],
      explanation: 'Onun ayakları, büyük ve geniş olması yönüyle palete benzetilmiştir.',
    },
  ],
};

export const KISILESTIRME_ACTIVITY_B: SentenceCheckActivity = {
  code: 'B',
  title: 'Kişileştirme Etkinliği',
  instruction: 'B) Aşağıdaki cümlelerde kişileştirme bulunanları işaretleyiniz.',
  positiveLabel: 'Kişileştirme var',
  negativeLabel: 'Kişileştirme yok',
  items: [
    {
      number: 1,
      sentence: 'Sulanmayan çiçekler bize somurtmaya başladı.',
      isCorrect: true,
      explanation: 'Kişileştirme var: Somurtmak insana ait bir özelliktir, çiçeklere verilmiştir.',
    },
    {
      number: 2,
      sentence: 'Küçük kara balık neşe içinde yüzüyordu.',
      isCorrect: true,
      explanation: 'Kişileştirme var: Neşe içinde olmak insana ait bir duygudur, balığa verilmiştir.',
    },
    {
      number: 3,
      sentence: 'Sınıfa gelen öğrenci çantasını sıraya yerleştirdi.',
      isCorrect: false,
      explanation: 'Kişileştirme yok: Öğrenci zaten bir insandır.',
    },
    {
      number: 4,
      sentence: 'Gül ile bülbül gülümsüyorlardı birbirlerine.',
      isCorrect: true,
      explanation: 'Kişileştirme var: Gülümsemek insan özelliğidir; gül ve bülbüle verilmiştir.',
    },
    {
      number: 5,
      sentence: 'Sabahtan beri burada seni bekliyorum.',
      isCorrect: false,
      explanation: 'Kişileştirme yok: İnsana ait normal bir durum anlatılmıştır.',
    },
    {
      number: 6,
      sentence: 'Dün akşam sizi çok bekledik.',
      isCorrect: false,
      explanation: 'Kişileştirme yok: İnsana ait olağan bir eylemdir.',
    },
    {
      number: 7,
      sentence: 'Kirpi, sinsi sinsi gülmeye başladı.',
      isCorrect: true,
      explanation: 'Kişileştirme var: Sinsi sinsi gülmek insana özgüdür, kirpiye verilmiştir.',
    },
    {
      number: 8,
      sentence: 'Evden çıkarken televizyonu kapat.',
      isCorrect: false,
      explanation: 'Kişileştirme yok: Günlük bir hatırlatma cümlesidir.',
    },
  ],
};

export function normalizeTurkishAnswer(input: string): string {
  return input
    .toLocaleLowerCase('tr-TR')
    .replace(/[’`´]/g, "'")
    .replace(/[.,!?;:"()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function isElementAnswerMatch(input: string, accepted: string[]): boolean {
  const norm = normalizeTurkishAnswer(input);
  if (!norm) return false;
  const normNoApostrophe = norm.replace(/'/g, '');
  return accepted.some((candidate) => {
    const cNorm = normalizeTurkishAnswer(candidate);
    return norm === cNorm || normNoApostrophe === cNorm.replace(/'/g, '');
  });
}

export function evaluateCheckboxActivity(
  items: SentenceCheckActivityItem[],
  selectedNumbers: number[]
) {
  const selectedSet = new Set(selectedNumbers);
  const itemResults = items.map((item) => {
    const checked = selectedSet.has(item.number);
    const isMatched = checked === item.isCorrect;
    return {
      number: item.number,
      checked,
      expected: item.isCorrect,
      isMatched,
    };
  });
  const correctCount = itemResults.filter((r) => r.isMatched).length;
  return {
    correctCount,
    totalCount: items.length,
    isPerfect: correctCount === items.length,
    itemResults,
  };
}

export function evaluateElementsTableActivity(
  rows: BenzetmeTableRow[],
  entries: Record<number, { benzeyen: string; benzetilen: string }>
) {
  const rowResults = rows.map((row) => {
    const entry = entries[row.number] ?? { benzeyen: '', benzetilen: '' };
    const benzeyenOk = isElementAnswerMatch(entry.benzeyen, row.acceptedBenzeyen);
    const benzetilenOk = isElementAnswerMatch(entry.benzetilen, row.acceptedBenzetilen);
    return {
      number: row.number,
      benzeyenOk,
      benzetilenOk,
    };
  });
  const correctCells = rowResults.reduce(
    (sum, r) => sum + (r.benzeyenOk ? 1 : 0) + (r.benzetilenOk ? 1 : 0),
    0
  );
  const totalCells = rows.length * 2;
  return {
    correctCells,
    totalCells,
    isPerfect: correctCells === totalCells,
    rowResults,
  };
}

export function getNextLessonTopic(current: LessonTopicId): LessonTopicId | null {
  const idx = LESSON_TOPICS.findIndex((t) => t.id === current);
  if (idx < 0 || idx >= LESSON_TOPICS.length - 1) return null;
  return LESSON_TOPICS[idx + 1].id;
}

export function getPrevLessonTopic(current: LessonTopicId): LessonTopicId | null {
  const idx = LESSON_TOPICS.findIndex((t) => t.id === current);
  if (idx <= 0) return null;
  return LESSON_TOPICS[idx - 1].id;
}
