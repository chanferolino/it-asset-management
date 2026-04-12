"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { Asset, CheckEvent } from "@/lib/checkinout/types";
import {
  MOCK_ASSETS,
  MOCK_HISTORY,
  MOCK_USERS,
} from "@/lib/checkinout/mock-data";
import { findAssetByTagOrSerial } from "@/lib/checkinout/lookup";
import { LookupForm } from "./lookup-form";
import { AssetCard } from "./asset-card";
import { AssetNotFound } from "./asset-not-found";
import { CheckoutModal, type CheckoutInput } from "./checkout-modal";
import { CheckinModal, type CheckinInput } from "./checkin-modal";
import { HistoryList } from "./history-list";

function generateEventId(): string {
  if (
    typeof globalThis.crypto !== "undefined" &&
    typeof globalThis.crypto.randomUUID === "function"
  ) {
    return `evt_${globalThis.crypto.randomUUID()}`;
  }
  return `evt_${Math.random().toString(36).slice(2)}_${Date.now()}`;
}

export function CheckinoutWorkflow() {
  const [assets, setAssets] = useState<Asset[]>(MOCK_ASSETS);
  const [events, setEvents] = useState<CheckEvent[]>(MOCK_HISTORY);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [notFoundQuery, setNotFoundQuery] = useState<string | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkinOpen, setCheckinOpen] = useState(false);

  const selectedAsset = assets.find((a) => a.id === selectedAssetId) ?? null;
  const assignee = selectedAsset?.currentAssigneeId
    ? MOCK_USERS.find((u) => u.id === selectedAsset.currentAssigneeId) ?? null
    : null;
  const eventsForSelectedAsset = selectedAsset
    ? events
        .filter((e) => e.assetId === selectedAsset.id)
        .slice()
        .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    : [];

  function handleLookup(query: string) {
    const match = findAssetByTagOrSerial(assets, query);
    if (match) {
      setSelectedAssetId(match.id);
      setNotFoundQuery(null);
    } else {
      setSelectedAssetId(null);
      setNotFoundQuery(query);
    }
  }

  function handleCheckoutSubmit({ userId, notes }: CheckoutInput) {
    if (!selectedAssetId) return;
    setAssets((prev) =>
      prev.map((a) =>
        a.id === selectedAssetId
          ? { ...a, status: "ASSIGNED", currentAssigneeId: userId }
          : a,
      ),
    );
    setEvents((prev) => [
      {
        id: generateEventId(),
        assetId: selectedAssetId,
        type: "CHECK_OUT",
        userId,
        timestamp: new Date().toISOString(),
        notes,
      },
      ...prev,
    ]);
    toast.success("Checked out — recorded locally (UI only)");
  }

  function handleCheckinSubmit({ notes }: CheckinInput) {
    if (!selectedAssetId || !selectedAsset) return;
    const returningUserId = selectedAsset.currentAssigneeId;
    if (!returningUserId) return;

    setAssets((prev) =>
      prev.map((a) =>
        a.id === selectedAssetId
          ? { ...a, status: "AVAILABLE", currentAssigneeId: undefined }
          : a,
      ),
    );
    setEvents((prev) => [
      {
        id: generateEventId(),
        assetId: selectedAssetId,
        type: "CHECK_IN",
        userId: returningUserId,
        timestamp: new Date().toISOString(),
        notes,
      },
      ...prev,
    ]);
    toast.success("Checked in — recorded locally (UI only)");
  }

  return (
    <div className="space-y-6" data-testid="checkinout-workflow">
      <LookupForm onLookup={handleLookup} />

      {selectedAsset === null && notFoundQuery === null ? (
        <div
          data-testid="checkinout-empty-prompt"
          className="rounded-3xl border border-dashed border-[#e0e0e0] bg-white/40 p-10 text-center text-sm text-[#888888] backdrop-blur-xl"
        >
          Enter an asset tag or serial number above to get started.
        </div>
      ) : null}

      {notFoundQuery !== null ? (
        <AssetNotFound
          query={notFoundQuery}
          onClear={() => setNotFoundQuery(null)}
        />
      ) : null}

      {selectedAsset !== null ? (
        <AssetCard
          asset={selectedAsset}
          assignee={assignee}
          onCheckoutClick={() => setCheckoutOpen(true)}
          onCheckinClick={() => setCheckinOpen(true)}
        />
      ) : null}

      <CheckoutModal
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        asset={selectedAsset}
        users={MOCK_USERS}
        onSubmit={handleCheckoutSubmit}
      />

      <CheckinModal
        open={checkinOpen}
        onOpenChange={setCheckinOpen}
        asset={selectedAsset}
        currentAssignee={assignee}
        onSubmit={handleCheckinSubmit}
      />

      <HistoryList
        events={eventsForSelectedAsset}
        users={MOCK_USERS}
        hasSelectedAsset={selectedAsset !== null}
      />
    </div>
  );
}
