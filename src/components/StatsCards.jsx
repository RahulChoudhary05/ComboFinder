import { motion } from "framer-motion"

const StatsCards = ({ productsCount, lowerLimit, upperLimit, combinationsCount }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6"
    >
      <motion.div
        whileHover={{ y: -5 }}
        className="bg-white dark:bg-gray-800 blue:bg-blue-50 green:bg-green-50 purple:bg-purple-50 orange:bg-orange-50 pink:bg-pink-50 rounded-xl shadow-md p-6 border-l-4 border-blue-500 dark:border-blue-600 blue:border-blue-500 green:border-green-500 purple:border-purple-500 orange:border-orange-500 pink:border-pink-500 hover:shadow-lg transition-all"
      >
        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">Total Products</h3>
        <div className="flex items-center">
          <span className="text-2xl font-bold text-gray-800 dark:text-gray-100">{productsCount}</span>
          <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">items</span>
        </div>
      </motion.div>

      <motion.div
        whileHover={{ y: -5 }}
        className="bg-white dark:bg-gray-800 blue:bg-blue-50 green:bg-green-50 purple:bg-purple-50 orange:bg-orange-50 pink:bg-pink-50 rounded-xl shadow-md p-6 border-l-4 border-indigo-500 dark:border-indigo-600 blue:border-blue-500 green:border-green-500 purple:border-purple-500 orange:border-orange-500 pink:border-pink-500 hover:shadow-lg transition-all"
      >
        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">Price Range</h3>
        <div className="flex items-center">
          <span className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            ${lowerLimit} - ${upperLimit}
          </span>
        </div>
      </motion.div>

      <motion.div
        whileHover={{ y: -5 }}
        className="bg-white dark:bg-gray-800 blue:bg-blue-50 green:bg-green-50 purple:bg-purple-50 orange:bg-orange-50 pink:bg-pink-50 rounded-xl shadow-md p-6 border-l-4 border-purple-500 dark:border-purple-600 blue:border-blue-500 green:border-green-500 purple:border-purple-500 orange:border-orange-500 pink:border-pink-500 hover:shadow-lg transition-all"
      >
        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">Combinations Found</h3>
        <div className="flex items-center">
          <span className="text-2xl font-bold text-gray-800 dark:text-gray-100">{combinationsCount}</span>
          <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">matches</span>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default StatsCards
