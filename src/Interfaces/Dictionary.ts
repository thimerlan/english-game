interface IDictionaryData {
  word: string;
  phonetic?: string;
  phonetics?: {
    text: string;
    audio: string;
    sourceUrl: string;
  }[];
  meanings?: {
    partOfSpeech: string;
    synonyms?: string[];
    antonyms?: string[];
    definitions: {
      definition: string;
      example: string;
      synonyms?: string[];
      antonyms?: string[];
    }[];
  }[];
}
