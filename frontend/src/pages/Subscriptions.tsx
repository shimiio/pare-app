import { useState } from "react";
import { Plus, ChevronRight } from "lucide-react";
import { useSubscriptions } from "../hooks/useSubscriptions";
import CreateSubscriptionModal from "../components/subscriptions/CreateSubscriptionModal";
import EditSubscriptionModal from "../components/subscriptions/EditSubscriptionModal";
import type { Subscription } from "../types";

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

  // date converting
  const readableDate = (dateString: string): string => {
    const date = new Date(dateString);

    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // get day difference
  const getDaysUtil = (date: string): number => {
    const today = new Date();
    const target = new Date(date);

    const diffMs = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    return diffDays;
  };

  // label color
  const getLabelColor = (days: number) => {
    if (days <= 3) return "bg-red-500/20 text-red-400";
    if (days <= 7) return "bg-yellow-500/20 text-yellow-400";
    return "bg-green-500/20 text-green-400";
  };

  // get domain from service url
  const getDomain = (url: string) => {
    try {
      const withProtocol = url.startsWith("http") ? url : `https://${url}`;
      return new URL(withProtocol).hostname.replace("www", "");
    } catch {
      return url;
    }
  };

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
                    {subs.map((sub) => {
                      const days = getDaysUtil(sub.nextBillingDate);
                      const labelColor = getLabelColor(days);

                      return (
                        <div key={sub.id} className="flex flex-col">
                          <button
                            onClick={() => {
                              setModal("edit");
                              setSelectedSubscription(sub);
                            }}
                            className="flex flex-row justify-between 2xl:p-6 2xl:px-10 border-b border-white/20 hover:bg-white/5 cursor-pointer"
                          >
                            <div className="flex flex-row gap-7">
                              <img
                                src={`https://www.google.com/s2/favicons?domain=${getDomain(sub.serviceUrl)}&sz=64`}
                                width={32}
                              ></img>
                              <span className="text-xl">{sub.name}</span>
                            </div>
                            <div className="flex flex-row gap-5">
                              <div
                                className={`flex rounded-2xl p-1 px-3 font-medium gap-1 ${labelColor}`}
                              >
                                <span className="font-medium">{days}</span>days
                              </div>

                              <span className="flex text-xl gap-1">
                                <span>{sub.price}</span>$
                              </span>
                            </div>
                          </button>
                        </div>
                      );
                    })}
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
                  <button
                    onClick={() => {
                      setModal("edit");
                      setSelectedSubscription(sub);
                    }}
                    className="flex flex-row justify-between 2xl:p-6 2xl:px-10 border-y border-white/20 hover:bg-white/5 cursor-pointer"
                  >
                    <div className="flex flex-row gap-7">
                      <img src="/favicon.svg" width={24}></img>
                      <span className="text-xl">{sub.name}</span>
                    </div>

                    <div className="flex text-xl gap-1">
                      <span>{sub.price}</span>$
                    </div>
                  </button>
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
                  <button
                    onClick={() => {
                      setModal("edit");
                      setSelectedSubscription(sub);
                    }}
                    className="flex flex-row justify-between 2xl:p-6 2xl:px-10 border-y border-white/20 hover:bg-white/5 cursor-pointer"
                  >
                    <div className="flex flex-row gap-7">
                      <img src="/favicon.svg" width={24}></img>
                      <span className="text-xl">{sub.name}</span>
                    </div>
                    <div className="flex flex-row gap-6">
                      <span className="flex text-xl gap-1">
                        <span>{sub.price}</span>$
                      </span>
                    </div>
                  </button>
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
