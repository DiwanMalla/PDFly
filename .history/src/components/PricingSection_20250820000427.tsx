"use client";

import React, { useState } from "react";
import Button from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { CheckCircle, Star, Zap, Award as Crown } from "@/components/ui/Icons";
import { motion } from "framer-motion";

const PricingSection: React.FC = () => {
  const [annual, setAnnual] = useState(false);
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for personal use and testing",
      icon: Star,
      features: [
        annual ? "60 PDF operations/year" : "5 PDF operations/month",
        "Files up to 10MB",
        "Basic merge & split",
        "Community support",
        "Web access only",
      ],
      limitations: [
        "No API access",
        "Basic features only",
        "No priority support",
      ],
      cta: "Get Started Free",
      popular: false,
      gradient: "from-gray-500 to-gray-600",
    },
    {
      name: "Pro",
      price: annual ? "$95.99" : "$9.99",
      period: annual ? "/year" : "/month",
      description: "Ideal for professionals and small teams",
      icon: Zap,
      features: [
        annual ? "6,000 PDF operations/year" : "500 PDF operations/month",
        "Files up to 100MB",
        "All processing features",
        "AI-powered compression",
        "Cloud storage (5GB)",
        "Priority support",
        "Mobile & desktop apps",
        "Basic API access",
      ],
      limitations: [],
      cta: annual ? "Start Annual Pro" : "Start Pro Trial",
      popular: true,
      gradient: "from-blue-500 to-purple-600",
    },
    {
      name: "Business",
      price: annual ? "$239.99" : "$24.99",
      period: annual ? "/year" : "/month",
      description: "Advanced features for growing businesses",
      icon: Crown,
      features: [
        annual ? "24,000 PDF operations/year" : "2,000 PDF operations/month",
        "Files up to 500MB",
        "Team collaboration",
        "Real-time editing",
        "Cloud storage (50GB)",
        "SSO integration",
        "Advanced API access",
        "Analytics dashboard",
        "Custom branding",
      ],
      limitations: [],
      cta: annual ? "Start Annual Business" : "Start Business Trial",
      popular: false,
      gradient: "from-purple-500 to-pink-600",
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "pricing",
      description: "Tailored solutions for large organizations",
      icon: Crown,
      features: [
        "Unlimited operations",
        "Unlimited file sizes",
        "White-label solutions",
        "On-premise deployment",
        "Dedicated support",
        "Custom integrations",
        "SLA guarantees",
        "Compliance tools",
        "Training & consulting",
      ],
      limitations: [],
      cta: "Contact Sales",
      popular: false,
      gradient: "from-gray-800 to-black",
    },
  ];

  return (
    <section id="pricing" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Choose your
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              perfect plan
            </span>
          </h2>

          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Start free, scale as you grow. All plans include our core features
            with different usage limits and advanced capabilities.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <span
              className={`text-gray-600 font-medium ${
                !annual ? "text-blue-600" : ""
              }`}
            >
              Monthly
            </span>
            <button
              aria-label="Toggle annual pricing"
              className="relative focus:outline-none"
              onClick={() => setAnnual((prev) => !prev)}
            >
              <div className="w-12 h-6 bg-gray-200 rounded-full shadow-inner"></div>
              <motion.div
                className="absolute inset-y-0 left-0 w-6 h-6 bg-white rounded-full shadow transform"
                animate={{ x: annual ? 24 : 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            </button>
            <span
              className={`text-gray-600 font-medium ${
                annual ? "text-blue-600" : ""
              }`}
            >
              Annual
              <span className="ml-1 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                20% off
              </span>
            </span>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4">
          {plans.map((plan, index) => {
            const IconComponent = plan.icon;
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`relative ${plan.popular ? "lg:-mt-4 lg:mb-4" : ""}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                <Card
                  className={`h-full ${
                    plan.popular ? "ring-2 ring-blue-500 shadow-lg" : ""
                  }`}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className={`w-12 h-12 rounded-xl bg-gradient-to-r ${plan.gradient} flex items-center justify-center`}
                      >
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      {plan.popular && (
                        <div className="flex items-center space-x-1 text-yellow-500">
                          <Star className="w-4 h-4 fill-current" />
                          <Star className="w-4 h-4 fill-current" />
                          <Star className="w-4 h-4 fill-current" />
                        </div>
                      )}
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {plan.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      {plan.description}
                    </p>

                    <div className="mb-6">
                      <span className="text-4xl font-bold text-gray-900">
                        {plan.price}
                      </span>
                      <span className="text-gray-600 ml-1">{plan.period}</span>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <Button
                      className={`w-full mb-6 ${
                        plan.popular
                          ? ""
                          : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                      }`}
                      variant={plan.popular ? "primary" : "secondary"}
                      onClick={() => {
                        if (plan.name === "Free") {
                          window.location.href = "/signup";
                        } else if (plan.name === "Enterprise") {
                          window.location.href = "/contact";
                        } else {
                          window.location.href = `/subscribe?plan=${plan.name.toLowerCase()}&annual=${annual}`;
                        }
                      }}
                    >
                      {plan.cta}
                    </Button>

                    <div className="space-y-3">
                      {plan.features.map((feature, featureIndex) => (
                        <div
                          key={featureIndex}
                          className="flex items-start space-x-3"
                        >
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-600">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-20 text-center"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-8">
            Frequently Asked Questions
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              {
                question: "Can I change plans anytime?",
                answer:
                  "Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.",
              },
              {
                question: "Is there a free trial?",
                answer:
                  "Yes! All paid plans come with a 14-day free trial. No credit card required to start.",
              },
              {
                question: "What payment methods do you accept?",
                answer:
                  "We accept all major credit cards, PayPal, and wire transfers for enterprise customers.",
              },
              {
                question: "Do you offer refunds?",
                answer:
                  "Yes, we offer a 30-day money-back guarantee if you're not satisfied with our service.",
              },
            ].map((faq, index) => (
              <div key={index} className="text-left">
                <h4 className="font-semibold text-gray-900 mb-2">
                  {faq.question}
                </h4>
                <p className="text-gray-600 text-sm">{faq.answer}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingSection;
