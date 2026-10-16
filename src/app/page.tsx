import Link from "next/link";


export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
      <h1 className="text-4xl md:text-6xl font-extrabold text-blue-900 mb-6 drop-shadow-sm">
        SSF Kozhikode South
        <span className="block text-2xl md:text-4xl text-blue-600 mt-2">Campus Syndicate</span>
      </h1>
      <p className="text-gray-600 max-w-2xl mx-auto text-lg md:text-xl mb-10 leading-relaxed">
        Welcome to the official portal managing campus student data, event coordination, 
        and ProfSummit status across our 10 divisions.
      </p>
      
      <Link 
        href="/login" 
        className="px-8 py-4 bg-blue-700 hover:bg-blue-800 text-white rounded-full font-semibold text-lg transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
      >
        Portal Login
      </Link>
    </div>
  );
}