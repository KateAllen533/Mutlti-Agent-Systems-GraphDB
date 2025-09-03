# 📊 Data Loading Guide - Multi-Agent System

## 🚀 **Supported Data Sources**

### **File Formats**
- ✅ **CSV** (.csv) - Comma-separated values
- ✅ **Excel** (.xlsx, .xls) - Microsoft Excel files
- ✅ **JSON** (.json) - JavaScript Object Notation
- ✅ **Database Connections** - ODBC (SQLite, MySQL, PostgreSQL)

## 📁 **Method 1: File Upload via API**

### **Upload CSV/Excel/JSON Files**
```bash
# Using PowerShell (Windows)
$form = @{file = Get-Item "your_file.csv"}
Invoke-WebRequest -Uri "http://localhost:3000/api/upload" -Method POST -Form $form

# Using curl (if available)
curl -X POST -F "file=@your_file.csv" http://localhost:3000/api/upload
```

### **Process Local Files**
```bash
# Process a file from your local system
curl -X POST -H "Content-Type: application/json" \
  -d '{"filePath": "C:/path/to/your/file.csv"}' \
  http://localhost:3000/api/process/local
```

## 🗄️ **Method 2: Database Connections**

### **SQLite Database**
```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{
    "connectionString": "DRIVER={SQLite3 ODBC Driver};Database=C:/path/to/database.db",
    "query": "SELECT * FROM your_table"
  }' \
  http://localhost:3000/api/process/odbc
```

### **MySQL Database**
```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{
    "connectionString": "DRIVER={MySQL ODBC 8.0 Driver};SERVER=localhost;DATABASE=your_db;USER=username;PASSWORD=password",
    "query": "SELECT * FROM your_table"
  }' \
  http://localhost:3000/api/process/odbc
```

### **PostgreSQL Database**
```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{
    "connectionString": "DRIVER={PostgreSQL ODBC Driver};SERVER=localhost;DATABASE=your_db;USER=username;PASSWORD=password",
    "query": "SELECT * FROM your_table"
  }' \
  http://localhost:3000/api/process/odbc
```

## 📊 **Method 3: Batch Processing**

### **Process Multiple Files**
```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{
    "files": [
      {"path": "C:/data/file1.csv", "type": "csv"},
      {"path": "C:/data/file2.xlsx", "type": "excel"},
      {"path": "C:/data/file3.json", "type": "json"}
    ]
  }' \
  http://localhost:3000/api/process/batch
```

## 🎯 **Method 4: Dashboard Interface**

1. **Open Dashboard**: http://localhost:3001/test.html
2. **Click "Test File Upload"** for instructions
3. **Use Full Dashboard**: http://localhost:3001 (if working)
4. **Drag & Drop** files directly into the interface

## 📋 **Example Data Files**

### **Sample CSV Structure**
```csv
id,name,email,department,salary,hire_date,manager_id
1,John Doe,john.doe@company.com,Engineering,75000,2020-01-15,5
2,Jane Smith,jane.smith@company.com,Marketing,65000,2019-03-22,3
```

### **Sample JSON Structure**
```json
[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john.doe@company.com",
    "department": "Engineering",
    "salary": 75000,
    "hire_date": "2020-01-15",
    "manager_id": 5
  }
]
```

## 🔍 **Monitoring Your Data**

### **Check Job Status**
```bash
# Get job history
curl http://localhost:3000/api/jobs/history

# Check specific job
curl http://localhost:3000/api/job/{jobId}/status
```

### **Check Agent Status**
```bash
curl http://localhost:3000/api/agents/status
```

## ⚡ **Quick Start Examples**

### **Upload the Sample Data**
```bash
# Upload the sample CSV we created
$form = @{file = Get-Item "sample_data.csv"}
Invoke-WebRequest -Uri "http://localhost:3000/api/upload" -Method POST -Form $form
```

### **Process Local File**
```bash
# Process the sample file directly
curl -X POST -H "Content-Type: application/json" \
  -d '{"filePath": "sample_data.csv"}' \
  http://localhost:3000/api/process/local
```

## 🎯 **What Happens After Upload**

1. **Data Loader Agent** - Loads and parses your data
2. **Data Structuring Agent** - Cleans, normalizes, and structures data
3. **Graph Modeling Agent** - Creates graph models and relationships
4. **Dashboard** - Displays results and visualizations

## 🚨 **Troubleshooting**

- **File too large**: Check MAX_FILE_SIZE in .env
- **Unsupported format**: Use CSV, Excel, or JSON
- **Database connection**: Ensure ODBC drivers are installed
- **Upload fails**: Check file permissions and path

## 📞 **Need Help?**

- Check the dashboard at: http://localhost:3001/test.html
- View API status at: http://localhost:3000/api/agents/status
- Check job history at: http://localhost:3000/api/jobs/history
