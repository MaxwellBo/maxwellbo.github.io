/**
 * @typedef {Object} Site
 * @property {string} url - The website's URL
 * @property {string} name - The name of the website or its owner
 * @property {string} feed - URL to the website's RSS/Atom feed
 */

/** @type {Site[]} */
const RING = [
  {
    url: "https://maxbo.me",
    name: "Max Bo",
    feed: "https://maxbo.me/atom.xml"
  }
];

/**
 * Returns the complete list of webring entries
 * @returns {Site[]} List of all entries in the webring
 */
export function getRing() {
  return [...RING];
}

/**
 * Gets the previous and next entries in the webring for a given URL
 * @param {string} url - The URL to find neighbors for
 * @returns {{previous: Site, next: Site}} Object containing previous and next entries
 */
export function getRingNeighbors(url) {
  let posIndex = RING.findIndex(site => site.url === url);
  
  // If URL not found in ring, use a hash of the URL to determine a position in the ring
  if (posIndex === -1) {
    const hash = url.split('').reduce((acc, char) => {
      return ((acc << 5) - acc) + char.charCodeAt(0) | 0;
    }, 0);
    
    // Use absolute value in case of negative hash
    posIndex = Math.abs(hash) % RING.length;
  }
  
  const previousIndex = (posIndex - 1 + RING.length) % RING.length;
  const nextIndex = (posIndex + 1) % RING.length;
  
  return {
    previous: RING[previousIndex],
    next: RING[nextIndex]
  };
}