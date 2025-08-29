import { useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { 
  Heart, 
  Users, 
  Brain, 
  Eye, 
  Ear, 
  Hand, 
  BookOpen, 
  Target, 
  Star,
  Play,
  Pause,
  Volume2,
  ChevronRight,
  Award,
  Shield,
  Lightbulb,
  Palette,
  Music,
  CheckCircle,
  Phone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

const slideVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut"
    }
  }
};

const iconVariants = {
  hover: {
    scale: 1.2,
    rotate: 5,
    transition: {
      duration: 0.3,
      ease: "easeInOut"
    }
  }
};

const SENPage = () => {
  const [activeTab, setActiveTab] = useState(0);

  // Section refs for scroll animations
  const heroRef = useRef<HTMLDivElement>(null);
  const philosophyRef = useRef<HTMLDivElement>(null);
  const supportRef = useRef<HTMLDivElement>(null);
  const processRef = useRef<HTMLDivElement>(null);
  const testimonialsRef = useRef<HTMLDivElement>(null);

  // In-view hooks
  const heroInView = useInView(heroRef, { once: true });
  const philosophyInView = useInView(philosophyRef, { once: true });
  const supportInView = useInView(supportRef, { once: true });
  const processInView = useInView(processRef, { once: true });
  const testimonialsInView = useInView(testimonialsRef, { once: true });



  const supportAreas = [
    {
      icon: Brain,
      title: "Cognitive Development",
      description: "Tailored learning approaches for different cognitive abilities and learning styles.",
      color: "from-purple-400 to-pink-400",
      features: ["Visual learning aids", "Structured routines", "Multi-sensory activities"]
    },
    {
      icon: Eye,
      title: "Visual Impairments",
      description: "Specialized support for children with visual challenges.",
      color: "from-blue-400 to-cyan-400",
      features: ["Braille resources", "Audio descriptions", "Tactile learning materials"]
    },
    {
      icon: Ear,
      title: "Hearing Support",
      description: "Communication assistance for children with hearing difficulties.",
      color: "from-green-400 to-teal-400",
      features: ["Sign language support", "Visual communication", "Hearing loop systems"]
    },
    {
      icon: Hand,
      title: "Physical Disabilities",
      description: "Adaptive environments and equipment for physical accessibility.",
      color: "from-orange-400 to-red-400",
      features: ["Wheelchair accessibility", "Adaptive equipment", "Physiotherapy support"]
    },
    {
      icon: Heart,
      title: "Social & Emotional",
      description: "Building confidence, social skills, and emotional regulation.",
      color: "from-rose-400 to-pink-400",
      features: ["Peer buddy systems", "Emotional check-ins", "Social skills groups"]
    },
    {
      icon: BookOpen,
      title: "Learning Difficulties",
      description: "Specialized teaching methods for various learning challenges.",
      color: "from-indigo-400 to-purple-400",
      features: ["Dyslexia support", "ADHD strategies", "Autism-friendly environments"]
    }
  ];

  const processSteps = [
    {
      step: 1,
      title: "Initial Assessment",
      description: "Comprehensive evaluation of your child's unique needs and strengths.",
      icon: Target
    },
    {
      step: 2,
      title: "Personalized Plan",
      description: "Creating an Individual Education Plan (IEP) tailored to your child.",
      icon: Star
    },
    {
      step: 3,
      title: "Implementation",
      description: "Putting support strategies into daily practice with our trained staff.",
      icon: Users
    },
    {
      step: 4,
      title: "Regular Review",
      description: "Continuous monitoring and adjustment of support plans as needed.",
      icon: Award
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      child: "Emma (Age 4)",
      location: "Hayes",
      text: "The team at Coat of Many Colours has been incredible in supporting Emma's autism. She's thriving in their structured, caring environment.",
      image: "/images/parent1.jpg"
    },
    {
      name: "Michael Chen",
      child: "Lucas (Age 3)",
      location: "Uxbridge",
      text: "Lucas has ADHD, and the staff's understanding and patience has made all the difference. He's learning to communicate and interact so well.",
      image: "/images/parent2.jpg"
    },
    {
      name: "Priya Patel",
      child: "Aisha (Age 5)",
      location: "Hounslow",
      text: "The sensory room and specialized activities have helped Aisha with her processing difficulties. We couldn't be happier.",
      image: "/images/parent3.jpg"
    }
  ];

  const qualifications = [
    { icon: Award, text: "SENCO qualified staff" },
    { icon: Shield, text: "Ofsted Outstanding rating" },
    { icon: BookOpen, text: "Specialized training programs" },
    { icon: Heart, text: "Person-centered approach" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <NavBar />
      
      {/* Hero Section with Video Background */}
      <motion.section 
        ref={heroRef}
        className="relative pt-20 pb-16 overflow-hidden"
        initial="hidden"
        animate={heroInView ? "visible" : "hidden"}
        variants={containerVariants}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-600/20"></div>
        
        {/* Hero Image Background */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/attached_assets/image_1751472102802.png"
            alt="Children with special education needs learning together"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/50 to-purple-600/50"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div variants={itemVariants} className="mb-6">
              <motion.div
                className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 mb-8"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <Heart className="text-pink-500" size={24} />
                <span className="text-white font-semibold">Every Child Matters</span>
              </motion.div>
            </motion.div>

            <motion.h1 
              variants={itemVariants}
              className="text-4xl md:text-6xl font-heading font-bold text-white mb-6 leading-tight"
            >
              Special Education
              <span className="bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent block">
                Needs Support
              </span>
            </motion.h1>

            <motion.p 
              variants={itemVariants}
              className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed"
            >
              Empowering every child to reach their full potential through 
              personalized care, expert support, and inclusive learning environments.
            </motion.p>

            <motion.div 
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Button 
                size="lg" 
                className="bg-white text-primary hover:bg-gray-100 px-8 py-4 text-lg rounded-full shadow-xl"
              >
                <BookOpen className="mr-2" size={20} />
                Learn About Our Approach
              </Button>
              
              <Button 
                size="lg" 
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-primary px-8 py-4 text-lg rounded-full"
              >
                <Phone className="mr-2" size={20} />
                Contact Us Today
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Floating Elements */}
        <motion.div
          className="absolute top-20 right-10 w-20 h-20 bg-yellow-300/30 rounded-full"
          animate={{
            y: [0, -20, 0],
            rotate: [0, 180, 360]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 left-10 w-16 h-16 bg-pink-300/30 rounded-full"
          animate={{
            y: [0, 20, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.section>

      {/* Philosophy Section */}
      <motion.section 
        ref={philosophyRef}
        className="py-20 bg-white"
        initial="hidden"
        animate={philosophyInView ? "visible" : "hidden"}
        variants={containerVariants}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div variants={itemVariants} className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-heading font-bold text-gray-900 mb-6">
                Our <span className="text-primary">Philosophy</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                We believe that every child is unique and deserves the opportunity to learn, grow, 
                and thrive in an environment that celebrates their individual strengths and supports their needs.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div variants={slideVariants} className="space-y-6">
                <div className="bg-gradient-to-br from-primary/10 to-purple-100 p-8 rounded-2xl">
                  <h3 className="text-2xl font-heading font-bold text-gray-900 mb-4">
                    Inclusive Excellence
                  </h3>
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    Our nurseries are designed to be fully inclusive spaces where children of all abilities 
                    learn together, support each other, and celebrate differences as strengths.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {qualifications.map((qual, index) => (
                      <motion.div
                        key={index}
                        className="flex items-center gap-2 text-sm text-gray-600"
                        whileHover={{ scale: 1.05, x: 5 }}
                        transition={{ duration: 0.2 }}
                      >
                        <qual.icon className="text-primary" size={16} />
                        <span>{qual.text}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <motion.div 
                  className="bg-gradient-to-br from-yellow-50 to-orange-50 p-8 rounded-2xl"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="text-2xl font-heading font-bold text-gray-900 mb-4">
                    Family Partnership
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    We work closely with families to ensure continuity of support between home and nursery, 
                    creating a unified approach to your child's development.
                  </p>
                </motion.div>
              </motion.div>

              <motion.div 
                variants={slideVariants}
                className="relative"
              >
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  <img 
                    src="/images/sen-philosophy.svg" 
                    alt="Children learning together inclusively"
                    className="w-full h-96 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  <div className="absolute bottom-6 left-6 text-white">
                    <h4 className="text-xl font-semibold mb-2">Learning Together</h4>
                    <p className="text-white/90">Every child brings unique gifts to our community</p>
                  </div>
                </div>

                {/* Floating stats */}
                <motion.div
                  className="absolute -top-6 -right-6 bg-white rounded-2xl p-6 shadow-xl border border-gray-100"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={philosophyInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                >
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">98%</div>
                    <div className="text-sm text-gray-600">Parent Satisfaction</div>
                  </div>
                </motion.div>

                <motion.div
                  className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-6 shadow-xl border border-gray-100"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={philosophyInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                  transition={{ delay: 0.7, duration: 0.6 }}
                >
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-2">15+</div>
                    <div className="text-sm text-gray-600">Years Experience</div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Support Areas Section */}
      <motion.section 
        ref={supportRef}
        className="py-20 bg-gradient-to-br from-gray-50 to-blue-50"
        initial="hidden"
        animate={supportInView ? "visible" : "hidden"}
        variants={containerVariants}
      >
        <div className="container mx-auto px-4">
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-heading font-bold text-gray-900 mb-6">
              Areas of <span className="text-primary">Specialized Support</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our expert team provides comprehensive support across a wide range of special educational needs
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {supportAreas.map((area, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="group"
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="h-full bg-white border-0 shadow-lg hover:shadow-2xl transition-all duration-300">
                  <CardContent className="p-8">
                    <motion.div
                      className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${area.color} mb-6`}
                      variants={iconVariants}
                      whileHover="hover"
                    >
                      <area.icon className="text-white" size={32} />
                    </motion.div>
                    
                    <h3 className="text-2xl font-heading font-bold text-gray-900 mb-4">
                      {area.title}
                    </h3>
                    
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      {area.description}
                    </p>

                    <div className="space-y-3">
                      {area.features.map((feature, featureIndex) => (
                        <motion.div
                          key={featureIndex}
                          className="flex items-center gap-3 text-sm text-gray-700"
                          initial={{ opacity: 0, x: -10 }}
                          animate={supportInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                          transition={{ delay: index * 0.1 + featureIndex * 0.1 }}
                        >
                          <CheckCircle className="text-green-500 flex-shrink-0" size={16} />
                          <span>{feature}</span>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Process Section */}
      <motion.section 
        ref={processRef}
        className="py-20 bg-white"
        initial="hidden"
        animate={processInView ? "visible" : "hidden"}
        variants={containerVariants}
      >
        <div className="container mx-auto px-4">
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-heading font-bold text-gray-900 mb-6">
              Our <span className="text-primary">Support Process</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A structured, collaborative approach to ensuring your child receives the best possible support
            </p>
          </motion.div>

          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {processSteps.map((step, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="relative"
                >
                  <div className="text-center">
                    {/* Step number */}
                    <motion.div
                      className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary to-purple-600 text-white font-bold text-xl rounded-full mb-6"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ duration: 0.3 }}
                    >
                      {step.step}
                    </motion.div>

                    {/* Icon */}
                    <motion.div
                      className="inline-flex p-4 bg-gray-100 rounded-2xl mb-6"
                      whileHover={{ scale: 1.1, backgroundColor: "#f3f4f6" }}
                      transition={{ duration: 0.3 }}
                    >
                      <step.icon className="text-primary" size={32} />
                    </motion.div>

                    <h3 className="text-xl font-heading font-bold text-gray-900 mb-4">
                      {step.title}
                    </h3>

                    <p className="text-gray-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  {/* Connecting line */}
                  {index < processSteps.length - 1 && (
                    <motion.div
                      className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-primary to-purple-600"
                      initial={{ scaleX: 0 }}
                      animate={processInView ? { scaleX: 1 } : { scaleX: 0 }}
                      transition={{ delay: index * 0.2, duration: 0.8 }}
                    />
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* Testimonials Section */}
      <motion.section 
        ref={testimonialsRef}
        className="py-20 bg-gradient-to-br from-purple-50 to-pink-50"
        initial="hidden"
        animate={testimonialsInView ? "visible" : "hidden"}
        variants={containerVariants}
      >
        <div className="container mx-auto px-4">
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-heading font-bold text-gray-900 mb-6">
              Parent <span className="text-primary">Stories</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Hear from families who have experienced the difference our specialized support makes
            </p>
          </motion.div>

          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="group"
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="bg-white border-0 shadow-lg hover:shadow-2xl transition-all duration-300 h-full">
                    <CardContent className="p-8">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 bg-gradient-to-r from-primary to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                          {testimonial.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-heading font-bold text-gray-900">
                            {testimonial.name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Parent of {testimonial.child}
                          </p>
                          <p className="text-xs text-primary font-semibold">
                            {testimonial.location} Branch
                          </p>
                        </div>
                      </div>

                      <blockquote className="text-gray-700 italic leading-relaxed">
                        "{testimonial.text}"
                      </blockquote>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section 
        className="py-20 bg-gradient-to-r from-primary to-purple-600 text-white"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="container mx-auto px-4 text-center">
          <motion.h2 
            className="text-3xl md:text-5xl font-heading font-bold mb-6"
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Ready to Support Your Child's Journey?
          </motion.h2>
          
          <motion.p 
            className="text-xl mb-8 max-w-3xl mx-auto leading-relaxed opacity-90"
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Contact us today to discuss how we can provide the specialized support your child needs to thrive.
          </motion.p>
          
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <Button 
              size="lg" 
              className="border-white text-black hover:bg-white hover:text-primary px-8 py-4 text-lg rounded-full bg-white"
            >
              <BookOpen className="mr-2" size={20} />
              Download Our SEN Guide
            </Button>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default SENPage;