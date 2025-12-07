# RC/DC JSON Upload API Documentation

## API Endpoint

### Upload RC/DC Data (JSON Format)

**Endpoint:** `POST /api/connection-logs/upload-json`

**Authentication:** Required (Bearer Token)

**Content-Type:** `application/json`

---

## Production URL

### Local/Development:
```
http://localhost:3000/api/connection-logs/upload-json
```

### Production:
```
http://192.168.10.109:3000/api/connection-logs/upload-json
```
*(Based on your TELEGRAM_API_BASE_URL configuration)*

---

## Request Format

### Headers
```json
{
  "Authorization": "Bearer YOUR_JWT_TOKEN",
  "Content-Type": "application/json"
}
```

### Body Structure
```json
{
  "data": [
    {
      "D1_ACTIVITY_ID": "ACT001",
      "OLD_CONSUMER_ID": "29225859",
      "MSN": "MSN123456789",
      "ACCOUNT_NO": "4074987485",
      "DATE_OF_COMMAND_TRIGGER": "2025-01-01T10:00:00Z",
      "RESPONSE_DATE_AND_TIME": "2025-01-01T10:05:00Z",
      "COMMAND_TYPE": "D1-RemoteConnect",
      "COMMAND_STATUS": "COMPLETED",
      "SA_ID": "SA001",
      "PAYOFF_BALNCE": 0,
      "NOCS_NAME": "NOCS1",
      "METER_STATUS": "ON",
      "PHASE": "SINGLE"
    },
    {
      "D1_ACTIVITY_ID": "ACT002",
      "OLD_CONSUMER_ID": "29225860",
      "MSN": "MSN987654321",
      "ACCOUNT_NO": "4074987486",
      "DATE_OF_COMMAND_TRIGGER": "2025-01-01T11:00:00Z",
      "RESPONSE_DATE_AND_TIME": "2025-01-01T11:05:00Z",
      "COMMAND_TYPE": "D1-RemoteDisconnect",
      "COMMAND_STATUS": "COMINPROG",
      "SA_ID": "SA002",
      "PAYOFF_BALNCE": 100,
      "NOCS_NAME": "NOCS2",
      "METER_STATUS": "PENDING",
      "PHASE": "THREE"
    }
  ]
}
```

---

## Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `D1_ACTIVITY_ID` | String | Optional | Unique activity identifier |
| `OLD_CONSUMER_ID` | String | Optional | Consumer ID |
| `MSN` | String | **Required** | Meter Serial Number |
| `ACCOUNT_NO` | String | Optional | Account number |
| `DATE_OF_COMMAND_TRIGGER` | String (ISO 8601) | Optional | When command was triggered |
| `RESPONSE_DATE_AND_TIME` | String (ISO 8601) | Optional | When response was received |
| `COMMAND_TYPE` | String | **Required** | Either "D1-RemoteConnect" or "D1-RemoteDisconnect" |
| `COMMAND_STATUS` | String | **Required** | One of: "COMPLETED", "COMINPROG", "DISCARDED" |
| `SA_ID` | String | Optional | Service Agreement ID |
| `PAYOFF_BALNCE` | Number | Optional | Payoff balance amount |
| `NOCS_NAME` | String | Optional | NOCS (Network Operations Center) name |
| `METER_STATUS` | String | Optional | Current meter status |
| `PHASE` | String | Optional | Meter phase type |

---

## Command Types

- **D1-RemoteConnect**: Remote connect operation (RC)
- **D1-RemoteDisconnect**: Remote disconnect operation (DC)

## Command Status Values

- **COMPLETED**: Operation completed successfully
- **COMINPROG**: Operation in progress
- **DISCARDED**: Operation failed/discarded

---

## Response Format

### Success Response (201 Created)
```json
{
  "message": "JSON data uploaded and processed.",
  "results": {
    "total": 100,
    "success": 98,
    "failed": 2,
    "errorCount": 2
  },
  "errors": [
    {
      "row": {
        "D1_ACTIVITY_ID": "ACT003",
        "MSN": "InvalidMSN"
      },
      "error": "Invalid date format"
    }
  ]
}
```

### Error Response (400 Bad Request)
```json
{
  "message": "Invalid data format. Expected an array of records in 'data' field.",
  "example": {
    "data": [...]
  }
}
```

### Error Response (401 Unauthorized)
```json
{
  "message": "Not authorized"
}
```

---

## Example cURL Commands

