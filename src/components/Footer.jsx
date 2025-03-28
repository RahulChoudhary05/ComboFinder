import { motion } from "framer-motion"
import { Github, Linkedin, Twitter, Mail, Globe } from "lucide-react"
import { Search } from "lucide-react"

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-gray-800 to-gray-900 dark:from-gray-900 dark:to-black blue:from-blue-800 blue:to-blue-900 green:from-green-800 green:to-green-900 purple:from-purple-800 purple:to-purple-900 orange:from-orange-800 orange:to-orange-900 pink:from-pink-800 pink:to-pink-900 text-white p-8 mt-8 print-hide">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center md:items-start">
          <div className="flex items-center mb-4 md:mb-0">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="bg-white bg-opacity-20 p-3 rounded-full mr-3"
            >
              <Search className="w-8 h-8 text-white" />
            </motion.div>
            <span className="text-xl font-bold">ComboFinder</span>
          </div>
            <p className="text-gray-400 text-center md:text-left">
              Find the perfect product combinations within your budget. Upload your product data and discover
              combinations that match your price range.
            </p>
          </div>

          <div className="flex flex-col items-center">
            <h3 className="text-lg font-semibold mb-4">Connect With Me</h3>
            <div className="flex space-x-4">
              <motion.a
                href="https://github.com/RahulChoudhary05"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -3 }}
                className="bg-white bg-opacity-10 p-2 rounded-full hover:bg-opacity-20 transition-all"
              >
                <Github className="w-5 h-5" />
              </motion.a>
              <motion.a
                href="https://www.linkedin.com/in/rahulchoudhary210505/"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -3 }}
                className="bg-white bg-opacity-10 p-2 rounded-full hover:bg-opacity-20 transition-all"
              >
                <Linkedin className="w-5 h-5" />
              </motion.a>
              <motion.a
                href="https://twitter.com/krahul_21"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -3 }}
                className="bg-white bg-opacity-10 p-2 rounded-full hover:bg-opacity-20 transition-all"
              >
                <Twitter className="w-5 h-5" />
              </motion.a>
              <motion.a
                href="mailto:rahulchoudhary.sk@gmail.com"
                whileHover={{ y: -3 }}
                className="bg-white bg-opacity-10 p-2 rounded-full hover:bg-opacity-20 transition-all"
              >
                <Mail className="w-5 h-5" />
              </motion.a>
              <motion.a
                href="https://rahulchoudhary05.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -3 }}
                className="bg-white bg-opacity-10 p-2 rounded-full hover:bg-opacity-20 transition-all"
              >
                <Globe className="w-5 h-5" />
              </motion.a>
            </div>
          </div>

          <div className="flex flex-col items-center md:items-end">
            <h3 className="text-lg font-semibold mb-4">About the Developer</h3>
            <p className="text-gray-400 text-center md:text-right">
              Created by John Doe, a full-stack developer passionate about building useful tools and applications.
            </p>
            <p className="text-gray-500 mt-4 text-center md:text-right">
              © {new Date().getFullYear()} ComboFinder - All rights reserved
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
