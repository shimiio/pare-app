import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useState } from "react";
import { Plus } from "lucide-react";
import { useSubscriptions } from "../hooks/useSubscriptions";
import { useUser } from "../hooks/useUser";
import { useCurrencyRates } from "../hooks/useCurrencyRates";
import type { Subscription } from "../types";
import { getDaysUtil, getLabelColor } from "../utils/dateUtils";
import { formatCurrency, getDomain } from "../utils/formatUtils";
import {
  getMonthlyAmount,
  getMonthlyExpenses,
  getYearlyExpenses,
} from "../utils/subscriptionUtils";
import CreateSubscriptionModal from "../components/subscriptions/CreateSubscriptionModal";

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
  const [modal, setModal] = useState<"create" | null>(null);

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

  // chart data
  const months = ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr"];
  const monthlyTotal = getMonthlyExpenses(active ?? [], toDefaultCurrency);

  const chartData = months.map((month) => ({
    month,
    amount: monthlyTotal,
  }));

  return (
    <>
      <h1 className="font-medium 2xl:text-3xl 2xl:mb-2.5">Dashboard</h1>

      {!active?.length ? (
        <button
          onClick={() => setModal("create")}
          className="flex cursor-pointer items-center duration-200 opacity-60 hover:opacity-100 rounded-xl 2xl:p-3 2xl:ml-3 2xl:gap-1 2xl:mb-10"
        >
          <Plus />
          <span>Add Subscription</span>
        </button>
      ) : (
        <>
          <div className="flex flex-row justify-around mt-7.5 mb-12 mx-10">
            <div className="bg-white/7 rounded-2xl 2xl:py-5 2xl:px-11 2xl:w-60">
              <div className="text-white/70 2xl:text-xl mb-1.5">Per Month</div>
              <div className="2xl:text-2xl mb-0.5">
                {formatCurrency(
                  getMonthlyExpenses(active ?? [], toDefaultCurrency),
                  currency,
                )}
              </div>
              <div className="text-white/60 2xl:text-lg">
                {active?.length} active
              </div>
            </div>

            <div className="bg-white/7 rounded-2xl 2xl:py-5 2xl:px-11 2xl:w-60">
              <div className="text-white/70 2xl:text-xl 2xl:mb-1.5">
                Per Year
              </div>
              <div className="2xl:text-2xl 2xl:mb-0.5">
                {formatCurrency(
                  getYearlyExpenses(active ?? [], toDefaultCurrency),
                  currency,
                )}
              </div>
              <div className="text-white/60 2xl:text-lg">
                Expensive: {mostExpensive?.name ?? "N/A"}
              </div>
            </div>

            <div className="bg-white/7 rounded-2xl 2xl:py-5 2xl:px-11 2xl:w-60">
              <div className="text-white/70 text-xl 2xl:mb-1.5">
                Next Payment
              </div>
              <div className="text-2xl mb-0.5">
                in {getDaysUtil(nextPayment.nextBillingDate)} days
              </div>
              <div className="text-white/60 2xl:text-lg">
                {nextPayment.name} -{" "}
                {formatCurrency(nextPayment.price, nextPayment.currency)}
              </div>
            </div>
          </div>

          <h2 className="2xl:text-2xl mb-8">Upcoming payment</h2>
          <div className="space-y-2 mb-12">
            {sorted?.slice(0, 3).map((sub) => {
              const days = getDaysUtil(sub.nextBillingDate);
              const labelColor = getLabelColor(days);

              return (
                <div key={sub.id} className="flex flex-col">
                  <button className="flex flex-row justify-between 2xl:p-5 2xl:px-16 mx-20 bg-white/5 rounded-xl">
                    <div className="flex flex-row gap-7">
                      <img
                        src={`https://www.google.com/s2/favicons?domain=${getDomain(sub.serviceUrl)}&sz=64`}
                        width={32}
                      />
                      <span className="text-xl">{sub.name}</span>
                    </div>
                    <div className="flex flex-row 2xl:gap-5">
                      <span
                        className={`flex rounded-2xl p-1 px-3 font-medium gap-1 ${labelColor}`}
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

          {/* Monthly Expenses */}
          <h2 className="2xl:text-2xl mb-10">Monthly Expenses</h2>
          <div className="flex justify-center">
            <ResponsiveContainer width="90%" height={300}>
              <BarChart data={chartData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(0,0,0,0.8)",
                    border: "1px solid rgba(255,255,255,0.2)",
                  }}
                  labelStyle={{ color: "white" }}
                />
                <Bar dataKey="amount" fill="rgba(255,255,255,0.4)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
      {modal === "create" && (
        <CreateSubscriptionModal onClose={() => setModal(null)} />
      )}
    </>
  );
}
