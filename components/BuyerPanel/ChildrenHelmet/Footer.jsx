const Footer = () => {
    return (
      <footer className="bg-gradient-to-r from-teal-600 to-indigo-600 text-white py-10 px-6 mt-12">
        <div className="max-w-6xl mx-auto text-center space-y-6">
          {/* Offer */}
          <h2 className="text-2xl font-bold">
             Special Launch Offer: <span className="text-yellow-300">20% OFF</span> + Free Delivery 
          </h2>
          <p className="text-lg">
            Give your child a helmet that’s <span className="font-semibold">safe</span>,{" "}
            <span className="font-semibold">fun</span>, and full of <span className="font-semibold">personality</span>.
          </p>
  
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
            <button className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-6 py-3 rounded-2xl shadow-lg transition">
              Choose Blue Rider
            </button>
            <button className="bg-pink-400 hover:bg-pink-500 text-black font-semibold px-6 py-3 rounded-2xl shadow-lg transition">
               Choose Pink Explorer
            </button>
          </div>
  
          {/* Divider */}
          {/* <div className="border-t border-white/30 my-6"></div> */}
  
        
        </div>
      </footer>
    );
  };
  
  export default Footer;
  