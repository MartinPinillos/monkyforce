export function normalizeLoginName(loginName: string): string {
  return loginName.trim().toLocaleLowerCase('en-US');
}
