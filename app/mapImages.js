// Récupère dynamiquement les images des maps depuis valorant-api.com
// Plus besoin de maintenir une liste d'UUIDs manuellement

let cachedMapImages = null

export async function fetchMapImages() {
  if (cachedMapImages) return cachedMapImages

  try {
    const res = await fetch("https://valorant-api.com/v1/maps")
    const data = await res.json()

    const map = {}
    data.data.forEach(m => {
      if (m.displayName && m.splash) {
        map[m.displayName] = m.splash
      }
    })

    cachedMapImages = map
    return map
  } catch (error) {
    console.error("Erreur récupération images maps:", error)
    return {}
  }
}