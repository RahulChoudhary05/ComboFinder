import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { User, Github, Linkedin, Globe, X, Code } from "lucide-react"

const DeveloperProfile = () => {
  const [showProfile, setShowProfile] = useState(false)

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowProfile(true)}
        className="bg-white bg-opacity-20 hover:bg-opacity-30 p-2 rounded-full transition-all"
        aria-label="Developer Profile"
      >
        <Code className="w-5 h-5" />
      </motion.button>

      <AnimatePresence>
        {showProfile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={() => setShowProfile(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-gray-800 blue:bg-blue-50 green:bg-green-50 purple:bg-purple-50 orange:bg-orange-50 pink:bg-pink-50 rounded-xl shadow-xl p-6 max-w-md w-full border border-gray-200 dark:border-gray-700 blue:border-blue-200 green:border-green-200 purple:border-purple-200 orange:border-orange-200 pink:border-pink-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 blue:from-blue-500 blue:to-blue-600 green:from-green-500 green:to-green-600 purple:from-purple-500 purple:to-purple-600 orange:from-orange-500 orange:to-orange-600 pink:from-pink-500 pink:to-pink-600 p-2 rounded-full mr-3">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Developer Profile</h2>
                </div>
                <button
                  onClick={() => setShowProfile(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-col items-center mb-6">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-blue-500 dark:border-blue-600 blue:border-blue-500 green:border-green-500 purple:border-purple-500 orange:border-orange-500 pink:border-pink-500 mb-4">
                  <img
                    src="https://res.cloudinary.com/dnlrwuxxs/image/upload/fl_preserve_transparency/v1743144349/RahulChoudharyPortfolio/Resume_Pic_sznfx3.jpg?_s=public-apps"
                    alt="Developer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Rahul Choudhary</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Full Stack Developer</p>
              </div>

              <div className="space-y-4 mb-6">
                <p className="text-gray-700 dark:text-gray-300">
                  I'm a passionate developer with expertise in React, Node.js, and modern web technologies. I love
                  creating intuitive and responsive applications that solve real-world problems.
                </p>

                <div className="flex flex-col space-y-2">
                  <a
                    href="https://github.com/RahulChoudhary05"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center p-2 rounded-lg bg-gray-100 dark:bg-gray-700 blue:bg-blue-100 green:bg-green-100 purple:bg-purple-100 orange:bg-orange-100 pink:bg-pink-100 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <Github className="w-5 h-5 mr-2 text-gray-700 dark:text-gray-300" />
                    <span className="text-gray-700 dark:text-gray-300">github.com/RahulChoudhary05</span>
                  </a>

                  <a
                    href="https://www.linkedin.com/in/rahulchoudhary210505"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center p-2 rounded-lg bg-gray-100 dark:bg-gray-700 blue:bg-blue-100 green:bg-green-100 purple:bg-purple-100 orange:bg-orange-100 pink:bg-pink-100 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <Linkedin className="w-5 h-5 mr-2 text-gray-700 dark:text-gray-300" />
                    <span className="text-gray-700 dark:text-gray-300">linkedin.com/in/rahulchoudhary210505</span>
                  </a>

                  <a
                    href="https://rahulchoudhary05.vercel.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center p-2 rounded-lg bg-gray-100 dark:bg-gray-700 blue:bg-blue-100 green:bg-green-100 purple:bg-purple-100 orange:bg-orange-100 pink:bg-pink-100 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <Globe className="w-5 h-5 mr-2 text-gray-700 dark:text-gray-300" />
                    <span className="text-gray-700 dark:text-gray-300">rahulchoudhary05.vercel.app</span>
                  </a>
                </div>
              </div>

              <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                <p>Feel free to reach out for collaboration or questions!</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default DeveloperProfile
