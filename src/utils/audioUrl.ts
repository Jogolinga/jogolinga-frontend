// utils/audioUrl.ts
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || "https://ofasbsudfnebvafofwmu.supabase.co"
const BUCKET = "jogolinga-audio"

export function getAudioUrl(filePath: string) {
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${filePath}`
}
