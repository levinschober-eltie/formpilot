// ═══ FEATURE: Conflict Resolver (S04) ═══
// Last-Write-Wins strategy with notification.

/**
 * Resolves a conflict between local (offline) data and server data.
 * Uses Last-Write-Wins: whichever has the newer updated_at timestamp wins.
 *
 * @param {Object} localData - The locally modified data
 * @param {Object} serverData - The current server data
 * @returns {{ winner: 'local'|'server', data: Object, conflict: boolean }}
 */
export function resolveConflict(localData, serverData) {
  if (!serverData) {
    // No server version, local wins
    return { winner: 'local', data: localData, conflict: false };
  }
  if (!localData) {
    return { winner: 'server', data: serverData, conflict: false };
  }

  const localTime = new Date(localData.updatedAt || localData.updated_at || 0).getTime();
  const serverTime = new Date(serverData.updatedAt || serverData.updated_at || 0).getTime();

  if (localTime >= serverTime) {
    // Local change is newer or same — overwrite server
    return { winner: 'local', data: localData, conflict: localTime !== serverTime };
  } else {
    // Server is newer — server wins, discard local change
    return { winner: 'server', data: serverData, conflict: true };
  }
}

/**
 * Builds a conflict notification message.
 * @param {string} entityName - Name of the entity (e.g., template name)
 * @param {'local'|'server'} winner - Who won the conflict
 * @returns {string}
 */
export function getConflictMessage(entityName, winner) {
  if (winner === 'server') {
    return `Deine Offline-Aenderung an "${entityName}" wurde ueberschrieben — ein Kollege hat zwischenzeitlich Aenderungen vorgenommen.`;
  }
  return `Deine Offline-Aenderung an "${entityName}" wurde uebernommen.`;
}
