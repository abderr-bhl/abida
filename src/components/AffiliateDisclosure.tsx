export default function AffiliateDisclosure() {
  return (
    <div className="bg-blue-50 border-l-4 border-primary p-6 my-12 rounded-r-lg shadow-sm">
      <div className="flex gap-4">
        <div className="flex-shrink-0 text-primary">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836c-.149.598.013 1.234.432 1.653a6.418 6.418 0 01.555.594 1.14 1.14 0 01-1.66 1.579 5.45 5.45 0 00-.612-.619 1.764 1.764 0 01-.497-1.898l.708-2.836a.71.71 0 00-.13-.574.71.71 0 00-.566-.251h-.24a1.14 1.14 0 01-1-1.696l.33-.66zm1.294-4.058a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z" clipRule="evenodd" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900 mb-1">Affiliate Disclosure</p>
          <p className="text-sm text-gray-700 leading-relaxed">
            ReviewGuid.com is an independent publisher. We participate in the Amazon Services LLC Associates Program.
            When you buy through links on our site, we may earn an affiliate commission at no extra cost to you.
            This helps us keep our testing and research independent.
            <a href="/about" className="text-primary hover:underline font-medium ml-1">Learn more about our process.</a>
          </p>
        </div>
      </div>
    </div>
  );
}
