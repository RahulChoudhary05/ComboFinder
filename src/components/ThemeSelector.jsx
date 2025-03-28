import { motion } from "framer-motion"
import { X, Sun, Moon, Monitor, Palette } from "lucide-react"

const themes = [
  { id: "light", name: "Light", icon: Sun, color: "bg-blue-500" },
  { id: "dark", name: "Dark", icon: Moon, color: "bg-indigo-700" },
]

const ThemeSelector = ({ currentTheme, onThemeChange, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white dark:bg-gray-800 blue:bg-blue-50 green:bg-green-50 purple:bg-purple-50 orange:bg-orange-50 pink:bg-pink-50 rounded-xl shadow-xl p-6 max-w-md w-full border border-gray-200 dark:border-gray-700 blue:border-blue-200 green:border-green-200 purple:border-purple-200 orange:border-orange-200 pink:border-pink-200"
      >
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 blue:from-blue-500 blue:to-blue-600 green:from-green-500 green:to-green-600 purple:from-purple-500 purple:to-purple-600 orange:from-orange-500 orange:to-orange-600 pink:from-pink-500 pink:to-pink-600 p-2 rounded-full mr-3">
              <Palette className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Choose Theme</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4">
          {themes.map((theme) => {
            const Icon = theme.icon
            return (
              <motion.button
                key={theme.id}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  onThemeChange(theme.id)
                  onClose()
                }}
                className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${
                  currentTheme === theme.id
                    ? "border-blue-500 dark:border-blue-400 blue:border-blue-500 green:border-green-500 purple:border-purple-500 orange:border-orange-500 pink:border-pink-500 bg-blue-50 dark:bg-blue-900/20 blue:bg-blue-100/50 green:bg-green-100/50 purple:bg-purple-100/50 orange:bg-orange-100/50 pink:bg-pink-100/50"
                    : "border-gray-200 dark:border-gray-700 blue:border-blue-200 green:border-green-200 purple:border-purple-200 orange:border-orange-200 pink:border-pink-200 hover:border-blue-300 dark:hover:border-blue-700 blue:hover:border-blue-400 green:hover:border-green-400 purple:hover:border-purple-400 orange:hover:border-orange-400 pink:hover:border-pink-400"
                }`}
              >
                <div className={`${theme.color} p-3 rounded-full mb-2`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{theme.name}</span>
              </motion.button>
            )
          })}
        </div>
      </motion.div>
    </motion.div>
  )
}

export default ThemeSelector
