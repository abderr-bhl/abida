import Link from 'next/link';

export default function Footer() {
  const sections = [
    {
      title: 'Expert Picks',
      links: [
        { name: 'Best Phones', href: '/guides/category/phones' },
        { name: 'Best Laptops', href: '/guides/category/laptops' },
        { name: 'Best TVs', href: '/guides/category/tvs' },
        { name: 'Best Audio', href: '/guides/category/audio' },
      ],
    },
    {
      title: 'Company',
      links: [
        { name: 'About Us', href: '/about' },
        { name: 'How We Test', href: '/testing' },
        { name: 'Our Team', href: '/team' },
        { name: 'Contact', href: '/contact' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { name: 'Privacy Policy', href: '/privacy' },
        { name: 'Terms of Use', href: '/terms' },
        { name: 'Affiliate Disclosure', href: '/disclosure' },
      ],
    },
  ];

  return (
    <footer className="bg-primary text-white dark:bg-black">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
          <div className="col-span-2 md:col-span-1">
             <Link href="/" className="text-3xl font-black flex items-center gap-2">
              <span className="bg-white text-primary p-1 rounded">RG</span>
              <span>ReviewGuid</span>
            </Link>
            <p className="mt-6 text-gray-400 text-sm leading-relaxed max-w-xs">
              ReviewGuid is the most comprehensive US-based product review site. We purchase and test every product ourselves to provide the most accurate advice.
            </p>
          </div>
          {sections.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-accent">{section.title}</h3>
              <ul className="mt-6 space-y-4">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-gray-300 hover:text-white transition-colors text-sm font-medium">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-widest">
            &copy; {new Date().getFullYear()} ReviewGuid. A Future US company.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Twitter</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Facebook</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Instagram</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">YouTube</a>
          </div>
        </div>

        <div className="mt-12 p-6 bg-gray-900/50 rounded-2xl border border-gray-800">
           <p className="text-[10px] text-gray-500 leading-relaxed text-center uppercase tracking-widest font-bold">
            ReviewGuid is a participant in the Amazon Services LLC Associates Program, an affiliate advertising program designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.com. Our editorial content is not influenced by commissions.
          </p>
        </div>
      </div>
    </footer>
  );
}
