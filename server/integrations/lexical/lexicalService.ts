export interface DatamuseWord {
  word: string;
  score: number;
  tags?: string[];
  defs?: string[];
}

export interface DictionaryDefinition {
  word: string;
  phonetic?: string;
  meanings: Array<{
    partOfSpeech: string;
    definitions: Array<{
      definition: string;
      example?: string;
      synonyms: string[];
      antonyms: string[];
    }>;
  }>;
}

export class LexicalService {
  /**
   * Fetch related words, distractors and synonyms from Datamuse API
   */
  async getDatamuseWords(query: string, type: 'synonyms' | 'distractors' | 'rhymes' | 'spelling' = 'synonyms'): Promise<DatamuseWord[]> {
    try {
      let endpoint = `https://api.datamuse.com/words?max=15&`;
      if (type === 'synonyms') {
        endpoint += `rel_syn=${encodeURIComponent(query)}`;
      } else if (type === 'distractors') {
        endpoint += `ml=${encodeURIComponent(query)}&topics=education,school,animals`;
      } else if (type === 'rhymes') {
        endpoint += `rel_rhy=${encodeURIComponent(query)}`;
      } else if (type === 'spelling') {
        endpoint += `sp=${encodeURIComponent(query)}`;
      }

      const res = await fetch(endpoint, {
        headers: { 'User-Agent': 'IOE-Master-Lexical/1.0' }
      });
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.warn('Datamuse API fetch fallback:', err);
      return [];
    }
  }

  /**
   * Fetch word definition and phonetics from Free Dictionary API
   */
  async getDictionaryDefinition(word: string): Promise<DictionaryDefinition | null> {
    try {
      const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`, {
        headers: { 'User-Agent': 'IOE-Master-Lexical/1.0' }
      });
      if (!res.ok) return null;
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data[0] as DictionaryDefinition;
      }
      return null;
    } catch (err) {
      console.warn('Dictionary API fetch fallback:', err);
      return null;
    }
  }

  /**
   * Get Tatoeba example sentences
   */
  async getTatoebaExamples(word: string): Promise<Array<{ text: string; translation?: string }>> {
    // Curated educational fallback examples
    const commonCuratedSentences: Record<string, string[]> = {
      'school': ['She walks to school every morning with her best friend.', 'Our school library has hundreds of fascinating books.'],
      'family': ['My family often gathers together for dinner on Sunday evenings.', 'He has a large and loving family in Da Nang.'],
      'animal': ['The elephant is the largest living land animal.', 'Many wild animals live peacefully in the national park.'],
      'weather': ['What is the weather like in Hanoi during autumn?', 'The weather today is warm and sunny.'],
      'friend': ['A true friend is someone who is always there to help you.', 'Nam and Phong have been close friends since grade 1.']
    };

    const wordLower = word.toLowerCase().trim();
    if (commonCuratedSentences[wordLower]) {
      return commonCuratedSentences[wordLower].map(text => ({ text }));
    }

    return [
      { text: `The student learned the meaning of "${word}" in English class today.` },
      { text: `Can you please make a complete sentence using the word "${word}"?` }
    ];
  }
}

export const lexicalService = new LexicalService();
