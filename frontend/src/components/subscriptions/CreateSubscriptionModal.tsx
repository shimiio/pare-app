import { useState } from "react";
import { useMutation, useQueryClient } from "react-query";
import Modal from "../ui/Modal";
import { type BillingCycleValue, type WriteSubscription } from "../../types";
import { createSubscription } from "../../api/subscriptions";
import {
  calculateNextBilling,
  formatNextBilling,
  sanitizePriceInput,
} from "../../utils/subscriptionUtils";

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

  // mutation
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      onClose();
    },
  });

  // axios create request
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
      serviceUrl: serviceUrl,
    };

    mutation.mutate(data);
  };

  return (
    <Modal onClose={handleClose} isClosing={isClosing} className="w-130">
      <div className="flex flex-row justify-between mb-10 items-end">
        {/* Subscription title */}
        <input
          className="2xl:w-60 2xl:text-3xl focus:outline-none"
          name="subscription title"
          value={title}
          placeholder="Subscription title"
          onChange={(e) => setTitle(e.target.value)}
          autoComplete="off"
        />

        <div className="flex flex-row items-end">
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

      <div className="flex items-start justify-between mb-4">
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

        <div className="flex flex-col gap-2">
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
          <div>
            <label className="text-white/30 text-sm">Next Billing Date</label>
            <div>{convertedNextBilling}</div>
          </div>
        </div>
      </div>

      {/* Service URL */}
      <div className="flex flex-col mb-5">
        <label className="text-white/30">Service URL</label>
        <input
          className="focus:outline-none"
          type="text"
          value={serviceUrl}
          placeholder="https://example.com"
          onChange={(e) => setServiceUrl(e.target.value)}
        ></input>
      </div>

      <div className="flex justify-end">
        {/* Create Button */}
        <button
          onClick={handleCreate}
          className="cursor-pointer 2xl:p-2 2xl:px-4 2xl:text-2xl hover:bg-white/10 duration-200 rounded-xl"
        >
          Create
        </button>
      </div>
    </Modal>
  );
}
