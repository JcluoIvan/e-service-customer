export const inArray = (arr: any[], target: any) => arr.indexOf(target) >= 0;

export const inEnum = (enums: object, target: any) => Object.values(enums).indexOf(target) >= 0;
