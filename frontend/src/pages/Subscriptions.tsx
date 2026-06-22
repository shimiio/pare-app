import { useState } from "react";
import { Plus, ChevronRight } from "lucide-react";
import { useSubscriptions } from "../hooks/useSubscriptions";
import SubscriptionCard from "../components/subscriptions/SubscriptionCard";
import CreateSubscriptionModal from "../components/subscriptions/CreateSubscriptionModal";
import EditSubscriptionModal from "../components/subscriptions/EditSubscriptionModal";
import type { Subscription } from "../types";
import { readableDate } from "../utils/dateUtils";
import { getMonthlyExpenses } from "../utils/subscriptionUtils";
import { useCurrencyRates } from "#hooks/useCurrencyRates";
import { useUser } from "#hooks/useUser";
import { formatCurrency } from "../utils/formatUtils";
import NoActiveSubscriptions from "#components/ui/NoActiveSubscriptions";

export default function Subscriptions() {
  const { data, isLoading, isError } = useSubscriptions();
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [selectedSubscription, setSelectedSubscription] =
    useState<Subscription | null>(null);
  const [activeOpen, setActiveOpen] = useState(true);
  const [pausedOpen, setPausedOpen] = useState(false);
  const [cancelledOpen, setCancelledOpen] = useState(false);
  const { data: user } = useUser();
  const currency = user?.currency ?? "EUR";
  const { data: rates } = useCurrencyRates(currency);

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>ERROR</div>;
  if (!data) return null;

  const subscriptions: Subscription[] | undefined = data;
  const active = subscriptions?.filter((sub) => sub.status === 0);
  const cancelled = subscriptions?.filter((sub) => sub.status === 1);
  const paused = subscriptions?.filter((sub) => sub.status === 2);

  const sorted = active?.sort((a, b) => {
    return (
      new Date(a.nextBillingDate).getTime() -
      new Date(b.nextBillingDate).getTime()
    );
  });

  const grouped = sorted?.reduce(
    (acc, sub) => {
      const date = sub.nextBillingDate;

      if (!acc[date]) {
        acc[date] = [];
      }

      acc[date].push(sub);
      return acc;
    },
    {} as Record<string, Subscription[]>,
  );

  const groupedEntries = Object.entries(grouped ?? {});

  const toDefaultCurrency = (amount: number, fromCurrency: string): number => {
    if (!rates) return amount;
    const inBase = amount / (rates[fromCurrency] ?? 1);
    return inBase * (rates[currency] ?? 1);
  };

  return (
    <>
      {subscriptions?.length === 0 ? (
        <NoActiveSubscriptions onClick={() => setModal("create")} />
      ) : (
        <div className="space-y-10 2xl:space-y-13 max-w-5xl 2xl:max-w-6xl mx-auto px-4 py-10">
          {/* Active */}
          {active && active.length > 0 ? (
            <>
              <div className="flex flex-row justify-between mb-6">
                <button
                  onClick={() => setActiveOpen(!activeOpen)}
                  className="flex flex-row cursor-pointer items-center text-lg 2xl:text-xl font-medium"
                >
                  {activeOpen ? (
                    <ChevronRight className="h-5 w-5 2xl:h-6 2xl:w-6 rotate-90 opacity-60 duration-200" />
                  ) : (
                    <ChevronRight className="h-5 w-5 2xl:h-6 2xl:w-6 opacity-60 duration-200" />
                  )}
                  <div>
                    <span>Active</span>
                    <span className="text-xs 2xl:text-sm ml-1.5">
                      {active.length}
                    </span>
                    <span className="text-xs 2xl:text-sm text-white/40 ml-1.5">
                      ·{" "}
                      {formatCurrency(
                        getMonthlyExpenses(active ?? [], toDefaultCurrency),
                        currency,
                      )}
                      /mo
                    </span>
                  </div>
                </button>

                <button
                  onClick={() => setModal("create")}
                  className="flex items-center gap-1 px-3 py-1.5 backdrop-blur-xs text-white bg-linear-to-br from-pink-400/15 via-violet-500/10 to-blue-500/20 border border-white/5 hover:bg-violet-400/5 shadow-md shadow-indigo-600/10 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer"
                >
                  <Plus size={12} strokeWidth={2} />
                  <span className="text-neutral-200">Add Subscription</span>
                </button>
              </div>

              <div className="space-y-8 2xl:space-y-9 mx-13">
                {activeOpen &&
                  groupedEntries.map(([date, subs], index) => (
                    <div key={date}>
                      <div className="flex justify-between pb-1.5 px-2">
                        <span className="text-sm 2xl:text-base">
                          {readableDate(date)}
                        </span>
                        {index === 0 && (
                          <span className="flex items-end text-white/40 uppercase text-[10px] 2xl:text-xs tracking-wider">
                            Next Payment
                          </span>
                        )}
                      </div>
                      <div className="bg-[#121212]/40 border border-white/5 rounded-xl flex flex-col divide-y divide-white/5">
                        {subs.map((sub) => (
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
                  ))}
              </div>
            </>
          ) : (
            <div className="w-full bg-[#121212]/30 border border-white/5 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center">
              <p className="text-sm font-medium text-neutral-400">
                No active services right now
              </p>
              <p className="text-xs text-neutral-500 mt-1 max-w-xs">
                All your tracked subscriptions are currently paused or
                cancelled.
              </p>
              <button
                onClick={() => setModal("create")}
                className="font-bold bg-clip-text text-transparent bg-linear-to-r from-fuchsia-400 via-violet-400 to-indigo-400 mt-3 text-xs 2xl:text-sm opacity-90 cursor-pointer"
              >
                + Track new service
              </button>
            </div>
          )}

          {/* Paused */}
          {paused && paused.length > 0 && (
            <>
              <button
                onClick={() => setPausedOpen(!pausedOpen)}
                className="flex flex-row cursor-pointer items-center text-xl mb-9 font-medium"
              >
                {pausedOpen ? (
                  <ChevronRight className="h-5 w-5 2xl:h-6 2xl:w-6 rotate-90 opacity-60 duration-200" />
                ) : (
                  <ChevronRight className="h-5 w-5 2xl:h-6 2xl:w-6 opacity-60 duration-200" />
                )}
                <div className="text-lg 2xl:text-xl">
                  <span>Paused</span>
                  <span className="text-xs 2xl:text-sm ml-1.5">
                    {paused.length}
                  </span>
                </div>
              </button>

              <div className="mx-13">
                {pausedOpen && (
                  <div className="bg-[#121212]/40 border border-white/5 rounded-xl flex flex-col divide-y divide-white/5">
                    {paused.map((sub) => (
                      <div key={sub.id} className="flex flex-col">
                        <SubscriptionCard
                          subscription={sub}
                          onClick={() => {
                            setModal("edit");
                            setSelectedSubscription(sub);
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Cancelled */}
          {cancelled && cancelled.length > 0 && (
            <>
              <button
                onClick={() => setCancelledOpen(!cancelledOpen)}
                className="flex flex-row cursor-pointer items-center text-xl mb-9 font-medium"
              >
                {cancelledOpen ? (
                  <ChevronRight className="h-5 w-5 2xl:h-6 2xl:w-6 rotate-90 opacity-60 duration-200" />
                ) : (
                  <ChevronRight className="h-5 w-5 2xl:h-6 2xl:w-6 opacity-60 duration-200" />
                )}
                <div className="text-lg 2xl:text-xl">
                  <span>Cancelled</span>
                  <span className="text-xs 2xl:text-sm ml-1.5">
                    {cancelled.length}
                  </span>
                </div>
              </button>

              <div className="mx-13">
                {cancelledOpen && (
                  <div className="bg-[#121212]/40 border border-white/5 rounded-xl flex flex-col divide-y divide-white/5">
                    {cancelled.map((sub) => (
                      <div key={sub.id} className="flex flex-col">
                        <SubscriptionCard
                          subscription={sub}
                          onClick={() => {
                            setModal("edit");
                            setSelectedSubscription(sub);
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {modal == "create" && (
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
