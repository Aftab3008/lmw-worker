# LMS Worker - Production-Ready OTP Email Service

A robust, type-safe, production-grade worker service for handling OTP email delivery using RabbitMQ and TypeScript.

## 🚀 Features

- **Type-Safe**: Fully typed with TypeScript for enhanced development experience
- **Production-Ready**: Built with reliability, monitoring, and error handling in mind
- **Fault Tolerant**: Exponential backoff retry mechanism with configurable limits
- **Monitoring**: Comprehensive health checks, statistics, and logging
- **Scalable**: Designed to handle high-throughput workloads
- **Containerized**: Docker support for easy deployment
- **Graceful Shutdown**: Proper cleanup and connection management
- **Email Validation**: Robust input validation and sanitization

## 📋 Prerequisites

- Node.js 18+
- RabbitMQ server
- SMTP email service (Gmail, SendGrid, etc.)
- Redis (optional, for future enhancements)

## 🛠️ Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd lms-worker
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Setup environment variables**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Build the project**
   ```bash
   npm run build
   ```

## ⚙️ Configuration

### Environment Variables

| Variable                | Description                          | Default                 | Required |
| ----------------------- | ------------------------------------ | ----------------------- | -------- |
| `WORKER`                | Enable worker mode                   | `false`                 | ✅       |
| `NODE_ENV`              | Environment (development/production) | `development`           | ❌       |
| `RABBITMQ_URL`          | RabbitMQ connection URL              | `amqp://localhost:5672` | ✅       |
| `RABBITMQ_QUEUE_NAME`   | Queue name for OTP jobs              | `service_send_otp`      | ❌       |
| `MAX_RETRIES`           | Maximum retry attempts               | `3`                     | ❌       |
| `BASE_DELAY_MS`         | Base delay for retries (ms)          | `1000`                  | ❌       |
| `MAX_DELAY_MS`          | Maximum delay for retries (ms)       | `30000`                 | ❌       |
| `PREFETCH_COUNT`        | RabbitMQ prefetch count              | `1`                     | ❌       |
| `HEARTBEAT_INTERVAL_MS` | Health check interval (ms)           | `30000`                 | ❌       |
| `SENDER_EMAIL`          | From email address                   | -                       | ✅       |
| `SMTP_HOST`             | SMTP server host                     | -                       | ✅       |
| `SMTP_PORT`             | SMTP server port                     | `587`                   | ❌       |
| `SMTP_USER`             | SMTP username                        | -                       | ✅       |
| `SMTP_PASS`             | SMTP password/app password           | -                       | ✅       |

### Example .env file

```env
WORKER=true
NODE_ENV=production

RABBITMQ_URL=amqp://admin:password@localhost:5672
RABBITMQ_QUEUE_NAME=service_send_otp

MAX_RETRIES=3
BASE_DELAY_MS=1000
MAX_DELAY_MS=30000
PREFETCH_COUNT=1
HEARTBEAT_INTERVAL_MS=30000

SENDER_EMAIL=noreply@yourdomain.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## 🚀 Usage

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm run build
npm start
```

### Docker

```bash
# Build image
npm run docker:build

# Run with docker-compose
npm run docker:compose

# Stop services
npm run docker:compose:down
```

## 📤 Job Payload Format

Send jobs to the RabbitMQ queue with the following JSON format:

```json
{
  "email": "user@example.com",
  "otp": "123456",
  "retryCount": 0,
  "jobId": "optional-unique-id",
  "timestamp": 1672531200000,
  "priority": "normal",
  "metadata": {
    "userName": "John Doe",
    "expiryMinutes": 15
  }
}
```

### Payload Fields

| Field        | Type   | Required | Description                             |
| ------------ | ------ | -------- | --------------------------------------- |
| `email`      | string | ✅       | Valid email address                     |
| `otp`        | string | ✅       | OTP code (min 4 characters)             |
| `retryCount` | number | ❌       | Current retry attempt (default: 0)      |
| `jobId`      | string | ❌       | Unique job identifier (auto-generated)  |
| `timestamp`  | number | ❌       | Job creation timestamp (auto-generated) |
| `priority`   | string | ❌       | Job priority: 'low', 'normal', 'high'   |
| `metadata`   | object | ❌       | Additional data for email template      |

## 📊 Monitoring & Health Checks

### Health Check Endpoint

The worker provides comprehensive health information:

```typescript
interface WorkerHealthCheck {
  status: WorkerStatus;
  stats: WorkerStats;
  uptime: number;
  memoryUsage: NodeJS.MemoryUsage;
  lastError?: Error;
}
```

### Statistics Tracking

