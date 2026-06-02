import { useState } from "react";
import { useMutation, useQueryClient } from "react-query";
import axios from "axios";
import Modal from "../ui/Modal";
import {
  type BillingCycleValue,
  type StatusValue,
  type Subscription,
  type WriteSubscription,
} from "../../types";
import { deleteSubscription, editSubscription } from "../../api/subscriptions";
import {
  calculateNextBilling,
  formatNextBilling,
  sanitizePriceInput,
} from "../../utils/subscriptionUtils";

type Props = {
  subscription: Subscription | null;
  onClose: () => void;
};

export default function EditSubscriptionModal({
  subscription,
  onClose,
}: Props) {
  const [isClosing, setIsClosing] = useState(false);
  const [title, setTitle] = useState<string | undefined>(subscription?.name);
  const priceString: string = String(subscription?.price);
  const [price, setPrice] = useState<string>(priceString);
  const [currency, setCurrency] = useState<string | undefined>(
    subscription?.currency,
  );
  const [cycle, setCycle] = useState<BillingCycleValue | undefined>(
    subscription?.billingCycle,
  );
  const [status, setStatus] = useState<StatusValue | undefined>(
    subscription?.status,
  );
  const [startDate, setStartDate] = useState(subscription?.startDate);
  const [serviceUrl, setServiceUrl] = useState<string | undefined>(
    subscription?.serviceUrl,
  );
  const [errors, setErrors] = useState<string[]>([]);

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

  // mutations
  const queryClient = useQueryClient();

  // edit mutation
  const editMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: WriteSubscription }) =>
      editSubscription(id, data),
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

  // delete mutation
  const deleteMutation = useMutation({
    mutationFn: ({ id }: { id: number }) => deleteSubscription(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      onClose();
    },
  });

  // axios edit request
  const handleEdit = (e: React.SubmitEvent) => {
    e.preventDefault();
    const convertedPrice = Number(price);
    const formData: WriteSubscription = {
      name: title,
      price: convertedPrice,
      currency: currency,
      billingCycle: cycle,
      status: status,
      nextBillingDate: isoNextBilling,
      startDate: startDate,
      serviceUrl: serviceUrl,
    };

    if (!subscription) return;
    editMutation.mutate({ id: subscription?.id, data: formData });
  };

  // axios delete request
  const handleDelete = () => {
    if (!subscription) return;
    deleteMutation.mutate({ id: subscription?.id });
  };

  return (
    <Modal onClose={handleClose} isClosing={isClosing} className="w-130">
      <form onSubmit={handleEdit} className="flex flex-col w-full">
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

        <div className="grid grid-cols-[auto_auto] justify-between gap-2 mb-4">
          {/* Billing Cycle */}
          <div className="flex flex-col w-fit">
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

          {/* Status */}
          <div className="flex flex-col">
            <label className="text-white/30 text-sm">Status</label>
            <select
              className="bg-black cursor-pointer"
              value={status}
              onChange={(e) => setStatus(Number(e.target.value) as StatusValue)}
            >
              <option value={0}>Active</option>
              <option value={1}>Cancelled</option>
              <option value={2}>Paused</option>
            </select>
          </div>

          {/* Next Billing Date */}
          <div>
            <label className="text-white/30 text-sm">Next Billing Date</label>
            <div>{convertedNextBilling}</div>
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

        <div className="flex justify-between items-end">
          {/* Delete Subscription Button */}
          <button
            type="button"
            onClick={handleDelete}
            className="cursor-pointer 2xl:p-2 2xl:px-4 2xl:text-xl text-red-400 hover:bg-red-400/10 rounded-xl duration-200"
          >
            Delete Subscription
          </button>

          {/* Edit Button */}
          <button
            type="submit"
            className="cursor-pointer 2xl:p-2 2xl:px-5 2xl:text-2xl hover:bg-white/10 rounded-xl duration-200"
          >
            Edit
          </button>
        </div>

        {/* Error Messages */}
        {errors.length > 0 && (
          <div className="text-red-400 text-sm space-y-1 mt-3">
            {errors.map((err, i) => (
              <div key={i}>• {err}</div>
            ))}
          </div>
        )}
      </form>
    </Modal>
  );
}
