export type Mapper = <T>(list: T[]) => T[];
export type Picker = <T>(list: T[]) => T;
export type PickerBy = <T>(list: T[], seek: T) => T;
export type Creators = <T>(amount: number, creators: () => T) => T[];
// T[] -> T[], T[] -> T arrow type declaration problem solved - KIHAL

export const rotateList:Mapper = ([first, ...rest]) => [...rest, first];
export const shuffleList:Mapper = list => [...list].sort(() => Math.random() > 0.5 ? 1 : -1);
export const randomPick:Picker = (list) => list[Math.random() * list.length | 0];
export const createList:Creators = (amount, creators) =>
  Array(amount)
    .fill(0)
    .map(() => creators())
  ;
export const nextOf:PickerBy = (list, current) => list[(list.indexOf(current) + 1) % list.length];
