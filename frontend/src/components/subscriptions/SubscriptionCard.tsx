import { Asterisk } from "lucide-react";
import type { Subscription } from "../../types";
import { formatCurrency, getDomain } from "../../utils/formatUtils";
import { getDaysUtil, getLabelColor } from "../../utils/dateUtils";

interface SubscriptionCardProps {
  subscription: Subscription;
  onClick: () => void;
  showDaysLabel?: boolean;
}

export default function SubscriptionCard({
  subscription,
  onClick,
  showDaysLabel,
}: SubscriptionCardProps) {
  const days = getDaysUtil(subscription.nextBillingDate);
  const labelColor = getLabelColor(days);

  return (
    <button
      onClick={onClick}
      className="flex flex-row justify-between rounded-xl 2xl:p-6 2xl:px-15 2x:mx-5 bg-white/5 hover:bg-white/10 duration-200 mx-3 cursor-pointer"
    >
      <div className="flex flex-row gap-7 items-center">
        {subscription.serviceUrl.length > 3 ? (
          <img
            src={`https://www.google.com/s2/favicons?domain=${getDomain(subscription.serviceUrl)}&sz=64`}
            width={32}
          />
        ) : (
          <Asterisk className="w-8 h-8" />
        )}
        <span className="text-xl">{subscription.name}</span>
      </div>
      <div className="flex flex-row gap-5">
        {showDaysLabel && (
          <span
            className={`flex rounded-2xl p-1 px-3 font-medium gap-1 ${labelColor}`}
          >
            <span className="font-medium">{days}</span>days
          </span>
        )}
        <span className="flex items-center">
          {formatCurrency(subscription.price, subscription.currency)}
        </span>
      </div>
    </button>
  );
}
