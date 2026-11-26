import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import {
  BENZETME_ACTIVITY_A,
  BENZETME_ELEMENTS_ACTIVITY_D,
  BENZETME_FOUR_ELEMENTS_SLIDE,
  BENZETME_SLIDE,
  evaluateCheckboxActivity,
  evaluateElementsTableActivity,
  getNextLessonTopic,
  getPrevLessonTopic,
  KISILESTIRME_ACTIVITY_B,
  KISILESTIRME_SLIDE,
  LESSON_TOPICS,
} from './lessonData';

test('1. Benzetme slide matches user uploaded definition and all 7 sentences verbatim', () => {
  assert.equal(BENZETME_SLIDE.title, '1. Benzetme');
  assert.equal(
    BENZETME_SLIDE.definition,
    'Sözün etkisini arttırmak veya anlatımı güçlendirmek için aralarında ilgi bulunan iki kavram ya da varlıktan, zayıf olanın güçlü olana benzetilmesidir.'
  );
  assert.deepEqual(
    BENZETME_SLIDE.examples.map((e) => e.sentence),
    [
      'Yaptığı poğaçalar kaya gibi sert olmuştu.',
      'Küçük kızın denizi andıran gözleri buğulanmıştı.',
      'Kuru bir yaprak gibi savruluyoruz.',
      'Ahmet, tilki gibi kurnaz bir çocuktur.',
      'Babaannemin pamuk gibi yumuşacık elleri vardı.',
      'Bu köy cennet gibi bir yerdi.',
      'Karınca gibi çalışkan olanlar mükâfatını alır.',
    ]
  );
});

test('Benzetmenin Dört Ögesi slide matches both analyzed examples and important note verbatim', () => {
  assert.equal(BENZETME_FOUR_ELEMENTS_SLIDE.title, 'Benzetmenin dört ögesi vardır:');
  assert.equal(
    BENZETME_FOUR_ELEMENTS_SLIDE.importantNote,
    'Benzetmenin olabilmesi için bu dört unsurun tamamının olmasına gerek yoktur.'
  );
  assert.equal(BENZETME_FOUR_ELEMENTS_SLIDE.examples.length, 2);

  const [ex1, ex2] = BENZETME_FOUR_ELEMENTS_SLIDE.examples;
  assert.equal(ex1.sentence, 'Ayşe teyzenin zeytin gibi simsiyah gözleri vardı.');
  assert.equal(
    ex1.segments.map((s) => s.text).join(''),
    ex1.sentence,
    'Highlighted segments must reconstruct exact sentence 01'
  );
  assert.deepEqual(ex1.elements, {
    benzeyen: 'Ayşe teyzenin gözleri',
    kendisine_benzetilen: 'zeytin',
    benzetme_yonu: 'simsiyah',
    benzetme_edati: 'gibi',
  });

  assert.equal(ex2.sentence, 'Kaya gibi sağlam bir bisiklet almış kardeşine.');
  assert.equal(
    ex2.segments.map((s) => s.text).join(''),
    ex2.sentence,
    'Highlighted segments must reconstruct exact sentence 02'
  );
  assert.deepEqual(ex2.elements, {
    benzeyen: 'bisiklet',
    kendisine_benzetilen: 'kaya',
    benzetme_yonu: 'sağlamlık',
    benzetme_edati: 'gibi',
  });
});

test('2. Kişileştirme slide matches user uploaded definition and all 8 sentences verbatim', () => {
  assert.equal(KISILESTIRME_SLIDE.title, '2. Kişileştirme');
  assert.equal(
    KISILESTIRME_SLIDE.definition,
    'İnsan dışındaki canlı ve cansız varlıklara insana ait özelliklerin verilmesiyle yapılan söz sanatıdır.'
  );
  assert.deepEqual(
    KISILESTIRME_SLIDE.examples.map((e) => e.sentence),
    [
      'Güneş, bu sabah sımsıcak gülümsüyordu bizlere.',
      'Küçük serçenin neşeli şarkıları her sabah beni dinlendirir.',
      'Yağmurun yağmasıyla toprağın sevinci katlandı.',
      'Yaşlı ve yorgun dere artık köyümüzü terk ediyordu.',
      'Aynalar yüzüme dik dik bakmayın.',
      'Güneş tüm doğaya selam verdi.',
      'Bahçedeki tüm çiçekler hasretle yolunu gözlüyordu.',
      'Kalemim dertli dertli bana bakıyor.',
    ]
  );
});

