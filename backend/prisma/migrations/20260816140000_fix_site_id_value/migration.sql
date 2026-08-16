-- Sites created before the siteId refactor stored siteId as "{user}-{domain}"
-- while the new model stores only the user-chosen siteId (and the on-disk
-- directories already follow the new layout). Strip the stale "{user}-" prefix.
UPDATE "Site"
SET "siteId" = substr("siteId", length("userUsername") + 2)
WHERE "siteId" LIKE "userUsername" || '-%';
