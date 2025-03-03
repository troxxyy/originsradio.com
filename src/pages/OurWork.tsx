import { motion } from "framer-motion";
import TeamSection from "@/components/home/TeamSection";

interface Project {
  title: string;
  description: string;
  imageUrl: string;
  tags: string[];
}

const projects: Project[] = [
  {
    title: "Project Aurora",
    description: "A mesmerizing audio-visual experience combining dark ambient soundscapes with reactive visuals.",
    imageUrl: "/images/project-1.jpg", // You'll need to add actual images
    tags: ["Audio", "Visual", "Interactive"],
  },
  {
    title: "Nocturnal Echoes",
    description: "An immersive installation exploring the intersection of darkness and sound.",
    imageUrl: "/images/project-2.jpg",
    tags: ["Installation", "Sound Design"],
  },
  {
    title: "Dark Wave Symphony",
    description: "A collaborative project merging classical instruments with electronic dark wave elements.",
    imageUrl: "/images/project-3.jpg",
    tags: ["Music", "Collaboration"],
  },
];

const OurWork = () => {
  return (
    <div className="min-h-screen bg-black text-white pt-24 px-4 md:px-8 lg:px-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="container mx-auto"
      >
        <div className="max-w-4xl mx-auto mb-16">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8">Our Work</h1>
          <p className="text-xl text-gray-400">
            Explore our portfolio of dark wave and ambient projects, where we push the boundaries
            of sound and visual art to create unique, immersive experiences.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 xl:gap-12 mb-32">
          {projects.map((project, index) => (
            <motion.div
              key={project.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-zinc-900/50 backdrop-blur-sm rounded-xl overflow-hidden hover:transform hover:scale-105 transition-transform duration-300 border border-white/10"
            >
              <div className="h-64 bg-zinc-800 relative">
                {/* Replace with actual images */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20" />
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-semibold mb-4">{project.title}</h3>
                <p className="text-gray-400 mb-6 text-lg">{project.description}</p>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-4 py-1.5 bg-zinc-800/50 backdrop-blur-sm rounded-full text-sm text-gray-300 border border-white/5"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Team Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <TeamSection />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default OurWork; 