test('lesson topic navigation helpers traverse 3 slides cleanly', () => {
  assert.equal(LESSON_TOPICS.length, 3);
  assert.equal(getPrevLessonTopic('benzetme'), null);
  assert.equal(getNextLessonTopic('benzetme'), 'benzetme_ogeleri');
  assert.equal(getPrevLessonTopic('benzetme_ogeleri'), 'benzetme');
  assert.equal(getNextLessonTopic('benzetme_ogeleri'), 'kisilestirme');
  assert.equal(getPrevLessonTopic('kisilestirme'), 'benzetme_ogeleri');
  assert.equal(getNextLessonTopic('kisilestirme'), null);
});

test('all 17 lesson examples have custom illustrations in public/assets/lesson and 5th-grade explanations', () => {
  const allExamples = [
    ...BENZETME_SLIDE.examples,
    ...BENZETME_FOUR_ELEMENTS_SLIDE.examples,
    ...KISILESTIRME_SLIDE.examples,
  ];
  assert.equal(allExamples.length, 17);
  for (const ex of allExamples) {
    assert.ok(ex.imagePath.startsWith('/assets/lesson/'), `Expected /assets/lesson/ path for ${ex.sentence}`);
    assert.ok(ex.imageAlt.trim().length > 5, `Expected descriptive imageAlt for ${ex.sentence}`);
    assert.ok(ex.kidExplanation.trim().length > 10, `Expected kidExplanation for ${ex.sentence}`);
    const filePath = join(process.cwd(), 'public', ex.imagePath.replace(/^\//, ''));
    assert.equal(existsSync(filePath), true, `Missing illustration file: ${filePath}`);
  }
});

test('Etkinlik A (Benzetme) has all 8 sentences and exact correct numbers 1,2,4,5,6,8', () => {
  assert.equal(BENZETME_ACTIVITY_A.items.length, 8);
  assert.deepEqual(
    BENZETME_ACTIVITY_A.items.filter((i) => i.isCorrect).map((i) => i.number),
    [1, 2, 4, 5, 6, 8]
  );
  const perfect = evaluateCheckboxActivity(BENZETME_ACTIVITY_A.items, [1, 2, 4, 5, 6, 8]);
  assert.equal(perfect.correctCount, 8);
  assert.equal(perfect.isPerfect, true);
});

test('Etkinlik D (Benzetme Unsurları Tablosu) matches exact 7-row answer key', () => {
  assert.equal(BENZETME_ELEMENTS_ACTIVITY_D.rows.length, 7);
  assert.deepEqual(
    BENZETME_ELEMENTS_ACTIVITY_D.rows.map((r) => [r.benzeyen, r.benzetilen]),
    [
      ['bulutlar', 'pamuk'],
      ['zaman', 'su'],
      ['Leman’ın kaşları', 'kalem'],
      ['ayaklar', 'davul'],
      ['ben', 'ceviz ağacı'],
      ['gencin kalbi', 'taş'],
      ['ayaklar', 'palet'],
    ]
  );
  const res = evaluateElementsTableActivity(BENZETME_ELEMENTS_ACTIVITY_D.rows, {
    1: { benzeyen: 'bulutlar', benzetilen: 'pamuk' },
    2: { benzeyen: 'zaman', benzetilen: 'su' },
    3: { benzeyen: 'Leman’ın kaşları', benzetilen: 'kalem' },
    4: { benzeyen: 'ayaklar', benzetilen: 'davul' },
    5: { benzeyen: 'ben', benzetilen: 'ceviz ağacı' },
    6: { benzeyen: 'gencin kalbi', benzetilen: 'taş' },
    7: { benzeyen: 'ayaklar', benzetilen: 'palet' },
  });
  assert.equal(res.correctCells, 14);
  assert.equal(res.totalCells, 14);
  assert.equal(res.isPerfect, true);
});

test('Etkinlik B (Kişileştirme) has all 8 sentences and exact correct numbers 1,2,4,7', () => {
  assert.equal(KISILESTIRME_ACTIVITY_B.items.length, 8);
  assert.deepEqual(
    KISILESTIRME_ACTIVITY_B.items.filter((i) => i.isCorrect).map((i) => i.number),
    [1, 2, 4, 7]
  );
  const perfect = evaluateCheckboxActivity(KISILESTIRME_ACTIVITY_B.items, [1, 2, 4, 7]);
  assert.equal(perfect.correctCount, 8);
  assert.equal(perfect.isPerfect, true);
});
