import { get as idbGet, set as idbSet, del as idbDel } from "idb-keyval";
import { v4 as uuid } from "uuid";
import {
  SCHEMA_VERSION,
  type StoredUserRecord,
  type UserProfile,
  type WardrobeItem,
  type OOTDLog,
  type SavedOutfit,
} from "@/types";

const KEYS = {
  users: "layerup_users", 
  session: "layerup_session", 
  profilePrefix: "layerup_profile_", 
  wardrobePrefix: "layerup_wardrobe_",
  ootdPrefix: "layerup_ootd_",
  outfitsPrefix: "layerup_outfits_", 
} as const;

// helpers

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

// users/sessions

export function getUsers(): Record<string, StoredUserRecord> {
  return read(KEYS.users, {});
}

export function setUser(record: StoredUserRecord): void {
  const users = getUsers();
  users[record.email] = record;
  write(KEYS.users, users);
}

export function getSessionEmail(): string | null {
  return read<{ email: string } | null>(KEYS.session, null)?.email ?? null;
}

export function setSession(email: string | null): void {
  if (!email) localStorage.removeItem(KEYS.session);
  else write(KEYS.session, { email });
}

// profile

export function getProfile(email: string): UserProfile | null {
  return read<UserProfile | null>(KEYS.profilePrefix + email, null);
}

export function saveProfile(profile: UserProfile): void {
  write(KEYS.profilePrefix + profile.email, {
    ...profile,
    schemaVersion: SCHEMA_VERSION,
    updatedAt: new Date().toISOString(),
  });
}

// wardrobe

export function getWardrobe(email: string): WardrobeItem[] {
  return read<WardrobeItem[]>(KEYS.wardrobePrefix + email, []);
}

export function saveWardrobe(email: string, items: WardrobeItem[]): void {
  write(KEYS.wardrobePrefix + email, items);
}

// ootd

export function getOOTDs(email: string): OOTDLog[] {
  return read<OOTDLog[]>(KEYS.ootdPrefix + email, []);
}

export function saveOOTDs(email: string, logs: OOTDLog[]): void {
  write(KEYS.ootdPrefix + email, logs);
}

// outfits

export function getOutfits(email: string): SavedOutfit[] {
  return read<SavedOutfit[]>(KEYS.outfitsPrefix + email, []);
}

export function saveOutfits(email: string, list: SavedOutfit[]): void {
  write(KEYS.outfitsPrefix + email, list);
}

// image storage

export async function storeImage(blob: Blob): Promise<string> {
  const id = `img_${uuid()}`;
  await idbSet(id, blob);
  return id;
}

export async function getImageURL(id: string): Promise<string | null> {
  const blob = await idbGet<Blob>(id);
  if (!blob) return null;
  return URL.createObjectURL(blob);
}

export async function deleteImage(id: string): Promise<void> {
  await idbDel(id);
}

// export data

export async function exportAllData(email: string): Promise<string> {
  const profile = getProfile(email);
  const wardrobe = getWardrobe(email);
  const ootds = getOOTDs(email);
  const outfits = getOutfits(email);

  const ids = new Set<string>();
  wardrobe.forEach((w) => w.imageRef && ids.add(w.imageRef));
  ootds.forEach((o) => o.imageRef && ids.add(o.imageRef));

  const images: Record<string, string> = {};
  for (const id of ids) {
    const blob = await idbGet<Blob>(id);
    if (blob) images[id] = await blobToBase64(blob);
  }

  return JSON.stringify(
    { schemaVersion: SCHEMA_VERSION, profile, wardrobe, ootds, outfits, images },
    null,
    2,
  );
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onerror = () => reject(r.error);
    r.onload = () => resolve(String(r.result));
    r.readAsDataURL(blob);
  });
}
