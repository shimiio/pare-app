import { useState } from "react";
import { Plus } from "lucide-react";
import CreateSubscriptionModal from "../components/subscriptions/CreateSubscriptionModal";
import { useSubscriptions } from "../hooks/useSubscriptions";
import type { Subscription } from "../types";
import {
  getMonthlyAmount,
  getMonthlyExpenses,
  getYearlyExpenses,
} from "../utils/subscriptionUtils";
import { useCurrencyRates } from "../hooks/useCurrencyRates";
import { useUser } from "../hooks/useUser";
import { formatCurrency } from "../utils/formatUtils";
import { getDaysUtil, getLabelColor } from "../utils/dateUtils";
import { getDomain } from "../utils/formatUtils";

export default function Analytics() {
  const { data, isLoading, isError } = useSubscriptions();
  const { data: user } = useUser();
  const currency = user?.currency ?? "EUR";
  const { data: rates } = useCurrencyRates(currency);
  const [modal, setModal] = useState<"create" | null>(null);

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>ERROR</div>;

  // get active subscriptions
  const subscriptions: Subscription[] | undefined = data;
  const active = subscriptions?.filter((sub) => sub.status === 0);

  // currency
  const toDefaultCurrency = (amount: number, fromCurrency: string): number => {
    if (!rates) return amount;
    const inBase = amount / (rates[fromCurrency] ?? 1);
    return inBase * (rates[currency] ?? 1);
  };

  // sort by price
  const sortedByPrice = active
    ? [...active].sort((a, b) => {
        const costA = getMonthlyAmount(a, toDefaultCurrency);
        const costB = getMonthlyAmount(b, toDefaultCurrency);
        return costB - costA;
      })
    : [];

  return (
    <>
      <h1 className="2xl:text-3xl 2xl:mb-2.5 font-medium">Analytics</h1>

      {!active?.length ? (
        <button
          onClick={() => setModal("create")}
          className="flex cursor-pointer items-center duration-200 opacity-60 hover:opacity-100 rounded-xl 2xl:p-3 2xl:ml-3 2xl:gap-1 2xl:mb-10"
        >
          <Plus />
          <span>Add Subscription</span>
        </button>
      ) : (
        <div className="flex 2xl:mt-12 w-full px-4 gap-15">
          <div className="flex flex-col w-full">
            <div className="text-xl mb-12">
              <h2 className="2xl:text-2xl mb-5">Main Info</h2>
              <div className="px-3 space-y-1">
                <div>Active - {active?.length ?? 0}</div>
                <div>
                  Per Month -{" "}
                  {formatCurrency(
                    getMonthlyExpenses(active ?? [], toDefaultCurrency),
                    currency,
                  )}
                </div>
                <div>
                  Per Year -{" "}
                  {formatCurrency(
                    getYearlyExpenses(active ?? [], toDefaultCurrency),
                    currency,
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="2xl:text-2xl 2xl:mb-5">
                Top 3 the most expensive
              </h2>
              {sortedByPrice?.slice(0, 3).map((sub) => {
                const days = getDaysUtil(sub.nextBillingDate);
                const labelColor = getLabelColor(days);

                return (
                  <div key={sub.id} className="flex flex-col">
                    <button className="flex flex-row justify-between 2xl:p-4 2xl:px-11 mx-2 bg-white/5 rounded-xl">
                      <div className="flex flex-row gap-5">
                        <img
                          src={`https://www.google.com/s2/favicons?domain=${getDomain(sub.serviceUrl)}&sz=64`}
                          width={32}
                        />
                        <span className="text-xl">{sub.name}</span>
                      </div>
                      <div className="flex flex-row 2xl:gap-4 text-sm">
                        <span
                          className={`items-center flex rounded-2xl p-1 px-3 font-medium gap-1 ${labelColor}`}
                        >
                          <span className="font-medium">{days}</span>days
                        </span>
                        <span className="flex items-center">
                          {formatCurrency(sub.price, sub.currency)}
                        </span>
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex w-full">
            <h2 className="2xl:text-2xl">Pie chart</h2>
          </div>
        </div>
      )}
      {modal === "create" && (
        <CreateSubscriptionModal onClose={() => setModal(null)} />
      )}
    </>
  );
}
