const keyOf = (userKey: string) => `myCourses:${userKey}`;

function readIds(userKey: string): string[] {
  if (!userKey) return [];
  try {
    const raw = localStorage.getItem(keyOf(userKey));
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function writeIds(userKey: string, ids: string[]) {
  if (!userKey) return;
  localStorage.setItem(keyOf(userKey), JSON.stringify(ids));
}

export function getMyCourseIds(userKey: string): string[] {
  return readIds(userKey);
}

export function hasMyCourse(userKey: string, courseId: string): boolean {
  return readIds(userKey).includes(courseId);
}

export function addMyCourse(userKey: string, courseId: string) {
  const ids = readIds(userKey);
  if (!ids.includes(courseId)) {
    ids.push(courseId);
    writeIds(userKey, ids);
  }
}

export function removeMyCourse(userKey: string, courseId: string) {
  const ids = readIds(userKey).filter((id) => id !== courseId);
  writeIds(userKey, ids);
}

export function clearMyCourses(userKey: string) {
  if (!userKey) return;
  localStorage.removeItem(keyOf(userKey));
}
