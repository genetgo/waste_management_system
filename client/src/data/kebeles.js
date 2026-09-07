export const KIFLE_KETEMAS = [
  {
    id: "abma",
    name: "Abima",
    kebeles: ["Kebele 01", "Kebele 02", "Kebele 03", "Kebele 04"]
  },
  {
    id: "nigus_teklehaymanot",
    name: "Nigus Teklehaymanot",
    kebeles: ["Kebele 05", "Kebele 06", "Kebele 07", "Kebele 08", "Kebele 09"]
  },
  {
    id: "tedila_gualu",
    name: "Tedila Gualu",
    kebeles: ["Kebele 10", "Kebele 11", "Kebele 12", "Kebele 13"]
  },
  {
    id: "menkorer",
    name: "Menkorer",
    kebeles: ["Kebele 14", "Kebele 15", "Kebele 16", "Kebele 17", "Kebele 18"]
  }
];

// Complete list of all 18 Kebeles (useful for standalone filtering)
export const ALL_KEBELES = KIFLE_KETEMAS.flatMap((kk) => kk.kebeles);

// Helper function to get Kebeles based on Sub-city (Kifle Ketema)
export const getKebelesByKifleKetema = (kifleKetemaName) => {
  const found = KIFLE_KETEMAS.find(
    (kk) => kk.name === kifleKetemaName || kk.id === kifleKetemaName
  );
  return found ? found.kebeles : [];
};