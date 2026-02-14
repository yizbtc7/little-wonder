export const replaceChildName = (text: string, name: string) =>
  text.replace(/\{\{\s*child_name\s*\}\}|\{\s*child_name\s*\}/gi, name);

export const replaceChildNameList = (items: string[], name: string) =>
  items.map((item) => replaceChildName(item, name));
