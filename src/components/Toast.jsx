import { motion } from "framer-motion"
import { X, AlertCircle, CheckCircle } from "lucide-react"

const Toast = ({ type, message, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`${
        type === "error"
          ? "bg-red-100 border-red-500 text-red-700 dark:bg-red-900/30 dark:border-red-700 dark:text-red-300 blue:bg-red-100 blue:border-red-500 blue:text-red-700 green:bg-red-100 green:border-red-500 green:text-red-700 purple:bg-red-100 purple:border-red-500 purple:text-red-700 orange:bg-red-100 orange:border-red-500 orange:text-red-700 pink:bg-red-100 pink:border-red-500 pink:text-red-700"
          : "bg-green-100 border-green-500 text-green-700 dark:bg-green-900/30 dark:border-green-700 dark:text-green-300 blue:bg-green-100 blue:border-green-500 blue:text-green-700 green:bg-green-100 green:border-green-500 green:text-green-700 purple:bg-green-100 purple:border-green-500 purple:text-green-700 orange:bg-green-100 orange:border-green-500 orange:text-green-700 pink:bg-green-100 pink:border-green-500 pink:text-green-700"
      } border-l-4 p-4 mb-6 rounded shadow-md flex justify-between items-start`}
    >
      <div className="flex items-center">
        {type === "error" ? <AlertCircle className="w-5 h-5 mr-2" /> : <CheckCircle className="w-5 h-5 mr-2" />}
        <p>{message}</p>
      </div>
      <button
        onClick={onClose}
        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 ml-4"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  )
}

export default Toast
