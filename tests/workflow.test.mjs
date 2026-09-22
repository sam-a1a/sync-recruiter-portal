import { test } from "node:test";
import assert from "node:assert/strict";
import { allowedMoves, moveApplication, seed } from "../src/data.ts";
const application = (stage) => ({
  ...structuredClone(seed.applications[0]),
  stage,
});
test("hired and withdrawn applications are terminal", () => {
  for (const stage of ["Hired", "Withdrawn"]) {
    const app = application(stage);
    assert.deepEqual(allowedMoves(stage), []);
    assert.equal(moveApplication(app, "Reviewing"), app);
    assert.equal(moveApplication(app, "Rejected"), app);
  }
});
test("rejected applications can only reopen for review", () => {
  assert.deepEqual(allowedMoves("Rejected"), ["Reviewing"]);
  const app = application("Rejected");
  app.rejectionDate = "2026-09-25";
  const reopened = moveApplication(app, "Reviewing");
  assert.equal(reopened.stage, "Reviewing");
  assert.equal(reopened.rejectionDate, undefined);
  assert.equal(moveApplication(app, "Offer"), app);
});
test("a hire records an unconfirmed claim and the stated start date", () => {
  const app = moveApplication(application("Offer"), "Hired", "2026-09-20");
  assert.equal(app.confirmation, "Awaiting confirmation");
  assert.equal(app.startDate, "2026-09-20");
  assert.equal(app.history[0].text, "Moved from Offer to Hired");
});
test("rejecting schedules notification three days later and keeps notes", () => {
  const before = Date.now();
  const initial = application("Reviewing");
  const app = moveApplication(initial, "Rejected");
  assert.equal(app.stage, "Rejected");
  assert(Date.parse(app.rejectionDate) >= before + 3 * 86400000);
  assert(Date.parse(app.rejectionDate) <= Date.now() + 3 * 86400000);
  assert.deepEqual(app.notes, initial.notes);
  assert.equal(initial.stage, "Reviewing");
});
test("recruiters cannot withdraw an application or move it to its current status", () => {
  for (const stage of [
    "New",
    "Reviewing",
    "Shortlisted",
    "Interview",
    "Offer",
    "Rejected",
  ]) {
    assert(!allowedMoves(stage).includes("Withdrawn"));
    const app = application(stage);
    assert.equal(moveApplication(app, stage), app);
  }
});