### Development
```bash
curl -X POST http://localhost:3000/api/connection-logs/upload-json \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "data": [
      {
        "D1_ACTIVITY_ID": "ACT001",
        "OLD_CONSUMER_ID": "29225859",
        "MSN": "MSN123456789",
        "ACCOUNT_NO": "4074987485",
        "DATE_OF_COMMAND_TRIGGER": "2025-01-01T10:00:00Z",
        "RESPONSE_DATE_AND_TIME": "2025-01-01T10:05:00Z",
        "COMMAND_TYPE": "D1-RemoteConnect",
        "COMMAND_STATUS": "COMPLETED",
        "SA_ID": "SA001",
        "PAYOFF_BALNCE": 0,
        "NOCS_NAME": "NOCS1",
        "METER_STATUS": "ON",
        "PHASE": "SINGLE"
      }
    ]
  }'
```

### Production
```bash
curl -X POST http://192.168.10.109:3000/api/connection-logs/upload-json \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "data": [
      {
        "D1_ACTIVITY_ID": "ACT001",
        "OLD_CONSUMER_ID": "29225859",
        "MSN": "MSN123456789",
        "ACCOUNT_NO": "4074987485",
        "DATE_OF_COMMAND_TRIGGER": "2025-01-01T10:00:00Z",
        "RESPONSE_DATE_AND_TIME": "2025-01-01T10:05:00Z",
        "COMMAND_TYPE": "D1-RemoteConnect",
        "COMMAND_STATUS": "COMPLETED",
        "SA_ID": "SA001",
        "PAYOFF_BALNCE": 0,
        "NOCS_NAME": "NOCS1",
        "METER_STATUS": "ON",
        "PHASE": "SINGLE"
      }
    ]
  }'
```

---

## Example JavaScript (Fetch)

```javascript
async function uploadRCDCData(data, token) {
  const response = await fetch('http://192.168.10.109:3000/api/connection-logs/upload-json', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ data })
  });

  const result = await response.json();
  console.log(result);
  return result;
}

// Usage
const rcdcData = [
  {
    D1_ACTIVITY_ID: "ACT001",
    OLD_CONSUMER_ID: "29225859",
    MSN: "MSN123456789",
    ACCOUNT_NO: "4074987485",
    DATE_OF_COMMAND_TRIGGER: "2025-01-01T10:00:00Z",
    RESPONSE_DATE_AND_TIME: "2025-01-01T10:05:00Z",
    COMMAND_TYPE: "D1-RemoteConnect",
    COMMAND_STATUS: "COMPLETED",
    SA_ID: "SA001",
    PAYOFF_BALNCE: 0,
    NOCS_NAME: "NOCS1",
    METER_STATUS: "ON",
    PHASE: "SINGLE"
  }
];

uploadRCDCData(rcdcData, 'your_jwt_token_here');
```

---

## Example Python (Requests)

```python
import requests
import json

def upload_rcdc_data(data, token):
    url = "http://192.168.10.109:3000/api/connection-logs/upload-json"

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    payload = {
        "data": data
    }

    response = requests.post(url, headers=headers, json=payload)
    return response.json()

# Usage
rcdc_data = [
    {
        "D1_ACTIVITY_ID": "ACT001",
        "OLD_CONSUMER_ID": "29225859",
        "MSN": "MSN123456789",
        "ACCOUNT_NO": "4074987485",
        "DATE_OF_COMMAND_TRIGGER": "2025-01-01T10:00:00Z",
        "RESPONSE_DATE_AND_TIME": "2025-01-01T10:05:00Z",
        "COMMAND_TYPE": "D1-RemoteConnect",
        "COMMAND_STATUS": "COMPLETED",
        "SA_ID": "SA001",
        "PAYOFF_BALNCE": 0,
        "NOCS_NAME": "NOCS1",
        "METER_STATUS": "ON",
        "PHASE": "SINGLE"
    }
]

result = upload_rcdc_data(rcdc_data, 'your_jwt_token_here')
print(result)
```

---

## Getting Your JWT Token

### Method 1: Login via API
```bash
curl -X POST http://192.168.10.109:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your_email@example.com",
    "password": "your_password"
  }'
```

Response will include the token:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {...}
}
```

### Method 2: Get from Browser
1. Login to the web application
2. Open Browser DevTools (F12)
3. Go to Application/Storage → Local Storage
4. Look for `token` or `authToken` key

---

## Notes

1. **Authentication is required** - You must include a valid JWT token in the Authorization header
2. **Batch uploads supported** - You can send multiple records in a single request
3. **Partial success handling** - The API will process all records and report which ones succeeded/failed
4. **Data validation** - Invalid dates or missing required fields will be reported in the errors array
5. **Source tracking** - All data uploaded via this API will be marked with `source: 'json_api'` in metadata

---

## Testing the API

You can test the API using:
- **Postman**: Import the cURL command above
- **Insomnia**: Use the JSON example provided
- **curl**: Use the command-line examples
- **Browser Console**: Use the JavaScript fetch example

---

## Support

For issues or questions, contact your system administrator or check the application logs:
- Backend logs: Check nodemon console output
- Database: Check `database.sqlite` file
- Connection logs table: `connection_logs`
