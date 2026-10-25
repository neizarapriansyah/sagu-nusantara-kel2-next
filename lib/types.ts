// tipe data yang dipakai seluruh website (sesuai struktur DEFAULT_DATA di data.js)

export type AboutCard = {
  id: string;
  title: string;
  image: string;
  description: string;
};

export type ProcessingStep = {
  id: string;
  title: string;
  icon: string;
  image: string;
  description: string;
};

export type Food = {
  id: string;
  name: string;
  region: string;
  category: string;
  servingType: string;
  image: string;
  description: string;
  ingredients: string[];
  preparation: string;
  story: string;
  fact: string;
};

export type FoodOptions = {
  wilayah: string[];
  kategori: string[];
  penyajian: string[];
};

export type Region = {
  id: string;
  name: string;
  mapIcon: string;
  image: string;
  description: string;
  foods: string[];
  facts: string;
};

export type Fact = {
  id: string;
  text: string;
  image: string;
  likes: number;
  dislikes: number;
};

export type Letter = "A" | "B" | "C" | "D";

export type Quiz = {
  id: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correct: Letter;
};

export type Settings = {
  siteName: string;
  heroEyebrow: string;
  tagline: string;
  heroDescription: string;
  footerText: string;
  copyright: string;
  heroImage: string;
  footerImageLeft: string;
  footerImageRight: string;
};

export type SaguData = {
  aboutCards: AboutCard[];
  processingSteps: ProcessingStep[];
  foods: Food[];
  foodOptions: FoodOptions;
  regions: Region[];
  facts: Fact[];
  quizzes: Quiz[];
  settings: Settings;
};

export type CollectionKey =
  | "aboutCards"
  | "processingSteps"
  | "foods"
  | "regions"
  | "facts"
  | "quizzes";
