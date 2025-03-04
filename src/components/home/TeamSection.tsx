interface TeamMemberProps {
  name: string;
  role: string;
  image?: string;
  index: number;
}

const TeamMember = ({ name, role, image, index }: TeamMemberProps) => (
  <div 
    className="bg-zinc-900/50 backdrop-blur-sm p-8 rounded-xl text-center animate-scale-in team-member-card border border-white/10"
    style={{ animationDelay: `${index * 100}ms` }}
  >
    <div className="w-24 h-24 rounded-full bg-primary/20 mx-auto mb-6 overflow-hidden shadow-lg">
      {image && (
        <img 
          src={image} 
          alt={name} 
          className="w-full h-full object-cover profile-image"
          onError={(e) => {
            e.currentTarget.onerror = null; // Prevent infinite loop
            e.currentTarget.style.display = 'none'; // Hide the img element on error
          }}
        />
      )}
    </div>
    <h3 className="text-xl font-semibold mb-3">{name}</h3>
    <p className="text-gray-400">{role}</p>
  </div>
);

const TeamSection = () => {
  const teamMembers = [
    { name: "Kaan Şimşir", role: "CEO", image: "/team/castor.JPG" },
    { name: "Kaan Karataş", role: "Operations Manager", image: "/team/karatas.jpg" },
    { name: "Duygu Dinler", role: "Creative Director", image: "/team/duygu.jpg" },
    { name: "Sina Çetinkaya", role: "CTO", image: "/team/sina.JPG" },  
    { name: "Ecem Cevheroğlu", role: "Art Director", image: "/team/ecem.JPG" },
    { name: "Uğur Kocagöz", role: "Music Director", image: "/team/kcgz.jpg" },
  ];

  return (
    <section className="w-full max-w-7xl mx-auto">
      <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8">Our Team</h1>

      <p className="text-xl text-gray-400 text-center max-w-3xl mx-auto mb-16">
        Meet the creative minds behind Origins Radio, bringing you the finest tech and music in the industry.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 xl:gap-12">
        {teamMembers.map((member, i) => (
          <TeamMember 
            key={i}
            name={member.name}
            role={member.role}
            image={member.image}
            index={i}
          />
        ))}
      </div>
    </section>
  );
};

export default TeamSection; 