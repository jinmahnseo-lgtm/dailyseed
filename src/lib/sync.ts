import { supabase } from "./supabase";

const SYNC_QUEUE_KEY = "dailyseed-sync-queue";
const MIGRATED_KEY = "dailyseed-migrated-v2";
const MISSION_PAGES = ["news", "classic", "art", "world", "why", "english"] as const;

interface SyncItem {
  type: "mission" | "report";
  page?: string;
  date: string;
  data?: string;
  parentEmail?: string;
  ts: number;
}

// --- Sync Queue ---
function getSyncQueue(): SyncItem[] {
  try {
    return JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY) || "[]");
  } catch {
    return [];
  }
}

function addToSyncQueue(item: SyncItem) {
  const queue = getSyncQueue();
  queue.push(item);
  localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
}

function clearSyncQueue() {
  localStorage.removeItem(SYNC_QUEUE_KEY);
}

// --- Mission Sync ---
export async function syncMissionToSupabase(
  userId: string,
  page: string,
  date: string,
  answerData?: string
) {
  if (!supabase) return;

  try {
    await supabase.from("missions").upsert(
      {
        user_id: userId,
        page,
        date,
        answer_data: answerData || null,
        completed_at: new Date().toISOString(),
      },
      { onConflict: "user_id,page,date" }
    );
  } catch {
    addToSyncQueue({
      type: "mission",
      page,
      date,
      data: answerData,
      ts: Date.now(),
    });
  }
}

// --- Report Sync ---
export async function syncReportToSupabase(
  userId: string,
  date: string,
  parentEmail: string
) {
  if (!supabase) return;

  try {
    await supabase.from("reports").upsert(
      {
        user_id: userId,
        date,
        parent_email: parentEmail,
        sent_at: new Date().toISOString(),
      },
      { onConflict: "user_id,date" }
    );
  } catch {
    addToSyncQueue({
      type: "report",
      date,
      parentEmail,
      ts: Date.now(),
    });
  }
}

// --- Flush Queue ---
export async function flushSyncQueue(userId: string) {
  if (!supabase) return;

  const queue = getSyncQueue();
  if (queue.length === 0) return;

  const failed: SyncItem[] = [];
  for (const item of queue) {
    try {
      if (item.type === "mission" && item.page) {
        await supabase.from("missions").upsert(
          {
            user_id: userId,
            page: item.page,
            date: item.date,
            answer_data: item.data || null,
            completed_at: new Date(item.ts).toISOString(),
          },
          { onConflict: "user_id,page,date" }
        );
      } else if (item.type === "report") {
        await supabase.from("reports").upsert(
          {
            user_id: userId,
            date: item.date,
            parent_email: item.parentEmail || "",
            sent_at: new Date(item.ts).toISOString(),
          },
          { onConflict: "user_id,date" }
        );
      }
    } catch {
      failed.push(item);
    }
  }

  if (failed.length > 0) {
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(failed));
  } else {
    clearSyncQueue();
  }
}

// --- Fetch from Supabase & Merge into localStorage ---
export async function pullMissionsFromSupabase(userId: string) {
  if (!supabase) return;

  // 먼저 기존 로컬 데이터 초기화 (다른 유저 잔여 데이터 방지)
  clearLocalMissionData();

  const { data: missions } = await supabase
    .from("missions")
    .select("page, date, answer_data")
    .eq("user_id", userId);

  if (missions) {
    for (const m of missions) {
      // useMission이 읽는 키 형식: dailyseed-{page}-day{index}
      const key = `dailyseed-${m.page}-day${m.date}`;
      const dataKey = `dailyseed-${m.page}-day${m.date}-data`;
      // Supabase wins: overwrite localStorage
      localStorage.setItem(key, "done");
      if (m.answer_data) {
        localStorage.setItem(dataKey, m.answer_data);
      }
    }
  }

  const { data: reports } = await supabase
    .from("reports")
    .select("date")
    .eq("user_id", userId);

  if (reports) {
    for (const r of reports) {
      // isReportSent가 읽는 키 형식: dailyseed-report-day{index}
      localStorage.setItem(`dailyseed-report-day${r.date}`, "sent");
    }
  }
}

// --- Clear mission/report data from localStorage (on logout) ---
export function clearLocalMissionData() {
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (!k) continue;
    for (const page of MISSION_PAGES) {
      // dailyseed-{page}-day{n}, dailyseed-{page}-day{n}-data (현재 형식)
      // dailyseed-{page}-{YYYY-MM-DD}, dailyseed-{page}-{YYYY-MM-DD}-data (옛 형식)
      if (k.startsWith(`dailyseed-${page}-`)) keysToRemove.push(k);
    }
    // dailyseed-report-day{n} (현재) + dailyseed-report-{YYYY-MM-DD} (옛)
    if (k.startsWith("dailyseed-report-")) keysToRemove.push(k);
  }
  keysToRemove.forEach((k) => localStorage.removeItem(k));
}

// --- Migrate localStorage → Supabase (first login) ---
export async function migrateLocalStorageToSupabase(userId: string) {
  if (!supabase) return;
  if (localStorage.getItem(MIGRATED_KEY) === userId) return;

  const missionRows: {
    user_id: string;
    page: string;
    date: string;
    answer_data: string | null;
    completed_at: string;
  }[] = [];

  // Scan localStorage for mission keys
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (!k) continue;

    for (const page of MISSION_PAGES) {
      const prefix = `dailyseed-${page}-`;
      if (k.startsWith(prefix) && !k.endsWith("-data") && localStorage.getItem(k) === "done") {
        let date = k.replace(prefix, "");
        // Normalize: "day0" → "0", "day12" → "12"
        const dayMatch = date.match(/^day(\d+)$/);
        if (dayMatch) date = dayMatch[1];
        // 숫자 형식만 허용 (YYYY-MM-DD는 무시)
        if (/^\d+$/.test(date)) {
          const dataKey = `${k}-data`;
          missionRows.push({
            user_id: userId,
            page,
            date,
            answer_data: localStorage.getItem(dataKey) || null,
            completed_at: new Date().toISOString(),
          });
        }
      }
    }
  }

  if (missionRows.length > 0) {
    await supabase
      .from("missions")
      .upsert(missionRows, { onConflict: "user_id,page,date" });
  }

  // Migrate reports
  const reportRows: {
    user_id: string;
    date: string;
    parent_email: string;
    sent_at: string;
  }[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (!k) continue;

    if (k.startsWith("dailyseed-report-") && localStorage.getItem(k) === "sent") {
      let date = k.replace("dailyseed-report-", "");
      const dayMatch = date.match(/^day(\d+)$/);
      if (dayMatch) date = dayMatch[1];
      // 숫자 형식만 허용 (YYYY-MM-DD는 무시)
      if (/^\d+$/.test(date)) {
        reportRows.push({
          user_id: userId,
          date,
          parent_email: localStorage.getItem("dailyseed-parent-email") || "",
          sent_at: new Date().toISOString(),
        });
      }
    }
  }

  if (reportRows.length > 0) {
    await supabase
      .from("reports")
      .upsert(reportRows, { onConflict: "user_id,date" });
  }

  // Migrate student name to profile
  const name = localStorage.getItem("dailyseed-student-name");
  if (name) {
    await supabase
      .from("profiles")
      .update({ display_name: name })
      .eq("id", userId);
  }

  localStorage.setItem(MIGRATED_KEY, userId);
}
