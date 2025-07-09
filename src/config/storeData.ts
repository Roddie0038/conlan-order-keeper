// Store data configuration - MASTER REFERENCE: Store Name Store Number format
// @deprecated This hardcoded mapping is being replaced by the store_email_recipients table
// TODO: Remove managerEmails field after full migration to database-driven routing
export const storeData = [
  // Mulberry 099 Plant Stores (001-011)
  { storeNumber: "001", name: "Fort Myers 001", plant: "Mulberry 099", managerEmails: "conlantire99@gmail.com" },
  { storeNumber: "002", name: "Tampa 002", plant: "Mulberry 099", managerEmails: "conlantire99@gmail.com" },
  { storeNumber: "003", name: "St. Pete 003", plant: "Mulberry 099", managerEmails: "conlantire99@gmail.com" },
  { storeNumber: "004", name: "Sarasota 004", plant: "Mulberry 099", managerEmails: "conlantire99@gmail.com" },
  { storeNumber: "005", name: "Lakeland 005", plant: "Mulberry 099", managerEmails: "conlantire99@gmail.com" },
  { storeNumber: "006", name: "Fort Pierce 006", plant: "Mulberry 099", managerEmails: "conlantire99@gmail.com" },
  { storeNumber: "007", name: "Orlando 007", plant: "Mulberry 099", managerEmails: "conlantire99@gmail.com" },
  { storeNumber: "008", name: "Lake Wales 008", plant: "Mulberry 099", managerEmails: "conlantire99@gmail.com" },
  { storeNumber: "009", name: "Gainesville 009", plant: "Mulberry 099", managerEmails: "conlantire99@gmail.com" },
  { storeNumber: "010", name: "Jacksonville 010", plant: "Mulberry 099", managerEmails: "conlantire99@gmail.com" },
  { storeNumber: "011", name: "Ocala 011", plant: "Mulberry 099", managerEmails: "conlantire99@gmail.com" },
  
  // Grand Prairie 097 Plant Stores (022, 027-030, 032-033, 035-036, 039)
  { storeNumber: "022", name: "Fort Worth 022", plant: "Grand Prairie 097", managerEmails: "roderickdemarais@aol.com, rdemarais@conlantire.com" },
  { storeNumber: "027", name: "Grand Prairie 027", plant: "Grand Prairie 097", managerEmails: "rdemarais@conlantire.com, roderickdemarais@aol.com, conlantire97@gmail.com" },
  { storeNumber: "028", name: "Houston 028", plant: "Grand Prairie 097", managerEmails: "jhughes@conlantire.com, eblais@conlantire.com" },
  { storeNumber: "029", name: "San Antonio 029", plant: "Grand Prairie 097", managerEmails: "rpetty@conlantire.com, pvallejo@conlantire.com" },
  { storeNumber: "030", name: "Oklahoma 030", plant: "Grand Prairie 097", managerEmails: "dbaumgardner@conlantire.com, bhunt@conlantire.com" },
  { storeNumber: "032", name: "Little Rock 032", plant: "Grand Prairie 097", managerEmails: "jmilliken@conlantire.com" },
  { storeNumber: "033", name: "Kansas 033", plant: "Grand Prairie 097", managerEmails: "rowilson@conlantire.com, lallen@conlantire.com" },
  { storeNumber: "035", name: "Laredo 035", plant: "Grand Prairie 097", managerEmails: "lguerra@conlantire.com, hgamez@conlantire.com" },
  { storeNumber: "036", name: "Tulsa 036", plant: "Grand Prairie 097", managerEmails: "kbrown@conlantire.com" },
  { storeNumber: "039", name: "Austin 039", plant: "Grand Prairie 097", managerEmails: "borozco@conlantire.com" },
  
  // Romulus 098 Plant Stores (040-045)
  { storeNumber: "040", name: "Romulus 040", plant: "Romulus 098", managerEmails: "conlantire98@gmail.com" },
  { storeNumber: "041", name: "Detroit 041", plant: "Romulus 098", managerEmails: "conlantire98@gmail.com" },
  { storeNumber: "042", name: "Toledo 042", plant: "Romulus 098", managerEmails: "conlantire98@gmail.com" },
  { storeNumber: "043", name: "Columbus 043", plant: "Romulus 098", managerEmails: "conlantire98@gmail.com" },
  { storeNumber: "044", name: "Flint 044", plant: "Romulus 098", managerEmails: "conlantire98@gmail.com" },
  { storeNumber: "045", name: "South Bend 045", plant: "Romulus 098", managerEmails: "conlantire98@gmail.com" },
];