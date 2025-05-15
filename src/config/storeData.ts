
/**
 * Store data configuration with manager emails
 * Used to map store numbers to their manager email addresses
 */

interface StoreInfo {
  storeNumber: string;
  name: string;
  managerEmails: string;
}

export const storeData: StoreInfo[] = [
  { storeNumber: "22", name: "Fort Worth 22", managerEmails: "jmartinez@conlantire.com" },
  { storeNumber: "27", name: "Grand Prairie 27", managerEmails: "tosborn@conlantire.com, crichard@conlantire.com" },
  { storeNumber: "28", name: "Houston 28", managerEmails: "jhughes@conlantire.com, eblais@conlantire.com" },
  { storeNumber: "29", name: "San Antonio 29", managerEmails: "rpetty@conlantire.com, pvallejo@conlantire.com" },
  { storeNumber: "30", name: "OKC 30", managerEmails: "dbaumgardner@conlantire.com, bhunt@conlantire.com" },
  { storeNumber: "32", name: "Little Rock 32", managerEmails: "jmilliken@conlantire.com" },
  { storeNumber: "33", name: "Kansas 33", managerEmails: "rjohnson@conlantire.com, rowilson@conlantire.com, lallen@conlantire.com" },
  { storeNumber: "35", name: "Laredo 35", managerEmails: "lguerra@conlantire.com, hgamez@conlantire.com" },
  { storeNumber: "36", name: "Tulsa 36", managerEmails: "rjohnson@conlantire.com, kbrown@conlantire.com" },
  { storeNumber: "39", name: "Austin 39", managerEmails: "borozco@conlantire.com" },
  { storeNumber: "Admin", name: "Admin", managerEmails: "Roderickdemarais@aol.com, Conlantire97@gmail.com" }
];
