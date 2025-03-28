import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, Mail, Printer, DollarSign, Package, BarChart3, Check } from "lucide-react"
import Header from "./components/Header"
import Footer from "./components/Footer"
import FileUploader from "./components/FileUploader"
import ResultsTable from "./components/ResultsTable"
import StatsCards from "./components/StatsCards"
import ColumnSelector from "./components/ColumnSelector"
import Toast from "./components/Toast"
import ThemeSelector from "./components/ThemeSelector"
import "./index.css"

function App() {
  const [products, setProducts] = useState([])
  const [combinations, setCombinations] = useState([])
  const [lowerLimit, setLowerLimit] = useState(490)
  const [upperLimit, setUpperLimit] = useState(510)
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [showHowItWorks, setShowHowItWorks] = useState(false)
  const [fileHeaders, setFileHeaders] = useState([])
  const [showColumnSelector, setShowColumnSelector] = useState(false)
  const [selectedColumns, setSelectedColumns] = useState([])
  const [fileContent, setFileContent] = useState(null)
  const [theme, setTheme] = useState("light")
  const [showThemeSelector, setShowThemeSelector] = useState(false)
  const resultsRef = useRef(null)

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [success])

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [error])

  useEffect(() => {
    const savedTheme = localStorage.getItem("combofinder-theme")
    if (savedTheme) {
      setTheme(savedTheme)
      document.documentElement.className = savedTheme
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      setTheme(prefersDark ? "dark" : "light")
      document.documentElement.className = prefersDark ? "dark" : "light"
    }
  }, [])

  const changeTheme = (newTheme) => {
    setTheme(newTheme)
    document.documentElement.className = newTheme
    localStorage.setItem("combofinder-theme", newTheme)
  }

  const handleFileContent = (content) => {
    try {
      setFileContent(content)
      const lines = content.split("\n")
      if (lines.length > 0) {
        const headers = lines[0].split(",").map((header) => header.trim())
        setFileHeaders(headers)
        setShowColumnSelector(true)

        const nameIndex = headers.findIndex(
          (h) => h.toLowerCase().includes("name") || h.toLowerCase().includes("product"),
        )

        const priceIndex = headers.findIndex(
          (h) => h.toLowerCase().includes("price") || h.toLowerCase().includes("cost"),
        )

        const initialSelectedColumns = []

        if (nameIndex !== -1) {
          initialSelectedColumns.push({
            header: headers[nameIndex],
            type: "name",
            index: nameIndex,
          })
        }

        if (priceIndex !== -1) {
          initialSelectedColumns.push({
            header: headers[priceIndex],
            type: "price",
            index: priceIndex,
          })
        }

        setSelectedColumns(initialSelectedColumns)
      } else {
        setError("The file appears to be empty.")
      }
    } catch (err) {
      setError("Failed to parse the file. Please ensure it's a valid CSV file.")
    }
  }

  const processFileWithSelectedColumns = () => {
    if (selectedColumns.length === 0) {
      setError("Please select at least one column.")
      return
    }

    const hasNameColumn = selectedColumns.some((col) => col.type === "name")
    const hasPriceColumn = selectedColumns.some((col) => col.type === "price")

    if (!hasNameColumn || !hasPriceColumn) {
      setError("Please select at least one name column and one price column.")
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const lines = fileContent.split("\n")
      const headers = lines[0].split(",").map((header) => header.trim())

      const newProducts = []
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim()
        if (!line) continue

        const parts = line.split(",")

        const product = { additionalData: {} }
        let hasValidName = false
        let hasValidPrice = false

        for (const column of selectedColumns) {
          if (column.index < parts.length) {
            const value = parts[column.index].trim()

            if (column.type === "name" && value) {
              product.name = value
              hasValidName = true
            } else if (column.type === "price") {
              const price = Number.parseFloat(value)
              if (!isNaN(price)) {
                product.price = price
                hasValidPrice = true
              }
            } else {
              product.additionalData[column.header] = value
            }
          }
        }

        if (hasValidName && hasValidPrice) {
          newProducts.push(product)
        }
      }

      if (newProducts.length === 0) {
        setError("No valid products found in the file with the selected columns.")
      } else {
        setProducts(newProducts)
        setSuccess(`Successfully loaded ${newProducts.length} products!`)
        setShowColumnSelector(false)
      }
    } catch (err) {
      setError("Error processing the file with selected columns.")
    } finally {
      setIsLoading(false)
    }
  }

  const findCombinations = () => {
    if (products.length === 0) {
      setError("Please upload a product list first.")
      return
    }

    if (lowerLimit >= upperLimit) {
      setError("Lower limit must be less than upper limit.")
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccess(null)

    setTimeout(() => {
      try {
        const result = []

        for (let i = 0; i < products.length; i++) {
          for (let j = i + 1; j < products.length; j++) {
            const totalPrice = products[i].price + products[j].price
            if (totalPrice >= lowerLimit && totalPrice <= upperLimit) {
              result.push({
                products: [products[i], products[j]],
                totalPrice,
              })
            }
          }
        }

        if (products.length <= 100) {
          for (let i = 0; i < products.length; i++) {
            for (let j = i + 1; j < products.length; j++) {
              for (let k = j + 1; k < products.length; k++) {
                const totalPrice = products[i].price + products[j].price + products[k].price
                if (totalPrice >= lowerLimit && totalPrice <= upperLimit) {
                  result.push({
                    products: [products[i], products[j], products[k]],
                    totalPrice,
                  })
                }
              }
            }
          }
        }

        setCombinations(result)

        if (result.length === 0) {
          setError("No combinations found within the specified price range.")
        } else {
          setSuccess(`Found ${result.length} combinations within your price range!`)
          setTimeout(() => {
            resultsRef.current?.scrollIntoView({ behavior: "smooth" })
          }, 500)
        }
      } catch (err) {
        setError("An error occurred while finding combinations.")
      } finally {
        setIsLoading(false)
      }
    }, 100)
  }

  const handleEmailSend = async () => {
    if (!email) {
      setError("Please enter an email address.")
      return
    }

    if (combinations.length === 0) {
      setError("No combinations to send. Please find combinations first.")
      return
    }

    setIsLoading(true)

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(to right, #4F46E5, #7C3AED); padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
          <img src="cid:logo" alt="ComboFinder Logo" style="width: 80px; height: 80px;">
          <h1 style="color: white; margin: 10px 0;">ComboFinder Results</h1>
        </div>
        <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
          <p style="color: #4B5563; font-size: 16px;">Here are your product combinations within the price range of $${lowerLimit} - $${upperLimit}:</p>
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <thead>
              <tr style="background-color: #F3F4F6;">
                <th style="padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb;">#</th>
                <th style="padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb;">Products</th>
                <th style="padding: 12px; text-align: right; border-bottom: 1px solid #e5e7eb;">Total Price</th>
              </tr>
            </thead>
            <tbody>
              ${combinations
                .map(
                  (combo, index) => `
                <tr style="background-color: ${index % 2 === 0 ? "white" : "#F9FAFB"};">
                  <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${index + 1}</td>
                  <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
                    <ul style="margin: 0; padding-left: 20px;">
                      ${combo.products
                        .map(
                          (product) => `
                        <li style="margin-bottom: 4px;">
                          <strong>${product.name}</strong> ($${product.price.toFixed(2)})
                          ${Object.entries(product.additionalData || {})
                            .map(
                              ([key, value]) =>
                                `<br><span style="font-size: 12px; color: #6B7280;">${key}: ${value}</span>`,
                            )
                            .join("")}
                        </li>
                      `,
                        )
                        .join("")}
                    </ul>
                  </td>
                  <td style="padding: 12px; text-align: right; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #047857;">$${combo.totalPrice.toFixed(2)}</td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6B7280; font-size: 14px;">
            <p>Thank you for using ComboFinder!</p>
            <p>© ${new Date().getFullYear()} ComboFinder - Find the perfect product combinations</p>
          </div>
        </div>
      </div>
    `

    const data = {
      to: email,
      subject: "Your ComboFinder Results",
      text: combinations
        .map((combo, index) => {
          return `Combination #${index + 1}:\nProducts: ${combo.products.map((p) => p.name).join(", ")}\nTotal Price: $${combo.totalPrice.toFixed(2)}\n`
        })
        .join("\n"),
      html: htmlContent,
    }

    try {
      const response = await fetch("http://localhost:5000/api/mail/sendemail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (response.ok) {
        setSuccess("Email sent successfully! Check your inbox.")
        setEmail("")
      } else {
        setError(result.message || "Failed to send email.")
      }
    } catch (err) {
      setError("An error occurred while sending the email.")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePrint = () => {
    if (combinations.length === 0) {
      setError("No combinations to print. Please find combinations first.")
      return
    }

    window.print()
  }

  return (
    <div className={theme}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 blue:from-blue-50 blue:to-blue-100 green:from-green-50 green:to-emerald-100 purple:from-purple-50 purple:to-violet-100 orange:from-orange-50 orange:to-amber-100 pink:from-pink-50 pink:to-rose-100 transition-colors duration-300">
        <Header
          showHowItWorks={showHowItWorks}
          setShowHowItWorks={setShowHowItWorks}
          theme={theme}
          setShowThemeSelector={setShowThemeSelector}
        />

        <main className="container mx-auto p-4 md:p-6 max-w-5xl">
          {/* Notification Messages */}
          <AnimatePresence>
            {error && <Toast type="error" message={error} onClose={() => setError(null)} />}

            {success && <Toast type="success" message={success} onClose={() => setSuccess(null)} />}
          </AnimatePresence>

          {/* Theme Selector Modal */}
          <AnimatePresence>
            {showThemeSelector && (
              <ThemeSelector
                currentTheme={theme}
                onThemeChange={changeTheme}
                onClose={() => setShowThemeSelector(false)}
              />
            )}
          </AnimatePresence>

          {/* Column Selector Modal */}
          <AnimatePresence>
            {showColumnSelector && (
              <ColumnSelector
                headers={fileHeaders}
                selectedColumns={selectedColumns}
                setSelectedColumns={setSelectedColumns}
                onConfirm={processFileWithSelectedColumns}
                onCancel={() => setShowColumnSelector(false)}
                isLoading={isLoading}
              />
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Upload Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white dark:bg-gray-800 blue:bg-blue-50 green:bg-green-50 purple:bg-purple-50 orange:bg-orange-50 pink:bg-pink-50 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border border-transparent hover:border-blue-200 dark:hover:border-blue-900 blue:hover:border-blue-300 green:hover:border-green-300 purple:hover:border-purple-300 orange:hover:border-orange-300 pink:hover:border-pink-300"
            >
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 dark:bg-blue-900 blue:bg-blue-200 green:bg-green-200 purple:bg-purple-200 orange:bg-orange-200 pink:bg-pink-200 p-3 rounded-full mr-3 shadow-inner">
                  <Upload className="w-5 h-5 text-blue-600 dark:text-blue-300 blue:text-blue-600 green:text-green-600 purple:text-purple-600 orange:text-orange-600 pink:text-pink-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Upload Products</h2>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Upload a CSV file with product data. You'll be able to select which columns to use.
              </p>

              <FileUploader onFileContent={handleFileContent} isLoading={isLoading} />

              {products.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-4 bg-green-50 dark:bg-green-900/20 blue:bg-blue-100/50 green:bg-green-100/50 purple:bg-purple-100/50 orange:bg-orange-100/50 pink:bg-pink-100/50 p-4 rounded-lg border border-green-100 dark:border-green-900 blue:border-blue-200 green:border-green-200 purple:border-purple-200 orange:border-orange-200 pink:border-pink-200"
                >
                  <div className="flex items-center">
                    <div className="bg-green-100 dark:bg-green-800 blue:bg-blue-200 green:bg-green-200 purple:bg-purple-200 orange:bg-orange-200 pink:bg-pink-200 p-1 rounded-full mr-2">
                      <Check className="w-4 h-4 text-green-600 dark:text-green-300 blue:text-blue-600 green:text-green-600 purple:text-purple-600 orange:text-orange-600 pink:text-pink-600" />
                    </div>
                    <p className="text-green-700 dark:text-green-300 blue:text-blue-700 green:text-green-700 purple:text-purple-700 orange:text-orange-700 pink:text-pink-700 font-medium">
                      Loaded {products.length} products successfully
                    </p>
                  </div>
                  <div className="mt-2 max-h-32 overflow-y-auto text-sm text-gray-600 dark:text-gray-300">
                    <p className="font-medium mb-1">Sample of loaded products:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      {products.slice(0, 3).map((product, idx) => (
                        <li key={idx}>
                          {product.name}: ${product.price.toFixed(2)}
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
                      {products.length > 3 && <li>...and {products.length - 3} more</li>}
                    </ul>
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* Price Range Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white dark:bg-gray-800 blue:bg-blue-50 green:bg-green-50 purple:bg-purple-50 orange:bg-orange-50 pink:bg-pink-50 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border border-transparent hover:border-indigo-200 dark:hover:border-indigo-900 blue:hover:border-blue-300 green:hover:border-green-300 purple:hover:border-purple-300 orange:hover:border-orange-300 pink:hover:border-pink-300"
            >
              <div className="flex items-center mb-4">
                <div className="bg-indigo-100 dark:bg-indigo-900 blue:bg-blue-200 green:bg-green-200 purple:bg-purple-200 orange:bg-orange-200 pink:bg-pink-200 p-3 rounded-full mr-3 shadow-inner">
                  <DollarSign className="w-5 h-5 text-indigo-600 dark:text-indigo-300 blue:text-blue-600 green:text-green-600 purple:text-purple-600 orange:text-orange-600 pink:text-pink-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Set Price Range</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="lowerLimit"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Lower Limit ($)
                  </label>
                  <input
                    type="number"
                    id="lowerLimit"
                    value={lowerLimit}
                    onChange={(e) => setLowerLimit(Number(e.target.value))}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 blue:border-blue-300 green:border-green-300 purple:border-purple-300 orange:border-orange-300 pink:border-pink-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 blue:bg-white green:bg-white purple:bg-white orange:bg-white pink:bg-white text-gray-900 dark:text-gray-100 transition-all"
                  />
                </div>

                <div>
                  <label
                    htmlFor="upperLimit"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Upper Limit ($)
                  </label>
                  <input
                    type="number"
                    id="upperLimit"
                    value={upperLimit}
                    onChange={(e) => setUpperLimit(Number(e.target.value))}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 blue:border-blue-300 green:border-green-300 purple:border-purple-300 orange:border-orange-300 pink:border-pink-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 blue:bg-white green:bg-white purple:bg-white orange:bg-white pink:bg-white text-gray-900 dark:text-gray-100 transition-all"
                  />
                </div>

                <div className="pt-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={findCombinations}
                    disabled={isLoading || products.length === 0}
                    className={`w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center ${
                      isLoading || products.length === 0
                        ? "bg-gray-300 dark:bg-gray-700 cursor-not-allowed text-gray-500 dark:text-gray-400"
                        : "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 dark:from-indigo-600 dark:to-purple-700 blue:from-blue-500 blue:to-blue-600 green:from-green-500 green:to-green-600 purple:from-purple-500 purple:to-purple-600 orange:from-orange-500 orange:to-orange-600 pink:from-pink-500 pink:to-pink-600 text-white shadow-md hover:shadow-lg"
                    } transition-all`}
                  >
                    {isLoading ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
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
                        <BarChart3 className="w-5 h-5 mr-2" /> Find Combinations
                      </>
                    )}
                  </motion.button>
                </div>
              </div>

              <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                <p>
                  We'll find all product combinations that total between ${lowerLimit} and ${upperLimit}.
                </p>
              </div>
            </motion.div>
          </div>

          {/* Results Section */}
          <AnimatePresence>
            {combinations.length > 0 && (
              <motion.div
                ref={resultsRef}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 40 }}
                transition={{ duration: 0.6 }}
                className="bg-white dark:bg-gray-800 blue:bg-blue-50 green:bg-green-50 purple:bg-purple-50 orange:bg-orange-50 pink:bg-pink-50 rounded-xl shadow-lg p-6 mb-6 border border-transparent hover:border-purple-200 dark:hover:border-purple-900 blue:hover:border-blue-300 green:hover:border-green-300 purple:hover:border-purple-300 orange:hover:border-orange-300 pink:hover:border-pink-300"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                  <div className="flex items-center">
                    <div className="bg-purple-100 dark:bg-purple-900 blue:bg-blue-200 green:bg-green-200 purple:bg-purple-200 orange:bg-orange-200 pink:bg-pink-200 p-3 rounded-full mr-3 shadow-inner">
                      <Package className="w-5 h-5 text-purple-600 dark:text-purple-300 blue:text-blue-600 green:text-green-600 purple:text-purple-600 orange:text-orange-600 pink:text-pink-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Results</h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {combinations.length} combinations found
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                    <div className="flex flex-1 md:flex-auto">
                      <input
                        type="email"
                        placeholder="Enter email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="flex-1 p-3 border border-gray-300 dark:border-gray-600 blue:border-blue-300 green:border-green-300 purple:border-purple-300 orange:border-orange-300 pink:border-pink-300 rounded-l-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 blue:bg-white green:bg-white purple:bg-white orange:bg-white pink:bg-white text-gray-900 dark:text-gray-100 transition-all"
                      />
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleEmailSend}
                        className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 dark:from-green-600 dark:to-green-700 blue:from-blue-500 blue:to-blue-600 green:from-green-500 green:to-green-600 purple:from-purple-500 purple:to-purple-600 orange:from-orange-500 orange:to-orange-600 pink:from-pink-500 pink:to-pink-600 text-white p-3 rounded-r-lg"
                        title="Send to Email"
                      >
                        <Mail className="w-5 h-5" />
                      </motion.button>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handlePrint}
                      className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 dark:from-purple-600 dark:to-purple-700 blue:from-blue-500 blue:to-blue-600 green:from-green-500 green:to-green-600 purple:from-purple-500 purple:to-purple-600 orange:from-orange-500 orange:to-orange-600 pink:from-pink-500 pink:to-pink-600 text-white p-3 rounded-lg flex items-center justify-center print-hide"
                      title="Print Results"
                    >
                      <Printer className="w-5 h-5 mr-2" /> Print
                    </motion.button>
                  </div>
                </div>

                <ResultsTable combinations={combinations} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stats Cards */}
          {products.length > 0 && (
            <StatsCards
              productsCount={products.length}
              lowerLimit={lowerLimit}
              upperLimit={upperLimit}
              combinationsCount={combinations.length}
            />
          )}
        </main>

        <Footer />
      </div>
    </div>
  )
}

export default App
