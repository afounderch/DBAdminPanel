import React from "react";
import { Link } from "react-router-dom";

const navItems = [
  { title: "Home", to: "/" },
  { title: "Recipes", to: "/recipes" },
  { title: "Supplements", to: "/supplements" },
  { title: "Profile", to: "/profile" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="text-xl font-bold text-green-600">HealthApp</div>
            <div className="flex space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.title}
                  to={item.to}
                  className="text-gray-700 hover:text-green-600 font-medium"
                >
                  {item.title}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="bg-green-50 py-20">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-green-700 mb-4">
            Welcome to HealthApp
          </h1>
          <p className="text-gray-700 text-lg md:text-xl mb-8">
            Track your health, recipes, and supplements all in one place.
          </p>
          <Link
            to="/recipes"
            className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
          <div className="bg-white shadow-md rounded-lg p-6 text-center hover:scale-105 transform transition">
            <h2 className="font-bold text-xl mb-2">Recipes</h2>
            <p className="text-gray-600">
              Browse and manage healthy recipes for every meal.
            </p>
          </div>
          <div className="bg-white shadow-md rounded-lg p-6 text-center hover:scale-105 transform transition">
            <h2 className="font-bold text-xl mb-2">Supplements</h2>
            <p className="text-gray-600">
              Track vitamins and supplements intake easily.
            </p>
          </div>
          <div className="bg-white shadow-md rounded-lg p-6 text-center hover:scale-105 transform transition">
            <h2 className="font-bold text-xl mb-2">Profile</h2>
            <p className="text-gray-600">
              Manage your personal health data and goals.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
