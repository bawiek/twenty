// STRATIA Phase 3 — DTO for POST /stratia/round-robin/next-setter.
//
// The workflow HTTP_REQUEST step (roundRobinAssignmentWorkflow in Wave 5)
// POSTs { workspaceId } and uses the returned workspaceMemberId to populate
// the Opportunity.assignedMemberId field.

export type PickNextSetterRequest = {
  workspaceId: string;
};

export type PickNextSetterResponse = {
  workspaceMemberId: string;
};
