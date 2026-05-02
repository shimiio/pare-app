import { useState } from "react";
import { useMutation, useQueryClient } from "react-query";
import { Plus } from "lucide-react";
import { type BillingCycleValue, type WriteSubscription } from "../../types";
import { createSubscription } from "../../api/subscriptions";

type Props = {
  onClose: () => void;
};

export default function CreateSubscriptionModal({ onClose }: Props) {
  const [isClosing, setIsClosing] = useState(false);
  const [title, setTitle] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [currency, setCurrency] = useState("EUR"); // default value
  const [cycle, setCycle] = useState<BillingCycleValue>(0);

  const isoCurrent: string = new Date().toISOString().split("T")[0];
  const [startDate, setStartDate] = useState(isoCurrent);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => onClose(), 200);
  };

  // price input validation
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputPrice = e.target.value.replace(",", ".");

    if (inputPrice.length > 6) return;

    const isValidFormat = /^\d*\.?\d{0,2}$/.test(inputPrice);

    if (isValidFormat || inputPrice === "") {
      setPrice(inputPrice);
    }
  };

  const handlePriceBlur = () => {
    if (price.endsWith(".")) {
      setPrice(price.slice(0, 1));
    }
  };

  const calculateNextBilling = (startDate: string, cycle: number) => {
    const date = new Date(startDate);
    if (cycle === 0) date.setMonth(date.getMonth() + 1);
    if (cycle === 1) date.setFullYear(date.getFullYear() + 1);
    if (cycle === 2) date.setDate(date.getDate() + 7);
    return date.toISOString().split("T")[0];
  };

  const isoNextBilling = calculateNextBilling(startDate, cycle);
  const [year, month, day] = isoNextBilling.split("T")[0].split("-");

  const convertedNextBilling: string = `${day}/${month}/${year}`;

  // mutation
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      onClose();
    },
  });

  // axios request
  const handleCreate = () => {
    const convertedPrice = Number(price);
    const data: WriteSubscription = {
      name: title,
      price: convertedPrice,
      currency: currency,
      billingCycle: cycle,
      status: 0,
      nextBillingDate: isoNextBilling,
      startDate: startDate,
    };

    mutation.mutate(data);
  };

  return (
    <div
      className={`flex fixed inset-0 items-center justify-center bg-black/50 ${isClosing ? "animate-fadeOut" : "animate-fadeIn"}`}
      onClick={handleClose}
    >
      <div
        className={`flex flex-col relative bg-black/30 backdrop-blur-sm 2xl:w-130 w-50 rounded-3xl 2xl:p-13 2xl:py-18 ${isClosing ? "animate-scaleOut" : "animate-scaleIn"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-5 right-1/28 cursor-pointer text-white duration-200 transition ease-in-out hover:bg-white/15 rounded-full 2xl:p-1"
          onClick={handleClose}
        >
          <Plus className="rotate-45 h-8 w-8" />
        </button>

        <div className="flex flex-row justify-between mb-10 items-end">
          <input
            className="2xl:w-60 2xl:text-3xl focus:outline-none"
            name="subscription title"
            value={title}
            placeholder="Subscription title"
            onChange={(e) => setTitle(e.target.value)}
            autoComplete="off"
          />

          <div className="flex flex-row">
            <input
              className="2xl:w-20 2xl:text-2xl focus:outline-none"
              type="text"
              inputMode="decimal"
              name="price"
              value={price}
              placeholder="Price"
              onChange={handlePriceChange}
              onBlur={handlePriceBlur}
              autoComplete="off"
            />

            <select
              className="cursor-pointer bg-black text-2xl"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              <option value={"EUR"}>€</option>
              <option value={"USR"}>$</option>
              <option value={"UAH"}>₴</option>
            </select>
          </div>
        </div>

        <div className="flex items-start justify-between mb-4">
          <div className="flex flex-col">
            <label className="text-white/30 text-sm">Billing Cycle</label>
            <select
              className="bg-black cursor-pointer"
              value={cycle}
              onChange={(e) =>
                setCycle(Number(e.target.value) as BillingCycleValue)
              }
            >
              <option value={0}>Monthly</option>
              <option value={1}>Yearly</option>
              <option value={2}>Weekly</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex flex-col">
              <label className="text-white/30 text-sm">Start Date</label>
              <input
                className="rounded"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="text-white/30 text-sm">Next Billing Date</label>
              <div>{convertedNextBilling}</div>
            </div>
          </div>
        </div>

        <div className="flex flex-col mb-5">
          <label className="text-white/30">Service URL</label>
          <input placeholder="https://example.com"></input>
        </div>

        <div className="flex justify-end">
          <button
            className="cursor-pointer 2xl:p-2 2xl:px-4 2xl:text-2xl hover:bg-white/10 rounded-xl"
            onClick={handleCreate}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
