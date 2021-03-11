export const replaceElement = <T>(arr: Array<T>, index: number, el: T) => {
  arr.splice(index, 1, el);
  return arr;
};
