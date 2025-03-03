interface AboutCardProps {
  title: string;
  content: string;
  delay?: string;
}

const AboutCard = ({ title, content, delay }: AboutCardProps) => (
  <div 
    className="glass p-6 rounded-lg animate-scale-in transition-transform duration-200 hover:scale-[1.02] hover:shadow-lg"
    style={delay ? { animationDelay: delay } : undefined}
  >
    <h3 className="text-xl font-semibold mb-4">{title}</h3>
    <p className="text-white/70">{content}</p>
  </div>
);

const UpNextSection = () => {
  return (
    <section className="mt-32 w-full max-w-4xl mx-auto px-6">
      <h1 className="text-4xl font-bold mb-8 text-center text-gradient">Up Next</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <AboutCard 
          title="Up Next" 
          content="Pushing the boundaries of electronic music through innovation and creativity."
        />
      
      </div>
    </section>
  );
};

export default  UpNextSection; 