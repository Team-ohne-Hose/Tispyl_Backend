NODE_ENV=development
DEVELOPMENT=true

# HTTPS
TLS_CRT="/home/tispyl/etc/certificates/tispyl.uber.space.crt"
TLS_KEY="/home/tispyl/etc/certificates/tispyl.uber.space.key"

# Database
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_NAME=BrettSpiel
DB_SECRET=root

SERVER_PORT=25670
JWT_SECRET=c7d6ec73c6f2c830a5ab92629f1f625a

# STORAGE
STORAGE_PATH="./storage"
LOGGING_PATH="${STORAGE_PATH}/logs"
IMAGE_PATH="${STORAGE_PATH}/image"

NEWS_PATH="${STORAGE_PATH}/news"
