import fs from "fs";

let proxies = [];
let index = 0;

export function loadProxies() {
  if (!fs.existsSync("proxyList.txt")) {
    console.error("❌ proxyList.txt tidak ditemukan!");
    return;
  }

  const lines = fs.readFileSync("proxyList.txt", "utf8")
    .split("\n")
    .map(x => x.trim())
    .filter(Boolean);

  proxies = lines.map(line => {
    const [ip, port, user, pass] = line.split(":");

    if (!ip || !port || !user || !pass) {
      console.log("❌ Invalid proxy format:", line);
      return null;
    }

    return `http://${user}:${pass}@${ip}:${port}`;
  }).filter(Boolean);

  index = 0; // reset rotation
  console.log(`✔ Loaded ${proxies.length} proxies`);
}

export function getNextProxy() {
  if (proxies.length === 0) return null;

  const proxy = proxies[index];
  index = (index + 1) % proxies.length;
  return proxy;
}
