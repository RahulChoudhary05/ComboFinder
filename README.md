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

```mermaid
ComboFinder Data Flow.download-icon {
            cursor: pointer;
            transform-origin: center;
        }
        .download-icon .arrow-part {
            transition: transform 0.35s cubic-bezier(0.35, 0.2, 0.14, 0.95);
             transform-origin: center;
        }
        button:has(.download-icon):hover .download-icon .arrow-part, button:has(.download-icon):focus-visible .download-icon .arrow-part {
          transform: translateY(-1.5px);
        }
        EmailServiceBackendFrontendUserEmailServiceBackendFrontendUser#mermaid-diagram-r87e{font-family:var(--font-geist-sans);font-size:12px;fill:#000000;}#mermaid-diagram-r87e .error-icon{fill:#552222;}#mermaid-diagram-r87e .error-text{fill:#552222;stroke:#552222;}#mermaid-diagram-r87e .edge-thickness-normal{stroke-width:1px;}#mermaid-diagram-r87e .edge-thickness-thick{stroke-width:3.5px;}#mermaid-diagram-r87e .edge-pattern-solid{stroke-dasharray:0;}#mermaid-diagram-r87e .edge-thickness-invisible{stroke-width:0;fill:none;}#mermaid-diagram-r87e .edge-pattern-dashed{stroke-dasharray:3;}#mermaid-diagram-r87e .edge-pattern-dotted{stroke-dasharray:2;}#mermaid-diagram-r87e .marker{fill:#666;stroke:#666;}#mermaid-diagram-r87e .marker.cross{stroke:#666;}#mermaid-diagram-r87e svg{font-family:var(--font-geist-sans);font-size:12px;}#mermaid-diagram-r87e p{margin:0;}#mermaid-diagram-r87e .actor{stroke:hsl(0, 0%, 83%);fill:#eee;}#mermaid-diagram-r87e text.actor>tspan{fill:#333;stroke:none;}#mermaid-diagram-r87e .actor-line{stroke:hsl(0, 0%, 83%);}#mermaid-diagram-r87e .messageLine0{stroke-width:1.5;stroke-dasharray:none;stroke:#333;}#mermaid-diagram-r87e .messageLine1{stroke-width:1.5;stroke-dasharray:2,2;stroke:#333;}#mermaid-diagram-r87e #arrowhead path{fill:#333;stroke:#333;}#mermaid-diagram-r87e .sequenceNumber{fill:white;}#mermaid-diagram-r87e #sequencenumber{fill:#333;}#mermaid-diagram-r87e #crosshead path{fill:#333;stroke:#333;}#mermaid-diagram-r87e .messageText{fill:#333;stroke:none;}#mermaid-diagram-r87e .labelBox{stroke:hsl(0, 0%, 83%);fill:#eee;}#mermaid-diagram-r87e .labelText,#mermaid-diagram-r87e .labelText>tspan{fill:#333;stroke:none;}#mermaid-diagram-r87e .loopText,#mermaid-diagram-r87e .loopText>tspan{fill:#333;stroke:none;}#mermaid-diagram-r87e .loopLine{stroke-width:2px;stroke-dasharray:2,2;stroke:hsl(0, 0%, 83%);fill:hsl(0, 0%, 83%);}#mermaid-diagram-r87e .note{stroke:#999;fill:#666;}#mermaid-diagram-r87e .noteText,#mermaid-diagram-r87e .noteText>tspan{fill:#fff;stroke:none;}#mermaid-diagram-r87e .activation0{fill:#f4f4f4;stroke:#666;}#mermaid-diagram-r87e .activation1{fill:#f4f4f4;stroke:#666;}#mermaid-diagram-r87e .activation2{fill:#f4f4f4;stroke:#666;}#mermaid-diagram-r87e .actorPopupMenu{position:absolute;}#mermaid-diagram-r87e .actorPopupMenuPanel{position:absolute;fill:#eee;box-shadow:0px 8px 16px 0px rgba(0,0,0,0.2);filter:drop-shadow(3px 5px 2px rgb(0 0 0 / 0.4));}#mermaid-diagram-r87e .actor-man line{stroke:hsl(0, 0%, 83%);fill:#eee;}#mermaid-diagram-r87e .actor-man circle,#mermaid-diagram-r87e line{stroke:hsl(0, 0%, 83%);fill:#eee;stroke-width:2px;}#mermaid-diagram-r87e .flowchart-link{stroke:hsl(var(--gray-400));stroke-width:1px;}#mermaid-diagram-r87e .marker,#mermaid-diagram-r87e marker,#mermaid-diagram-r87e marker *{fill:hsl(var(--gray-400))!important;stroke:hsl(var(--gray-400))!important;}#mermaid-diagram-r87e .label,#mermaid-diagram-r87e text,#mermaid-diagram-r87e text>tspan{fill:hsl(var(--black))!important;color:hsl(var(--black))!important;}#mermaid-diagram-r87e .background,#mermaid-diagram-r87e rect.relationshipLabelBox{fill:hsl(var(--white))!important;}#mermaid-diagram-r87e .entityBox,#mermaid-diagram-r87e .attributeBoxEven{fill:hsl(var(--gray-150))!important;}#mermaid-diagram-r87e .attributeBoxOdd{fill:hsl(var(--white))!important;}#mermaid-diagram-r87e .label-container,#mermaid-diagram-r87e rect.actor{fill:hsl(var(--white))!important;stroke:hsl(var(--gray-400))!important;}#mermaid-diagram-r87e line{stroke:hsl(var(--gray-400))!important;}#mermaid-diagram-r87e :root{--mermaid-font-family:var(--font-geist-sans);}Upload CSV fileParse CSV dataSelect columnsSet price rangeFind combinationsDisplay resultsRequest email reportSend email requestGenerate and send emailDeliver email report
```

