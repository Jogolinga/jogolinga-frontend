// data/languages/yoruba/categories/grammaire.ts

import { GrammarCategory } from '../../../../types/types';

export const grammaire: GrammarCategory = {
  'Àwọn Ìjíṣẹ́ Àkọ́kọ́ (Personal Pronouns)': {
    // Subject Pronouns
    'Mo': { 
      translation: "I", 
      explanation: "First person singular subject pronoun",
      example: "Moń kọ́ ẹ̀kọ́. (I am studying.)"
    },
    'Ìwọ': { 
      translation: "You (singular)", 
      explanation: "Second person singular subject pronoun",
      example: "Ìwọ ń ṣe iṣẹ́. (You are working.)"
    },
    'Òun': { 
      translation: "He/She", 
      explanation: "Third person singular subject pronoun",
      example: "Òun ń lọ ilé. (He/She is going home.)"
    },
    'Àwa': { 
      translation: "We", 
      explanation: "First person plural subject pronoun",
      example: "Àwa ń gbádáwọ́ ẹ̀. (We are helping.)"
    },
    'Ẹ̀yin': { 
      translation: "You (plural)", 
      explanation: "Second person plural subject pronoun",
      example: "Ẹ̀yin ń wá mi. (You all are looking for me.)"
    },
    'Wọn': { 
      translation: "They", 
      explanation: "Third person plural subject pronoun",
      example: "Wọn ń ṣàtọ́ àdáta. (They are telling a story.)"
    },
  },

  'Àwọn Ọ̀rọ̀ Àṣeyọrí (Verb Tenses)': {
    'Mo ń': { 
      translation: "I am (present continuous)", 
      explanation: "Indicates an ongoing action in the present",
      example: "Mo ń kọ́ ìwé. (I am writing a book.)"
    },
    'Mo ti': { 
      translation: "I have (perfect tense)", 
      explanation: "Indicates a completed action",
      example: "Mo ti parí iṣẹ́. (I have finished the work.)"
    },
    'Mo yóò': { 
      translation: "I will", 
      explanation: "Indicates a future action",
      example: "Mo yóò lọ àbula. (I will go to the market.)"
    },
    'Mo ṣe': { 
      translation: "I do/did", 
      explanation: "Simple present or past tense",
      example: "Mo ṣe iṣẹ́ gbọdọ̀. (I do the necessary work.)"
    },
    'Mo kò': { 
      translation: "I did not", 
      explanation: "Negative past tense",
      example: "Mo kò lọ ilé àna. (I did not go home yesterday.)"
    },
  },

  'Àwọn Ìṣọ́ (Prepositions)': {
    'Nínú': { 
      translation: "In, inside", 
      explanation: "Indicates location inside something",
      example: "Nínú ilé. (Inside the house.)"
    },
    'Lórí': { 
      translation: "On, about", 
      explanation: "Indicates location on top or a topic",
      example: "Lórí tábìlì. (On the table.)"
    },
    'Pẹ̀lú': { 
      translation: "With", 
      explanation: "Indicates accompaniment or association",
      example: "Mo lọ pẹ̀lú ọrẹ mi. (I went with my friend.)"
    },
    'Fún': { 
      translation: "For", 
      explanation: "Indicates purpose or recipient",
      example: "Ẹ̀yin fún mi. (For me.)"
    },
    'Láti': { 
      translation: "From", 
      explanation: "Indicates origin or starting point",
      example: "Mo wá láti Ìbàdàn. (I come from Ibadan.)"
    },
  },

  'Àwọn Ọ̀rọ̀ Àtẹ́wọ́ (Adjectives)': {
    'Dáradára': { 
      translation: "Good", 
      explanation: "Describes something positive or of good quality",
      example: "Ọmọ yìí dáradára. (This child is good.)"
    },
    'Buburu': { 
      translation: "Bad", 
      explanation: "Describes something negative or of poor quality",
      example: "Iṣẹ́ náà buburu. (That work is bad.)"
    },
    'Pẹ̀lú': { 
      translation: "Big", 
      explanation: "Describes large size",
      example: "Ilé pẹ̀lú púpọ̀. (The house is very big.)"
    },
    'Kéré': { 
      translation: "Small", 
      explanation: "Describes small size",
      example: "Ọmọ kéré. (Small child.)"
    },
    'Gidigidi': { 
      translation: "Strong", 
      explanation: "Describes physical or mental strength",
      example: "Ọkọ́ náà gidigidi. (That man is strong.)"
    },
  },

  'Àwọn Ìṣọ́ Àkókò (Temporal Prepositions)': {
    'Láti ṣáájú': { 
      translation: "Before", 
      explanation: "Indicates time before an event",
      example: "Láti ṣáájú àṣẹ, kọ́ iṣẹ́. (Before the order, do the work.)"
    },
    'Lẹ́yìn': { 
      translation: "After", 
      explanation: "Indicates time after an event",
      example: "Lẹ́yìn iṣẹ́, mo yóò lọ. (After work, I will go.)"
    },
    'Nísìyí': { 
      translation: "Now", 
      explanation: "Indicates present moment",
      example: "Nísìyí ni mo wà. (I am here now.)"
    },
  },

  'Àwọn Ọ̀rọ̀ Ìṣọ́ (Possessive Pronouns)': {
    'Tèmi': { 
      translation: "Mine", 
      explanation: "First person singular possessive",
      example: "Bọọku yìí tèmi. (This book is mine.)"
    },
    'Tẹ̀yin': { 
      translation: "Yours", 
      explanation: "Second person possessive",
      example: "Ìwé náà tẹ̀yin. (That book is yours.)"
    },
    'Tàwọn': { 
      translation: "Theirs", 
      explanation: "Third person plural possessive",
      example: "Ilé náà tàwọn. (That house is theirs.)"
    },
  }
};

export default grammaire;

export {};