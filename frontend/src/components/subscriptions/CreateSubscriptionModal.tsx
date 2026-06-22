import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "react-query";
import { X, Star } from "lucide-react";
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
  const isValidDateString =
    startDate && startDate.length === 10 && !isNaN(Date.parse(startDate));

  const isoNextBilling = isValidDateString
    ? calculateNextBilling(startDate, cycle)
    : "";

  const convertedNextBilling: string = isoNextBilling
    ? formatNextBilling(isoNextBilling)
    : "—";

  // delay for serviceUrl input
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
  const handleCreate = (e: React.FormEvent) => {
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
    <Modal
      onClose={handleClose}
      isClosing={isClosing}
      className="max-w-sm 2xl:max-w-md w-full"
    >
      <form
        onSubmit={handleCreate}
        className="flex flex-col w-full text-left select-none"
      >
        {/* HEADER */}
        <div className="p-4 flex justify-between items-center border-b border-white/5">
          <h3 className="text-sm font-medium text-neutral-400 uppercase tracking-wider">
            Create Subscription
          </h3>
          <button
            type="button"
            onClick={handleClose}
            className="text-neutral-500 hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* FORM CONTENT */}
        <div className="p-6 space-y-5">
          {/* Service Name & URL */}
          <div className="space-y-4">
            {/* Service Name with Favicon */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-neutral-500 uppercase tracking-widest px-1">
                Service Name
              </label>
              <div className="relative group flex items-center">
                <div className="absolute left-3 flex items-center justify-center text-neutral-500 group-focus-within:text-indigo-400 transition-colors">
                  {debouncedServiceUrl.length > 3 ? (
                    <img
                      src={`https://www.google.com/s2/favicons?domain=${getDomain(debouncedServiceUrl)}&sz=64`}
                      width={19}
                      height={19}
                      className="rounded-sm object-contain"
                      alt="favicon"
                    />
                  ) : (
                    <Star size={16} />
                  )}
                </div>
                <input
                  type="text"
                  name="subscription title"
                  value={title}
                  placeholder="e.g. Netflix"
                  onChange={(e) => setTitle(e.target.value)}
                  autoComplete="off"
                  className="w-full bg-[#121212]/50 border border-white/5 rounded-xl py-2.5 pl-9 pr-4 text-xs 2xl:text-sm text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-indigo-500/50 transition-all"
                />
              </div>
            </div>

            {/* Service URL */}
            <div className="space-y-1.5">
              <label className="flex justify-between text-[10px] font-semibold text-neutral-500 uppercase tracking-widest px-1">
                <p>Service URL</p>
                <p className="flex items-end text-[9px] text-neutral-600">
                  Used to fetch the service icon
                </p>
              </label>
              <input
                type="text"
                value={serviceUrl}
                placeholder="https://example.com"
                onChange={(e) => setServiceUrl(e.target.value)}
                autoComplete="off"
                className="w-full bg-[#121212]/50 border border-white/5 rounded-xl py-2.5 px-4 text-xs 2xl:text-sm text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-indigo-500/50 transition-all"
              />
            </div>
          </div>

          {/* Price & Currency */}
          <div className="grid grid-cols-3 gap-4 pt-1 border-t border-white/5">
            <div className="col-span-2 space-y-1.5 mt-3">
              <label className="text-[10px] font-semibold text-neutral-500 uppercase tracking-widest px-1">
                Price
              </label>
              <input
                type="text"
                inputMode="decimal"
                name="price"
                value={price}
                placeholder="0.00"
                onChange={handlePriceChange}
                onBlur={handlePriceBlur}
                autoComplete="off"
                className="w-full bg-[#121212]/50 border border-white/5 rounded-xl py-2.5 px-4 text-xs 2xl:text-sm text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-indigo-500/50 transition-all"
              />
            </div>
            <div className="space-y-1.5 mt-3">
              <label className="text-[10px] font-semibold text-neutral-500 uppercase tracking-widest px-1">
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-[#121212]/50 border border-white/5 rounded-xl py-2.5 px-3 text-xs 2xl:text-sm text-neutral-200 focus:outline-none focus:border-indigo-500/50 appearance-none transition-all cursor-pointer"
              >
                <option value="EUR">EUR (€)</option>
                <option value="USD">USD ($)</option>
                <option value="UAH">UAH (₴)</option>
              </select>
            </div>
          </div>

          {/* Billing Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-neutral-500 uppercase tracking-widest px-1">
                Billing Cycle
              </label>
              <select
                value={cycle}
                onChange={(e) =>
                  setCycle(Number(e.target.value) as BillingCycleValue)
                }
                className="w-full bg-[#121212]/50 border border-white/5 rounded-xl py-2.5 px-3 text-xs 2xl:text-sm text-neutral-200 focus:outline-none focus:border-indigo-500/50 appearance-none transition-all cursor-pointer"
              >
                <option value={0}>Monthly</option>
                <option value={1}>Yearly</option>
                <option value={2}>Weekly</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-neutral-500 uppercase tracking-widest px-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-[#121212]/50 border border-white/5 rounded-xl py-2.5 px-4 text-xs 2xl:text-sm text-neutral-200 focus:outline-none focus:border-indigo-500/50 transition-all cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-50 [&::-webkit-calendar-picker-indicator]:invert hover:[&::-webkit-calendar-picker-indicator]:opacity-80"
              />
            </div>
          </div>

          <div className="flex items-center justify-between px-1 pt-2">
            <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-widest">
              Next Billing Date
            </span>
            <span className="text-xs 2xl:text-sm font-medium text-neutral-300">
              {convertedNextBilling}
            </span>
          </div>
        </div>

        {/* FOOTER & ACTIONS */}
        <div className="p-6 pt-4 border-t border-white/5 bg-[#0a0a0a]/70">
          {errors.length > 0 && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs space-y-1">
              {errors.map((err, i) => (
                <div key={i}>• {err}</div>
              ))}
            </div>
          )}

          <button
            type="submit"
            disabled={!isValidDateString}
            className="flex justify-center items-center cursor-pointer w-full bg-linear-to-br from-pink-400/15 via-violet-500/10 to-blue-500/20 hover:bg-violet-400/5 text-white py-3 rounded-xl text-xs 2xl:text-sm font-semibold shadow-lg shadow-indigo-600/10 transition-all active:scale-98 disabled:hover:bg-violet-400/0 disabled:opacity-70 disabled:cursor-not-allowed disabled:shadow-none disabled:scale-100"
          >
            Create Subscription
          </button>
        </div>
      </form>
    </Modal>
  );
}
