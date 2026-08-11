import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  encryptVaultPayload,
  decryptVaultPayload,
  evaluatePasswordHealth,
} from "../lib/vault-crypto";

export type VaultCategory = "login" | "card" | "note" | "api_key" | "server";

export interface CustomField {
  id: string;
  label: string;
  value: string;
  type: "text" | "hidden" | "pin";
}

export interface DecryptedVaultItem {
  id: string;
  title: string;
  category: VaultCategory;
  username?: string;
  password?: string;
  websiteUrl?: string;
  notes?: string;
  totpSecret?: string; // Base32 secret for 2FA
  customFields?: CustomField[];
  isFavorite: boolean;
  tags?: string[];
  icon?: string;
  createdAt: string;
  updatedAt: string;
  // Card specific fields (if category === 'card')
  cardNumber?: string;
  cardHolder?: string;
  cardExpMonth?: string;
  cardExpYear?: string;
  cardCvv?: string;
  // Server specific fields (if category === 'server')
  serverHost?: string;
  serverPort?: string;
  serverPrivateKey?: string;
}

export interface EncryptedVaultRecord {
  id: string;
  title: string;
  category: VaultCategory;
  username?: string;
  websiteUrl?: string;
  icon?: string;
  isFavorite: boolean;
  tags?: string[];
  encryptedData: string;
  iv: string;
  salt: string;
  createdAt: string;
  updatedAt: string;
}

interface VaultState {
  isUnlocked: boolean;
  hasMasterPasswordSet: boolean;
  autoLockMinutes: number;
  lastActivityTimestamp: number;
  selectedCategory: "all" | VaultCategory | "favorites" | "trash";
  selectedItemId: string | null;
  searchQuery: string;
  filterTag: string | null;
  
  // Storage
  encryptedRecords: EncryptedVaultRecord[];
  decryptedItems: DecryptedVaultItem[];
  
  // Actions
  unlockVault: (masterPassword: string) => Promise<{ success: boolean; error?: string }>;
  setupMasterPassword: (masterPassword: string) => Promise<void>;
  changeMasterPassword: (oldPass: string, newPass: string) => Promise<boolean>;
  lockVault: () => void;
  resetVault: () => void;
  
  saveItem: (
    itemData: Omit<DecryptedVaultItem, "id" | "createdAt" | "updatedAt"> & { id?: string },
    masterPassword: string
  ) => Promise<DecryptedVaultItem>;
  
  deleteItem: (id: string) => Promise<void>;
  toggleFavorite: (id: string, masterPassword?: string) => Promise<void>;
  setSelectedCategory: (cat: "all" | VaultCategory | "favorites" | "trash") => void;
  setSelectedItemId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setFilterTag: (tag: string | null) => void;
  touchActivity: () => void;

  exportVaultBackup: (masterPassword: string) => Promise<string>;
  importVaultBackup: (backupJson: string, masterPassword: string) => Promise<number>;
  getSecurityAudit: () => {
    total: number;
    weakCount: number;
    reusedCount: number;
    totpCount: number;
    overallScore: number;
    weakItems: DecryptedVaultItem[];
    reusedGroups: { password: string; count: number; items: DecryptedVaultItem[] }[];
  };
}

// Initial mock records for demonstration when newly setup
const DEMO_ITEMS: Omit<DecryptedVaultItem, "id" | "createdAt" | "updatedAt">[] = [
  {
    title: "GitHub Personal Platform",
    category: "login",
    username: "jjfrancoms",
    password: "ghp_PersonalSecureKey2026!#",
    websiteUrl: "https://github.com/jjfrancoms",
    notes: "Main repository and personal project access credentials.",
    totpSecret: "JBSWY3DPEHPK3PXP",
    isFavorite: true,
    tags: ["Dev", "Code"],
    icon: "code",
  },
  {
    title: "Supabase Cloud Database",
    category: "api_key",
    username: "postgres.wyqzvypfjeivjuxqbkwd",
    password: "Bi4Jlrn2cs26Jwi8",
    websiteUrl: "https://supabase.com/dashboard/project/wyqzvypfjeivjuxqbkwd",
    notes: "Production PostgreSQL database connection string and API keys.",
    isFavorite: true,
    tags: ["Database", "Production"],
    icon: "database",
  },
  {
    title: "Cloudflare R2 Object Storage",
    category: "api_key",
    username: "3ee93f08316611e843d4b0ae0edb01ae",
    password: "4ec1093a6802fb16327464018d83be9baa0d59d5601ca571d2d38aed7b2dfc07",
    websiteUrl: "https://dash.cloudflare.com",
    notes: "R2 Access Keys for asset storage pipelines.",
    isFavorite: false,
    tags: ["Cloud", "Storage"],
    icon: "cloud",
  },
  {
    title: "Primary Development Server",
    category: "server",
    username: "root",
    password: "HyperSecureLinuxSshRootPass99!",
    serverHost: "192.168.1.100",
    serverPort: "22",
    notes: "Local worker node host credentials.",
    isFavorite: false,
    tags: ["Infrastructure"],
    icon: "terminal",
  }
];

