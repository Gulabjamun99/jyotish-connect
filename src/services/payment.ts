import { toast } from "react-hot-toast";

export const loadRazorpay = () => {
    return new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

export const initiatePayment = async ({
    amount,
    name,
    description,
    user,
    onSuccess,
}: {
    amount: number;
    name: string;
    description: string;
    user: any;
    onSuccess: (response: any) => void;
}) => {
    // Check for Server-Side Order Creation
    try {
        const orderRes = await fetch("/api/payment/create-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                amount: amount,
                currency: "INR"
            })
        });

        const orderData = await orderRes.json();
        if (!orderRes.ok) throw new Error(orderData.error || "Order creation failed");

        const options = {
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            amount: orderData.amount,
            currency: orderData.currency,
            name: "JyotishConnect",
            description: description,
            order_id: orderData.id,
            handler: function (response: any) {
                onSuccess(response);
            },
            prefill: {
                name: user.name,
                email: user.email,
                contact: user.contact,
            },
            theme: {
                color: "#0ea5e9",
            },
        };

        const rzp1 = new (window as any).Razorpay(options);
        rzp1.on('payment.failed', function (response: any) {
            toast.error(`Payment Failed: ${response.error.description}`);
            console.error("Payment Failed:", response.error);
        });
        rzp1.open();

    } catch (error: any) {
        console.error("Payment Init Error:", error);
        toast.error("Could not initiate payment. Please try again.");
    }
};
