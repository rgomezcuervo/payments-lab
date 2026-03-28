/**
 * @param {import('./content-provider.js').LandingContent} a
 * @param {import('./content-provider.js').LandingContent | undefined} b
 * @returns {import('./content-provider.js').LandingContent}
 */
export function mergeLandingContent(a, b) {
  const slotsA = a.slots && typeof a.slots === 'object' ? a.slots : {};
  const slotsB = b && b.slots && typeof b.slots === 'object' ? b.slots : {};
  const bannerItems =
    b && Array.isArray(b.bannerItems) ? b.bannerItems : a && Array.isArray(a.bannerItems) ? a.bannerItems : undefined;
  return {
    slots: { ...slotsA, ...slotsB },
    ...(bannerItems !== undefined ? { bannerItems } : {}),
  };
}
