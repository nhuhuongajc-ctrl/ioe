import { IOEQuestion, UserAnswerPayload, GradedQuestionResult } from '../../../src/shared/types/ioe.js';

export class GradingService {
  /**
   * Normalize text for string comparisons: NFKC, lowercase, trim, remove excessive spaces & common punctuation
   */
  normalizeText(text: string): string {
    if (!text) return '';
    return text
      .normalize('NFKC')
      .toLowerCase()
      .replace(/[’‘`]/g, "'")
      .replace(/[“”]/g, '"')
      .replace(/[.,!?;:]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Grade a single question authoritatively
   */
  gradeQuestion(question: IOEQuestion, userAnswer?: UserAnswerPayload): GradedQuestionResult {
    const maxScore = 10; // Standard IOE score is 10 points per question (200 questions = 2000 points)
    const emptyPayload: UserAnswerPayload = userAnswer || {
      questionId: question.id,
      clientAnsweredAt: Date.now()
    };

    let isCorrect = false;
    const fam = question.interaction.family;

    if (!userAnswer) {
      return {
        questionId: question.id,
        isCorrect: false,
        scoreEarned: 0,
        maxScore,
        userAnswer: emptyPayload,
        correctAnswer: question.answer,
        timeSpentMs: 0
      };
    }

    if (fam === 'choice' || fam === 'listening' || fam === 'image') {
      if (userAnswer.selectedOptionId && question.answer.correctOptionId) {
        isCorrect = userAnswer.selectedOptionId.trim() === question.answer.correctOptionId.trim();
      } else if (userAnswer.textAnswer && question.answer.acceptedAnswers) {
        // Listening text-entry or Image text
        const normUser = this.normalizeText(userAnswer.textAnswer);
        isCorrect = question.answer.acceptedAnswers.some(ans => this.normalizeText(ans) === normUser);
      }
    } else if (fam === 'text-entry') {
      if (userAnswer.textAnswer && question.answer.acceptedAnswers) {
        const normUser = this.normalizeText(userAnswer.textAnswer);
        isCorrect = question.answer.acceptedAnswers.some(ans => this.normalizeText(ans) === normUser);
      }
    } else if (fam === 'ordering') {
      if (userAnswer.orderedTokenIds && question.answer.orderedTokenIds) {
        const userSeq = userAnswer.orderedTokenIds.join('-');
        const correctSeq = question.answer.orderedTokenIds.join('-');
        isCorrect = userSeq === correctSeq;
      } else if (userAnswer.textAnswer && question.answer.acceptedAnswers) {
        const normUser = this.normalizeText(userAnswer.textAnswer);
        isCorrect = question.answer.acceptedAnswers.some(ans => this.normalizeText(ans) === normUser);
      }
    } else if (fam === 'matching') {
      if (userAnswer.pairMatches && question.answer.correctPairMatches) {
        const correctPairs = question.answer.correctPairMatches;
        const totalKeys = Object.keys(correctPairs).length;
        let matchedCount = 0;

        for (const [leftKey, rightVal] of Object.entries(correctPairs)) {
          if (userAnswer.pairMatches[leftKey] === rightVal) {
            matchedCount++;
          }
        }
        isCorrect = matchedCount === totalKeys && totalKeys > 0;
      }
    }

    return {
      questionId: question.id,
      isCorrect,
      scoreEarned: isCorrect ? maxScore : 0,
      maxScore,
      userAnswer,
      correctAnswer: question.answer,
      timeSpentMs: 0
    };
  }

  /**
   * Grade an entire attempt
   */
  gradeAttempt(questions: IOEQuestion[], answers: Record<string, UserAnswerPayload>) {
    const results: GradedQuestionResult[] = [];
    let correctCount = 0;
    let incorrectCount = 0;
    let unansweredCount = 0;
    let finalScore = 0;
    let totalPoints = 0;

    for (const q of questions) {
      const userAns = answers[q.id];
      const graded = this.gradeQuestion(q, userAns);
      results.push(graded);

      totalPoints += graded.maxScore;
      if (!userAns || (!userAns.selectedOptionId && !userAns.textAnswer && !userAns.orderedTokenIds && !userAns.pairMatches)) {
        unansweredCount++;
      } else if (graded.isCorrect) {
        correctCount++;
        finalScore += graded.scoreEarned;
      } else {
        incorrectCount++;
      }
    }

    return {
      finalScore,
      totalPoints,
      correctCount,
      incorrectCount,
      unansweredCount,
      results
    };
  }
}

export const gradingService = new GradingService();
