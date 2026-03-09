// server/catalog.js
// ✅ Source de vérité côté serveur (prix en centimes)
module.exports = {
  // id: { name, format, unitCents, imageUrl }
  "2": {
    name: "Nuit Festive",
    format: "20x60 cm | framed",
    unitCents: 10, // ⚠️ exemple : 1.00€ -> 100 (mets tes vrais prix)
    imageUrl: "https://storage.googleapis.com/atip_storage/Festive-Night_Mask.jpg",
  },

   "1": {
    name: "Nuit Festive",
    format: "20x60 cm | unframed",
    unitCents: 10, // ⚠️ exemple : 1.00€ -> 100 (mets tes vrais prix)
    imageUrl: "https://storage.googleapis.com/atip_storage/ATIP_Framing_side.jpg", 
  },

};