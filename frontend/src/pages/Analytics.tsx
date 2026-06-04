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
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

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

          <div className="flex w-full flex-col gap-6">
            <div className="flex items-end 2xl:mb-5 justify-between">
              <h2 className="2xl:text-2xl">Pie Chart</h2>
              <span className="text-sm text-white/70">
                Monthly cost split by subscription
              </span>
            </div>
            <div className="rounded-3xl p-4 w-full">
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={sortedByPrice.map((sub) => ({
                      name: sub.name,
                      value: getMonthlyAmount(sub, toDefaultCurrency),
                    }))}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={3}
                    label={({ name, percent }) =>
                      `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`
                    }
                  >
                    {sortedByPrice.map((sub, index) => {
                      const colors = [
                        "#3b82f6",
                        "#14b8a6",
                        "#f97316",
                        "#e11d48",
                        "#8b5cf6",
                        "#22c55e",
                        "#facc15",
                        "#0ea5e9",
                      ];
                      return (
                        <Cell
                          key={sub.id}
                          fill={colors[index % colors.length]}
                        />
                      );
                    })}
                  </Pie>
                  <Tooltip
                    formatter={(
                      value:
                        | number
                        | string
                        | readonly (string | number)[]
                        | undefined,
                    ) => {
                      const actualValue = Array.isArray(value)
                        ? value[0]
                        : value;

                      return formatCurrency(
                        typeof actualValue === "number"
                          ? actualValue
                          : Number(actualValue ?? 0),
                        currency,
                      );
                    }}
                    contentStyle={{
                      backgroundColor: "rgba(15, 23, 42, 0.95)",
                      border: "1px solid rgba(255,255,255,0.12)",
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={48}
                    iconType="circle"
                    wrapperStyle={{ paddingTop: 16 }}
                  />
                </PieChart>
              </ResponsiveContainer>
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
