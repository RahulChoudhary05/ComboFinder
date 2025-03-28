import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { Upload, FileSpreadsheet } from "lucide-react"

const FileUploader = ({ onFileContent, isLoading }) => {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)

  const handleFileUpload = (file) => {
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result
      onFileContent(content)
    }

    reader.readAsText(file)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file && (file.type === "text/csv" || file.name.endsWith(".csv"))) {
      handleFileUpload(file)
    } else {
      alert("Please upload a CSV file.")
    }
  }

  const downloadSampleFile = () => {
    const sampleContent =
      "ProductNo,ProductName,ProductCreate,ProductExpire,ProductDesc,ProductPrice,Discount,Category,InStock,Supplier\n1001,Laptop,2023-01-15,2026-01-15,High performance laptop,1200,0,Electronics,Yes,TechCorp\n1002,Mouse,2023-02-20,2025-02-20,Wireless gaming mouse,80,5,Electronics,Yes,TechCorp\n1003,Keyboard,2023-03-10,2025-03-10,Mechanical keyboard,120,0,Electronics,Yes,KeyMaster\n1004,Monitor,2023-04-05,2026-04-05,27-inch 4K monitor,350,10,Electronics,No,DisplayTech\n1005,Headphones,2023-05-12,2025-05-12,Noise cancelling headphones,200,15,Audio,Yes,SoundWave\n1006,Webcam,2023-06-18,2025-06-18,HD webcam with microphone,75,0,Electronics,Yes,TechVision"
    const blob = new Blob([sampleContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "sample_products.csv"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
          isDragging
            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 blue:bg-blue-100/50 green:bg-green-100/50 purple:bg-purple-100/50 orange:bg-orange-100/50 pink:bg-pink-100/50 scale-[1.02]"
            : "border-gray-300 dark:border-gray-700 blue:border-blue-300 green:border-green-300 purple:border-purple-300 orange:border-orange-300 pink:border-pink-300 hover:border-blue-400 dark:hover:border-blue-600 blue:hover:border-blue-400 green:hover:border-green-400 purple:hover:border-purple-400 orange:hover:border-orange-400 pink:hover:border-pink-400"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-4">
            <svg
              className="animate-spin h-8 w-8 text-blue-500 dark:text-blue-400 blue:text-blue-500 green:text-green-500 purple:text-purple-500 orange:text-orange-500 pink:text-pink-500 mb-2"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <p className="text-sm text-gray-500 dark:text-gray-400">Processing file...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-4">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            >
              <Upload className="h-10 w-10 text-blue-500 dark:text-blue-400 blue:text-blue-500 green:text-green-500 purple:text-purple-500 orange:text-orange-500 pink:text-pink-500 mb-2" />
            </motion.div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Drag and drop your CSV file here, or click to browse
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              CSV file with product data (name, price, etc.)
            </p>
          </div>
        )}
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleFileUpload(file)
          }}
          accept=".csv"
          className="hidden"
        />
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={downloadSampleFile}
        className="w-full bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 blue:from-blue-100 blue:to-blue-200 green:from-green-100 green:to-green-200 purple:from-purple-100 purple:to-purple-200 orange:from-orange-100 orange:to-orange-200 pink:from-pink-100 pink:to-pink-200 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-700 dark:hover:to-gray-600 text-gray-800 dark:text-gray-200 px-4 py-3 rounded-lg flex items-center justify-center transition-all shadow-sm"
      >
        <FileSpreadsheet className="w-5 h-5 mr-2 text-blue-500 dark:text-blue-400 blue:text-blue-500 green:text-green-500 purple:text-purple-500 orange:text-orange-500 pink:text-pink-500" />{" "}
        Download Sample File
      </motion.button>
    </div>
  )
}

export default FileUploader
