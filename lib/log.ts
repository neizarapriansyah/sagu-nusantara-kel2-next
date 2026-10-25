// catatan aktivitas admin (buat bagian "aktivitas terbaru" di dashboard)

export type LogItem = {
  action: string;
  module: string;
  detail: string;
  time: string;
};

const KEY = "webSagu_activity";
const MAX = 30;

export const SaguLog = {
  all(): LogItem[] {
    try {
      return JSON.parse(localStorage.getItem(KEY) || "[]") || [];
    } catch {
      return [];
    }
  },

  add(action: string, module: string, detail: string): void {
    const list = SaguLog.all();
    list.unshift({ action, module, detail, time: new Date().toISOString() });
    try {
      localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
    } catch {
      /* kalau penuh ya udah, log nya ga kesimpen */
    }
  },

  clear(): void {
    localStorage.removeItem(KEY);
  },
};
