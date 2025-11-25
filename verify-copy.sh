#!/bin/bash
SOURCE_DIR="/Users/arjunperi/chatpredict"
DEST_DIR="."
echo "Checking if all files were copied correctly..."
echo "=================================================="
echo ""
MISSING_FILES=()
EXISTING_FILES=()
check_file() {
    local file_path=$1
    local description=$2
    if [ -f "$DEST_DIR/$file_path" ]; then
        echo "✅ $description"
        EXISTING_FILES+=("$file_path")
        return 0
    else
        echo "❌ $description - MISSING: $file_path"
        MISSING_FILES+=("$file_path")
        return 1
    fi
}
check_dir() {
    local dir_path=$1
    local description=$2
    if [ -d "$DEST_DIR/$dir_path" ]; then
        echo "✅ $description"
        EXISTING_FILES+=("$dir_path")
        return 0
    else
        echo "❌ $description - MISSING: $dir_path"
        MISSING_FILES+=("$dir_path")
        return 1
    fi
}
echo "Core Business Logic Files:"
check_file "lib/lmsr.ts" "LMSR algorithm"
check_file "lib/market.ts" "Market operations"
check_file "lib/resolution.ts" "Market resolution"
check_file "lib/tokens.ts" "Token management"
check_file "lib/db/prisma.ts" "Database client"
echo ""
echo "Utility Files:"
check_file "lib/utils/format.ts" "Format utilities"
check_file "lib/utils/validation.ts" "Validation utilities"
check_file "lib/utils/retry.ts" "Retry utilities"
echo ""
echo "API Routes:"
check_dir "app/api/markets" "Markets API"
check_file "app/api/markets/route.ts" "Markets route"
check_file "app/api/markets/[id]/route.ts" "Market detail route"
check_file "app/api/markets/[id]/resolve/route.ts" "Market resolve route"
check_dir "app/api/bets" "Bets API"
check_file "app/api/bets/route.ts" "Bets route"
check_file "app/api/bets/sell/route.ts" "Sell shares route"
check_dir "app/api/users" "Users API"
check_file "app/api/users/[telegramId]/route.ts" "User route"
check_dir "app/api/leaderboard" "Leaderboard API"
check_file "app/api/leaderboard/route.ts" "Leaderboard route"
echo ""
echo "Database Files:"
check_file "prisma/schema.prisma" "Prisma schema"
echo ""
echo "Summary:"
echo "Files found: ${#EXISTING_FILES[@]}"
echo "Files missing: ${#MISSING_FILES[@]}"
if [ ${#MISSING_FILES[@]} -eq 0 ]; then
    echo "All required files are present!"
else
    echo "Missing files:"
    for file in "${MISSING_FILES[@]}"; do
        echo "   - $file"
    done
fi
