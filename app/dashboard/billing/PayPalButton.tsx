"use client";

import { useState, useEffect, useRef } from "react";

interface Props {
  listingId: string;
  monthlyPlanId: string;
  annualPlanId: string;
  clientId: string;
  userEmail: string;
}

type BillingCycle = "monthly" | "annual";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    paypal?: any;
  }
}

export default function PayPalButton({
  listingId,
  monthlyPlanId,
  annualPlanId,
  clientId,
  userEmail,
}: Props) {
  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const renderedCycle = useRef<BillingCycle | null>(null);

  // Load PayPal SDK once
  useEffect(() => {
    if (document.querySelector(`script[data-paypal-sdk]`)) {
      setLoading(false);
      return;
    }
    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&vault=true&intent=subscription`;
    script.setAttribute("data-paypal-sdk", "true");
    script.onload = () => setLoading(false);
    script.onerror = () => {
      setError("Failed to load PayPal. Please try again.");
      setLoading(false);
    };
    document.head.appendChild(script);
  }, [clientId]);

  // Render PayPal button whenever cycle changes or SDK loads
  useEffect(() => {
    if (loading || !window.paypal || !containerRef.current) return;
    if (renderedCycle.current === cycle) return;

    // Clear previous button
    if (containerRef.current) containerRef.current.innerHTML = "";
    renderedCycle.current = cycle;

    const planId = cycle === "monthly" ? monthlyPlanId : annualPlanId;

    window.paypal
      .Buttons({
        style: {
          shape: "rect",
          color: "gold",
          layout: "vertical",
          label: "subscribe",
        },
        createSubscription: (_data: unknown, actions: { subscription: { create: (opts: object) => Promise<string> } }) => {
          return actions.subscription.create({
            plan_id: planId,
            custom_id: listingId,
            subscriber: { email_address: userEmail },
          });
        },
        onApprove: async (data: { subscriptionID: string }) => {
          // Notify our backend so we can mark the listing as featured
          try {
            await fetch("/api/paypal/subscription-approved", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                subscriptionId: data.subscriptionID,
                listingId,
                cycle,
              }),
            });
          } catch {}
          // Redirect to dashboard with success message
          window.location.href = "/dashboard?upgraded=1";
        },
        onError: (err: unknown) => {
          console.error("PayPal error", err);
          setError("Something went wrong with PayPal. Please try again or contact support.");
        },
      })
      .render(containerRef.current);
  }, [loading, cycle, monthlyPlanId, annualPlanId, listingId, userEmail]);

  return (
    <div>
      {/* Cycle selector */}
      <div className="flex gap-2 mb-4">
        {(["monthly", "annual"] as BillingCycle[]).map((c) => (
          <button
            key={c}
            onClick={() => {
              renderedCycle.current = null; // force re-render
              setCycle(c);
            }}
            className={`flex-1 text-sm font-medium py-2 rounded-xl border transition-colors ${
              cycle === c
                ? "bg-brand-green text-white border-brand-green"
                : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
            }`}
          >
            {c === "monthly" ? "$29/mo" : "$299/yr"}
            {c === "annual" && (
              <span className="ml-1 text-xs opacity-80">(save $49)</span>
            )}
          </button>
        ))}
      </div>

      {loading && (
        <div className="text-center py-4 text-sm text-gray-400">Loading checkout…</div>
      )}

      {error && (
        <p className="text-sm text-red-600 mb-3">{error}</p>
      )}

      <div ref={containerRef} />

      <p className="text-xs text-gray-400 mt-2 text-center">
        Secured by PayPal · Cancel any time
      </p>
    </div>
  );
}
