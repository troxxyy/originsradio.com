interface UpNextCardProps {
  imageUrl: string;
  title: string;
  delay?: string;
}

const UpNextCard = ({ imageUrl, title, delay }: UpNextCardProps) => (
  <div 
    className="glass rounded-xl animate-scale-in transition-all duration-300 hover:scale-105 hover:shadow-[0_0_25px_rgba(150,150,150,0.4)] overflow-hidden relative group"
    style={delay ? { animationDelay: delay } : undefined}
  >
    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    <div className="aspect-[1/1] overflow-hidden">
      <img 
        src={imageUrl} 
        alt={title} 
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
      />
    </div>
    <div className="absolute bottom-0 left-0 right-0 p-5 z-20">
      <h3 className="text-xl font-bold text-center group-hover:text-shadow-glow transition-all duration-300 group-hover:-translate-y-1">{title}</h3>
      <div className="h-0.5 w-0 group-hover:w-full mx-auto mt-2 bg-gradient-to-r from-[#383838] to-[#d1d1d1] transition-all duration-500"></div>
    </div>
  </div>
);

const UpNextSection = () => {
  const upcomingEvents = [
    {
      imageUrl: '/upnext-photos/upnext1.png',
      title: 'March 15 — 9pm',
      delay: '0.1s'
    },
    {
      imageUrl: '/upnext-photos/upnext2.png',
      title: 'March 22 — 9pm',
      delay: '0.2s'
    },
    {
      imageUrl: '/upnext-photos/upnext3.png',
      title: 'March 29 — 9pm',
      delay: '0.4s'
    }
  ];

  return (
    <section className="relative mt-16 sm:mt-32 w-full max-w-6xl mx-auto px-4 sm:px-6 py-16">
      <div className="absolute -top-10 -left-20 w-64 h-64 bg-[#363636]/20 rounded-full filter blur-3xl animate-slow-pulse"></div>
      <div className="absolute -bottom-10 -right-20 w-64 h-64 bg-[#787878]/20 rounded-full filter blur-3xl animate-slow-pulse" style={{ animationDelay: '2s' }}></div>
      
      <h1 className="text-4xl sm:text-5xl font-bold mb-2 text-center ">Up Next</h1>
      <div className="flex items-center justify-center gap-2 mb-10">
        <div className="h-0.5 w-12 bg-gradient-to-r from-[#363636] to-[#787878]"></div>
        <p className="text-xl text-center text-white/80">Live on Our Youtube Channel</p>
        <div className="h-0.5 w-12 bg-gradient-to-r from-[#787878] to-[#d1d1d1]"></div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10">
        {upcomingEvents.map((event, index) => (
          <UpNextCard 
            key={index}
            imageUrl={event.imageUrl}
            title={event.title}
            delay={event.delay}
          />
        ))}
      </div>
      
      <div className="mt-12 text-center">
        <a 
          href="https://www.youtube.com/@originsradiotr" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#363636] to-[#d1d1d1] text-white font-bold hover:scale-105 transition-transform duration-300 shadow-[0_0_15px_rgba(150,150,150,0.4)]"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
          Subscribe to our channel
        </a>
      </div>
    </section>
  );
};

export default UpNextSection; 