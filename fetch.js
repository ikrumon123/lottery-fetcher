const SUPABASE_URL = "https://joicadepjbjvyuxlesdh.supabase.co";
const SUPABASE_KEY = "sb_publishable_LKpGsutdMhvgafj7P59txw_XhSZLTf3";

const LATEST_API = "https://indialotteryapi.com/wp-json/klr/v1/latest";
const HISTORY_API = "https://indialotteryapi.com/wp-json/klr/v1/history?limit=10";

async function insertRow(data) {
  if (!data.draw_code) return;

  await fetch(`${SUPABASE_URL}/rest/v1/results`, {
    method: "POST",
    headers: {
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      "Prefer": "resolution=ignore-duplicates"
    },
    body: JSON.stringify({
      draw_code: data.draw_code,
      draw_date: data.draw_date,
      draw_name: data.draw_name,
      full_data: data
    })
  });

  console.log("Saved:", data.draw_code);
}

async function getCount() {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/results?select=id`,
    {
      headers: {
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`
      }
    }
  );

  const data = await res.json();
  return data.length;
}

async function run() {
  try {
    const count = await getCount();

    // 🔴 FIRST RUN → fill history (NO VALIDATION HERE)
    if (count === 0) {
      console.log("Filling history...");

      const res = await fetch(HISTORY_API);
      const json = await res.json();

      for (const item of json.items) {
        await insertRow(item);
      }

      console.log("History filled");
      return;
    }

    // 🔴 NORMAL RUN → latest (WITH VALIDATION)
    const res = await fetch(LATEST_API);
    const data = await res.json();

    if (!data.first || !data.first.ticket) {
      console.log("Latest not ready → skip");
      return;
    }

    await insertRow(data);

    console.log("Latest updated:", data.draw_code);

  } catch (err) {
    console.log("Error:", err.message);
  }
}

run();
