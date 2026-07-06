import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useEffect, useState } from "react";

const plans = {
  silver: {
    title: "Silver Membership",
    buttonText: "Buy Silver",
    buttonClass: "btn-secondary",
    benefits: [
      "Chat with other people",
      "100 connection requests per day",
      "Blue Tick",
      "3 months",
    ],
  },
  gold: {
    title: "Gold Membership",
    buttonText: "Buy Gold",
    buttonClass: "btn-primary",
    benefits: [
      "Chat with other people",
      "Unlimited connection requests per day",
      "Blue Tick",
      "6 months",
    ],
  },
};

const formatDate = (date) =>
  date
    ? new Date(date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

const Premium = () => {
  const [premiumUser, setPremiumUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    verifyPremiumUser();
  }, []);

  const verifyPremiumUser = async () => {
    try {
      const res = await axios.get(BASE_URL + "/premium/verify", {
        withCredentials: true,
      });

      setPremiumUser(res.data);
      setError("");
    } catch (err) {
      setError(err?.response?.data?.msg || "Unable to load premium status.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuyClick = async (type) => {
    try {
      const order = await axios.post(
        BASE_URL + "/payment/create",
        {
          membershipType: type,
        },
        { withCredentials: true }
      );

      const { amount, keyId, currency, notes, orderId } = order.data;

      const verifyPayment = async (paymentResponse) => {
        const res = await axios.post(
          BASE_URL + "/payment/verify",
          paymentResponse,
          { withCredentials: true }
        );

        setPremiumUser(res.data.user);
        setError("");
      };

      const options = {
        key: keyId,
        amount,
        currency,
        name: "Dev Circle",
        description: "Connect to other developers",
        order_id: orderId,
        prefill: {
          name: notes.firstName + " " + notes.lastName,
          email: notes.emailId,
          contact: "9999999999",
        },
        theme: {
          color: "#F37254",
        },
        handler: verifyPayment,
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setError(err?.response?.data?.msg || "Unable to start payment.");
    }
  };

  if (isLoading) {
    return (
      <div className="app-container flex justify-center">
        <div className="soft-panel rounded-lg px-6 py-4 font-semibold text-slate-300">
          Loading premium details...
        </div>
      </div>
    );
  }

  const activeMembership = premiumUser?.isPremium
    ? premiumUser.membershipType
    : null;
  const validUntil = formatDate(premiumUser?.membershipExpiresAt);
  const visiblePlans =
    activeMembership === "gold"
      ? []
      : activeMembership === "silver"
      ? ["gold"]
      : ["silver", "gold"];

  return (
    <div className="app-container">
      <div className="mb-8 text-center">
        <h1 className="page-title">Premium</h1>
        <p className="page-subtitle">
          Boost your reach when you are ready to meet more builders.
        </p>
      </div>
      {activeMembership && (
        <div className="soft-panel mb-8 rounded-lg p-6 text-center">
          <h1 className="text-3xl font-black capitalize text-slate-50">
            {activeMembership} premium is already active
          </h1>
          <p className="mt-2 text-slate-400">
            {validUntil
              ? `Valid until ${validUntil}`
              : "Your premium membership is active."}
          </p>
        </div>
      )}

      {error && <p className="mb-4 text-center text-error">{error}</p>}

      {activeMembership === "gold" ? (
        <div className="soft-panel mx-auto max-w-xl rounded-lg p-8 text-center">
          <h2 className="text-2xl font-black text-slate-50">
            Premium is purchased
          </h2>
        </div>
      ) : (
        <div className="flex w-full flex-col gap-6 lg:flex-row">
          {visiblePlans.map((planType, index) => {
            const plan = plans[planType];

            return (
              <div key={planType} className="flex flex-1 items-stretch">
                {index > 0 && (
                  <div className="divider divider-horizontal hidden lg:flex">
                    OR
                  </div>
                )}
                <div className="surface-card grid min-h-80 flex-grow place-items-center rounded-lg p-7 text-center">
                  <h1 className="text-3xl font-black text-slate-50">
                    {plan.title}
                  </h1>
                  <ul className="space-y-3 text-left text-slate-300">
                    {plan.benefits.map((benefit) => (
                      <li key={benefit} className="flex gap-2">
                        <span className="text-cyan-300">+</span>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => handleBuyClick(planType)}
                    className={
                      plan.buttonClass === "btn-primary"
                        ? "primary-action"
                        : "secondary-action"
                    }
                  >
                    {activeMembership === "silver" && planType === "gold"
                      ? "Upgrade to Gold"
                      : plan.buttonText}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Premium;
