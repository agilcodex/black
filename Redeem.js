import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";
import { HttpsProxyAgent } from "https-proxy-agent";
import { getNextProxy } from "./proxyManager.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// path config.json relatif terhadap file ini
const configPath = path.join(__dirname, "./config.json");

// baca config
const configRaw = await fs.readFile(configPath, "utf8");
const config = JSON.parse(configRaw);

// ===== TOOLS =====

function md5(input) {
  return crypto.createHash("md5").update(input).digest("hex");
}

function buildSignString(params) {
  return Object.entries(params)
    .filter(([_, value]) => value !== "" && value !== undefined && value !== null)
    .map(([key, value]) => [key, String(value)])
    .sort((a, b) => (a[0] > b[0] ? 1 : -1))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");
}

export async function redeemCode(session) {
  const proxyUrl = getNextProxy();        // <-- PROXY BARU SETIAP REQUEST

  const agent = proxyUrl ? new HttpsProxyAgent(proxyUrl) : undefined;

  const { uuid, sessionId, userId } = session;

  const SECRET = config.SECRET;
  const BASE = config.BASE;
  const ENDPOINT = "/osfingerauth/activation/checkActivationCode.json";

  const params = {
    lang: config.lang,
    client: config.client,
    uuid,
    versionName: config.versionName,
    versionCode: config.versionCode,
    languageType: config.lang,
    sessionId,
    userId,
    channelCode: config.channelCode,
    serverNode: config.serverNode,
    userSource: "web",
    medium: "organic",
    campaign: "organic",
    timestamp: Date.now().toString()
  };

  const body = {
    code: config.code,
    bizType: "0",
    goodsOptionsTypeValueJson: JSON.stringify({
      rom_version: config.rom_version,
      idc_code: config.idc_code
    })
  };

  params.sign = md5(buildSignString({ ...params, ...body }) + SECRET);

  const url = BASE + ENDPOINT + "?" + new URLSearchParams(params).toString();

  const headers = {
    Accept: "*/*",
    "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
    Authorization: `${params.userId} ${params.sessionId}`,
    "Api-Version": params.versionCode,
    "Server-Node": params.serverNode,
    Origin: "https://www.cloudemulator.net",
    Referer: "https://www.cloudemulator.net/"
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: new URLSearchParams(body).toString(),
      agent
    });

    const txt = await res.text();

    let json;
    try {
      json = JSON.parse(txt);
    } catch {
      console.log("❗ RAW TEXT:", txt);
      return null;
    }

    return json;

  } catch (err) {
    console.error("FETCH ERROR:", err);
    return null;
  }
}

