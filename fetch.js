import fetch from "node-fetch";

const API = "https://indialotteryapi.com/wp-json/klr/v1/latest";

const SUPABASE_URL = "https://joicadepjbjvyuxlesdh.supabase.co";
const SUPABASE_KEY = "sb_publishable_LKpGsutdMhvgafj7P59txw_XhSZLTf3";

async function run() {
  try {
    const res = await fetch(API);

    if (!res.ok) {
      console.log("API failed");
      return;
    }

    const data = await res.json();

    if (!data.draw_code) {
      console.log("Invalid data");
      return;
    }

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

    console.log("Inserted:", data.draw_code);
  } catch (err) {
    console.log("Error:", err.message);
  }
}

run();
