import { motion } from "framer-motion";
import { useState } from "react";

interface TeamMemberProps {
  name: string;
  role: string;
  image?: string;
  index: number;
  bio?: string;
  onClick: () => void;
}

const TeamMember = ({ name, role, image, index, onClick }: TeamMemberProps) => (
  <motion.div 
    className="bg-zinc-900/50 backdrop-blur-sm p-8 rounded-xl border border-white/10 group cursor-pointer overflow-hidden"
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ 
      duration: 0.5, 
      delay: index * 0.1,
      ease: "easeOut" 
    }}
    viewport={{ once: true, margin: "-100px" }}
    whileHover={{ 
      y: -10,
      boxShadow: "0 10px 30px -15px rgba(255, 255, 255, 0.2)"
    }}
    onClick={onClick}
  >
    <div className="w-24 h-24 rounded-full bg-primary/20 mb-6 overflow-hidden shadow-lg relative">
      {image && (
        <motion.img 
          src={image} 
          alt={name} 
          className="w-full h-full object-cover"
          initial={{ scale: 1 }}
          whileHover={{ scale: 1.15 }}
          transition={{ duration: 0.6 }}
          onError={(e) => {
            e.currentTarget.onerror = null; // Prevent infinite loop
            e.currentTarget.style.display = 'none'; // Hide the img element on error
          }}
        />
      )}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />
    </div>
    <motion.h3 
      className="text-xl font-semibold mb-3 group-hover:text-white transition-colors duration-300"
      initial={{ opacity: 0.9 }}
      whileHover={{ opacity: 1 }}
    >
      {name}
    </motion.h3>
    <motion.p 
      className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300"
      initial={{ opacity: 0.7 }}
      whileHover={{ opacity: 1 }}
    >
      {role}
    </motion.p>
    <motion.div 
      className="w-0 h-0.5 bg-white mt-4 group-hover:w-full transition-all duration-300"
      initial={{ width: 0 }}
      whileHover={{ width: "100%" }}
    />
  </motion.div>
);

interface TeamMemberDetail {
  name: string;
  role: string;
  image?: string;
  bio: string;
  socialLinks?: { platform: string; url: string }[];
}

const TeamSection = () => {
  const [selectedMember, setSelectedMember] = useState<TeamMemberDetail | null>(null);

  const teamMembers: TeamMemberDetail[] = [
    { 
      name: "Kaan Şimşir", 
      role: "CEO", 
      image: "/team/castor.JPG",
      bio: "Founder and visionary behind Origins Radio, bringing together technology and music to create unique experiences."
    },
    { 
      name: "Kaan Karataş", 
      role: "COO", 
      image: "/team/karatas.jpg",
      bio: "Manages day-to-day operations and ensures smooth execution of all Origins Radio events and projects."
    },
    { 
      name: "Sina Çetinkaya", 
      role: "CTO", 
      image: "/team/sina.JPG",
      bio: "Drives technological innovation at Origins Radio, developing cutting-edge solutions for immersive experiences."
    }, 
    { 
      name: "Duygu Dinler", 
      role: "Creative Director", 
      image: "/team/duygu.jpg",
      bio: "Leads the creative vision for Origins Radio, overseeing all visual and experiential aspects of our brand."
    },
  
    { 
      name: "Ecem Cevheroğlu", 
      role: "Art Director", 
      image: "/team/ecem.JPG",
      bio: "Creates the visual language of Origins Radio, designing captivating artwork for all our events and platforms."
    },
    { 
      name: "Uğur Kocagöz", 
      role: "Music Director", 
      image: "/team/kcgz.jpg",
      bio: "Curates the sonic identity of Origins Radio, discovering and showcasing the best talent in electronic music."
    },
  ];

  const openMemberDetails = (member: TeamMemberDetail) => {
    setSelectedMember(member);
    document.body.style.overflow = "hidden";
  };

  const closeMemberDetails = () => {
    setSelectedMember(null);
    document.body.style.overflow = "auto";
  };

  return (
    <section className="w-full max-w-7xl mx-auto">
      <motion.h1 
        className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, margin: "-100px" }}
      >
        The Team
      </motion.h1>

      <motion.p 
        className="text-xl text-gray-400 max-w-3xl mb-16"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        viewport={{ once: true, margin: "-100px" }}
      >
        Meet the creative minds behind Origins Radio, bringing you the finest tech and music in the industry.
      </motion.p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 xl:gap-12">
        {teamMembers.map((member, i) => (
          <TeamMember 
            key={i}
            name={member.name}
            role={member.role}
            image={member.image}
            index={i}
            onClick={() => openMemberDetails(member)}
          />
        ))}
      </div>

      {/* Team Member Modal */}
      {selectedMember && (
        <motion.div 
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 md:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeMemberDetails}
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ 
              type: "spring",
              damping: 30,
              stiffness: 500
            }}
            className="bg-zinc-900 rounded-xl overflow-hidden max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative bg-zinc-800 h-64 overflow-hidden">
              {selectedMember.image && (
                <motion.img 
                  src={selectedMember.image} 
                  alt={selectedMember.name} 
                  className="w-full h-full object-cover object-top"
                  initial={{ scale: 1.1, opacity: 0.5 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent" />
              <motion.button 
                onClick={closeMemberDetails}
                className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm p-2 rounded-full hover:bg-black/70 transition-colors"
                aria-label="Close member details"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
              <div className="absolute bottom-8 left-8">
                <motion.h2 
                  className="text-3xl md:text-4xl font-bold"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  {selectedMember.name}
                </motion.h2>
                <motion.p 
                  className="text-xl text-gray-300"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  {selectedMember.role}
                </motion.p>
              </div>
            </div>
            <motion.div 
              className="p-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <h3 className="text-xl font-semibold mb-4">About</h3>
              <p className="text-gray-300 text-lg mb-8">{selectedMember.bio}</p>
              
              {selectedMember.socialLinks && (
                <div className="flex gap-4 mt-6">
                  {selectedMember.socialLinks.map((link, index) => (
                    <motion.a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-zinc-800 rounded-full text-gray-300 hover:bg-white/10"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      whileTap={{ scale: 0.9 }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                    >
                      {link.platform === "twitter" && (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                        </svg>
                      )}
                      {link.platform === "instagram" && (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </motion.a>
                  ))}
                </div>
              )}
              
              <div className="flex justify-end mt-8">
                <motion.button 
                  onClick={closeMemberDetails}
                  className="px-6 py-3 bg-white text-black font-medium rounded-lg hover:bg-gray-200 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Close
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </section>
  );
};

export default TeamSection; 