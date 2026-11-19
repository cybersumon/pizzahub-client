import { Search, ShoppingCart, ClipboardCheck } from "lucide-react";
interface OrderStep {
    number: string;
    title: string;
    description: string;
    icon: typeof Search;
}

const steps: OrderStep[] = [
    {
        number: "01",
        title: "Explore Your Favorites",
        description: "Browse pizzas from local restaurants and find your perfect flavor.",
        icon: Search,
    },
    {
        number: "02",
        title: "Place Your Order",
        description: "Select a delivery date, enter your address and submit your order.",
        icon: ShoppingCart,
    },
    {
        number: "03",
        title: "Track Your Order",
        description: "Follow your order status from your customer dashboard.",
        icon: ClipboardCheck,
    },
];

export default function HowItWorks() {
    return (
        <section className="bg-white py-20 lg:py-10">
            <div className="mx-auto max-w-7xl px-5 lg:px-8">
                <div className="mx-auto mb-14 max-w-2xl text-center">

                    <p className="mb-4 text-sm font-bold uppercase tracking-widest text-[#D62828]">
                        Simple & Easy
                    </p>
                    <h2 className="text-4xl font-extrabold text-stone-900 sm:text-5xl">
                        How <span className="text-[#D62828]">PizzaHub</span> Works
                    </h2>

                    <p className="mt-4 leading-7 text-stone-600">
                        Your next pizza experience is just three easy steps away.
                    </p>
                </div>

                <div className="grid gap-8 md:grid-cols-3">

                    {steps.map((step) => {

                        const Icon = step.icon;

                        return (

                            <article
                                key={step.number}
                                className="relative rounded-3xl border border-orange-100 bg-[#FFF7ED] p-8 text-center"
                            >
                                <span className="absolute right-5 top-4 text-4xl font-black text-orange-100">
                                    {step.number}
                                </span>
                                <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white text-[#D62828] shadow-sm">

                                    <Icon size={32} strokeWidth={1.8} />
                                </div>

                                <h3 className="mb-3 text-xl font-bold text-stone-900">
                                    {step.title}
                                </h3>
                                <p className="text-sm leading-7 text-stone-600">
                                    {step.description}
                                </p>
                            </article>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}