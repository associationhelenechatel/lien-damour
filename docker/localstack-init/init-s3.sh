#!/bin/sh
# Exécuté automatiquement par LocalStack une fois le service S3 prêt
# (voir docker-compose.yml : /etc/localstack/init/ready.d).
# Crée le bucket de dev et reproduit la configuration du bucket R2 de
# production (CORS pour l'upload direct depuis le navigateur, lecture
# publique pour l'affichage des photos/logos et le téléchargement des
# documents).
set -e

BUCKET="lien-damour-dev"

awslocal s3 mb "s3://${BUCKET}" || true

awslocal s3api put-bucket-cors --bucket "${BUCKET}" --cors-configuration '{
  "CORSRules": [
    {
      "AllowedOrigins": ["http://localhost:3000"],
      "AllowedMethods": ["GET", "PUT"],
      "AllowedHeaders": ["content-type", "content-disposition", "cache-control"],
      "MaxAgeSeconds": 3600
    }
  ]
}'

awslocal s3api put-bucket-policy --bucket "${BUCKET}" --policy '{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::'"${BUCKET}"'/*"
    }
  ]
}'
