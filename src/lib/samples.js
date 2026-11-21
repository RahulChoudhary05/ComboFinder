// Sample catalogues users can download (CSV / Excel / JSON) or load instantly.

const HEADERS = ["ProductNo", "ProductName", "Category", "ProductPrice", "Discount", "InStock", "Supplier", "ProductDesc", "ProductCreate", "ProductExpire"]

const ROWS = [
  [1001, "Laptop 14\" Ultrabook", "Electronics", 1200, 0, "Yes", "TechCorp", "High performance, 16 GB RAM", "2024-01-15", "2027-01-15"],
  [1002, "Wireless Mouse", "Electronics", 80, 5, "Yes", "TechCorp", "Ergonomic, silent clicks", "2024-02-20", "2026-02-20"],
  [1003, "Mechanical Keyboard", "Electronics", 120, 0, "Yes", "KeyMaster", "Hot-swappable brown switches", "2024-03-10", "2026-03-10"],
  [1004, "27\" 4K Monitor", "Electronics", 350, 10, "No", "DisplayTech", "IPS, 60 Hz, USB-C", "2024-04-05", "2027-04-05"],
  [1005, "Noise Cancelling Headphones", "Audio", 200, 15, "Yes", "SoundWave", "40 h battery", "2024-05-12", "2026-05-12"],
  [1006, "HD Webcam", "Electronics", 75, 0, "Yes", "TechVision", "1080p with dual microphones", "2024-06-18", "2026-06-18"],
  [1007, "Bluetooth Speaker", "Audio", 95, 0, "Yes", "SoundWave", "Waterproof IPX7", "2024-02-01", "2026-02-01"],
  [1008, "USB-C Hub 7-in-1", "Accessories", 45, 0, "Yes", "PortPlus", "HDMI, SD, 100 W PD", "2024-03-03", "2027-03-03"],
  [1009, "Laptop Stand", "Accessories", 35, 0, "Yes", "DeskPro", "Aluminium, adjustable", "2024-01-20", "2029-01-20"],
  [1010, "Portable SSD 1 TB", "Storage", 110, 10, "Yes", "DataVault", "1050 MB/s", "2024-04-14", "2028-04-14"],
  [1011, "Wireless Earbuds", "Audio", 130, 20, "Yes", "SoundWave", "ANC, wireless charging case", "2024-05-02", "2026-05-02"],
  [1012, "Smartwatch", "Wearables", 250, 0, "Yes", "FitGear", "GPS, heart-rate, 7-day battery", "2024-06-01", "2027-06-01"],
  [1013, "Fitness Band", "Wearables", 60, 0, "Yes", "FitGear", "Sleep and step tracking", "2024-06-11", "2026-06-11"],
  [1014, "Gaming Chair", "Furniture", 290, 15, "Yes", "DeskPro", "Lumbar support, 4D arms", "2024-02-17", "2030-02-17"],
  [1015, "Standing Desk", "Furniture", 420, 5, "No", "DeskPro", "Dual motor, memory presets", "2024-03-22", "2031-03-22"],
  [1016, "Desk Lamp LED", "Furniture", 40, 0, "Yes", "BrightCo", "Dimmable, USB charging port", "2024-01-08", "2028-01-08"],
  [1017, "Graphics Tablet", "Electronics", 170, 0, "Yes", "DrawLab", "8192 pressure levels", "2024-07-04", "2028-07-04"],
  [1018, "Wi-Fi 6 Router", "Networking", 140, 10, "Yes", "NetWave", "AX3000, dual band", "2024-05-25", "2028-05-25"],
  [1019, "Mesh Wi-Fi Node", "Networking", 99, 0, "Yes", "NetWave", "Add-on satellite", "2024-05-25", "2028-05-25"],
  [1020, "Power Bank 20000 mAh", "Accessories", 50, 0, "Yes", "ChargeIt", "65 W USB-C PD", "2024-04-30", "2027-04-30"],
  [1021, "Phone Gimbal", "Camera", 115, 0, "Yes", "SteadyShot", "3-axis stabiliser", "2024-08-09", "2027-08-09"],
  [1022, "Action Camera", "Camera", 310, 12, "Yes", "SteadyShot", "4K60, waterproof", "2024-08-15", "2027-08-15"],
  [1023, "MicroSD 256 GB", "Storage", 30, 0, "Yes", "DataVault", "A2, V30", "2024-02-05", "2030-02-05"],
  [1024, "Ring Light", "Camera", 55, 0, "Yes", "BrightCo", "18 inch with tripod", "2024-03-12", "2028-03-12"],
  [1025, "Condenser Microphone", "Audio", 145, 0, "Yes", "SoundWave", "USB, cardioid", "2024-07-19", "2028-07-19"],
  [1026, "E-Reader", "Electronics", 160, 0, "Yes", "PageTurn", "300 ppi, warm light", "2024-09-01", "2028-09-01"],
  [1027, "Smart Plug (2-pack)", "Smart Home", 25, 0, "Yes", "HomeIQ", "Energy monitoring", "2024-06-21", "2029-06-21"],
  [1028, "Video Doorbell", "Smart Home", 180, 10, "Yes", "HomeIQ", "2K, night vision", "2024-07-07", "2028-07-07"],
  [1029, "Robot Vacuum", "Smart Home", 380, 18, "Yes", "CleanBot", "LiDAR mapping", "2024-08-28", "2029-08-28"],
  [1030, "Air Purifier", "Smart Home", 220, 0, "No", "PureAir", "HEPA H13, 40 m²", "2024-10-10", "2029-10-10"],
]

export const SAMPLE_HEADERS = HEADERS
export const SAMPLE_ROWS = ROWS

export function sampleCSV() {
  const esc = (v) => {
    const s = String(v)
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  return [HEADERS, ...ROWS].map((r) => r.map(esc).join(",")).join("\r\n")
}

export function sampleJSON() {
  const products = ROWS.map((r) => Object.fromEntries(HEADERS.map((h, i) => [h, r[i]])))
  return JSON.stringify({ products }, null, 2)
}

/** Two-sheet workbook with a title row above the header (demonstrates sheet picking + header detection). */
export async function sampleXLSX() {
  const XLSX = await import("xlsx")
  const wb = XLSX.utils.book_new()
  const tech = ROWS.filter((r) => !["Furniture", "Smart Home"].includes(r[2]))
  const home = ROWS.filter((r) => ["Furniture", "Smart Home"].includes(r[2]))
  const s1 = XLSX.utils.aoa_to_sheet([["Tech catalogue – Q3 price list"], [], HEADERS, ...tech])
  const s2 = XLSX.utils.aoa_to_sheet([HEADERS, ...home])
  const widths = [10, 30, 14, 12, 9, 8, 12, 34, 12, 12].map((wch) => ({ wch }))
  s1["!cols"] = widths
  s2["!cols"] = widths
  XLSX.utils.book_append_sheet(wb, s1, "Tech")
  XLSX.utils.book_append_sheet(wb, s2, "Home & Office")
  return XLSX.write(wb, { bookType: "xlsx", type: "array" })
}
