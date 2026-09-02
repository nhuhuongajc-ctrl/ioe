import { GradingService } from '../server/modules/grading/gradingService.js';
import { IOEQuestion, UserAnswerPayload } from '../src/shared/types/ioe.js';

/**
 * Automated test suite for IOE Authoritative Grading Engine
 */
function runGradingTests() {
  const grading = new GradingService();
  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string) {
    total++;
    if (condition) {
      console.log(`  ✓ ${testName}`);
      passed++;
    } else {
      console.error(`  ✗ FAILED: ${testName}`);
    }
  }

  console.log('\n--- Running Grading Engine Tests ---');

  // Test 1: Text normalization
  assert(grading.normalizeText('  Hello, World! ') === 'hello world', 'Normalizes casing and trims punctuation');
  assert(grading.normalizeText("They’re “happy”") === "they're \"happy\"", 'Normalizes curly quotes to standard quotes');

  // Test 2: Multiple Choice grading
  const choiceQ: IOEQuestion = {
    id: 'q1',
    version: 1,
    grade: 5,
    skill: 'vocabulary',
    topic: 'Stationery',
    difficulty: 2,
    interaction: { family: 'choice', subtype: 'single', variant: 'text-options' },
    prompt: 'She needs a pair of scissors.',
    options: [
      { id: 'opt-a', label: 'A', text: 'ruler' },
      { id: 'opt-b', label: 'B', text: 'scissors' }
    ],
    answer: { correctOptionId: 'opt-b', explanation: 'Scissors cuts paper' },
    source: { provider: 'wordnet', license: 'CC', provenance: 'unit_test' },
    qualityStatus: 'approved',
    statistics: { attempts: 0, correctRate: 0, averageTimeMs: 0 },
    createdAt: '',
    updatedAt: ''
  };

  const correctChoiceAns: UserAnswerPayload = { questionId: 'q1', selectedOptionId: 'opt-b', clientAnsweredAt: 100 };
  const wrongChoiceAns: UserAnswerPayload = { questionId: 'q1', selectedOptionId: 'opt-a', clientAnsweredAt: 100 };

  assert(grading.gradeQuestion(choiceQ, correctChoiceAns).isCorrect === true, 'Multiple choice correct option grades to TRUE');
  assert(grading.gradeQuestion(choiceQ, wrongChoiceAns).isCorrect === false, 'Multiple choice wrong option grades to FALSE');

  // Test 3: Short answer normalization & grading
  const textQ: IOEQuestion = {
    id: 'q2',
    version: 1,
    grade: 5,
    skill: 'grammar',
    topic: 'Prepositions',
    difficulty: 2,
    interaction: { family: 'text-entry', subtype: 'short-answer', variant: 'single-input' },
    prompt: 'Class starts ______ 7:00.',
    answer: { acceptedAnswers: ['at'], explanation: 'at + time' },
    source: { provider: 'manual', license: 'CC0', provenance: 'unit_test' },
    qualityStatus: 'approved',
    statistics: { attempts: 0, correctRate: 0, averageTimeMs: 0 },
    createdAt: '',
    updatedAt: ''
  };

  assert(grading.gradeQuestion(textQ, { questionId: 'q2', textAnswer: ' AT  ', clientAnsweredAt: 100 }).isCorrect === true, 'Short answer trims and lowercases before check');
  assert(grading.gradeQuestion(textQ, { questionId: 'q2', textAnswer: 'in', clientAnsweredAt: 100 }).isCorrect === false, 'Wrong short answer returns false');

  // Test 4: Sentence token ordering
  const orderQ: IOEQuestion = {
    id: 'q3',
    version: 1,
    grade: 5,
    skill: 'grammar',
    topic: 'Ordering',
    difficulty: 3,
    interaction: { family: 'ordering', subtype: 'tokens', variant: 'sentence' },
    prompt: 'Order the sentence',
    tokens: [
      { id: 't1', text: 'How' },
      { id: 't2', text: 'are' },
      { id: 't3', text: 'you?' }
    ],
    answer: { orderedTokenIds: ['t1', 't2', 't3'] },
    source: { provider: 'manual', license: 'CC0', provenance: 'unit_test' },
    qualityStatus: 'approved',
    statistics: { attempts: 0, correctRate: 0, averageTimeMs: 0 },
    createdAt: '',
    updatedAt: ''
  };

  assert(grading.gradeQuestion(orderQ, { questionId: 'q3', orderedTokenIds: ['t1', 't2', 't3'], clientAnsweredAt: 100 }).isCorrect === true, 'Token sequence matches correctly');
  assert(grading.gradeQuestion(orderQ, { questionId: 'q3', orderedTokenIds: ['t2', 't1', 't3'], clientAnsweredAt: 100 }).isCorrect === false, 'Wrong token sequence returns false');

  console.log(`\nResults: ${passed} / ${total} tests passed.\n`);
  if (passed !== total) {
    process.exit(1);
  }
}

runGradingTests();
