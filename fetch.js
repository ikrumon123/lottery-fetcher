const API = "https://indialotteryapi.com/wp-json/klr/v1/latest";

const SUPABASE_URL = "https://joicadepjbjvyuxlesdh.supabase.co";
const SUPABASE_KEY = "sb_publishable_LKpGsutdMhvgafj7P59txw_XhSZLTf3";

async function run() {
  try {
    const res = await fetch(API, {
      headers: { Accept: "application/json" }
    });

    if (!res.ok) {
      console.log("API failed");
      return;
    }

    const data = await res.json();

    // 🔴 VALIDATION (CRITICAL)
    if (!data.draw_code) {
      console.log("Missing draw_code → skip");
      return;
    }

    if (!data.first || !data.first.ticket) {
      console.log("Incomplete result → skip");
      return;
    }

    if (!data.prizes || !data.prizes.amounts) {
      console.log("Invalid prize data → skip");
      return;
    }

    // ✅ Insert into Supabase
    const insert = await fetch(`${SUPABASE_URL}/rest/v1/results`, {
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
        first_ticket: data.first.ticket,
        full_data: data
      })
    });

    const result = await insert.text();

    console.log("Inserted:", data.draw_code);
    console.log("DB response:", result);

  } catch (err) {
    console.log("Error:", err.message);
  }
}

run();
