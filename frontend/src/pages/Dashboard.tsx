import { useSubscriptions } from "../hooks/useSubscriptions";
import type { Subscription } from "../types";
import { getDaysUtil, getLabelColor } from "../utils/dateUtils";
import { formatCurrency, getDomain } from "../utils/formatUtils";

interface INextPayment {
  name: string;
  nextBillingDate: string;
  price?: number;
  currency: string;
}

export default function Dashboard() {
  const { data, isLoading, isError } = useSubscriptions();

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
  const RATES: Record<string, number> = {
    EUR: 1,
    USD: 1.08,
    UAH: 0.025,
  };

  const toEur = (amount: number, currency: string): number =>
    amount * (RATES[currency] ?? 1);

  const getMonthlyAmount = (sub: Subscription): number => {
    const price = sub.price ?? 0;
    const inEur = toEur(price, sub.currency);

    switch (sub.billingCycle) {
      case 0:
        return inEur;
      case 1:
        return inEur / 12;
      case 2:
        return inEur * 4.33;
      default:
        return inEur;
    }
  };

  // get monthly expenses
  const getMonthlyExpenses = (subs: Subscription[]) => {
    return subs.reduce((sum, sub) => sum + getMonthlyAmount(sub), 0);
  };

  // get yearly exprenses
  const getYearlyExprenses = (subscription: Subscription[]) => {
    const monthly = getMonthlyExpenses(subscription);
    return monthly * 12;
  };

  // get most expensive subscription name
  const mostExpensive = active?.reduce((max, sub) =>
    getMonthlyAmount(sub) > getMonthlyAmount(max) ? sub : max,
  );

  // get next payment info from sorted array
  const getNextPayment = (subscription: Subscription[]): typeof nextPayment => {
    const nextPayment: INextPayment = {
      name: subscription[0].name,
      nextBillingDate: subscription[0].nextBillingDate,
      price: subscription[0].price,
      currency: subscription[0].currency,
    };

    return nextPayment;
  };

  const nextPayment = getNextPayment(active ?? []);

  return (
    <>
      <h1 className="2xl:text-3xl 2xl:mb-10">Dashboard</h1>

      <div className="flex flex-row justify-around mb-10 mx-10">
        <div className="bg-white/7 rounded-2xl 2xl:py-5 2xl:px-11 2xl:w-60">
          <div className="text-white/70 2xl:text-xl mb-1.5">Per Month</div>
          <div className="2xl:text-2xl mb-0.5">
            {formatCurrency(getMonthlyExpenses(active ?? []), "EUR")}
          </div>
          <div className="text-white/60 2xl:text-lg">
            {active?.length} active
          </div>
        </div>

        <div className="bg-white/7 rounded-2xl 2xl:py-5 2xl:px-11 2xl:w-60">
          <div className="text-white/70 2xl:text-xl 2xl:mb-1.5">Per Year</div>
          <div className="2xl:text-2xl 2xl:mb-0.5">
            {formatCurrency(getYearlyExprenses(data ?? []), "EUR")}
          </div>
          <div className="text-white/60 2xl:text-lg">
            Expensive: {mostExpensive?.name ?? "N/A"}
          </div>
        </div>

        <div className="bg-white/7 rounded-2xl 2xl:py-5 2xl:px-11 2xl:w-60">
          <div className="text-white/70 text-xl 2xl:mb-1.5">Next Payment</div>
          <div className="text-2xl mb-0.5">
            in {getDaysUtil(nextPayment.nextBillingDate)} days
          </div>
          <div className="text-white/60 2xl:text-lg">
            {nextPayment.name} -{" "}
            {formatCurrency(nextPayment.price, nextPayment.currency)}
          </div>
        </div>
      </div>

      <h2 className="2xl:text-3xl text-white/80 mb-8">Upcoming payment</h2>
      <div className="space-y-2 mb-10">
        {sorted?.slice(0, 3).map((sub) => {
          const days = getDaysUtil(sub.nextBillingDate);
          const labelColor = getLabelColor(days);

          return (
            <div key={sub.id} className="flex flex-col">
              <button className="flex flex-row justify-between 2xl:p-6 2xl:px-16 mx-20 bg-white/5 rounded-xl">
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

      <h2 className="text-white/80 2xl:text-3xl">Monthly expenses</h2>
    </>
  );
}
