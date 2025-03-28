import { motion } from "framer-motion"
import { Upload, DollarSign, Package, Columns } from "lucide-react"

const HowItWorks = () => {
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="overflow-hidden mt-6"
    >
      <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">How ComboFinder Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="flex flex-col items-center text-center">
            <div className="bg-white bg-opacity-20 p-4 rounded-full mb-3">
              <Upload className="w-6 h-6" />
            </div>
            <h3 className="font-medium mb-2">1. Upload Products</h3>
            <p className="text-sm text-blue-100">Upload a CSV file with your product data</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="bg-white bg-opacity-20 p-4 rounded-full mb-3">
              <Columns className="w-6 h-6" />
            </div>
            <h3 className="font-medium mb-2">2. Select Columns</h3>
            <p className="text-sm text-blue-100">Choose which columns to use for name, price, and additional info</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="bg-white bg-opacity-20 p-4 rounded-full mb-3">
              <DollarSign className="w-6 h-6" />
            </div>
            <h3 className="font-medium mb-2">3. Set Price Range</h3>
            <p className="text-sm text-blue-100">Define your budget with lower and upper price limits</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="bg-white bg-opacity-20 p-4 rounded-full mb-3">
              <Package className="w-6 h-6" />
            </div>
            <h3 className="font-medium mb-2">4. Get Combinations</h3>
            <p className="text-sm text-blue-100">View, email, or print product combinations that fit your budget</p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default HowItWorks
