import { IOEQuestion } from '../../../src/shared/types/ioe.js';

export const INITIAL_SEED_QUESTIONS: IOEQuestion[] = [
  // 1. choice / single / text-options (Vocabulary & Grammar)
  {
    id: 'ioe-q-001',
    version: 1,
    grade: 5,
    cefrLevel: 'A1',
    skill: 'vocabulary',
    topic: 'School & Stationery',
    difficulty: 2,
    interaction: {
      family: 'choice',
      subtype: 'single',
      variant: 'text-options'
    },
    prompt: 'She needs a ______ to cut the coloured paper for her art project.',
    options: [
      { id: 'opt-a', label: 'A', text: 'ruler' },
      { id: 'opt-b', label: 'B', text: 'pair of scissors' },
      { id: 'opt-c', label: 'C', text: 'pencil case' },
      { id: 'opt-d', label: 'D', text: 'compass' }
    ],
    answer: {
      correctOptionId: 'opt-b',
      explanation: 'Để cắt giấy (cut the paper) trong giờ thủ công/mỹ thuật, ta dùng kéo ("a pair of scissors"). Ruler là thước kẻ, pencil case là hộp bút, compass là compa.',
      vietnameseMeaning: 'Cô ấy cần một chiếc kéo để cắt giấy màu cho dự án mỹ thuật.',
      pronunciationIpa: '/ˈsɪz.əz/'
    },
    source: {
      provider: 'wordnet',
      license: 'WordNet-3.0',
      provenance: 'Synset: scissors.n.01'
    },
    qualityStatus: 'approved',
    statistics: { attempts: 420, correctRate: 86.4, averageTimeMs: 6500 },
    createdAt: '2026-08-15T08:00:00.000Z',
    updatedAt: '2026-08-15T08:00:00.000Z',
    approvedBy: 'teacher-master'
  },
  {
    id: 'ioe-q-002',
    version: 1,
    grade: 5,
    cefrLevel: 'A1',
    skill: 'grammar',
    topic: 'Past Simple Tense',
    grammarPoint: 'Irregular verbs in past simple',
    difficulty: 2,
    interaction: {
      family: 'choice',
      subtype: 'single',
      variant: 'text-options'
    },
    prompt: 'Yesterday, my family ______ to Ha Long Bay by coach.',
    options: [
      { id: 'opt-a', label: 'A', text: 'go' },
      { id: 'opt-b', label: 'B', text: 'went' },
      { id: 'opt-c', label: 'C', text: 'gone' },
      { id: 'opt-d', label: 'D', text: 'goes' }
    ],
    answer: {
      correctOptionId: 'opt-b',
      explanation: 'Trạng từ thời gian "Yesterday" (hôm qua) chỉ hành động đã xảy ra trong quá khứ đơn, động từ bất quy tắc "go" chuyển thành "went".',
      vietnameseMeaning: 'Hôm qua, gia đình tôi đã đi vịnh Hạ Long bằng xe khách.'
    },
    source: {
      provider: 'tatoeba',
      license: 'CC-BY 2.0 FR',
      provenance: 'Tatoeba sentence 482191'
    },
    qualityStatus: 'approved',
    statistics: { attempts: 512, correctRate: 91.2, averageTimeMs: 5200 },
    createdAt: '2026-08-15T08:00:00.000Z',
    updatedAt: '2026-08-15T08:00:00.000Z',
    approvedBy: 'teacher-master'
  },

  // 2. choice / single / image-options
  {
    id: 'ioe-q-003',
    version: 1,
    grade: 4,
    cefrLevel: 'A1',
    skill: 'vocabulary',
    topic: 'Animals',
    difficulty: 1,
    interaction: {
      family: 'choice',
      subtype: 'single',
      variant: 'image-options'
    },
    prompt: 'Which animal has a very long neck and eats leaves from tall trees?',
    options: [
      { id: 'opt-a', label: 'A', text: 'Giraffe', imageUrl: 'https://images.unsplash.com/photo-1538099130811-745e64318258?w=300' },
      { id: 'opt-b', label: 'B', text: 'Elephant', imageUrl: 'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?w=300' },
      { id: 'opt-c', label: 'C', text: 'Zebra', imageUrl: 'https://images.unsplash.com/photo-1526095179574-86e545346ae6?w=300' },
      { id: 'opt-d', label: 'D', text: 'Lion', imageUrl: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=300' }
    ],
    answer: {
      correctOptionId: 'opt-a',
      explanation: 'Hươu cao cổ (Giraffe) có chiếc cổ rất dài (very long neck) để ăn lá từ các cây cao.',
      vietnameseMeaning: 'Động vật nào có chiếc cổ rất dài và ăn lá cây trên cao? -> Hươu cao cổ.'
    },
    source: {
      provider: 'wordnet',
      license: 'WordNet-3.0',
      provenance: 'Synset: giraffe.n.01'
    },
    qualityStatus: 'approved',
    statistics: { attempts: 380, correctRate: 95.0, averageTimeMs: 4300 },
    createdAt: '2026-08-15T08:00:00.000Z',
    updatedAt: '2026-08-15T08:00:00.000Z',
    approvedBy: 'teacher-master'
  },

  // 3. text-entry / short-answer / missing-letters (Classic IOE Fill-In-The-Missing-Letter)
  {
    id: 'ioe-q-004',
    version: 1,
    grade: 5,
    cefrLevel: 'A1',
    skill: 'vocabulary',
    topic: 'Occupations',
    difficulty: 2,
    interaction: {
      family: 'text-entry',
      subtype: 'missing-letters',
      variant: 'single-word'
    },
    prompt: 'Fill in the missing letters to complete the word for someone who takes care of people’s teeth:',
    missingLetterPattern: 'd _ n t _ s t',
    answer: {
      acceptedAnswers: ['dentist', 'e, i', 'e i', 'ei'],
      explanation: 'Từ hoàn chỉnh là "DENTIST" (Nha sĩ / Bác sĩ răng hàm mặt). Các chữ cái còn thiếu là "e" và "i".',
      vietnameseMeaning: 'Nha sĩ (người chăm sóc răng miệng).'
    },
    source: {
      provider: 'datamuse',
      license: 'Public Domain',
      provenance: 'Datamuse spelling pattern d?nt?st'
    },
    qualityStatus: 'approved',
    statistics: { attempts: 490, correctRate: 84.2, averageTimeMs: 7800 },
    createdAt: '2026-08-15T08:00:00.000Z',
    updatedAt: '2026-08-15T08:00:00.000Z',
    approvedBy: 'teacher-master'
  },
  {
    id: 'ioe-q-005',
    version: 1,
    grade: 4,
    cefrLevel: 'A1',
    skill: 'vocabulary',
    topic: 'Days of the week',
    difficulty: 2,
    interaction: {
      family: 'text-entry',
      subtype: 'missing-letters',
      variant: 'single-word'
    },
    prompt: 'Fill in the missing letters to complete the day between Tuesday and Thursday:',
    missingLetterPattern: 'W e d n _ s d _ y',
    answer: {
      acceptedAnswers: ['wednesday', 'e, a', 'e a', 'ea'],
      explanation: 'Thứ Tư trong tiếng Anh là "Wednesday". Các chữ cái còn thiếu là "e" và "a".',
      vietnameseMeaning: 'Thứ Tư'
    },
    source: {
      provider: 'dictionary',
      license: 'Free Dictionary API License',
      provenance: 'Entry: Wednesday'
    },
    qualityStatus: 'approved',
    statistics: { attempts: 360, correctRate: 88.0, averageTimeMs: 6200 },
    createdAt: '2026-08-15T08:00:00.000Z',
    updatedAt: '2026-08-15T08:00:00.000Z',
    approvedBy: 'teacher-master'
  },

  // 4. text-entry / short-answer / single-input (Điền một từ thích hợp)
  {
    id: 'ioe-q-006',
    version: 1,
    grade: 5,
    cefrLevel: 'A1',
    skill: 'grammar',
    topic: 'Prepositions of Time',
    difficulty: 2,
    interaction: {
      family: 'text-entry',
      subtype: 'short-answer',
      variant: 'single-input'
    },
    prompt: 'My school starts ______ 7:15 every morning.',
    answer: {
      acceptedAnswers: ['at'],
      explanation: 'Ta dùng giới từ "at" trước các mốc thời gian cụ thể (ví dụ: at 7:15, at 8 o\'clock).',
      vietnameseMeaning: 'Trường học của tôi bắt đầu vào lúc 7 giờ 15 mỗi buổi sáng.'
    },
    source: {
      provider: 'manual',
      license: 'CC0',
      provenance: 'IOE Standard Grade 5 Grammar Set'
    },
    qualityStatus: 'approved',
    statistics: { attempts: 600, correctRate: 93.5, averageTimeMs: 4100 },
    createdAt: '2026-08-15T08:00:00.000Z',
    updatedAt: '2026-08-15T08:00:00.000Z',
    approvedBy: 'teacher-master'
  },
  {
    id: 'ioe-q-007',
    version: 1,
    grade: 5,
    cefrLevel: 'A1',
    skill: 'grammar',
    topic: 'Wh- Questions',
    difficulty: 2,
    interaction: {
      family: 'text-entry',
      subtype: 'short-answer',
      variant: 'single-input'
    },
    prompt: '______ is the weather like in Hanoi today? - It is sunny and warm.',
    answer: {
      acceptedAnswers: ['what'],
      explanation: 'Cấu trúc hỏi thời tiết: "What is the weather like...?" hoặc "How is the weather...?". Ở đây có từ "like" ở cuối nên phải dùng "What".',
      vietnameseMeaning: 'Thời tiết ở Hà Nội hôm nay như thế nào? - Trời nắng và ấm áp.'
    },
    source: {
      provider: 'tatoeba',
      license: 'CC-BY',
      provenance: 'Tatoeba English sentence'
    },
    qualityStatus: 'approved',
    statistics: { attempts: 450, correctRate: 89.2, averageTimeMs: 5100 },
    createdAt: '2026-08-15T08:00:00.000Z',
    updatedAt: '2026-08-15T08:00:00.000Z',
    approvedBy: 'teacher-master'
  },

  // 5. ordering / tokens / sentence (Sắp xếp từ thành câu hoàn chỉnh)
  {
    id: 'ioe-q-008',
    version: 1,
    grade: 5,
    cefrLevel: 'A1',
    skill: 'grammar',
    topic: 'Sentence Reordering',
    difficulty: 3,
    interaction: {
      family: 'ordering',
      subtype: 'tokens',
      variant: 'sentence'
    },
    prompt: 'Reorder the words to form a correct English sentence:',
    tokens: [
      { id: 'tok-1', text: 'How' },
      { id: 'tok-2', text: 'often' },
      { id: 'tok-3', text: 'do' },
      { id: 'tok-4', text: 'you' },
      { id: 'tok-5', text: 'brush' },
      { id: 'tok-6', text: 'your' },
      { id: 'tok-7', text: 'teeth?' }
    ],
    answer: {
      orderedTokenIds: ['tok-1', 'tok-2', 'tok-3', 'tok-4', 'tok-5', 'tok-6', 'tok-7'],
      acceptedAnswers: ['How often do you brush your teeth?'],
      explanation: 'Cấu trúc câu hỏi tần suất: How often + do/does + S + V(nguyên mẫu) + O?',
      vietnameseMeaning: 'Bạn đánh răng thường xuyên như thế nào (mấy lần một ngày)?'
    },
    source: {
      provider: 'tatoeba',
      license: 'CC-BY',
      provenance: 'Tatoeba corpus'
    },
    qualityStatus: 'approved',
    statistics: { attempts: 310, correctRate: 79.5, averageTimeMs: 11200 },
    createdAt: '2026-08-15T08:00:00.000Z',
    updatedAt: '2026-08-15T08:00:00.000Z',
    approvedBy: 'teacher-master'
  },
  {
    id: 'ioe-q-009',
    version: 1,
    grade: 6,
    cefrLevel: 'A2',
    skill: 'grammar',
    topic: 'Comparative Adjectives',
    difficulty: 3,
    interaction: {
      family: 'ordering',
      subtype: 'tokens',
      variant: 'sentence'
    },
    prompt: 'Reorder the words to make a meaningful comparative sentence:',
    tokens: [
      { id: 'tok-a', text: 'Living' },
      { id: 'tok-b', text: 'in' },
      { id: 'tok-c', text: 'the' },
      { id: 'tok-d', text: 'city' },
      { id: 'tok-e', text: 'is' },
      { id: 'tok-f', text: 'more' },
      { id: 'tok-g', text: 'convenient' },
      { id: 'tok-h', text: 'than' },
      { id: 'tok-i', text: 'the' },
      { id: 'tok-j', text: 'countryside.' }
    ],
    answer: {
      orderedTokenIds: ['tok-a', 'tok-b', 'tok-c', 'tok-d', 'tok-e', 'tok-f', 'tok-g', 'tok-h', 'tok-i', 'tok-j'],
      acceptedAnswers: ['Living in the city is more convenient than the countryside.'],
      explanation: 'Cấu trúc so sánh hơn với tính từ dài: S + is/are + more + Adj + than + ... ("convenient" là tính từ 3 âm tiết -> more convenient).',
      vietnameseMeaning: 'Sống ở thành phố tiện lợi hơn ở nông thôn.'
    },
    source: {
      provider: 'manual',
      license: 'CC0',
      provenance: 'Grade 6 English Curriculum'
    },
    qualityStatus: 'approved',
    statistics: { attempts: 240, correctRate: 74.0, averageTimeMs: 14500 },
    createdAt: '2026-08-15T08:00:00.000Z',
    updatedAt: '2026-08-15T08:00:00.000Z',
    approvedBy: 'teacher-master'
  },

  // 6. matching / pairs / text-text (Nối từ với định nghĩa / nghĩa tiếng Việt)
  {
    id: 'ioe-q-010',
    version: 1,
    grade: 5,
    cefrLevel: 'A1',
    skill: 'vocabulary',
    topic: 'Places in Town',
    difficulty: 3,
    interaction: {
      family: 'matching',
      subtype: 'pairs',
      variant: 'text-text'
    },
    prompt: 'Match each place in the left column with its correct description on the right:',
    matchingPairs: [
      { id: 'pair-1', leftId: 'L1', leftText: 'Bakery', rightId: 'R1', rightText: 'A shop where bread and cakes are baked and sold' },
      { id: 'pair-2', leftId: 'L2', leftText: 'Pharmacy', rightId: 'R2', rightText: 'A store where you can buy medicine' },
      { id: 'pair-3', leftId: 'L3', leftText: 'Library', rightId: 'R3', rightText: 'A quiet building where you can borrow and read books' },
      { id: 'pair-4', leftId: 'L4', leftText: 'Cinema', rightId: 'R4', rightText: 'A place where people go to watch movies on a big screen' }
    ],
    answer: {
      correctPairMatches: {
        'L1': 'R1',
        'L2': 'R2',
        'L3': 'R3',
        'L4': 'R4'
      },
      explanation: 'Bakery = Tiệm bánh; Pharmacy = Hiệu thuốc; Library = Thư viện; Cinema = Rạp chiếu phim.'
    },
    source: {
      provider: 'wordnet',
      license: 'WordNet-3.0',
      provenance: 'WordNet definitions'
    },
    qualityStatus: 'approved',
    statistics: { attempts: 290, correctRate: 85.0, averageTimeMs: 13800 },
    createdAt: '2026-08-15T08:00:00.000Z',
    updatedAt: '2026-08-15T08:00:00.000Z',
    approvedBy: 'teacher-master'
  },

  // 7. listening / choice / audio-options (Nghe và chọn phương án đúng)
  {
    id: 'ioe-q-011',
    version: 1,
    grade: 5,
    cefrLevel: 'A1',
    skill: 'listening',
    topic: 'Daily Routines',
    difficulty: 2,
    interaction: {
      family: 'listening',
      subtype: 'audio-options',
      variant: 'choice'
    },
    prompt: 'Listen to the audio recording and answer: What time does Nam usually wake up on weekdays?',
    audioUrl: 'https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg',
    passage: '[Audio transcript]: "Hello everyone, I am Nam. From Monday to Friday, I always wake up at 6:00 AM, do morning exercises, and have breakfast with my parents."',
    options: [
      { id: 'opt-a', label: 'A', text: 'At 5:30 AM' },
      { id: 'opt-b', label: 'B', text: 'At 6:00 AM' },
      { id: 'opt-c', label: 'C', text: 'At 6:30 AM' },
      { id: 'opt-d', label: 'D', text: 'At 7:00 AM' }
    ],
    answer: {
      correctOptionId: 'opt-b',
      explanation: 'Trong bài nghe, Nam nói: "From Monday to Friday, I always wake up at 6:00 AM". Do đó đáp án chính xác là 6:00 AM.',
      vietnameseMeaning: 'Nam thức dậy lúc 6 giờ sáng vào các ngày trong tuần.'
    },
    source: {
      provider: 'manual',
      license: 'CC0',
      provenance: 'IOE Grade 5 Listening Bank'
    },
    qualityStatus: 'approved',
    statistics: { attempts: 340, correctRate: 88.2, averageTimeMs: 9500 },
    createdAt: '2026-08-15T08:00:00.000Z',
    updatedAt: '2026-08-15T08:00:00.000Z',
    approvedBy: 'teacher-master'
  },

  // 8. listening / text-entry / audio-input (Nghe và điền từ)
  {
    id: 'ioe-q-012',
    version: 1,
    grade: 5,
    cefrLevel: 'A1',
    skill: 'listening',
    topic: 'Favorite Subject',
    difficulty: 2,
    interaction: {
      family: 'listening',
      subtype: 'audio-input',
      variant: 'short-answer'
    },
    prompt: 'Listen to the audio clip and type the missing word: "Her favourite subject at school is ______ because she loves singing."',
    audioUrl: 'https://actions.google.com/sounds/v1/ambiences/outdoor_festival.ogg',
    answer: {
      acceptedAnswers: ['music'],
      explanation: 'Từ cần điền là "music" (môn Âm nhạc), liên kết với "she loves singing" (cô ấy thích hát).',
      vietnameseMeaning: 'Môn học yêu thích của cô ấy ở trường là Âm nhạc vì cô ấy thích ca hát.'
    },
    source: {
      provider: 'manual',
      license: 'CC0',
      provenance: 'IOE Grade 5 Listening Bank'
    },
    qualityStatus: 'approved',
    statistics: { attempts: 410, correctRate: 91.0, averageTimeMs: 8200 },
    createdAt: '2026-08-15T08:00:00.000Z',
    updatedAt: '2026-08-15T08:00:00.000Z',
    approvedBy: 'teacher-master'
  },

  // 9. image / choice / image-word (Nhìn tranh và chọn/điền)
  {
    id: 'ioe-q-013',
    version: 1,
    grade: 3,
    cefrLevel: 'A1',
    skill: 'vocabulary',
    topic: 'Fruits & Food',
    difficulty: 1,
    interaction: {
      family: 'image',
      subtype: 'image-word',
      variant: 'choice'
    },
    prompt: 'Look at the picture. What is this fruit?',
    imageUrl: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=400',
    options: [
      { id: 'opt-a', label: 'A', text: 'Pineapple' },
      { id: 'opt-b', label: 'B', text: 'Watermelon' },
      { id: 'opt-c', label: 'C', text: 'Strawberry' },
      { id: 'opt-d', label: 'D', text: 'Banana' }
    ],
    answer: {
      correctOptionId: 'opt-a',
      explanation: 'Bức tranh chụp quả dứa (Pineapple). Watermelon = dưa hấu, Strawberry = dâu tây, Banana = chuối.',
      vietnameseMeaning: 'Quả dứa'
    },
    source: {
      provider: 'dictionary',
      license: 'Free Dictionary',
      provenance: 'Entry: pineapple'
    },
    qualityStatus: 'approved',
    statistics: { attempts: 520, correctRate: 96.5, averageTimeMs: 3800 },
    createdAt: '2026-08-15T08:00:00.000Z',
    updatedAt: '2026-08-15T08:00:00.000Z',
    approvedBy: 'teacher-master'
  },

  // 10. reading / comprehension
  {
    id: 'ioe-q-014',
    version: 1,
    grade: 5,
    cefrLevel: 'A1',
    skill: 'reading',
    topic: 'Animals in the wild',
    difficulty: 3,
    interaction: {
      family: 'choice',
      subtype: 'single',
      variant: 'passage-question'
    },
    prompt: 'According to the passage, why do penguins have thick layers of fat and feathers?',
    passage: 'Penguins are flightless birds that live mostly in the southern hemisphere, especially Antarctica. They spend about half of their lives on land and the other half in the sea. To survive in the freezing cold waters and icy storms, penguins have dense feathers and thick layers of blubber (fat) that keep their bodies warm.',
    options: [
      { id: 'opt-a', label: 'A', text: 'To help them fly faster in the sky' },
      { id: 'opt-b', label: 'B', text: 'To stay warm in freezing cold temperatures' },
      { id: 'opt-c', label: 'C', text: 'To hide from big sharks in the ocean' },
      { id: 'opt-d', label: 'D', text: 'To run fast on the icy ground' }
    ],
    answer: {
      correctOptionId: 'opt-b',
      explanation: 'Đoạn văn viết: "To survive in the freezing cold waters and icy storms, penguins have dense feathers and thick layers of blubber that keep their bodies warm".',
      vietnameseMeaning: 'Chim cánh cụt có lớp lông dày và mỡ để giữ ấm cơ thể trong điều kiện nhiệt độ giá lạnh.'
    },
    source: {
      provider: 'tatoeba',
      license: 'CC-BY',
      provenance: 'Adapted reading comprehension text'
    },
    qualityStatus: 'approved',
    statistics: { attempts: 280, correctRate: 82.1, averageTimeMs: 16500 },
    createdAt: '2026-08-15T08:00:00.000Z',
    updatedAt: '2026-08-15T08:00:00.000Z',
    approvedBy: 'teacher-master'
  },

  // 11. Secondary Grade 7-9 questions
  {
    id: 'ioe-q-015',
    version: 1,
    grade: 7,
    cefrLevel: 'A2',
    skill: 'grammar',
    topic: 'Conditional Sentences Type 1',
    difficulty: 3,
    interaction: {
      family: 'choice',
      subtype: 'single',
      variant: 'text-options'
    },
    prompt: 'If it ______ tomorrow, we will cancel our outdoor camping trip.',
    options: [
      { id: 'opt-a', label: 'A', text: 'rains' },
      { id: 'opt-b', label: 'B', text: 'will rain' },
      { id: 'opt-c', label: 'C', text: 'rained' },
      { id: 'opt-d', label: 'D', text: 'is raining' }
    ],
    answer: {
      correctOptionId: 'opt-a',
      explanation: 'Câu điều kiện loại 1: If + S + V(hiện tại đơn), S + will + V(nguyên mẫu). Chủ ngữ "it" đi với "rains".',
      vietnameseMeaning: 'Nếu ngày mai trời mưa, chúng tôi sẽ hủy chuyến đi cắm trại ngoài trời.'
    },
    source: {
      provider: 'manual',
      license: 'CC0',
      provenance: 'Grade 7 English Grammar Curriculum'
    },
    qualityStatus: 'approved',
    statistics: { attempts: 390, correctRate: 84.0, averageTimeMs: 6400 },
    createdAt: '2026-08-15T08:00:00.000Z',
    updatedAt: '2026-08-15T08:00:00.000Z',
    approvedBy: 'teacher-master'
  },
  {
    id: 'ioe-q-016',
    version: 1,
    grade: 8,
    cefrLevel: 'B1',
    skill: 'grammar',
    topic: 'Passive Voice',
    difficulty: 4,
    interaction: {
      family: 'choice',
      subtype: 'single',
      variant: 'text-options'
    },
    prompt: 'The famous Eiffel Tower ______ in Paris in 1889.',
    options: [
      { id: 'opt-a', label: 'A', text: 'built' },
      { id: 'opt-b', label: 'B', text: 'was built' },
      { id: 'opt-c', label: 'C', text: 'has built' },
      { id: 'opt-d', label: 'D', text: 'is built' }
    ],
    answer: {
      correctOptionId: 'opt-b',
      explanation: 'Câu bị động trong quá khứ đơn (năm 1889): S + was/were + V3/ed. Chủ ngữ "The famous Eiffel Tower" là số ít nên dùng "was built".',
      vietnameseMeaning: 'Tháp Eiffel nổi tiếng được xây dựng ở Paris vào năm 1889.'
    },
    source: {
      provider: 'manual',
      license: 'CC0',
      provenance: 'Grade 8 English Passive Voice Unit'
    },
    qualityStatus: 'approved',
    statistics: { attempts: 410, correctRate: 78.5, averageTimeMs: 7200 },
    createdAt: '2026-08-15T08:00:00.000Z',
    updatedAt: '2026-08-15T08:00:00.000Z',
    approvedBy: 'teacher-master'
  },
  {
    id: 'ioe-q-017',
    version: 1,
    grade: 9,
    cefrLevel: 'B1',
    skill: 'vocabulary',
    topic: 'Environment & Climate Change',
    difficulty: 4,
    interaction: {
      family: 'choice',
      subtype: 'single',
      variant: 'text-options'
    },
    prompt: 'Solar and wind energy are examples of ______ resources that do not pollute the atmosphere.',
    options: [
      { id: 'opt-a', label: 'A', text: 'renewable' },
      { id: 'opt-b', label: 'B', text: 'exhaustible' },
      { id: 'opt-c', label: 'C', text: 'fossil' },
      { id: 'opt-d', label: 'D', text: 'harmful' }
    ],
    answer: {
      correctOptionId: 'opt-a',
      explanation: '"Renewable resources" = các nguồn tài nguyên tái tạo (năng lượng mặt trời, gió...). Exhaustible = có thể cạn kiệt, fossil = hóa thạch.',
      vietnameseMeaning: 'Năng lượng mặt trời và năng lượng gió là những ví dụ về các nguồn tài nguyên tái tạo không gây ô nhiễm bầu khí quyển.'
    },
    source: {
      provider: 'wordnet',
      license: 'WordNet-3.0',
      provenance: 'Synset: renewable_resource.n.01'
    },
    qualityStatus: 'approved',
    statistics: { attempts: 320, correctRate: 81.2, averageTimeMs: 8100 },
    createdAt: '2026-08-15T08:00:00.000Z',
    updatedAt: '2026-08-15T08:00:00.000Z',
    approvedBy: 'teacher-master'
  },
  {
    id: 'ioe-q-018',
    version: 1,
    grade: 3,
    cefrLevel: 'A1',
    skill: 'vocabulary',
    topic: 'Colors and Numbers',
    difficulty: 1,
    interaction: {
      family: 'choice',
      subtype: 'single',
      variant: 'text-options'
    },
    prompt: 'How many days are there in a week?',
    options: [
      { id: 'opt-a', label: 'A', text: 'Five' },
      { id: 'opt-b', label: 'B', text: 'Six' },
      { id: 'opt-c', label: 'C', text: 'Seven' },
      { id: 'opt-d', label: 'D', text: 'Eight' }
    ],
    answer: {
      correctOptionId: 'opt-c',
      explanation: 'Một tuần có 7 ngày (Seven days in a week).',
      vietnameseMeaning: 'Có bao nhiêu ngày trong một tuần? -> 7 ngày.'
    },
    source: {
      provider: 'manual',
      license: 'CC0',
      provenance: 'Grade 3 Basics'
    },
    qualityStatus: 'approved',
    statistics: { attempts: 620, correctRate: 98.2, averageTimeMs: 3100 },
    createdAt: '2026-08-15T08:00:00.000Z',
    updatedAt: '2026-08-15T08:00:00.000Z',
    approvedBy: 'teacher-master'
  }
];
