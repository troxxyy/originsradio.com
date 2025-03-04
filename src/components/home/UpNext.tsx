interface UpNextCardProps {
  imageUrl: string;
  title: string;
  delay?: string;
}

const UpNextCard = ({ imageUrl, title, delay }: UpNextCardProps) => (
  <div 
    className="glass rounded-xl animate-scale-in transition-transform duration-200 hover:scale-[1.02] hover:shadow-lg overflow-hidden opacity-20"
    style={delay ? { animationDelay: delay } : undefined}
  >
    <div className="aspect-[1/1] overflow-hidden opacity-85">
      <img 
        src={imageUrl} 
        alt={title} 
        className="w-full h-150 object-cover hover:scale-105 transition-transform duration-500"
      />
    </div>
    <h3 className="text-xl font-semibold p-4 text-center">{title}</h3>
  </div>
);

const UpNextSection = () => {
  const upcomingEvents = [
    {
      imageUrl: '/upnext-photos/upnext1.png',
      title: 'March 15',
      delay: '0s'
    },
    {
      imageUrl: '/upnext-photos/upnext2.png',
      title: 'March 22',
      delay: '0.1s'
    },
    {
      imageUrl: '/upnext-photos/upnext3.png',
      title: 'March 29',
      delay: '0.2s'
    }
  ];

  return (
    <section className="mt-32 w-full max-w-5xl mx-auto px-6">
      <h1 className="text-4xl font-bold mb-12 text-center text-gradient">Up Next</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {upcomingEvents.map((event, index) => (
          <UpNextCard 
            key={index}
            imageUrl={event.imageUrl}
            title={event.title}
            delay={event.delay}
          />
        ))}
      </div>
    </section>
  );
};

export default UpNextSection; 