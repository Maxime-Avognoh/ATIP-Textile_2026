// server/catalog.js
// Source de vérité côté serveur (prix en centimes)

const SEPT_DISCOUNT = 0.20;

function getUnitCents(baseCents) {
  const now = new Date();
  const isOnSale = now.getFullYear() === 2026 && now.getMonth() === 8; // 8 = September
  return isOnSale ? Math.round(baseCents * (1 - SEPT_DISCOUNT)) : baseCents;
}

const BASE_CATALOG = {
  "1": {
    name: "Festive Night",
    format: "60x20 cm | unframed",
    baseCents: 7600,
    imageUrl: "https://storage.googleapis.com/atip_storage/ATIP_Framing_side.jpg",
  },
  "2": {
    name: "Festive Night",
    format: "60x20 cm | framed",
    baseCents: 8990,
    imageUrl: "https://storage.googleapis.com/atip_storage/Festive-Night_Mask.jpg",
  },
  "3": {
    name: "Aloe Flowers",
    format: "60x20 cm | unframed",
    baseCents: 7600,
    imageUrl: "https://storage.googleapis.com/atip_storage/Aloe%20Flower%201.jpg",
  },
  "4": {
    name: "Aloe Flowers",
    format: "60x20 cm | framed",
    baseCents: 8990,
    imageUrl: "https://storage.googleapis.com/atip_storage/Face_F_Aloe_Flowers.jpg",
  },
  "5": {
    name: "Wax and Honey",
    format: "60x20 cm | unframed",
    baseCents: 7600,
    imageUrl: "https://storage.googleapis.com/atip_storage/W%26H_Vert_face.JPG",
  },
  "6": {
    name: "Festive Night",
    format: "20x20 cm | framed",
    baseCents: 3990,
    imageUrl: "https://storage.googleapis.com/atip_storage/ATIP_SQ_NF_%20Front.jpg",
  },
  "7": {
    name: "Aloe Flowers",
    format: "20x20 cm | framed",
    baseCents: 3990,
    imageUrl: "https://storage.googleapis.com/atip_storage/ATIP_SQ_AF_Front.jpg",
  },
  "8": {
    name: "Dragonflies",
    format: "20x20 cm | framed",
    baseCents: 3990,
    imageUrl: "https://storage.googleapis.com/atip_storage/ATIP_SQ_DF_Front.jpg",
  },
};

// Export with unitCents computed at runtime (applies September discount automatically)
module.exports = Object.fromEntries(
  Object.entries(BASE_CATALOG).map(([id, p]) => [
    id,
    { ...p, unitCents: getUnitCents(p.baseCents) },
  ])
);
