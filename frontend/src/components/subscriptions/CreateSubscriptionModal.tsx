import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "react-query";
import { Asterisk } from "lucide-react";
import axios from "axios";
import Modal from "../ui/Modal";
import { type BillingCycleValue, type WriteSubscription } from "../../types";
import { createSubscription } from "../../api/subscriptions";
import {
  calculateNextBilling,
  formatNextBilling,
  sanitizePriceInput,
} from "../../utils/subscriptionUtils";
import { getDomain } from "../../utils/formatUtils";

type Props = {
  onClose: () => void;
};

export default function CreateSubscriptionModal({ onClose }: Props) {
  const [isClosing, setIsClosing] = useState(false);
  const [title, setTitle] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [currency, setCurrency] = useState("EUR"); // default value
  const [cycle, setCycle] = useState<BillingCycleValue>(0);
  const [serviceUrl, setServiceUrl] = useState<string>("");
  const [debouncedServiceUrl, setDebouncedServiceUrl] = useState<string>("");
  const [errors, setErrors] = useState<string[]>([]);

  const isoCurrent: string = new Date().toISOString().split("T")[0];
  const [startDate, setStartDate] = useState(isoCurrent);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => onClose(), 200);
  };

  // price input validation
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const result = sanitizePriceInput(e.target.value);
    if (result !== null) setPrice(result);
  };

  const handlePriceBlur = () => {
    if (price.endsWith(".")) {
      setPrice(price.slice(0, 1));
    }
  };

  // calculate and format next billing date
  const isoNextBilling = calculateNextBilling(startDate, cycle);
  const convertedNextBilling: string = formatNextBilling(isoNextBilling);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedServiceUrl(serviceUrl);
    }, 1000);

    return () => {
      clearTimeout(handler);
    };
  }, [serviceUrl, setDebouncedServiceUrl]);

  // mutation
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      onClose();
    },
    onError: (error: unknown) => {
      if (axios.isAxiosError(error)) {
        const data = error.response?.data?.errors as
          | Record<string, string[]>
          | undefined;
        if (data) {
          const messages = Object.values(data).flat();
          setErrors(messages);
        }
      }
    },
  });

  // axios create request
  const handleCreate = (e: React.SubmitEvent) => {
    e.preventDefault();
    const convertedPrice = Number(price);
    const data: WriteSubscription = {
      name: title,
      price: convertedPrice,
      currency: currency,
      billingCycle: cycle,
      status: 0,
      nextBillingDate: isoNextBilling,
      startDate: startDate,
      serviceUrl: serviceUrl,
    };

    mutation.mutate(data);
  };

  return (
    <Modal onClose={handleClose} isClosing={isClosing} className="w-118">
      <form onSubmit={handleCreate} className="flex flex-col w-full">
        <div className="flex flex-row justify-between mb-10 items-end">
          {/* Subscription title */}
          <div className="flex flex-row gap-3">
            <div className="flex items-center">
              {serviceUrl.length > 3 ? (
                <img
                  src={`https://www.google.com/s2/favicons?domain=${getDomain(debouncedServiceUrl)}&sz=64`}
                  width={32}
                />
              ) : (
                <Asterisk className="w-8 h-8" />
              )}
            </div>

            <input
              className="2xl:w-50 2xl:text-2xl focus:outline-none border-b border-white/10 pb-1"
              name="subscription title"
              value={title}
              placeholder="Subscription title"
              onChange={(e) => setTitle(e.target.value)}
              autoComplete="off"
            />
          </div>

          <div className="flex flex-row items-center border-b border-white/10 pb-1">
            {/* Price */}
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

            {/* Currency */}
            <select
              className="cursor-pointer bg-black text-2xl"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              <option value={"EUR"}>€</option>
              <option value={"USD"}>$</option>
              <option value={"UAH"}>₴</option>
            </select>
          </div>
        </div>

        <div className="flex items-start justify-between mb-5 mx-2">
          {/* Billing Cycle */}
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

          <div className="flex flex-col w-30 gap-2">
            {/* Start Date */}
            <div className="flex flex-col">
              <label className="text-white/30 text-sm">Start Date</label>
              <input
                className="rounded"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            {/* Next Billing Date */}
            <div className="flex flex-col w-30">
              <label className="text-white/30 text-sm">Next Billing Date</label>
              <input
                type="text"
                value={convertedNextBilling}
                readOnly
                className="bg-transparent text-neutral-400 cursor-not-allowed border-none focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Service URL */}
        <div className="flex flex-col mb-5">
          <label className="text-white/30 text-sm">Service URL</label>
          <input
            className="focus:outline-none"
            type="text"
            value={serviceUrl}
            placeholder="https://example.com"
            onChange={(e) => setServiceUrl(e.target.value)}
          ></input>
        </div>

        <div className="flex justify-between">
          {/* Error Messages */}
          {errors.length > 0 ? (
            <div className="text-red-400 text-sm space-y-1">
              {errors.map((err, i) => (
                <div key={i}>• {err}</div>
              ))}
            </div>
          ) : (
            <div></div>
          )}

          {/* Create Button */}
          <button
            type="submit"
            className="cursor-pointer 2xl:p-2 2xl:px-5 2xl:text-2xl hover:bg-white/5 active:bg-white/10 duration-200 rounded-xl h-fit"
          >
            Create
          </button>
        </div>
      </form>
    </Modal>
  );
}
