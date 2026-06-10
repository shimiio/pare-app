import { useState } from "react";
import { useSubscriptions } from "../hooks/useSubscriptions";
import { useUser } from "../hooks/useUser";
import { useCurrencyRates } from "../hooks/useCurrencyRates";
import type { Subscription } from "../types";
import { getDaysUtil } from "../utils/dateUtils";
import { formatCurrency } from "../utils/formatUtils";
import {
  getMonthlyAmount,
  getMonthlyExpenses,
  getYearlyExpenses,
} from "../utils/subscriptionUtils";
import CreateSubscriptionModal from "../components/subscriptions/CreateSubscriptionModal";
import SubscriptionCard from "#components/subscriptions/SubscriptionCard";
import EditSubscriptionModal from "#components/subscriptions/EditSubscriptionModal";
import NoActiveSubscriptions from "#components/ui/NoActiveSubscriptions";

interface INextPayment {
  name: string;
  nextBillingDate: string;
  price?: number;
  currency: string;
}

export default function Dashboard() {
  const { data, isLoading, isError } = useSubscriptions();
  const { data: user } = useUser();
  const currency = user?.currency ?? "EUR";
  const { data: rates } = useCurrencyRates(currency);
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [selectedSubscription, setSelectedSubscription] =
    useState<Subscription | null>(null);

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>ERROR</div>;

  // get active subscriptions
  const subscriptions: Subscription[] | undefined = data;
  const active = subscriptions?.filter((sub) => sub.status === 0);

  // sort by date
  const sorted = active?.sort((a, b) => {
    return (
      new Date(a.nextBillingDate).getTime() -
      new Date(b.nextBillingDate).getTime()
    );
  });

  // currency
  const toDefaultCurrency = (amount: number, fromCurrency: string): number => {
    if (!rates) return amount;
    const inBase = amount / (rates[fromCurrency] ?? 1);
    return inBase * (rates[currency] ?? 1);
  };

  // get most expensive subscription name
  const mostExpensive = active?.length
    ? active.reduce((max, sub) =>
        getMonthlyAmount(sub, toDefaultCurrency) >
        getMonthlyAmount(max, toDefaultCurrency)
          ? sub
          : max,
      )
    : null;

  // get next payment info from sorted array
  const getNextPayment = (
    subscription: Subscription[],
  ): INextPayment | null => {
    if (!subscription.length || subscription.length === 0) return null;

    return {
      name: subscription[0].name,
      nextBillingDate: subscription[0].nextBillingDate,
      price: subscription[0].price,
      currency: subscription[0].currency,
    };
  };

  const nextPayment = getNextPayment(sorted ?? []) ?? {
    name: "N/A",
    nextBillingDate: new Date().toISOString(),
    price: 0,
    currency: "EUR",
  };

  const getNextPaymentColor = (days: number) => {
    if (days <= 3) return "text-red-400";
    if (days <= 7) return "text-yellow-400";
    return "text-green-400";
  };

  const nextPaymentColor = getNextPaymentColor(
    getDaysUtil(nextPayment.nextBillingDate),
  );

  // get next billing day
  const nextBillingDay = getDaysUtil(nextPayment.nextBillingDate);

  return (
    <>
      {!active?.length ? (
        <NoActiveSubscriptions onClick={() => setModal("create")} />
      ) : (
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* Per Month */}
            <div className="bg-[#121212]/40 border border-white/5 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <p className="text-xs text-neutral-500 uppercase tracking-wider font-medium">
                  Per Month
                </p>
                <p className="text-2xl font-semibold text-neutral-100 mt-1">
                  {formatCurrency(
                    getMonthlyExpenses(active ?? [], toDefaultCurrency),
                    currency,
                  )}
                </p>
              </div>

              <div className="text-white/60 2xl:text-lg">
                <p className="text-xs text-neutral-400 mt-3 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                  {active?.length} active subscriptions
                </p>
              </div>
            </div>

            {/* Yearly */}
            <div className="bg-[#121212]/40 border border-white/5 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <p className="text-xs text-neutral-500 uppercase tracking-wider font-medium">
                  Per Year
                </p>
                <p className="text-2xl font-semibold text-neutral-100 mt-1">
                  {formatCurrency(
                    getYearlyExpenses(active ?? [], toDefaultCurrency),
                    currency,
                  )}
                </p>
              </div>

              <div className="text-xs text-neutral-400 mt-3 flex flex-col gap-0.5">
                <p className="text-neutral-500 text-[10px] uppercase tracking-wider">
                  Most Expensive
                </p>
                <p className="font-medium text-neutral-300">
                  {mostExpensive?.name ?? "N/A"}
                </p>
              </div>
            </div>

            {/* Next Payment */}
            <div className="bg-[#121212]/40 border border-white/5 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <p className="text-xs text-neutral-500 uppercase tracking-wider font-medium">
                  Next Payment
                </p>
                <p
                  className={`text-2xl font-semibold mt-1 ${nextPaymentColor}`}
                >
                  {nextBillingDay === 0 ? (
                    <span>Today</span>
                  ) : (
                    <span>in {nextBillingDay} days</span>
                  )}
                </p>
              </div>
              <div className="text-xs text-neutral-400 mt-3 flex flex-col gap-0.5">
                <p className="text-neutral-500 text-[10px] uppercase tracking-wider">
                  Upcoming
                </p>
                <p className="font-medium text-neutral-300">
                  {nextPayment.name} -{" "}
                  {formatCurrency(nextPayment.price, nextPayment.currency)}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h3 className="text-sm font-medium text-neutral-400 uppercase tracking-wider mb-3 px-1">
                Upcoming Payments
              </h3>

              <div className="bg-[#121212]/40 border border-white/5 rounded-xl flex flex-col">
                <div className="divide-y divide-white/5">
                  {sorted?.slice(0, 3).map((sub) => (
                    <div key={sub.id} className="flex flex-col">
                      <SubscriptionCard
                        subscription={sub}
                        onClick={() => {
                          setModal("edit");
                          setSelectedSubscription(sub);
                        }}
                        showDaysLabel
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-neutral-400 uppercase tracking-wider mb-3 px-1">
                Budget Summary
              </h3>

              <div className="bg-[#121212]/40 border border-white/5 rounded-xl p-4 flex flex-col gap-4">
                <div>
                  <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-medium">
                    Daily Average
                  </p>
                  <p className="text-lg font-semibold text-neutral-200 mt-0.5">
                    {formatCurrency(
                      getMonthlyExpenses(active ?? [], toDefaultCurrency) / 30,
                      currency,
                    )}
                    <span className="text-xs font-normal text-neutral-500">
                      / day
                    </span>
                  </p>
                </div>

                <div className="border-t border-white/5 pt-3">
                  <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-medium">
                    Active Services
                  </p>
                  <p className="text-lg font-semibold text-neutral-200 mt-0.5">
                    {active?.length}{" "}
                    <span className="text-xs font-normal text-neutral-500">
                      tracked
                    </span>
                  </p>
                </div>

                <div className="border-t border-white/5 pt-3">
                  <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-medium">
                    Yearly Projected
                  </p>
                  <p className="text-lg font-semibold text-neutral-200 mt-0.5">
                    {formatCurrency(
                      getYearlyExpenses(active ?? [], toDefaultCurrency),
                      currency,
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {modal === "create" && (
        <CreateSubscriptionModal onClose={() => setModal(null)} />
      )}
      {modal == "edit" && (
        <EditSubscriptionModal
          subscription={selectedSubscription}
          onClose={() => setModal(null)}
        />
      )}
    </>
  );
}
