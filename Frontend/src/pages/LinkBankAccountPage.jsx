import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../lib/axiosInstance";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useUser } from "../context/UserContext";

export default function LinkBankAccountPage() {
    const navigate = useNavigate();
    const { user, login } = useUser();

    const [formData, setFormData] = useState({
        bankName: "",
        accountNumber: "",
    });

    const [loading, setLoading] = useState(false);

    /* ---------------- SECURITY: Prevent Back Navigation ---------------- */
    useEffect(() => {
        window.history.pushState(null, "", window.location.href);
        const handlePopState = () => {
            window.history.pushState(null, "", window.location.href);
        };
        window.addEventListener("popstate", handlePopState);

        return () => window.removeEventListener("popstate", handlePopState);
    }, []);

    /* ---------------- SECURITY: Prevent Page Leave ---------------- */
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            e.preventDefault();
            e.returnValue = "";
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        return () =>
            window.removeEventListener("beforeunload", handleBeforeUnload);
    }, []);

    /* ---------------- Redirect If Already Linked ---------------- */
    useEffect(() => {
        if (user?.bankAccounts?.length > 0) {
            navigate("/dashboard");
        }
    }, [user, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.bankName || !formData.accountNumber) {
            toast.error("All fields are required");
            return;
        }

        try {
            setLoading(true);
            const res = await axiosInstance.post(
                '/account/link-bank-account',
                formData
            );

            toast.success("Bank account linked successfully");

            // Update user context
            login(res.data.user);

            setTimeout(() => {
                navigate("/dashboard");
            }, 1000);
        } catch (err) {
            const message =
                err.response?.data?.message || "Failed to link account";
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center bg-[#050505] overflow-hidden">
            <ToastContainer />

            {/* Background Glow */}
            <div className="absolute w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[140px] top-[-20%] left-[-10%] animate-pulse" />
            <div className="absolute w-[500px] h-[500px] bg-green-400/10 rounded-full blur-[120px] bottom-[-20%] right-[-10%] animate-pulse" />

            {/* Card */}
            <div className="relative z-10 w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-10 shadow-2xl">

                <div className="mb-8 text-center">
                    <h2 className="text-3xl font-bold text-white mb-3">
                        Connect Your Bank
                    </h2>

                    <p className="text-white/50 text-sm leading-relaxed">
                        "Every smart financial journey begins with visibility.
                        Start by linking your bank account and take control of your money."
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Bank Name */}
                    <div>
                        <label className="block text-xs uppercase text-white/50 mb-2">
                            Bank Name
                        </label>
                        <input
                            type="text"
                            name="bankName"
                            value={formData.bankName}
                            onChange={handleChange}
                            placeholder="e.g. HDFC Bank"
                            required
                            className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                    </div>

                    {/* Account Number */}
                    <div>
                        <label className="block text-xs uppercase text-white/50 mb-2">
                            Account Number
                        </label>
                        <input
                            type="text"
                            name="accountNumber"
                            value={formData.accountNumber}
                            onChange={handleChange}
                            placeholder="XXXXXXXXXX"
                            required
                            className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                        <p className="text-xs text-white/30 mt-2">
                            You can edit account details later.
                        </p>
                    </div>

                    {/* Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-4 rounded-lg transition-all shadow-lg hover:shadow-emerald-500/40"
                    >
                        {loading ? "Linking..." : "Link Account & Continue"}
                    </button>

                </form>
            </div>
        </div>
    );
}
