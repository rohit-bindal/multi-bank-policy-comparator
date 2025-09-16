# Architecture & Design Decisions

This document outlines key implementation decisions and production optimization strategies for the Multi-Bank Policy Comparator.

## ⏰ **Implementation Decisions & Production Optimizations**

### 1. **Sequential File Processing**
**Current Implementation**: Process PDF files one by one in sequence

**Production Optimization**: Implement message queue system (Redis/RabbitMQ) with multiple worker processes to handle parallel file processing without blocking the main server thread

### 2. **Generic AI Model Usage**
**Current Implementation**: Rely on Google Gemini with well-structured Pydantic models and comprehensive prompts

**Production Optimization**: Fine-tune custom models based on historical document data and specific banking terminology to improve extraction accuracy and reduce hallucination

### 3. **Basic Evidence Display**
**Current Implementation**: Show page numbers and text snippets as evidence

**Production Optimization**: Implement bounding box strategy using AWS Textract for precise coordinate mapping, integrate PDF viewer with evidence highlighting, and add navigation between evidence points. Store documents securely in AWS S3 for persistent access.

### 4. **Client-Side State Management**
**Current Implementation**: Use localStorage for demonstration and rapid development

**Production Optimization**: Migrate to PostgreSQL/MySQL database with proper user authentication (SSO), session management, and multi-device synchronization capabilities

### 5. **AI Model Selection Strategy**
**Current Implementation**: Use Gemini 2.5 Pro for PDF processing and Flash for comparisons

**Rationale**: Pro model provides better accuracy for complex document extraction, while Flash model is sufficient and cost-effective for straightforward text comparison tasks

### 6. **Limited Test Coverage**
**Current Implementation**: Added minimal test suite covering only critical functionality for demonstration purposes

**Production Optimization**: Implement comprehensive test hierarchy including unit tests, integration tests, end-to-end tests, and performance tests based on proper project structure with test-driven development practices

---

These decisions were made to balance development speed, user experience, and system reliability while acknowledging the specific constraints and requirements of the home loan policy comparison domain.
