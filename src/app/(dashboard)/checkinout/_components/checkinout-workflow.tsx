"use client";

import { useState, useEffect, useTransition } from "react";
import { toast } from "sonner";
import { Spinner } from "@/components/spinner";
import type { Asset, CheckEvent, User } from "@/lib/checkinout/types";
import {
  lookupAsset,
  getActiveUsers,
  checkOutAsset,
  checkInAsset,
} from "@/lib/actions/checkinout";
import { LookupForm } from "./lookup-form";
import { AssetCard } from "./asset-card";
import { AssetNotFound } from "./asset-not-found";
import { CheckoutModal, type CheckoutInput } from "./checkout-modal";
import { CheckinModal, type CheckinInput } from "./checkin-modal";
import { HistoryList } from "./history-list";

export function CheckinoutWorkflow() {
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [assignee, setAssignee] = useState<User | null>(null);
  const [events, setEvents] = useState<CheckEvent[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [notFoundQuery, setNotFoundQuery] = useState<string | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkinOpen, setCheckinOpen] = useState(false);
  const [isLookupPending, startLookupTransition] = useTransition();

  useEffect(() => {
    getActiveUsers().then((result) => {
      if (result.success) {
        setUsers(result.users);
      }
    });
  }, []);

  function handleLookup(query: string) {
    startLookupTransition(async () => {
      const result = await lookupAsset(query);
      if (result.success) {
        setSelectedAsset(result.asset);
        setAssignee(result.assignee);
        setEvents(result.history);
        setNotFoundQuery(null);
      } else {
        setSelectedAsset(null);
        setAssignee(null);
        setEvents([]);
        setNotFoundQuery(query);
      }
    });
  }

  async function handleCheckoutSubmit({ userId, notes }: CheckoutInput) {
    if (!selectedAsset) return;
    const result = await checkOutAsset(selectedAsset.id, userId, notes);
    if (result.success) {
      toast.success("Asset checked out successfully");
      // Refresh asset data
      const refreshed = await lookupAsset(selectedAsset.tag);
      if (refreshed.success) {
        setSelectedAsset(refreshed.asset);
        setAssignee(refreshed.assignee);
        setEvents(refreshed.history);
      }
    } else {
      toast.error(result.error);
    }
  }

  async function handleCheckinSubmit({ notes }: CheckinInput) {
    if (!selectedAsset) return;
    const result = await checkInAsset(selectedAsset.id, notes);
    if (result.success) {
      toast.success("Asset checked in successfully");
      // Refresh asset data
      const refreshed = await lookupAsset(selectedAsset.tag);
      if (refreshed.success) {
        setSelectedAsset(refreshed.asset);
        setAssignee(refreshed.assignee);
        setEvents(refreshed.history);
      }
    } else {
      toast.error(result.error);
    }
  }

  return (
    <div className="space-y-6" data-testid="checkinout-workflow">
      <LookupForm onLookup={handleLookup} />

      {isLookupPending && (
        <div className="flex items-center justify-center py-8">
          <Spinner className="size-6 text-[#c80000]" />
        </div>
      )}

      {!isLookupPending && selectedAsset === null && notFoundQuery === null ? (
        <div
          data-testid="checkinout-empty-prompt"
          className="rounded-3xl border border-dashed border-[#e0e0e0] bg-white/40 p-10 text-center text-sm text-[#888888] backdrop-blur-xl"
        >
          Enter an asset tag or serial number above to get started.
        </div>
      ) : null}

      {!isLookupPending && notFoundQuery !== null ? (
        <AssetNotFound
          query={notFoundQuery}
          onClear={() => setNotFoundQuery(null)}
        />
      ) : null}

      {!isLookupPending && selectedAsset !== null ? (
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
        users={users}
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
        events={events}
        users={users}
        hasSelectedAsset={selectedAsset !== null}
      />
    </div>
  );
}
