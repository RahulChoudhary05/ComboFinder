import { useState } from "react"
import { motion } from "framer-motion"
import { X, Database, Check, Plus, Trash2 } from "lucide-react"

const ColumnSelector = ({ headers, selectedColumns, setSelectedColumns, onConfirm, onCancel, isLoading }) => {
  const [columnType, setColumnType] = useState("name")

  const addColumn = (header, index) => {
    const isAlreadySelected = selectedColumns.some((col) => col.header === header)

    if (!isAlreadySelected) {
      setSelectedColumns([
        ...selectedColumns,
        {
          header,
          type: columnType,
          index,
        },
      ])
    }
  }

  const removeColumn = (header) => {
    setSelectedColumns(selectedColumns.filter((col) => col.header !== header))
  }

  const getColumnTypeLabel = (type) => {
    switch (type) {
      case "name":
        return "Product Name"
      case "price":
        return "Price"
      default:
        return "Additional Info"
    }
  }

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
        className="bg-white dark:bg-gray-800 blue:bg-blue-50 green:bg-green-50 purple:bg-purple-50 orange:bg-orange-50 pink:bg-pink-50 rounded-xl shadow-xl p-6 max-w-2xl w-full border border-gray-200 dark:border-gray-700 blue:border-blue-200 green:border-green-200 purple:border-purple-200 orange:border-orange-200 pink:border-pink-200"
      >
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <div className="bg-blue-100 dark:bg-blue-900 blue:bg-blue-200 green:bg-green-200 purple:bg-purple-200 orange:bg-orange-200 pink:bg-pink-200 p-2 rounded-full mr-3 shadow-inner">
              <Database className="w-5 h-5 text-blue-600 dark:text-blue-300 blue:text-blue-600 green:text-green-600 purple:text-purple-600 orange:text-orange-600 pink:text-pink-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Select Columns</h2>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          We detected the following columns in your file. Select which columns you want to use and specify their type.
        </p>

        <div className="mb-6 bg-gray-50 dark:bg-gray-900 blue:bg-blue-100/50 green:bg-green-100/50 purple:bg-purple-100/50 orange:bg-orange-100/50 pink:bg-pink-100/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700 blue:border-blue-200 green:border-green-200 purple:border-purple-200 orange:border-orange-200 pink:border-pink-200">
          <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Selected Columns</h3>

          {selectedColumns.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 italic">
              No columns selected yet. Select columns below.
            </p>
          ) : (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {selectedColumns.map((column, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-white dark:bg-gray-800 blue:bg-white green:bg-white purple:bg-white orange:bg-white pink:bg-white p-2 rounded border border-gray-200 dark:border-gray-700 blue:border-blue-200 green:border-green-200 purple:border-purple-200 orange:border-orange-200 pink:border-pink-200"
                >
                  <div className="flex items-center">
                    <span
                      className={`inline-block w-2 h-2 rounded-full mr-2 ${
                        column.type === "name"
                          ? "bg-blue-500"
                          : column.type === "price"
                            ? "bg-green-500"
                            : "bg-purple-500"
                      }`}
                    ></span>
                    <span className="font-medium text-gray-700 dark:text-gray-300">{column.header}</span>
                    <span className="ml-2 text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 blue:bg-blue-100 green:bg-green-100 purple:bg-purple-100 orange:bg-orange-100 pink:bg-pink-100 text-gray-600 dark:text-gray-400">
                      {getColumnTypeLabel(column.type)}
                    </span>
                  </div>
                  <button
                    onClick={() => removeColumn(column.header)}
                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mb-4">
          <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Available Columns</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => setColumnType("name")}
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                columnType === "name"
                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-2 border-blue-500"
                  : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 blue:bg-blue-100 blue:text-blue-800 green:bg-green-100 green:text-green-800 purple:bg-purple-100 purple:text-purple-800 orange:bg-orange-100 orange:text-orange-800 pink:bg-pink-100 pink:text-pink-800"
              }`}
            >
              Product Name
            </button>
            <button
              onClick={() => setColumnType("price")}
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                columnType === "price"
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-2 border-green-500"
                  : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 blue:bg-blue-100 blue:text-blue-800 green:bg-green-100 green:text-green-800 purple:bg-purple-100 purple:text-purple-800 orange:bg-orange-100 orange:text-orange-800 pink:bg-pink-100 pink:text-pink-800"
              }`}
            >
              Price
            </button>
            <button
              onClick={() => setColumnType("other")}
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                columnType === "other"
                  ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 border-2 border-purple-500"
                  : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 blue:bg-blue-100 blue:text-blue-800 green:bg-green-100 green:text-green-800 purple:bg-purple-100 purple:text-purple-800 orange:bg-orange-100 orange:text-orange-800 pink:bg-pink-100 pink:text-pink-800"
              }`}
            >
              Additional Info
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-60 overflow-y-auto p-2 bg-gray-50 dark:bg-gray-900 blue:bg-blue-100/50 green:bg-green-100/50 purple:bg-purple-100/50 orange:bg-orange-100/50 pink:bg-pink-100/50 rounded-lg">
            {headers.map((header, index) => {
              const isSelected = selectedColumns.some((col) => col.header === header)
              return (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => addColumn(header, index)}
                  disabled={isSelected}
                  className={`flex items-center justify-between p-2 rounded ${
                    isSelected
                      ? "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                      : "bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 blue:border-blue-200 green:border-green-200 purple:border-purple-200 orange:border-orange-200 pink:border-pink-200"
                  }`}
                >
                  <span className="truncate text-sm">{header}</span>
                  {!isSelected && <Plus className="w-4 h-4 text-gray-500 dark:text-gray-400" />}
                </motion.button>
              )
            })}
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 blue:border-blue-300 green:border-green-300 purple:border-purple-300 orange:border-orange-300 pink:border-pink-300 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={
              selectedColumns.length === 0 ||
              isLoading ||
              !selectedColumns.some((col) => col.type === "name") ||
              !selectedColumns.some((col) => col.type === "price")
            }
            className={`px-4 py-2 rounded-lg flex items-center ${
              selectedColumns.length === 0 ||
              isLoading ||
              !selectedColumns.some((col) => col.type === "name") ||
              !selectedColumns.some((col) => col.type === "price")
                ? "bg-gray-300 dark:bg-gray-700 cursor-not-allowed text-gray-500 dark:text-gray-400"
                : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 blue:bg-blue-600 blue:hover:bg-blue-700 green:bg-green-600 green:hover:bg-green-700 purple:bg-purple-600 purple:hover:bg-purple-700 orange:bg-orange-600 orange:hover:bg-orange-700 pink:bg-pink-600 pink:hover:bg-pink-700 text-white"
            } transition-colors`}
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                Processing...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" /> Confirm
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default ColumnSelector
