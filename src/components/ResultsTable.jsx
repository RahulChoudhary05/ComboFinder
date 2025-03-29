import { motion } from "framer-motion"

const ResultsTable = ({ combinations }) => {
  return (
    <div className="overflow-x-auto print:overflow-visible bg-gray-50 dark:bg-gray-900 blue:bg-blue-100/50 green:bg-green-100/50 purple:bg-purple-100/50 orange:bg-orange-100/50 pink:bg-pink-100/50 rounded-xl border border-gray-100 dark:border-gray-700 blue:border-blue-200 green:border-green-200 purple:border-purple-200 orange:border-orange-200 pink:border-pink-200">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 blue:divide-blue-200 green:divide-green-200 purple:divide-purple-200 orange:divide-orange-200 pink:divide-pink-200">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-800 blue:bg-blue-200/50 green:bg-green-200/50 purple:bg-purple-200/50 orange:bg-orange-200/50 pink:bg-pink-200/50">
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider rounded-tl-xl">
              #
            </th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Products
            </th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider rounded-tr-xl">
              Total Price
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 blue:bg-white green:bg-white purple:bg-white orange:bg-white pink:bg-white divide-y divide-gray-200 dark:divide-gray-700 blue:divide-blue-200 green:divide-green-200 purple:divide-purple-200 orange:divide-orange-200 pink:divide-pink-200">
          {combinations.map((combo, index) => (
            <motion.tr
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={
                index % 2 === 0
                  ? "bg-white dark:bg-gray-800 blue:bg-white green:bg-white purple:bg-white orange:bg-white pink:bg-white"
                  : "bg-gray-50 dark:bg-gray-900/50 blue:bg-blue-50 green:bg-green-50 purple:bg-purple-50 orange:bg-orange-50 pink:bg-pink-50"
              }
            >
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                #{index + 1}
              </td>
              <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                <ul className="list-disc pl-5 space-y-1">
                  {combo.products.map((product, idx) => (
                    <li key={idx}>
                      <span className="font-medium">{product.name}</span>
                      <span className="text-gray-500 dark:text-gray-400">(${product.price.toFixed(2)})</span>

                      {Object.entries(product.additionalData || {}).length > 0 && (
                        <ul className="list-none pl-4 mt-1 text-xs text-gray-500 dark:text-gray-400">
                          {Object.entries(product.additionalData).map(([key, value], i) => (
                            <li key={i}>
                              {key}: {value}
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 blue:bg-blue-100 blue:text-blue-800 green:bg-green-100 green:text-green-800 purple:bg-purple-100 purple:text-purple-800 orange:bg-orange-100 orange:text-orange-800 pink:bg-pink-100 pink:text-pink-800">
                  ${combo.totalPrice.toFixed(2)}
                </span>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ResultsTable
