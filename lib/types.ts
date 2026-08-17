export type CatStatus = "official" | "pending" | "adopted";
export type CatSex = "公猫" | "母猫" | "未知";
export type PostType = "目击" | "近况" | "故事" | "健康";

export interface Cat {
  id: string;
  slug: string;
  name: string;
  aliases: string[];
  sex: CatSex;
  age: string;
  coat: string;
  feature: string;
  area: string;
  temperament: string;
  status: CatStatus;
  health: string;
  neutered: boolean | null;
  intro: string;
  image: string;
  imagePosition: string;
  sightings: number;
}

export interface TimelineItem {
  id: string;
  catSlug?: string;
  type: PostType;
  title: string;
  body: string;
  date: string;
  area: string;
  author: string;
  featured?: boolean;
}

export interface Campaign {
  id: string;
  title: string;
  summary: string;
  deadline: string;
  submissions: number;
  status: "open" | "closed";
}
