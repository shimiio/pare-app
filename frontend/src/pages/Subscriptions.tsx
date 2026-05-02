import { useState } from "react";
import { Plus } from "lucide-react";
import { useSubscriptions } from "../hooks/useSubscriptions";
import CreateSubscriptionModal from "../components/subscriptions/CreateSubscriptionModal";
import EditSubscriptionModal from "../components/subscriptions/EditSubscriptionModal";
import type { Subscription } from "../types";

export default function Subscriptions() {
  const { data, isLoading, isError } = useSubscriptions();
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [selectedSubscription, setSelectedSubscription] =
    useState<Subscription | null>(null);

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>ERROR</div>;

  return (
    <>
      <div className="flex flex-row justify-between 2xl:mb-15">
        <h1 className="2xl:text-3xl font-medium">Subscriptions</h1>
        <button
          onClick={() => setModal("create")}
          className="cursor-pointer 2xl:text-2xl hover:bg-white/15 2xl:p-2 rounded-full "
        >
          <Plus />
        </button>
      </div>
      <div className="flex flex-col mx-5">
        <div className="text-xl border-b border-white/40 pb-2.5">
          30 Apr 2026 (place holder)
        </div>
        {data?.map((subscription) => (
          <div key={subscription.id} className="flex flex-col">
            <button
              onClick={() => {
                setModal("edit");
                setSelectedSubscription(subscription);
              }}
              className="flex flex-row justify-between 2xl:p-8 border-b border-white/20 hover:bg-white/5 cursor-pointer"
            >
              <div className="flex flex-row gap-7">
                <img src="/favicon.svg" width={24}></img>
                <span className="text-xl">{subscription.name}</span>
              </div>
              <div className="flex flex-row gap-6">
                <div className="bg-yellow-500 text-yellow-900 rounded-xl p-1 px-2 font-medium">
                  6 days
                </div>
                <span className="text-xl">
                  $<span>{subscription.price}</span>
                </span>
              </div>
            </button>
          </div>
        ))}
        {modal == "create" && (
          <CreateSubscriptionModal onClose={() => setModal(null)} />
        )}
        {modal == "edit" && (
          <EditSubscriptionModal
            subscription={selectedSubscription}
            onClose={() => setModal(null)}
          />
        )}
      </div>
    </>
  );
}
