# Multi-Bank Policy Comparator

**AI-powered home loan MITC document comparison tool** that extracts, normalizes, and compares key policy terms across banks with side-by-side analysis and traceable evidence.

## 🎥 Video Walkthrough

**[📺 Watch Demo Video](https://drive.google.com/file/d/142JwneEc8KPUbxISjxi5Lg9YXiqoBcSh/view?usp=sharing)**

## 🏗️ Architecture

- **Backend**: FastAPI with Google Gemini AI integration
- **Frontend**: Next.js with TypeScript
- **Deployment**: Docker containerized services
- **Storage**: Client-side localStorage (demo) + configurable fields
- **AI Models**: Gemini 2.5 Pro (extraction) + Flash (comparison)

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Google Gemini API key

### 1. Clone Repository
```bash
git clone https://github.com/rohit-bindal/multi-bank-policy-comparator.git
cd multi-bank-policy-comparator
```

### 2. Environment Setup
```bash
# Copy environment template
cp env.example .env

# Add your Gemini API key
echo "GEMINI_API_KEY=your_gemini_api_key_here" >> .env
```

### 3. Start Application
```bash
# Build and start containers
docker-compose up --build

# Access applications
Frontend: http://localhost:3000
Backend API: http://localhost:8000
```

### 4. Usage Flow
1. **Upload PDFs**: Click to browse and select home loan MITC documents
2. **AI Processing**: Documents are analyzed and normalized
3. **Compare Banks**: Select 2+ banks for side-by-side comparison
4. **View Evidence**: Click cells to see source page numbers and snippets

## 🎯 Why These 7 Key Fields?

The system focuses on **7 critical sections** that operations teams need most for efficient customer service and regulatory compliance:

### **1. Fees & Charges**
Essential for direct cost impact and transparency. Enables quick pricing comparisons, regulatory compliance checks, and customer negotiation support.

### **2. Prepayment/Foreclosure**
Highly regulated and customer-sensitive area. Operations teams need immediate access to penalty structures and flexibility rules to handle queries promptly and avoid regulatory violations.

### **3. LTV Bands (Loan-To-Value)**
Critical for risk assessment and eligibility screening. Helps ops teams advise on approval likelihood, down payment requirements, and compliance thresholds.

### **4. Eligibility**
Streamlines applicant qualification process. Clear, comparable eligibility rules minimize time spent on incomplete applications and improve conversion rates.

### **5. Tenure**
Directly impacts EMI calculations and customer planning. Knowing tenure limits across banks helps set realistic expectations and improve satisfaction.

### **6. Interest Reset/Communication**
Prevents customer confusion and complaints. Clear communication protocols around rate changes build trust and reduce operational errors.

### **7. Documents Required**
Accelerates processing and reduces errors. Standardized documentation checklists support efficient, error-free customer onboarding.

## 🔧 Features

### **AI-Powered Processing**
- Document validation (MITC vs marketing materials)
- Intelligent text extraction with evidence tracking
- Currency & terminology normalization (₹/Rs/Lakh/Crore)
- Policy date extraction (effective vs upload dates)

### **Smart Comparison**
- Side-by-side bank policy analysis
- Status indicators: SAME/DIFF/MISSING/SUSPECT
- Traceable evidence with page numbers and snippets
- Comparison result caching

### **Developer Experience**
- Configurable field schema (JSON/environment)
- Type-safe models (Pydantic + TypeScript)
- Comprehensive error handling with retries
- Docker-first development

## 🧪 Testing

```bash
# Run backend tests
cd backend
python -m pytest test_core.py -v

# Tests cover:
# - Model validation
# - AI API error handling  
# - Retry mechanisms
# - Date field integration
# - Business logic validation
```

## 📁 Project Structure

```
multi-bank-policy-comparator/
├── backend/
│   ├── config/           # Field configuration
│   ├── routes/           # API endpoints
│   ├── models.py         # Pydantic data models
│   ├── main.py           # FastAPI application
│   ├── requirements.txt  # Python dependencies
│   ├── test_core.py      # Critical tests
│   └── Dockerfile        # Backend container config
├── frontend/
│   ├── src/app/
│   │   ├── components/   # React components
│   │   ├── config/       # Field configuration
│   │   └── services/     # Storage & API services
│   └── Dockerfile        # Frontend container config
├── docker-compose.yml    # Container orchestration
├── env.example           # Environment template
├── DECISIONS.md          # Architecture decisions
└── README.md
```

## ⚙️ Configuration

### **Custom Fields**
```bash
# Set custom field configuration
FIELD_CONFIG_FILE=/app/config/custom_fields.json
```

### **Environment Variables**
```bash
GEMINI_API_KEY=your_api_key_here      # Required
FIELD_CONFIG_FILE=/path/to/config     # Optional
FRONTEND_PORT=3000                    # Optional
BACKEND_PORT=8000                     # Optional
```

## 🔄 API Endpoints

- `POST /process-pdfs` - Upload and process PDF documents
- `POST /compare-banks` - Compare multiple bank policies
- `GET /` - Health check

## 🛠️ Production Considerations

See [DECISIONS.md](./DECISIONS.md) for detailed architecture decisions and production optimization strategies including:

- Message queue for parallel processing
- AWS Textract for bounding box evidence
- Database migration from localStorage
- Custom AI model fine-tuning
- Comprehensive test coverage

## 📊 Technology Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| Backend API | FastAPI + Python | Document processing & comparison |
| AI Processing | Google Gemini 2.5 Pro/Flash | Text extraction & analysis |
| Frontend | Next.js + TypeScript | User interface & state management |
| Validation | Pydantic + Zod | Type safety & data validation |
| Storage | localStorage (demo) | Client-side data persistence |
| Deployment | Docker + Docker Compose | Containerized services |
| Testing | Pytest | Critical functionality testing |

---

**Built with ❤️**