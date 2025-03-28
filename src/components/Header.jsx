import { motion, AnimatePresence } from "framer-motion"
import { Search, ChevronDown, Palette } from "lucide-react"
import HowItWorks from "./HowItWorks"
import DeveloperProfile from "./DeveloperProfile"

const Header = ({ showHowItWorks, setShowHowItWorks, theme, setShowThemeSelector }) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700 text-white dark:from-blue-900 dark:to-indigo-900 blue:from-blue-600 blue:to-blue-800 green:from-green-600 green:to-green-800 purple:from-purple-600 purple:to-purple-800 orange:from-orange-500 orange:to-red-600 pink:from-pink-500 pink:to-purple-600">
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white opacity-10"
            initial={{
              x: Math.random() * 100 - 50 + "%",
              y: Math.random() * 100 - 50 + "%",
              scale: Math.random() * 0.5 + 0.5,
            }}
            animate={{
              x: [Math.random() * 100 - 50 + "%", Math.random() * 100 - 50 + "%", Math.random() * 100 - 50 + "%"],
              y: [Math.random() * 100 - 50 + "%", Math.random() * 100 - 50 + "%", Math.random() * 100 - 50 + "%"],
            }}
            transition={{
              duration: 20 + Math.random() * 30,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
            }}
            style={{
              width: Math.random() * 300 + 50 + "px",
              height: Math.random() * 300 + 50 + "px",
            }}
          />
        ))}
      </div>

      <header className="relative z-10 py-8 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col md:flex-row items-center justify-between gap-4"
          >
            <div className="flex items-center">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="bg-white bg-opacity-20 p-3 rounded-full mr-3"
              >
                <Search className="w-8 h-8" />
              </motion.div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">ComboFinder</h1>
                <p className="text-blue-100 dark:text-blue-200">
                  Find the perfect product combinations within your budget
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <DeveloperProfile />

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowThemeSelector(true)}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 p-2 rounded-full transition-all"
                aria-label="Change theme"
              >
                <Palette className="w-5 h-5" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowHowItWorks(!showHowItWorks)}
                className="flex items-center gap-2 bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-full transition-all"
              >
                How It Works
                <motion.div animate={{ rotate: showHowItWorks ? 180 : 0 }} transition={{ duration: 0.3 }}>
                  <ChevronDown className="w-5 h-5" />
                </motion.div>
              </motion.button>
            </div>
          </motion.div>

          <AnimatePresence>{showHowItWorks && <HowItWorks />}</AnimatePresence>
        </div>
      </header>
    </div>
  )
}

export default Header
