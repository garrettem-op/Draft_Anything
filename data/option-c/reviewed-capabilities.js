/* Option C — reviewed capability SAMPLE (PR 1).
 *
 * A deliberately tiny, source-linked sample of capabilities the existing
 * ability index does not yet model, used to exercise the sport-rules
 * framework. It is NOT the #82/#83 research atlas and must not be read as
 * roster coverage. Every record is `provisional` until the owner/ChatGPT
 * review signs it off; nothing here changes live ratings or eligibility.
 *
 * Record: id (pool:Character), capability (Option C kind), label, feat,
 * source, continuity, limitation, status, reviewedBy.
 */
(function (root) {
  'use strict';
  const NS = root.DA_OPTION_C_MODULES || (root.DA_OPTION_C_MODULES = {});
  const RECORDS = Object.freeze([
    Object.freeze({
      id: 'mcu:Spider-Man',
      capability: 'danger-sense',
      label: 'Spider-sense (danger anticipation)',
      feat: 'Marvel\'s on-screen profile describes an internal alarm for impending danger alongside enhanced strength, stamina and agility that lets him react quickly.',
      source: 'https://www.marvel.com/characters/spider-man-peter-parker/on-screen',
      continuity: 'Marvel Cinematic Universe (on-screen profile)',
      limitation: 'Warns of danger; it is not general foresight of where a ball will go, and it can be overwhelmed or deceived.',
      status: 'provisional',
      reviewedBy: 'claude-option-c-pr1 (source read 2026-11-12; awaiting owner review)',
    }),
  ]);
  const byId = Object.create(null);
  for (const r of RECORDS) (byId[r.id] || (byId[r.id] = [])).push(r);
  const api = {
    REVIEWED_CAPABILITIES: RECORDS,
    reviewedCapabilitiesFor: id => (byId[id] || []).slice(),
  };
  NS.reviewedCapabilities = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
