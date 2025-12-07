// handle.js

const serverNames = {
  SG_IDC_03: "Singapore",
  HK_IDC_01: "Hongkong",
  TH_IDC_01: "Thailand",
  TW_IDC_04: "Taiwan",
  US_IDC_01: "United States", 
};

export function handleResponse(res, elapsed, now, startAt, config) {

  if (!res) {
    console.log(`[${now()}] [info] [${elapsed}s] Tidak ada response, retry...`);
    return { action: "retry", delay: 3000 };
  }

  // ===== 2108 handler =====
  if (res.resultCode === 2109) {
    const msg = (res.resultDesc || res.resultMsg || "").toLowerCase();

    if (msg.includes("request") || msg.includes("frequently") || msg.includes("try")) {
      console.log(`[${now()}] [info] [${elapsed}s] Server gave response Limit frequent.`);
      return { action: "retry", delay: 3000 };
    }

    if (msg.includes("unable") || msg.includes("purchase") || msg.includes("no")) {
      console.log(`[${now()}] [info] [${elapsed}s] Server gave response empty stock.`);
      return { action: "retry", delay: 3000 };
    }
  }
  
  //===== SUCCESS RESULT =====
  
  if (res.resultCode === 1) {
    const msg = (res.resultDesc || res.resultMsg || "").toLowerCase();

    if (msg.includes("invalid") || msg.includes("check")) {
      const endAt = now();
    const serverKey = config.server_idc_code?.toUpperCase();
    const serverName = serverNames[serverKey] || serverKey;

    console.log(`[${now()}] [info] [${elapsed}s] Successfully get server ${serverName}`);
    console.log(`[${now()}] [info] Start: ${startAt} | End: ${endAt}`);

    return { action: "success" };
    }
  }

	if (res.resultCode === 0) {
    const msg = (res.resultDesc || res.resultMsg || "").toLowerCase();

    if (msg.includes("distributed") || msg.includes("didistribusikan")) {
      const endAt = now();
    const serverKey = config.server_idc_code?.toUpperCase();
    const serverName = serverNames[serverKey] || serverKey;

    console.log(`[${now()}] [info] [${elapsed}s] Successfully get server ${serverName}`);
    console.log(`[${now()}] [info] Start: ${startAt} | End: ${endAt}`);

    return { action: "success" };
    }
  }

  if (res.resultCode === 200 || res.resultCode === 500 || res.resultCode === 0) {
    const endAt = now();
    const serverKey = config.server_idc_code?.toUpperCase();
    const serverName = serverNames[serverKey] || serverKey;

    console.log(`[${now()}] [info] [${elapsed}s] Successfully get server ${serverName}`);
    console.log(`[${now()}] [info] Start: ${startAt} | End: ${endAt}`);

    return { action: "success" };
  }

  // ===== UNKNOWN RESPONSE =====
  console.log(`[${now()}] [info] [${elapsed}s]`, res);
  return { action: "retry", delay: 1200 };
}
