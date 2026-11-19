
import {
    ChefHat,
    ShieldCheck,
    ShoppingBag,
    CalendarHeart,
} from "lucide-react";

interface Feature {
    id: number;
    title: string;
    description: string;
    icon: typeof ChefHat;
}

const features: Feature[] = [
    {
        id: 1,
        title: "Fresh & Delicious",
        description: "Discover delicious pizzas prepared by local restaurants.",
        icon: ChefHat,
    },
    {
        id: 2,
        title: "Trusted Restaurants",
        description: "Explore menu items reviewed before publication.",
        icon: ShieldCheck,
    },
    {
        id: 3,
        title: "Easy Ordering",
        description: "Choose your favorites and request delivery in a few steps.",
        icon: ShoppingBag,
    },
    {
        id: 4,
        title: "Event Reservations",
        description: "Plan special occasions with participating Premium+ restaurants.",
        icon: CalendarHeart,
    },
];

export default function WhyChoosePizzaHub() {

    return (
        <section className="bg-[#FFF7ED] py-20 lg:py-24">
            <div className="mx-auto max-w-7xl px-5 lg:px-8">
                <div className="mx-auto mb-12 max-w-2xl text-center">
                    <p className="mb-4 text-sm font-bold uppercase tracking-widest text-[#D62828]">
                        Why Choose Us
                    </p>
                    <h2 className="text-4xl font-extrabold tracking-tight text-stone-900 sm:text-5xl">
                        Why Choose <span className="text-[#D62828]">PizzaHub?</span>
                    </h2>
                    <p className="mt-4 leading-7 text-stone-600">
                        Your favorite pizza experiences, made easier with PizzaHub.
                    </p>
                </div>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {features.map((feature) => {
                        const Icon = feature.icon;

                        return (
                            <article
                                key={feature.id}
                                className="rounded-3xl border border-orange-100 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                            >
                                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-[#D62828]">
                                    <Icon size={27} strokeWidth={1.8} />
                                </div>
                                <h3 className="mb-3 text-xl font-bold text-stone-900">
                                    {feature.title}
                                </h3>
                                <p className="text-sm leading-7 text-stone-600">
                                    {feature.description}
                                </p>
                            </article>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}