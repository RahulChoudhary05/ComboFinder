## 📋 Overview

ComboFinder is a powerful web application that helps users find optimal product combinations within a specified price range. Upload your product data, set your budget constraints, and ComboFinder will identify all possible combinations that match your criteria. Perfect for retailers, shoppers, or anyone looking to maximize value within a budget.

## ✨ Features

- **CSV File Upload**: Easily upload your product data in CSV format
- **Column Selection**: Choose which columns to use for product names, prices, and additional information
- **Flexible Price Range**: Set minimum and maximum price limits for your combinations
- **Smart Combination Algorithm**: Efficiently finds all valid product combinations (2-3 items) within your price range
- **Email Reports**: Send results directly to your email with beautifully formatted HTML templates
- **Print Functionality**: Print your results for offline reference
- **Multiple Themes**: Choose from 8 different themes (Light, Dark, System, Blue, Green, Purple, Orange, Pink)
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Developer Profile**: Showcase your information as the developer of this application
- **Social Integration**: Connect with your social profiles directly from the application


## 🛠️ Technology Stack

- **Frontend**: React.js, Tailwind CSS, Framer Motion
- **Backend**: Node.js, Express.js
- **Email Service**: Nodemailer
- **State Management**: React Hooks
- **Styling**: Tailwind CSS with custom theme extensions
- **Animations**: Framer Motion for fluid UI transitions


## 🏗️ Architecture

graph TD;
    A["Frontend (React)"] -->|API Requests| B["Backend (Node.js/Express)"]
    B -->|Email Service| C["SMTP Server"]
    D["CSV File"] -->|Upload| A
    A -->|Process Data| E["Combination Algorithm"]
    E -->|Results| A
    A -->|Email Request| B
    B -->|Send Email| F["User's Inbox"]
    A -->|Theme Selection| G["Theme System"]
    G -->|Apply Theme| A

## 🔄 Data Flow

sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant EmailService
    
    User->>Frontend: Upload CSV file
    Frontend->>Frontend: Parse CSV data
    Frontend->>Frontend: Select columns
    Frontend->>Frontend: Set price range
    Frontend->>Frontend: Find combinations
    Frontend->>Frontend: Display results
    User->>Frontend: Request email report
    Frontend->>Backend: Send email request
    Backend->>EmailService: Generate and send email
    EmailService->>User: Deliver email report

## 📊 Component Structure

graph TD;
    A["App"] --> B["Header"]
    A --> C["Main Content"]
    A --> D["Footer"]
    B --> E["Logo"]
    B --> F["DeveloperProfile"]
    B --> G["ThemeToggle"]
    B --> H["HowItWorks"]
    C --> I["FileUploader"]
    C --> J["ColumnSelector"]
    C --> K["PriceRangeSelector"]
    C --> L["ResultsTable"]
    C --> M["StatsCards"]
    D --> N["SocialLinks"]

## 🚀 Installation

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- SMTP server access for email functionality


### Setup Instructions

1. **Clone the repository**


```shellscript
git clone https://github.com/yourusername/combofinder.git
cd combofinder
```

2. **Install frontend dependencies**


```shellscript
cd frontend
npm install
```

3. **Install backend dependencies**


```shellscript
cd ../backend
npm install
```

4. **Configure environment variables**


Create a `.env` file in the backend directory:

```plaintext
PORT=5000
MAIL_HOST=your-smtp-server.com
MAIL_PORT=587
MAIL_USER=your-email@example.com
MAIL_PASS=your-email-password
```

5. **Start the backend server**


```shellscript
npm start
```

6. **Start the frontend development server**


```shellscript
cd ../frontend
npm start
```

7. **Access the application**


Open your browser and navigate to `http://localhost:3000`

## 📝 Usage Guide

### 1. Upload Product Data

- Click on the upload area or drag and drop a CSV file
- Your CSV should contain product names and prices (at minimum)
- You can download a sample file to see the expected format


### 2. Select Columns

- Choose which columns represent product names and prices
- Optionally select additional columns for extra information
- Confirm your selection


### 3. Set Price Range

