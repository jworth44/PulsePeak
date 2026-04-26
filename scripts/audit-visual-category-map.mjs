import {
  getVisualCategoryAuditSnapshot
} from "../shared/visualCategoryMap.js";

const snapshot = getVisualCategoryAuditSnapshot();

console.log(
  JSON.stringify(
    {
      audit: "visual-category-map",
      totalLiveMovements: snapshot.totalLiveMovements,
      mappedCount: snapshot.mappedCount,
      unmappedCount: snapshot.unmappedCount,
      categoryCounts: snapshot.categoryCounts,
      lowMediumConfidenceItems: snapshot.lowMediumConfidenceItems,
      duplicateIds: snapshot.duplicateIds,
      missingDisplayNames: snapshot.missingDisplayNames
    },
    null,
    2
  )
);
