#!/bin/bash

# AgentCore Memory Demo Deployment Script

set -e

echo "🚀 Deploying AgentCore Memory Demo..."

# Configuration
STACK_NAME="agentcore-memory-demo"
REGION="us-east-1"
MEMORY_ID="runtime_us_market_agent_8e082e5c_mem-B1ZetpF2X2"
RUNTIME_ID="runtime_us_market_agent_8e082e5c-HYMo6FF9Qn"

# Step 1: Deploy API Gateway and Lambda
echo "📡 Deploying API Gateway and Lambda..."
aws cloudformation deploy \
  --template-file infrastructure/api-gateway.yaml \
  --stack-name $STACK_NAME \
  --parameter-overrides \
    MemoryId=$MEMORY_ID \
    RuntimeId=$RUNTIME_ID \
  --capabilities CAPABILITY_IAM \
  --region $REGION

# Get API Gateway URL
API_URL=$(aws cloudformation describe-stacks \
  --stack-name $STACK_NAME \
  --region $REGION \
  --query 'Stacks[0].Outputs[?OutputKey==`ApiGatewayUrl`].OutputValue' \
  --output text)

echo "✅ API Gateway deployed: $API_URL"

# Step 2: Create environment file
echo "📝 Creating environment configuration..."
cat > .env << EOF
REACT_APP_AGENTCORE_ENDPOINT=$API_URL
REACT_APP_AWS_REGION=$REGION
REACT_APP_MEMORY_ID=$MEMORY_ID
REACT_APP_RUNTIME_ID=$RUNTIME_ID
EOF

echo "✅ Environment file created"

# Step 3: Build React app
echo "🏗️ Building React application..."
npm install
npm run build

echo "✅ React app built"

# Step 4: Deploy to S3 and Amplify
echo "🌐 Deploying to AWS Amplify..."

# Check if Amplify app exists
APP_NAME="agentcore-memory-demo"
if aws amplify get-app --app-id $APP_NAME 2>/dev/null; then
  echo "📱 Amplify app exists, updating..."
else
  echo "📱 Creating new Amplify app..."
  aws amplify create-app \
    --name $APP_NAME \
    --description "AgentCore Memory Demo UI" \
    --region $REGION
fi

echo "🎉 Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Go to AWS Amplify Console"
echo "2. Connect your GitHub repository"
echo "3. Set environment variables:"
echo "   REACT_APP_AGENTCORE_ENDPOINT=$API_URL"
echo "   REACT_APP_AWS_REGION=$REGION"
echo "   REACT_APP_MEMORY_ID=$MEMORY_ID"
echo "   REACT_APP_RUNTIME_ID=$RUNTIME_ID"
echo "4. Deploy the app"
echo ""
echo "🔗 API Gateway URL: $API_URL"