- Enter your minimum and maximum budget limits
- These define the acceptable total price range for combinations


### 4. Find Combinations

- Click "Find Combinations" to process your data
- The algorithm will identify all valid combinations within your price range
- Results will display in a table below


### 5. Export Results

- Enter an email address and click the mail icon to receive results via email
- Click the print button to print your results
- Results include all product details and total prices


### 6. Customize Experience

- Click the theme selector to choose from 8 different themes
- Explore the developer profile to learn more about the creator
- Connect via social links in the footer


## 📸 Screenshots

## 🧩 Key Components

### Frontend

- **App.jsx**: Main application component
- **Header.jsx**: Navigation and developer profile
- **FileUploader.jsx**: Handles CSV file uploads
- **ColumnSelector.jsx**: Interface for selecting data columns
- **ResultsTable.jsx**: Displays combination results
- **ThemeSelector.jsx**: Theme customization interface
- **DeveloperProfile.jsx**: Developer information modal
- **Footer.jsx**: Application footer with social links


### Backend

- **server.js**: Express server setup
- **mailRouter.js**: Email API routes
- **mailSender.js**: Email generation and sending functionality


## 🔍 Algorithm

ComboFinder uses an efficient algorithm to find valid product combinations:

1. **For 2-item combinations**:

1. Time Complexity: O(n²)
2. Space Complexity: O(n²)



2. **For 3-item combinations**:

1. Time Complexity: O(n³)
2. Space Complexity: O(n³)





For performance reasons, 3-item combinations are only calculated when the product list contains 100 or fewer items.

```javascript
// Simplified algorithm pseudocode
function findCombinations(products, lowerLimit, upperLimit) {
  const combinations = [];
  
  // Find 2-item combinations
  for (let i = 0; i < products.length; i++) {
    for (let j = i + 1; j < products.length; j++) {
      const totalPrice = products[i].price + products[j].price;
      if (totalPrice >= lowerLimit && totalPrice <= upperLimit) {
        combinations.push({
          products: [products[i], products[j]],
          totalPrice
        });
      }
    }
  }
  
  // Find 3-item combinations (if product list is not too large)
  if (products.length <= 100) {
    for (let i = 0; i < products.length; i++) {
      for (let j = i + 1; j < products.length; j++) {
        for (let k = j + 1; k < products.length; k++) {
          const totalPrice = products[i].price + products[j].price + products[k].price;
          if (totalPrice >= lowerLimit && totalPrice <= upperLimit) {
            combinations.push({
              products: [products[i], products[j], products[k]],
              totalPrice
            });
          }
        }
      }
    }
  }
  
  return combinations;
}
```

## 🎨 Theme System

ComboFinder features a comprehensive theme system with 8 different options:

- **Light**: Clean, bright interface with blue accents
- **Dark**: Dark mode with reduced eye strain for night use
- **System**: Automatically matches your system preferences
- **Blue**: Vibrant blue-focused theme
- **Green**: Fresh green-focused theme
- **Purple**: Rich purple-focused theme
- **Orange**: Warm orange-focused theme
- **Pink**: Playful pink-focused theme


Themes are implemented using Tailwind CSS classes and custom CSS variables, with preferences saved to localStorage for persistence.

## 📧 Email System

The email functionality uses Nodemailer to send beautifully formatted HTML emails:

- **HTML Templates**: Rich, responsive email templates
- **Embedded Logo**: Brand recognition with embedded logo
- **Detailed Results**: Complete product information and pricing
- **Plain Text Fallback**: Compatibility with all email clients


## 📱 Responsive Design

ComboFinder is fully responsive across all devices:

- **Desktop**: Full-featured interface with optimal spacing
- **Tablet**: Adapted layout for medium-sized screens
- **Mobile**: Streamlined interface with touch-friendly controls


## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request


## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Developer

**John Doe**

- [GitHub](https://github.com/johndoe)
- [LinkedIn](https://linkedin.com/in/johndoe)
- [Portfolio](https://johndoe.dev)


## 🙏 Acknowledgements

- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [Nodemailer](https://nodemailer.com/)
- [Lucide Icons](https://lucide.dev/)
