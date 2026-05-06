import { useState } from "react";
import { Plus, ChevronRight } from "lucide-react";
import { useSubscriptions } from "../hooks/useSubscriptions";
import SubscriptionCard from "../components/subscriptions/SubscriptionCard";
import CreateSubscriptionModal from "../components/subscriptions/CreateSubscriptionModal";
import EditSubscriptionModal from "../components/subscriptions/EditSubscriptionModal";
import type { Subscription } from "../types";
import { readableDate } from "../utils/dateUtils";

export default function Subscriptions() {
  const { data, isLoading, isError } = useSubscriptions();
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [selectedSubscription, setSelectedSubscription] =
    useState<Subscription | null>(null);
  const [activeOpen, setActiveOpen] = useState(true);
  const [pausedOpen, setPausedOpen] = useState(false);
  const [cancelledOpen, setCancelledOpen] = useState(false);

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>ERROR</div>;

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

  return (
    <>
      <h1 className="font-medium 2xl:text-3xl 2xl:mb-2.5">Subscriptions</h1>

      <button
        onClick={() => setModal("create")}
        className="flex cursor-pointer items-center duration-200 opacity-60 hover:opacity-100 rounded-xl 2xl:p-3 2xl:ml-3 2xl:gap-1 2xl:mb-10"
      >
        <Plus />
        <span>Add Subscription</span>
      </button>

      <div className="2xl:space-y-15">
        {/* Active */}
        {active && active.length > 0 && (
          <div className="2xl:mx-2">
            <button
              onClick={() => setActiveOpen(!activeOpen)}
              className="flex flex-row cursor-pointer items-center 2xl:text-2xl 2xl:mb-9 font-medium"
            >
              {activeOpen ? (
                <ChevronRight className="rotate-90 opacity-60 duration-200" />
              ) : (
                <ChevronRight className="opacity-60 duration-200" />
              )}
              <div>
                <span>Active</span>
                <span className="text-lg text-white/60 ml-2">
                  {active.length}
                </span>
              </div>
            </button>
            <div className="2xl:space-y-12 2xl:mx-13">
              {activeOpen &&
                groupedEntries.map(([date, subs]) => (
                  <div key={date}>
                    <div className="2xl:text-xl border-b border-white/40 2xl:pb-2.5 2xl:px-2">
                      {readableDate(date)}
                    </div>
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
                ))}
            </div>
          </div>
        )}

        {/* Paused */}
        {paused && paused.length > 0 && (
          <div className="2xl:mx-2">
            <button
              onClick={() => setPausedOpen(!pausedOpen)}
              className="flex flex-row cursor-pointer items-center 2xl:text-2xl 2xl:mb-9 font-medium"
            >
              {pausedOpen ? (
                <ChevronRight className="rotate-90 opacity-60 duration-200" />
              ) : (
                <ChevronRight className="opacity-60 duration-200" />
              )}
              <div>
                <span>Paused</span>
                <span className="text-lg text-white/60 ml-2">
                  {paused.length}
                </span>
              </div>
            </button>
            {pausedOpen &&
              paused.map((sub) => (
                <div key={sub.id} className="flex flex-col 2xl:mx-13">
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

        {/* Cancelled */}
        {cancelled && cancelled.length > 0 && (
          <div className="2xl:mx-2">
            <button
              onClick={() => setCancelledOpen(!cancelledOpen)}
              className="flex flex-row cursor-pointer items-center 2xl:text-2xl 2xl:mb-9 font-medium"
            >
              {cancelledOpen ? (
                <ChevronRight className="rotate-90 opacity-60 duration-200" />
              ) : (
                <ChevronRight className="opacity-60 duration-200" />
              )}
              <div>
                <span>Cancelled</span>
                <span className="text-lg text-white/60 ml-2">
                  {cancelled.length}
                </span>
              </div>
            </button>
            {cancelledOpen &&
              cancelled.map((sub) => (
                <div key={sub.id} className="flex flex-col mx-13">
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
