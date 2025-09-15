export default function Header() {
  return (
    <div className="text-center mb-8">
      <div className="flex items-center justify-center mb-4">
        <div className="bg-orange-100 p-2 rounded-lg mr-3">
          <span className="text-orange-600 text-xl">🔧</span>
        </div>
        <span className="text-orange-600 font-medium">Our Tools</span>
      </div>
      <h1 className="text-5xl font-bold text-gray-800 mb-4">
        Choose Right, Choose Smart
      </h1>
      <p className="text-gray-600 text-lg max-w-3xl mx-auto">
        Take control of your banking journey with our powerful tools. Whether you're comparing policies or exploring different bank offerings.
      </p>
    </div>
  );
}
