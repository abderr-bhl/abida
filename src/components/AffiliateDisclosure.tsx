export default function AffiliateDisclosure() {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 my-8 text-xs text-gray-500 dark:bg-gray-900/50 dark:border-gray-800">
      <div className="flex items-start">
        <svg className="w-4 h-4 mr-2 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p>
          <strong>Affiliate Disclosure:</strong> ReviewGuid.com is a participant in the Amazon Services LLC Associates Program, an affiliate advertising program designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.com. As an Amazon Associate, we earn from qualifying purchases. This comes at no extra cost to you and helps us continue to provide high-quality reviews and guides.
        </p>
      </div>
    </div>
  );
}