- **processedJobs**: Successfully processed jobs
- **failedJobs**: Jobs that failed after max retries
- **retriedJobs**: Jobs that were retried
- **startTime**: Worker start timestamp
- **lastProcessedAt**: Last successful job timestamp

### Logging

The worker provides structured logging for:

- Job processing start/success/failure
- Retry attempts with backoff delays
- Health monitoring warnings
- Graceful shutdown process
- Startup and configuration details

## 🔄 Retry Mechanism

The worker implements an intelligent retry system:

1. **Exponential Backoff**: Delays increase exponentially (2^n \* baseDelay)
2. **Jitter**: Random delay component to prevent thundering herd
3. **Maximum Delay**: Configurable ceiling to prevent excessive delays
4. **Retry Limits**: Configurable maximum retry attempts
5. **Dead Letter Handling**: Failed jobs are logged and tracked

### Retry Formula

```
delay = min(baseDelay * 2^retryCount + jitter, maxDelay)
jitter = random(0, 0.3 * exponentialDelay)
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Running Simple Tests

```bash
# Run basic validation tests
npx tsx tests/otp.workers.test.ts
```

## 🐳 Docker Deployment

### Single Container

```bash
docker build -t lms-worker .
docker run --env-file .env lms-worker
```

### Docker Compose (Recommended)

The included `docker-compose.yml` provides:

- RabbitMQ with management interface
- Redis for caching
- The OTP worker service
- Proper networking and health checks

```bash
docker-compose up -d
```

Access RabbitMQ Management: http://localhost:15672 (admin/admin123)

## 🔧 Development

### Project Structure

```
src/
├── index.ts              # Application entry point
├── workers/
│   └── otp.workers.ts    # OTP worker implementation
├── services/
│   └── email.services.ts # Email service layer
├── config/
│   ├── rabbitmq.ts       # RabbitMQ configuration
│   ├── redis.ts          # Redis configuration
│   └── nodemailer.ts     # Email transport configuration
├── templates/
│   └── templates.ts      # Email templates
└── types/
    └── index.ts          # TypeScript type definitions
```

### Adding New Workers

1. Create worker class extending base functionality
2. Define job payload interface in `types/index.ts`
3. Implement job processing logic
4. Add worker to startup in `index.ts`
5. Add tests for new functionality

### Code Quality

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Type checking
npx tsc --noEmit
```

## 🚀 Production Deployment

### Recommended Production Setup

1. **Load Balancer**: Deploy multiple worker instances
2. **Monitoring**: Implement health check endpoints
3. **Logging**: Centralized logging with ELK stack
4. **Metrics**: Prometheus/Grafana for metrics collection
5. **Alerts**: Monitor queue depth and error rates
6. **Backup**: Regular RabbitMQ configuration backups

### Environment-Specific Configurations

#### Development

- Single worker instance
- Local RabbitMQ and Redis
- Detailed logging
- Short retry delays

#### Staging

- Multiple worker instances
- Shared RabbitMQ cluster
- Production-like configuration
- Extended health checks

#### Production

- Horizontally scaled workers
- High-availability RabbitMQ
- Comprehensive monitoring
- Optimized retry strategies

## 🔒 Security Considerations

- **Input Validation**: All payloads are validated and sanitized
- **Email Validation**: Robust email format checking
- **Rate Limiting**: Configurable prefetch limits
- **Secure Connections**: TLS/SSL for SMTP and RabbitMQ
- **Secret Management**: Environment variables for sensitive data
- **Non-root Containers**: Docker containers run as non-root user

## 📈 Performance Tuning

### RabbitMQ Optimization

- Adjust `PREFETCH_COUNT` based on processing time
- Use persistent messages for reliability
- Monitor queue depth and consumer lag

### Memory Management

- Monitor heap usage in health checks
- Implement memory leak detection
- Configure appropriate container limits

### Email Service Optimization

- Use connection pooling for SMTP
- Implement circuit breaker for external services
- Cache email templates

## 🐛 Troubleshooting

### Common Issues

1. **Connection Failures**

   - Check RabbitMQ server status
   - Verify connection URLs and credentials
   - Check network connectivity

2. **Email Delivery Issues**

   - Verify SMTP configuration
   - Check email provider limits
   - Review bounce/rejection logs

3. **High Memory Usage**

   - Monitor prefetch count
   - Check for memory leaks
   - Adjust container limits

4. **Performance Problems**
   - Analyze job processing times
   - Check queue depth
   - Monitor system resources

### Debug Mode

Enable detailed logging:

```env
NODE_ENV=development
LOG_LEVEL=debug
```

## 📄 License

This project is licensed under the ISC License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📞 Support

For issues and questions:

- Create an issue in the repository
- Check existing documentation
- Review logs for error details
