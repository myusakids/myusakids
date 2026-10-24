import Link from "next/link";

const categoryLinks = [
  { label: "Camps", href: "/categories/camps" },
  { label: "Classes & Programs", href: "/categories/classes" },
  { label: "Sports & Athletics", href: "/categories/sports" },
  { label: "Things to Do", href: "/categories/things-to-do" },
  { label: "Birthday Parties", href: "/categories/birthday-parties" },
  { label: "Childcare & Preschool", href: "/categories/childcare" },
  { label: "Education", href: "/categories/education" },
  { label: "Health & Wellness", href: "/categories/health" },
];

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-100 mt-16">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="font-bold text-lg text-brand-green mb-2">
              MyConnecticut<span className="text-brand-green-dark">Kids</span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              Connecticut&apos;s family resource directory — helping parents find camps, classes,
              sports programs, childcare, and things to do with kids.
            </p>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Categories</h3>
            <ul className="space-y-2">
              {categoryLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-500 hover:text-brand-green transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Site links */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Site</h3>
            <ul className="space-y-2">
              <li><Link href="/events" className="text-sm text-gray-500 hover:text-brand-green transition-colors">Events calendar</Link></li>
          <li><Link href="/events/submit" className="text-sm text-gray-500 hover:text-brand-green transition-colors">Submit an event</Link></li>
          <li><Link href="/submit" className="text-sm text-gray-500 hover:text-brand-green transition-colors">Add your listing</Link></li>
              <li><Link href="/coming-soon" className="text-sm text-gray-500 hover:text-brand-green transition-colors">About</Link></li>
              <li><Link href="/coming-soon" className="text-sm text-gray-500 hover:text-brand-green transition-colors">Contact</Link></li>
              <li><Link href="/coming-soon" className="text-sm text-gray-500 hover:text-brand-green transition-colors">Privacy Policy</Link></li>
              <li><Link href="/affiliate-disclosure" className="text-sm text-gray-500 hover:text-brand-green transition-colors">Advertising &amp; affiliate disclosure</Link></li>
            </ul>
            <div className="mt-6">
              <a
                href="https://www.facebook.com/myconnecticutkids"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-brand-green transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                72K followers on Facebook
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-6 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} MyConnecticutKids.com · All rights reserved
        </div>
      </div>
    </footer>
  );
}
