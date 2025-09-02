# API Reference

## Authentication

All API endpoints require authentication via Bearer token:

```
Authorization: Bearer <API_TOKEN>
```

## Rate Limiting

API endpoints are rate limited to 100 requests per 15 minutes per IP.

## Error Responses

All errors follow consistent format:
```json
{ "error": "Error description" }
```

## Endpoints

### System Information
- `GET /health` - System health check
- `GET /api/stats` - Plugin and system statistics

### Server Management  
- `GET /api/servers` - List all servers
- `GET /api/servers/:id/config` - Get server configuration
- `PUT /api/servers/:id/config` - Update server configuration

### Audit and Monitoring
- `GET /api/servers/:id/audit` - Query audit logs
- `GET /api/servers/:id/stats` - Server-specific statistics

Query parameters for audit logs:
- `limit`: Number of records (default: 50)
- `action`: Filter by action type
- `userId`: Filter by user ID
