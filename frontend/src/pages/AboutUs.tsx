import { Rocket, Shield, Zap, Users, Globe, Heart } from 'lucide-react';
import { BackButton } from '../components/BackButton.tsx';

export default function AboutUs() {
  const values = [
    { name: 'Simplicity', description: 'We believe in clean, intuitive solutions that just work', Icon: Zap },
    { name: 'Security', description: 'Your data and applications are protected by default', Icon: Shield },
    { name: 'Performance', description: 'Lightning-fast deployments with zero compromise', Icon: Rocket },
    { name: 'Community', description: 'Built by developers, for developers', Icon: Users },
    { name: 'Global', description: 'Deploy anywhere, reach everywhere', Icon: Globe },
    { name: 'Passion', description: 'We love what we build, and it shows', Icon: Heart },
  ];

  return (
    <div className="space-y-12">
      {/* Back button */}
      <BackButton to="/" label="Home" variant="inline" />

      {/* Hero Section */}
      <div>
        <h1 className="text-3xl font-bold text-stone-900 dark:text-stone-100 mb-4">About Nohonu</h1>
        <p className="text-lg text-stone-600 dark:text-stone-400 leading-relaxed">
          Nohonu is a modern deployment platform designed to simplify how you build, ship, and scale your applications.
          Inspired by the Hawaiian word for "surfing," we help you ride the waves of technology with confidence and
          ease.
        </p>
      </div>

      {/* Mission Section */}
      <div className="bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 p-8">
        <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-4">Our Mission</h2>
        <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
          To democratize deployment infrastructure and empower developers worldwide to focus on what matters
          most—building great products. We eliminate the complexity of modern deployment pipelines so you can spend less
          time configuring and more time creating.
        </p>
      </div>

      {/* Values Grid */}
      <div>
        <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-6">Our Values</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {values.map((value, index) => {
            const Icon = value.Icon;
            return (
              <div
                key={index}
                className="bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-center mb-4 h-12 w-12 mx-auto bg-stone-100 dark:bg-stone-700 rounded-lg">
                  <Icon className="w-6 h-6 text-stone-900 dark:text-stone-100" />
                </div>
                <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-2 text-center">
                  {value.name}
                </h3>
                <p className="text-sm text-stone-600 dark:text-stone-400 text-center">{value.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Story Section */}
      <div className="bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 p-8">
        <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-4">Our Story</h2>
        <p className="text-stone-600 dark:text-stone-400 leading-relaxed mb-4">
          Founded by a team of experienced developers who grew tired of wrestling with complex deployment systems,
          Nohonu was born from a simple idea: deployment should be as easy as pushing code.
        </p>
        <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
          We've spent years refining our platform to handle everything from personal projects to enterprise-scale
          applications. Our Hawaiian-inspired name reflects our philosophy—like surfing, deployment should feel natural,
          fluid, and ultimately enjoyable.
        </p>
      </div>

      {/* Contact Section */}
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-4">Get in Touch</h2>
        <p className="text-stone-600 dark:text-stone-400 mb-6">Have questions? We'd love to hear from you.</p>
        <a
          href="mailto:hello@nohonu.com"
          className="inline-flex items-center gap-2 px-6 py-3 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-lg font-medium hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors"
        >
          Contact Us
        </a>
      </div>
    </div>
  );
}
