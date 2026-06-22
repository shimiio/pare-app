import { useState } from "react";
import { Star } from "lucide-react";
import CreateSubscriptionModal from "../components/subscriptions/CreateSubscriptionModal";
import { useSubscriptions } from "../hooks/useSubscriptions";
import type { BillingCycleValue, Subscription } from "../types";
import {
  getMonthlyAmount,
  getMonthlyExpenses,
  getYearlyExpenses,
} from "../utils/subscriptionUtils";
import { useCurrencyRates } from "../hooks/useCurrencyRates";
import { useUser } from "../hooks/useUser";
import { formatCurrency } from "../utils/formatUtils";
import { getDomain } from "../utils/formatUtils";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import NoActiveSubscriptions from "#components/ui/NoActiveSubscriptions";

const BILLING_CYCLE_NAMES = ["Monthly", "Yearly", "Weekly"] as const;

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

  // get billing cycle name
  const getBillingCycleName = (subscription: Subscription): string => {
    if (!subscription || subscription.billingCycle === undefined) {
      return "Unknown";
    }

    return BILLING_CYCLE_NAMES[subscription.billingCycle] || "Unknown";
  };

  // calculate daily subscription cost
  const calculateDailyCost = (
    price: number,
    billingCycle: BillingCycleValue,
  ) => {
    if (!price || price <= 0) return undefined;

    let days = 30;

    if (billingCycle === 1) {
      days = 365;
    } else if (billingCycle === 2) {
      days = 7;
    }

    return price / days;
  };

  // CALCULATIONS FOR ANALYTICS
  const totalMonthly = active
    ? getMonthlyExpenses(active, toDefaultCurrency)
    : 0;
  const totalYearly = active ? getYearlyExpenses(active, toDefaultCurrency) : 0;
  const averageCost =
    active && active.length > 0 ? totalMonthly / active.length : 0;

  const mostExpensive = sortedByPrice.length > 0 ? sortedByPrice[0] : null;
  const cheapest =
    sortedByPrice.length > 0 ? sortedByPrice[sortedByPrice.length - 1] : null;

  // Grouping for Pie Chart and progress bars on Billing Cycle (0 = Monthly, 1 = Yearly, 2 = Weekly)
  let monthlyCyclesTotal = 0;
  let yearlyCyclesTotal = 0;
  let weeklyCyclesTotal = 0;

  if (active) {
    active.forEach((sub) => {
      const monthlyAmount = getMonthlyAmount(sub, toDefaultCurrency);
      if (sub.billingCycle === 0) monthlyCyclesTotal += monthlyAmount;
      else if (sub.billingCycle === 1) yearlyCyclesTotal += monthlyAmount;
      else if (sub.billingCycle === 2) weeklyCyclesTotal += monthlyAmount;
    });
  }

  // Preparing data for Recharts (removing null values)
  const pieData = [
    { name: "Monthly", value: monthlyCyclesTotal, color: "#6366f1" },
    { name: "Yearly", value: yearlyCyclesTotal, color: "#4f46e5" },
    { name: "Weekly", value: weeklyCyclesTotal, color: "#312e81" },
  ].filter((item) => item.value > 0);

  // Progress bar percentage calculation function
  const getPercent = (value: number) => {
    if (totalMonthly === 0) return 0;
    return ((value / totalMonthly) * 100).toFixed(0);
  };

  return (
    <>
      {!active?.length ? (
        <NoActiveSubscriptions onClick={() => setModal("create")} />
      ) : (
        <div className="max-w-5xl mx-auto px-4 py-6 select-none w-full">
          {/* TWO-COLUMN GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 w-full">
            {/* LEFT COLUMN */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              {/* Financial Summary */}
              <div>
                <h3 className="text-sm font-medium text-neutral-400 uppercase tracking-wider mb-3 px-1">
                  Financial Summary
                </h3>
                <div className="bg-[#121212]/40 border border-white/5 rounded-xl p-4 flex flex-col gap-6 divide-y divide-white/5">
                  <div className="flex justify-between items-center pt-3">
                    <span className="text-xs text-neutral-400">
                      Active Subscriptions
                    </span>
                    <span className="text-sm font-semibold text-neutral-200">
                      {active.length} tracked
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-neutral-400">
                      Total Per Month
                    </span>
                    <span className="text-sm font-semibold text-neutral-100">
                      {formatCurrency(totalMonthly, currency)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-neutral-400">
                      Total Per Year
                    </span>
                    <span className="text-sm font-semibold text-neutral-100">
                      {formatCurrency(totalYearly, currency)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-neutral-400">
                      Average Service Cost
                    </span>
                    <span className="text-sm font-semibold text-neutral-300">
                      {formatCurrency(averageCost, currency)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Price Extremes */}
              <div>
                <div className="flex flex-row justify-between mb-3 px-1">
                  <h3 className="text-sm font-medium text-neutral-400 uppercase tracking-wider">
                    Price Extremes
                  </h3>
                  <p className="flex text-[10px] text-neutral-500 uppercase tracking-wider font-medium items-end">
                    Per Month
                  </p>
                </div>

                <div className="bg-[#121212]/40 border border-white/5 rounded-xl flex flex-col divide-y divide-white/5">
                  {mostExpensive && (
                    <div className="p-3.5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {mostExpensive.serviceUrl.length > 3 ? (
                          <img
                            src={`https://www.google.com/s2/favicons?domain=${getDomain(mostExpensive.serviceUrl)}&sz=64`}
                            width={24}
                            className="rounded-sm"
                          />
                        ) : (
                          <Star className="w-6 h-6 text-indigo-400" />
                        )}
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[10px] text-red-400 uppercase tracking-wider font-semibold">
                            Most Expensive
                          </span>
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-medium text-neutral-200">
                              {mostExpensive.name}
                            </span>
                            <span className="text-[11px] text-white/50">
                              · {getBillingCycleName(mostExpensive)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-xs 2xl:text-sm font-semibold text-neutral-100">
                          {formatCurrency(
                            getMonthlyAmount(mostExpensive, toDefaultCurrency),
                            currency,
                          )}
                        </span>
                        <span className="text-[10px] 2xl:text-[11px] text-white/40">
                          {formatCurrency(
                            calculateDailyCost(
                              getMonthlyAmount(
                                mostExpensive,
                                toDefaultCurrency,
                              ),
                              mostExpensive.billingCycle,
                            ),
                            currency,
                          )}
                          /day
                        </span>
                      </div>
                    </div>
                  )}

                  {cheapest && active.length > 1 && (
                    <div className="p-3.5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {cheapest.serviceUrl.length > 3 ? (
                          <img
                            src={`https://www.google.com/s2/favicons?domain=${getDomain(cheapest.serviceUrl)}&sz=64`}
                            width={24}
                            className="rounded-sm"
                          />
                        ) : (
                          <Star className="w-6 h-6 text-indigo-400" />
                        )}
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[10px] text-emerald-400 uppercase tracking-wider font-semibold">
                            Cheapest
                          </span>
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-medium text-neutral-200">
                              {cheapest.name}
                            </span>
                            <span className="text-[11px] text-white/50">
                              · {getBillingCycleName(cheapest)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-xs 2xl:text-sm font-semibold text-neutral-100">
                          {formatCurrency(
                            getMonthlyAmount(cheapest, toDefaultCurrency),
                            currency,
                          )}
                        </span>
                        <span className="text-[10px] 2xl:text-[11px] text-white/40">
                          {formatCurrency(
                            calculateDailyCost(
                              getMonthlyAmount(cheapest, toDefaultCurrency),
                              cheapest.billingCycle,
                            ),
                            currency,
                          )}
                          /day
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="lg:col-span-3">
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-end mb-3 px-1">
                  <h3 className="text-sm font-medium text-neutral-400 uppercase tracking-wider">
                    Billing Cycles Split
                  </h3>
                  <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-medium">
                    Monthly share
                  </span>
                </div>

                <div className="bg-[#121212]/40 border border-white/5 rounded-xl p-6 flex flex-col items-center justify-between min-h-95 h-full">
                  {/* Recharts Pie Chart */}
                  <div className="w-full max-w-60 aspect-square relative my-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={3}
                          stroke="none"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          // accept possibly undefined/any value from Recharts tooltip
                          formatter={(value: unknown) =>
                            formatCurrency(Number(value ?? 0), currency)
                          }
                          contentStyle={{
                            backgroundColor: "rgba(18, 18, 18, 0.95)",
                            border: "1px solid rgba(255,255,255,0.05)",
                            borderRadius: "8px",
                            fontSize: "12px",
                          }}
                          itemStyle={{ color: "#e5e5e5" }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Progress-bars */}
                  <div className="w-full space-y-4 pt-6 border-t border-white/5 mt-2">
                    {monthlyCyclesTotal > 0 && (
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="font-medium text-neutral-300">
                            Monthly Expenses
                          </span>
                          <span className="text-neutral-400">
                            {formatCurrency(monthlyCyclesTotal, currency)}
                            <span className="text-neutral-600 text-[10px] font-semibold ml-1">
                              {getPercent(monthlyCyclesTotal)}%
                            </span>
                          </span>
                        </div>
                        <div className="w-full h-1 bg-white/2 border border-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-500 rounded-full"
                            style={{
                              width: `${getPercent(monthlyCyclesTotal)}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {yearlyCyclesTotal > 0 && (
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="font-medium text-neutral-300">
                            Yearly (Converted to Month)
                          </span>
                          <span className="text-neutral-400">
                            {formatCurrency(yearlyCyclesTotal, currency)}
                            <span className="text-neutral-600 text-[10px] font-semibold ml-1">
                              {getPercent(yearlyCyclesTotal)}%
                            </span>
                          </span>
                        </div>
                        <div className="w-full h-1 bg-white/2 border border-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-600 rounded-full"
                            style={{
                              width: `${getPercent(yearlyCyclesTotal)}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {weeklyCyclesTotal > 0 && (
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="font-medium text-neutral-300">
                            Weekly Expenses
                          </span>
                          <span className="text-neutral-400">
                            {formatCurrency(weeklyCyclesTotal, currency)}
                            <span className="text-neutral-600 text-[10px] font-semibold ml-1">
                              {getPercent(weeklyCyclesTotal)}%
                            </span>
                          </span>
                        </div>
                        <div className="w-full h-1 bg-white/2 border border-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-800 rounded-full"
                            style={{
                              width: `${getPercent(weeklyCyclesTotal)}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {modal === "create" && (
        <CreateSubscriptionModal onClose={() => setModal(null)} />
      )}
    </>
  );
}
