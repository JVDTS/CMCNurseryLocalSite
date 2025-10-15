
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowRight, FileText } from "lucide-react";
import { fadeUp } from "@/lib/animations";


interface NewsletterProps {
  nursery: string;
}

export default function Newsletter({ nursery }: NewsletterProps) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [newsletters, setNewsletters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNewsletters() {
      setLoading(true);
      try {
        // Fetch newsletters for the specific nursery
        const res = await fetch(`/api/nurseries/${nursery}/newsletters`);
        const data = await res.json();
        setNewsletters(data);
      } catch (err) {
        setNewsletters([]);
      }
      setLoading(false);
    }
    fetchNewsletters();
  }, [nursery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setEmail("");
      setTimeout(() => {
        setSubmitted(false);
      }, 3000);
    }
  };

  return (
    <section className="py-16 bg-primary">
      <div className="container mx-auto px-4">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="max-w-4xl mx-auto text-center"
        >
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Mail className="text-white w-8 h-8" />
            </div>
          </div>
          <h2 className="text-3xl font-heading font-bold text-white mb-4">
            Stay Updated with Our Newsletter
          </h2>
          <p className="text-white text-opacity-90 mb-8 max-w-lg mx-auto">
            Subscribe to our newsletter for updates on events, activities, and important information about our nursery.
          </p>
          <form onSubmit={handleSubmit} className="max-w-md mx-auto relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="w-full px-6 py-4 rounded-full shadow-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-secondary pr-12"
              required
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-secondary text-white p-2 rounded-full hover:bg-opacity-90 transition-all"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
          {submitted && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-white mt-4"
            >
              Thank you for subscribing!
            </motion.p>
          )}
          <div className="mt-12">
            <h3 className="text-2xl font-bold text-white mb-6">Latest Newsletters</h3>
            {loading ? (
              <div className="text-white">Loading newsletters...</div>
            ) : newsletters.length === 0 ? (
              <div className="text-white">No newsletters found.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {newsletters.map((nl: any) => (
                  <div key={nl.id} className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
                    {nl.thumbnailUrl ? (
                      <img src={nl.thumbnailUrl} alt={nl.title} className="w-24 h-24 object-cover rounded mb-2" />
                    ) : (
                      <div className="w-24 h-24 flex items-center justify-center bg-gray-200 rounded mb-2">
                        <FileText className="w-10 h-10 text-gray-400" />
                      </div>
                    )}
                    <h4 className="font-bold text-lg mb-1 text-gray-900">{nl.title}</h4>
                    <p className="text-gray-500 text-sm mb-2">{nl.description}</p>
                    <a
                      href={nl.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline"
                    >
                      View Newsletter
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
          <p className="text-white text-opacity-70 text-sm mt-6">
            We respect your privacy and will never share your email with third parties.
          </p>
        </motion.div>
      </div>
    </section>
  );
}