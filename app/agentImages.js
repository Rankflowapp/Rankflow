// Récupère dynamiquement les images des agents depuis valorant-api.com
// Plus besoin de maintenir une liste d'UUIDs manuellement

let cachedAgentImages = null

export async function fetchAgentImages() {
  if (cachedAgentImages) return cachedAgentImages

  try {
    const res = await fetch("https://valorant-api.com/v1/agents?isPlayableCharacter=true")
    const data = await res.json()

    const agents = {}
    data.data.forEach(a => {
      if (a.displayName && a.displayIcon) {
        agents[a.displayName] = a.displayIcon
      }
    })

    cachedAgentImages = agents
    return agents
  } catch (error) {
    console.error("Erreur récupération images agents:", error)
    return {}
  }
}