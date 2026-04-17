export function getBestMap(maps) {
  return maps.reduce((a, b) => (a.wr > b.wr ? a : b))
}

export function getWorstMap(maps) {
  return maps.reduce((a, b) => (a.wr < b.wr ? a : b))
}

export function getFocus(maps) {
  const lowEco = maps.find(m => m.eco < 40)
  if (lowEco) return "Improve eco rounds"

  const badEntry = maps.find(m => m.entryDiff < 0)
  if (badEntry) return "Reduce early deaths"

  return "Keep current playstyle"
}

export function getMainAgent(map) {
  if (!map.agents || map.agents.length === 0) return "Flex"

  return map.agents.reduce((a, b) => (a.wr > b.wr ? a : b)).name
}