export const replaceChildName = (text: string, name: string) =>
  text.replace(/\{\{child_name\}\}|\{child_name\}/g, name);

export const replaceChildNameList = (items: string[], name: string) =>
  items.map((item) => replaceChildName(item, name));
