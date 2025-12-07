import fs from "fs/promises";
import { redeemCode } from "./Redeem.js";
import { loadProxies } from "./proxyManager.js";
import { handleResponse } from "./handle.js";

const config = JSON.parse(await fs.readFile("./config.json", "utf8"));

loadProxies();

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const now = () => new Date().toLocaleTimeString("id-ID", { hour12: false });

(async () => {
  let session;

  try {
    session = JSON.parse(await fs.readFile("./sessions.json", "utf8"));
    console.log(`[${now()}] [info] Session loaded`);
  } catch {
    console.error(`[${now()}] [info] Gagal membaca sessions.json`);
    return;
  }

  const scriptStart = Date.now();
  const startAt = now();

  while (true) {
    const res = await redeemCode(session);
    const elapsed = ((Date.now() - scriptStart) / 1000).toFixed(2);

    const action = handleResponse(res, elapsed, now, startAt, config);

    if (action.action === "success") break;
    await delay(action.delay);
  }
})();
