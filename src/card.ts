import { Card } from "./multipleReducer.ts.ts";
import { skillList } from "./skillList.ts";
import { randomPick } from "./arrayUtils.ts";

export const cardInfo = ({ value, skill }: Partial<Card>) => `[ ${value?.toString().padStart(2, " ")} ] ${skill} `;

export const rndCard = (owner: string): Card => ({
  owner,
  id: Math.random().toString().slice(-6),
  skill: randomPick(skillList),
  value: Math.random() * 18 - 9 | 0
});