## 📊 Component Structure

```mermaid
Component Structure.download-icon {
            cursor: pointer;
            transform-origin: center;
        }
        .download-icon .arrow-part {
            transition: transform 0.35s cubic-bezier(0.35, 0.2, 0.14, 0.95);
             transform-origin: center;
        }
        button:has(.download-icon):hover .download-icon .arrow-part, button:has(.download-icon):focus-visible .download-icon .arrow-part {
          transform: translateY(-1.5px);
        }
        #mermaid-diagram-r87j{font-family:var(--font-geist-sans);font-size:12px;fill:#000000;}#mermaid-diagram-r87j .error-icon{fill:#552222;}#mermaid-diagram-r87j .error-text{fill:#552222;stroke:#552222;}#mermaid-diagram-r87j .edge-thickness-normal{stroke-width:1px;}#mermaid-diagram-r87j .edge-thickness-thick{stroke-width:3.5px;}#mermaid-diagram-r87j .edge-pattern-solid{stroke-dasharray:0;}#mermaid-diagram-r87j .edge-thickness-invisible{stroke-width:0;fill:none;}#mermaid-diagram-r87j .edge-pattern-dashed{stroke-dasharray:3;}#mermaid-diagram-r87j .edge-pattern-dotted{stroke-dasharray:2;}#mermaid-diagram-r87j .marker{fill:#666;stroke:#666;}#mermaid-diagram-r87j .marker.cross{stroke:#666;}#mermaid-diagram-r87j svg{font-family:var(--font-geist-sans);font-size:12px;}#mermaid-diagram-r87j p{margin:0;}#mermaid-diagram-r87j .label{font-family:var(--font-geist-sans);color:#000000;}#mermaid-diagram-r87j .cluster-label text{fill:#333;}#mermaid-diagram-r87j .cluster-label span{color:#333;}#mermaid-diagram-r87j .cluster-label span p{background-color:transparent;}#mermaid-diagram-r87j .label text,#mermaid-diagram-r87j span{fill:#000000;color:#000000;}#mermaid-diagram-r87j .node rect,#mermaid-diagram-r87j .node circle,#mermaid-diagram-r87j .node ellipse,#mermaid-diagram-r87j .node polygon,#mermaid-diagram-r87j .node path{fill:#eee;stroke:#999;stroke-width:1px;}#mermaid-diagram-r87j .rough-node .label text,#mermaid-diagram-r87j .node .label text{text-anchor:middle;}#mermaid-diagram-r87j .node .katex path{fill:#000;stroke:#000;stroke-width:1px;}#mermaid-diagram-r87j .node .label{text-align:center;}#mermaid-diagram-r87j .node.clickable{cursor:pointer;}#mermaid-diagram-r87j .arrowheadPath{fill:#333333;}#mermaid-diagram-r87j .edgePath .path{stroke:#666;stroke-width:2.0px;}#mermaid-diagram-r87j .flowchart-link{stroke:#666;fill:none;}#mermaid-diagram-r87j .edgeLabel{background-color:white;text-align:center;}#mermaid-diagram-r87j .edgeLabel p{background-color:white;}#mermaid-diagram-r87j .edgeLabel rect{opacity:0.5;background-color:white;fill:white;}#mermaid-diagram-r87j .labelBkg{background-color:rgba(255, 255, 255, 0.5);}#mermaid-diagram-r87j .cluster rect{fill:hsl(0, 0%, 98.9215686275%);stroke:#707070;stroke-width:1px;}#mermaid-diagram-r87j .cluster text{fill:#333;}#mermaid-diagram-r87j .cluster span{color:#333;}#mermaid-diagram-r87j div.mermaidTooltip{position:absolute;text-align:center;max-width:200px;padding:2px;font-family:var(--font-geist-sans);font-size:12px;background:hsl(-160, 0%, 93.3333333333%);border:1px solid #707070;border-radius:2px;pointer-events:none;z-index:100;}#mermaid-diagram-r87j .flowchartTitleText{text-anchor:middle;font-size:18px;fill:#000000;}#mermaid-diagram-r87j .flowchart-link{stroke:hsl(var(--gray-400));stroke-width:1px;}#mermaid-diagram-r87j .marker,#mermaid-diagram-r87j marker,#mermaid-diagram-r87j marker *{fill:hsl(var(--gray-400))!important;stroke:hsl(var(--gray-400))!important;}#mermaid-diagram-r87j .label,#mermaid-diagram-r87j text,#mermaid-diagram-r87j text>tspan{fill:hsl(var(--black))!important;color:hsl(var(--black))!important;}#mermaid-diagram-r87j .background,#mermaid-diagram-r87j rect.relationshipLabelBox{fill:hsl(var(--white))!important;}#mermaid-diagram-r87j .entityBox,#mermaid-diagram-r87j .attributeBoxEven{fill:hsl(var(--gray-150))!important;}#mermaid-diagram-r87j .attributeBoxOdd{fill:hsl(var(--white))!important;}#mermaid-diagram-r87j .label-container,#mermaid-diagram-r87j rect.actor{fill:hsl(var(--white))!important;stroke:hsl(var(--gray-400))!important;}#mermaid-diagram-r87j line{stroke:hsl(var(--gray-400))!important;}#mermaid-diagram-r87j :root{--mermaid-font-family:var(--font-geist-sans);}AppHeaderMain ContentFooterLogoDeveloperProfileThemeToggleHowItWorksFileUploaderColumnSelectorPriceRangeSelectorResultsTableStatsCardsSocialLinks
```

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
