import { Button } from "./DemoComponents";
import { Icon } from "./DemoComponents";

type IconName = "heart" | "star" | "check" | "plus" | "arrow-right";

interface Feature {
  icon: IconName;
  title: string;
  description: string;
}

export default function LandingPage() {
  const features: Feature[] = [
    {
      icon: "heart",
      title: "Secure",
      description: "Built with state-of-the-art security measures"
    },
    {
      icon: "star",
      title: "Fast",
      description: "Lightning-fast transactions and interactions"
    },
    {
      icon: "check",
      title: "Community",
      description: "Join our growing community of users"
    }
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
          NABULINES
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
          Revolutionizing the way you interact with blockchain technology
        </p>
        <div className="flex gap-4 justify-center">
          <Button
            variant="primary"
            size="lg"
            className="bg-[#0052FF] hover:bg-[#0040CC]"
          >
            Get Started
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="border-[#0052FF] text-[#0052FF] hover:bg-[#0052FF] hover:text-white"
          >
            Learn More
          </Button>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4">
        {features.map((feature, index) => (
          <div
            key={index}
            className="p-6 rounded-xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="w-12 h-12 bg-[#0052FF] bg-opacity-10 rounded-full flex items-center justify-center mb-4">
              <Icon name={feature.icon} size="lg" className="text-[#0052FF]" />
            </div>
            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
            <p className="text-gray-600 dark:text-gray-300">
              {feature.description}
            </p>
          </div>
        ))}
      </div>

      {/* CTA Section */}
      <div className="mt-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Ready to get started?</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Join thousands of users already using NABULINES
        </p>
        <Button
          variant="primary"
          size="lg"
          className="bg-[#0052FF] hover:bg-[#0040CC]"
        >
          Connect Wallet
        </Button>
      </div>
    </div>
  );
} 