import { Star } from "lucide-react";
import type { Subscription } from "../../types";
import { formatCurrency, getDomain } from "../../utils/formatUtils";
import { getDaysUtil, getLabelColor } from "../../utils/dateUtils";

interface SubscriptionCardProps {
  subscription: Subscription;
  onClick: () => void;
  showDaysLabel?: boolean;
}

const BILLING_CYCLE_NAMES = ["Monthly", "Yearly", "Weekly"] as const;

export default function SubscriptionCard({
  subscription,
  onClick,
  showDaysLabel,
}: SubscriptionCardProps) {
  const days = getDaysUtil(subscription.nextBillingDate);
  const labelColor = getLabelColor(days);

  const calculateDailyCost = (subscription: Subscription) => {
    if (!subscription.price || subscription.price <= 0) return undefined;

    let days = 30;

    if (subscription.billingCycle === 1) {
      days = 365;
    } else if (subscription.billingCycle === 2) {
      days = 7;
    }

    return subscription.price / days;
  };

  const getBillingCycleName = (subscription: Subscription): string => {
    if (!subscription || subscription.billingCycle === undefined) {
      return "Unknown";
    }

    return BILLING_CYCLE_NAMES[subscription.billingCycle] || "Unknown";
  };

  return (
    <button
      onClick={onClick}
      className="flex flex-row justify-between p-3 px-6 2x:mx-5 hover:bg-white/2 duration-200 cursor-pointer"
    >
      <div className="flex flex-row gap-3.5 items-center">
        {subscription.serviceUrl.length > 3 ? (
          <img
            src={`https://www.google.com/s2/favicons?domain=${getDomain(subscription.serviceUrl)}&sz=64`}
            width={24}
            className="rounded-sm"
          />
        ) : (
          <Star className="w-6 h-6 text-indigo-400" />
        )}

        <div className="flex flex-col items-start">
          <span className="text-white text-sm 2xl:text-base">
            {subscription.name}
          </span>
          <span className="flex text-[10px] 2xl:text-xs items-start text-white/40">
            {getBillingCycleName(subscription)}
          </span>
        </div>
      </div>

      <div className="flex flex-row gap-3 2xl:gap-4 items-center">
        {showDaysLabel && (
          <span
            className={`flex text-xs rounded-2xl border px-2 py-0.5 font-medium gap-1 ${labelColor}`}
          >
            {days === 0 ? (
              <span className="font-medium text-[11px] 2xl:text-xs">
                today
              </span>
            ) : (
              <span className="font-medium text-[11px] 2xl:text-xs">
                {days} days
              </span>
            )}
          </span>
        )}

        <div className="flex flex-col items-end">
          <span className="flex items-center font-medium text-xs 2xl:text-sm">
            {formatCurrency(subscription.price, subscription.currency)}
          </span>
          <span className="flex items-start text-white/40 text-[10px]  2xl:text-xs">
            {formatCurrency(
              calculateDailyCost(subscription),
              subscription.currency,
            )}
            /day
          </span>
        </div>
      </div>
    </button>
  );
}