export const useVaultStore = create<VaultState>()(
  persist(
    (set, get) => ({
      isUnlocked: false,
      hasMasterPasswordSet: false,
      autoLockMinutes: 15,
      lastActivityTimestamp: Date.now(),
      selectedCategory: "all",
      selectedItemId: null,
      searchQuery: "",
      filterTag: null,
      encryptedRecords: [],
      decryptedItems: [],

      touchActivity: () => set({ lastActivityTimestamp: Date.now() }),

      setSelectedCategory: (cat) => set({ selectedCategory: cat, selectedItemId: null }),
      setSelectedItemId: (id) => set({ selectedItemId: id }),
      setSearchQuery: (searchQuery) => set({ searchQuery }),
      setFilterTag: (filterTag) => set({ filterTag }),

      setupMasterPassword: async (masterPassword: string) => {
        const encryptedRecords: EncryptedVaultRecord[] = [];
        const decryptedItems: DecryptedVaultItem[] = [];

        // Encrypt initial demo records
        for (const demo of DEMO_ITEMS) {
          const id = "item-" + Math.random().toString(36).substring(2, 9);
          const now = new Date().toISOString();
          
          const payload = {
            password: demo.password,
            notes: demo.notes,
            totpSecret: demo.totpSecret,
            customFields: demo.customFields || [],
            cardNumber: demo.cardNumber,
            cardHolder: demo.cardHolder,
            cardExpMonth: demo.cardExpMonth,
            cardExpYear: demo.cardExpYear,
            cardCvv: demo.cardCvv,
            serverHost: demo.serverHost,
            serverPort: demo.serverPort,
            serverPrivateKey: demo.serverPrivateKey,
          };

          const encrypted = await encryptVaultPayload(payload, masterPassword);

          const record: EncryptedVaultRecord = {
            id,
            title: demo.title,
            category: demo.category,
            username: demo.username,
            websiteUrl: demo.websiteUrl,
            icon: demo.icon,
            isFavorite: demo.isFavorite,
            tags: demo.tags,
            encryptedData: encrypted.encryptedData,
            iv: encrypted.iv,
            salt: encrypted.salt,
            createdAt: now,
            updatedAt: now,
          };

          encryptedRecords.push(record);
          decryptedItems.push({
            ...demo,
            id,
            createdAt: now,
            updatedAt: now,
          });
        }

        set({
          hasMasterPasswordSet: true,
          isUnlocked: true,
          encryptedRecords,
          decryptedItems,
          selectedItemId: decryptedItems[0]?.id || null,
          lastActivityTimestamp: Date.now(),
        });
      },

      unlockVault: async (masterPassword: string) => {
        const { encryptedRecords } = get();
        if (encryptedRecords.length === 0) {
          set({ isUnlocked: true, lastActivityTimestamp: Date.now() });
          return { success: true };
        }

        try {
          const decrypted: DecryptedVaultItem[] = [];

          for (const rec of encryptedRecords) {
            try {
              const payload = await decryptVaultPayload<any>(
                rec.encryptedData,
                rec.iv,
                rec.salt,
                masterPassword
              );

              decrypted.push({
                id: rec.id,
                title: rec.title,
                category: rec.category,
                username: rec.username,
                websiteUrl: rec.websiteUrl,
                icon: rec.icon,
                isFavorite: rec.isFavorite,
                tags: rec.tags,
                createdAt: rec.createdAt,
                updatedAt: rec.updatedAt,
                ...payload,
              });
            } catch {
              // Master password failed on decryption
              return { success: false, error: "Incorrect Master Password. Verification failed." };
            }
          }

          set({
            isUnlocked: true,
            decryptedItems: decrypted,
            selectedItemId: decrypted[0]?.id || null,
            lastActivityTimestamp: Date.now(),
          });
          return { success: true };
        } catch (err: any) {
          return { success: false, error: err?.message || "Failed to unlock vault" };
        }
      },

      changeMasterPassword: async (oldPass: string, newPass: string) => {
        const { encryptedRecords } = get();
        const decrypted: DecryptedVaultItem[] = [];

        try {
          // Decrypt all with old password
          for (const rec of encryptedRecords) {
            const payload = await decryptVaultPayload<any>(
              rec.encryptedData,
              rec.iv,
              rec.salt,
              oldPass
            );
            decrypted.push({ ...rec, ...payload });
          }

          // Re-encrypt all with new password
          const newEncryptedRecords: EncryptedVaultRecord[] = [];
          for (const item of decrypted) {
            const payload = {
              password: item.password,
              notes: item.notes,
              totpSecret: item.totpSecret,
              customFields: item.customFields || [],
              cardNumber: item.cardNumber,
              cardHolder: item.cardHolder,
              cardExpMonth: item.cardExpMonth,
              cardExpYear: item.cardExpYear,
              cardCvv: item.cardCvv,
              serverHost: item.serverHost,
              serverPort: item.serverPort,
              serverPrivateKey: item.serverPrivateKey,
            };
            const encrypted = await encryptVaultPayload(payload, newPass);
            newEncryptedRecords.push({
              id: item.id,
              title: item.title,
              category: item.category,
              username: item.username,
              websiteUrl: item.websiteUrl,
              icon: item.icon,
              isFavorite: item.isFavorite,
              tags: item.tags,
              encryptedData: encrypted.encryptedData,
              iv: encrypted.iv,
              salt: encrypted.salt,
              createdAt: item.createdAt,
              updatedAt: new Date().toISOString(),
            });
          }

          set({ encryptedRecords: newEncryptedRecords, decryptedItems: decrypted });
          return true;
        } catch {
          return false;
        }
      },

      lockVault: () => {
        set({
          isUnlocked: false,
          decryptedItems: [],
          selectedItemId: null,
        });
      },

      resetVault: () => {
        set({
          isUnlocked: false,
          hasMasterPasswordSet: false,
          encryptedRecords: [],
          decryptedItems: [],
          selectedItemId: null,
        });
      },

      saveItem: async (itemData, masterPassword) => {
        const now = new Date().toISOString();
        const id = itemData.id || "item-" + Math.random().toString(36).substring(2, 9);

        const payload = {
          password: itemData.password,
          notes: itemData.notes,
          totpSecret: itemData.totpSecret,
          customFields: itemData.customFields || [],
          cardNumber: itemData.cardNumber,
          cardHolder: itemData.cardHolder,
          cardExpMonth: itemData.cardExpMonth,
          cardExpYear: itemData.cardExpYear,
          cardCvv: itemData.cardCvv,
          serverHost: itemData.serverHost,
          serverPort: itemData.serverPort,
          serverPrivateKey: itemData.serverPrivateKey,
        };

        const encrypted = await encryptVaultPayload(payload, masterPassword);

        const record: EncryptedVaultRecord = {
          id,
          title: itemData.title,
          category: itemData.category,
          username: itemData.username,
          websiteUrl: itemData.websiteUrl,
          icon: itemData.icon || "lock",
          isFavorite: itemData.isFavorite ?? false,
          tags: itemData.tags || [],
          encryptedData: encrypted.encryptedData,
          iv: encrypted.iv,
          salt: encrypted.salt,
          createdAt: now,
          updatedAt: now,
        };

        const newItem: DecryptedVaultItem = {
          ...itemData,
          id,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => {
          const filteredEnc = state.encryptedRecords.filter((r) => r.id !== id);
          const filteredDec = state.decryptedItems.filter((i) => i.id !== id);
          return {
            encryptedRecords: [record, ...filteredEnc],
            decryptedItems: [newItem, ...filteredDec],
            selectedItemId: id,
            lastActivityTimestamp: Date.now(),
          };
        });

        return newItem;
      },

      deleteItem: async (id: string) => {
        set((state) => {
          const encryptedRecords = state.encryptedRecords.filter((r) => r.id !== id);
          const decryptedItems = state.decryptedItems.filter((i) => i.id !== id);
          const nextSelected = decryptedItems[0]?.id || null;
          return {
            encryptedRecords,
            decryptedItems,
            selectedItemId: state.selectedItemId === id ? nextSelected : state.selectedItemId,
          };
        });
      },

      toggleFavorite: async (id: string) => {
        set((state) => {
          const decryptedItems = state.decryptedItems.map((item) =>
            item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
          );
          const encryptedRecords = state.encryptedRecords.map((rec) =>
            rec.id === id ? { ...rec, isFavorite: !rec.isFavorite } : rec
          );
          return { decryptedItems, encryptedRecords };
        });
      },

      exportVaultBackup: async (masterPassword: string) => {
        const { encryptedRecords } = get();
        const payload = {
          version: "1.0",
          exportDate: new Date().toISOString(),
          records: encryptedRecords,
        };
        return JSON.stringify(payload, null, 2);
      },

      importVaultBackup: async (backupJson: string, masterPassword: string) => {
        try {
          const parsed = JSON.parse(backupJson);
          const records: EncryptedVaultRecord[] = parsed.records || [];
          if (!Array.isArray(records)) throw new Error("Invalid backup format");

          set((state) => {
            const existingIds = new Set(state.encryptedRecords.map((r) => r.id));
            const newRecords = records.filter((r) => !existingIds.has(r.id));
            return {
              encryptedRecords: [...state.encryptedRecords, ...newRecords],
            };
          });

          // Re-unlock to refresh decrypted list
          await get().unlockVault(masterPassword);
          return records.length;
        } catch (err: any) {
          throw new Error("Failed to import backup: " + err.message);
        }
      },

      getSecurityAudit: () => {
        const { decryptedItems } = get();
        const total = decryptedItems.length;
        if (total === 0) {
          return {
            total: 0,
            weakCount: 0,
            reusedCount: 0,
            totpCount: 0,
            overallScore: 100,
            weakItems: [],
            reusedGroups: [],
          };
        }

        const weakItems: DecryptedVaultItem[] = [];
        const passwordCounts = new Map<string, DecryptedVaultItem[]>();
        let totpCount = 0;
        let totalScoreSum = 0;

        for (const item of decryptedItems) {
          if (item.totpSecret) totpCount++;
          if (item.password) {
            const health = evaluatePasswordHealth(item.password);
            totalScoreSum += health.score;
            if (health.score < 60) {
              weakItems.push(item);
            }

            const existing = passwordCounts.get(item.password) || [];
            existing.push(item);
            passwordCounts.set(item.password, existing);
          } else {
            totalScoreSum += 80;
          }
        }

        const reusedGroups: { password: string; count: number; items: DecryptedVaultItem[] }[] = [];
        let reusedCount = 0;
        passwordCounts.forEach((items, pass) => {
          if (items.length > 1) {
            reusedCount += items.length;
            reusedGroups.push({ password: pass, count: items.length, items });
          }
        });

        let overallScore = Math.round(totalScoreSum / total);
        if (weakItems.length > 0) overallScore = Math.max(20, overallScore - weakItems.length * 5);
        if (reusedCount > 0) overallScore = Math.max(10, overallScore - reusedCount * 5);

        return {
          total,
          weakCount: weakItems.length,
          reusedCount,
          totpCount,
          overallScore: Math.min(100, Math.max(0, overallScore)),
          weakItems,
          reusedGroups,
        };
      },
    }),
    {
      name: "personal_platform_vault_store",
      partialize: (state) => ({
        hasMasterPasswordSet: state.hasMasterPasswordSet,
        autoLockMinutes: state.autoLockMinutes,
        encryptedRecords: state.encryptedRecords,
      }),
    }
  )
);
